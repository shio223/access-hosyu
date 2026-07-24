#!/usr/bin/env npx tsx
/**
 * T-設備マスタ.xlsx → Supabase equipment_master 一括インポート CLI
 *
 * 使い方:
 *   npm run import:equipment -- --dry-run
 *   npm run import:equipment -- --execute
 *   npm run import:equipment -- --file "/path/to/T-設備マスタ.xlsx" --execute
 *
 * UPSERT キー: (customer_code, equipment_number)
 * service_role は .env.local の SUPABASE_SERVICE_ROLE_KEY のみ使用。
 */
import * as fs from "node:fs";
import * as path from "node:path";
import {
  readEquipmentMasterExcel,
  validateEquipmentMasterData,
  type EquipmentMasterImportRow,
} from "../src/lib/import/excel-readers";
import { createServiceRoleClient } from "../src/lib/supabase/admin";

const BATCH = 500;
const IMPORT_DIR = path.join(process.cwd(), "import-data");
const DEFAULT_FILES = [
  path.join(IMPORT_DIR, "T-設備マスタ.xlsx"),
  path.join(IMPORT_DIR, "T_設備マスタ.xlsx"),
  "/Volumes/USB DISK/T-設備マスタ.xlsx",
];

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = val;
  }
}

function resolveFilePath(args: string[]): string {
  const fileFlag = args.indexOf("--file");
  if (fileFlag >= 0 && args[fileFlag + 1]) {
    return path.resolve(args[fileFlag + 1]);
  }
  for (const candidate of DEFAULT_FILES) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `設備マスタ Excel が見つかりません。--file で指定するか import-data/ に配置してください。\n試したパス:\n${DEFAULT_FILES.map((p) => `  - ${p}`).join("\n")}`
  );
}

function logSummary(
  label: string,
  summary: ReturnType<typeof validateEquipmentMasterData>
) {
  console.log(`\n--- ${label} ---`);
  console.log(`件数: ${summary.rowCount.toLocaleString()}`);
  console.log(
    `UPSERTキー(得意先+設備番号) ユニーク: ${summary.uniquePairCount.toLocaleString()}`
  );
  console.log(
    `UPSERTキー重複行: ${summary.duplicatePairCount.toLocaleString()}`
  );
  console.log(
    `設備番号単体のユニーク: ${summary.uniqueEquipmentNumberCount.toLocaleString()}`
  );
  console.log(
    `設備番号単体の重複余分行: ${summary.duplicateEquipmentNumberExtraRows.toLocaleString()}`
  );
  console.log(
    `設備番号先頭ゼロ: ${summary.leadingZeroEquipmentCount.toLocaleString()} 件`
  );
}

async function upsertEquipment(
  rows: EquipmentMasterImportRow[],
  dryRun: boolean
): Promise<{ attempted: number; errorCount: number; batchErrors: string[] }> {
  if (dryRun) return { attempted: 0, errorCount: 0, batchErrors: [] };
  const supabase = createServiceRoleClient();
  let errorCount = 0;
  const batchErrors: string[] = [];
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("equipment_master").upsert(chunk, {
      onConflict: "customer_code,equipment_number",
    });
    if (error) {
      errorCount += 1;
      const msg = `equipment_master バッチ失敗 @${i}: ${error.message}`;
      batchErrors.push(msg);
      console.error(msg);
    } else {
      console.log(
        `equipment_master: ${Math.min(i + BATCH, rows.length).toLocaleString()} / ${rows.length.toLocaleString()}`
      );
    }
  }
  return { attempted: rows.length, errorCount, batchErrors };
}

async function countEquipment(): Promise<number> {
  const supabase = createServiceRoleClient();
  const { count, error } = await supabase
    .from("equipment_master")
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function main() {
  loadEnvLocal();
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run") || !args.includes("--execute");
  const filePath = resolveFilePath(args);

  if (!args.includes("--dry-run") && !args.includes("--execute")) {
    console.log(
      "モード未指定のためドライランで実行します。本番投入は --execute を付けてください。"
    );
  }

  if (dryRun) {
    console.log("=== ドライラン（Supabase へ書き込みません） ===");
  } else {
    console.log("=== 本番投入（--execute） ===");
  }

  console.log(`ファイル: ${filePath}`);
  console.log("Excel 読み取り中...");
  const rows = readEquipmentMasterExcel(filePath);
  const summary = validateEquipmentMasterData(rows);
  logSummary("検証結果", summary);

  if (summary.duplicatePairCount > 0) {
    console.error(
      "得意先コード+設備番号の重複があるため中断します（UPSERTキー衝突）"
    );
    process.exit(1);
  }

  if (dryRun) {
    console.log("\n--- インポート予定サマリー ---");
    console.log(`件数: ${summary.rowCount.toLocaleString()}`);
    console.log(`エラー件数: 0（未実行）`);
    console.log(
      `重複件数（UPSERTキー）: ${summary.duplicatePairCount.toLocaleString()}`
    );
    console.log(
      `重複件数（設備番号単体の余分行・参考）: ${summary.duplicateEquipmentNumberExtraRows.toLocaleString()}`
    );
    console.log("\nドライラン完了。問題なければ次を実行:");
    console.log(
      `  npm run import:equipment -- --file "${filePath}" --execute`
    );
    console.log(
      "\n事前に SQL Editor で supabase/migrations/002_equipment_master.sql を実行してください。"
    );
    return;
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY が未設定です");
    process.exit(1);
  }

  console.log("\nequipment_master 投入中...");
  const result = await upsertEquipment(rows, false);
  const tableCount = await countEquipment();

  console.log("\n--- インポート完了 ---");
  console.log(`件数: ${tableCount.toLocaleString()}（テーブル総件数）`);
  console.log(`投入試行: ${result.attempted.toLocaleString()}`);
  console.log(`エラー件数: ${result.errorCount}`);
  console.log(
    `重複件数（UPSERTキー）: ${summary.duplicatePairCount.toLocaleString()}`
  );
  console.log(
    `重複件数（設備番号単体の余分行・参考）: ${summary.duplicateEquipmentNumberExtraRows.toLocaleString()}`
  );

  if (result.errorCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
