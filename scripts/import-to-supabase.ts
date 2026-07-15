#!/usr/bin/env npx tsx
/**
 * Access Excel → Supabase 一括インポート CLI
 *
 * 使い方:
 *   npm run import:supabase -- --dry-run
 *   npm run import:supabase -- --execute
 *
 * --execute は本番投入。確認後に明示指定すること。
 * service_role は .env.local の SUPABASE_SERVICE_ROLE_KEY のみ使用。
 */
import * as fs from "node:fs";
import * as path from "node:path";
import {
  readCustomerExcel,
  readMaintenanceExcel,
  validateImportData,
  type CustomerImportRow,
  type MaintenanceImportRow,
} from "../src/lib/import/excel-readers";
import { createServiceRoleClient } from "../src/lib/supabase/admin";

const BATCH = 800;
const IMPORT_DIR = path.join(process.cwd(), "import-data");
const MAINT_FILE = path.join(IMPORT_DIR, "hosyu.xlsx");
const CUST_FILE = path.join(IMPORT_DIR, "得意先マスタ検索結果.XLS");

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

function logSummary(label: string, summary: ReturnType<typeof validateImportData>) {
  console.log(`\n--- ${label} ---`);
  console.log(`保守実績件数: ${summary.maintenanceCount.toLocaleString()}`);
  console.log(`得意先件数: ${summary.customerCount.toLocaleString()}`);
  console.log(`source_hash ユニーク: ${summary.uniqueSourceHash.toLocaleString()}`);
  console.log(`source_hash 重複行: ${summary.duplicateSourceHash.toLocaleString()}`);
  console.log(
    `設備番号先頭ゼロ: ${summary.equipmentLeadingZeroCount.toLocaleString()} 件`
  );
  console.log(`作業日NULL: ${summary.nullWorkDateCount}`);
  console.log(`稼働時間NULL: ${summary.nullOperatingHoursCount.toLocaleString()}`);
  console.log(
    `得意先コード一致: ${summary.matchCustomerCodes} / 実績側ユニークコード分`
  );
  console.log(`実績のみのコード: ${summary.onlyInMaintenance}`);
  console.log(`マスタのみのコード: ${summary.onlyInCustomers}`);
  console.log(`紐付け率: ${summary.matchRatePercent}%`);
}

async function upsertCustomers(
  rows: CustomerImportRow[],
  dryRun: boolean
): Promise<{ inserted: number }> {
  if (dryRun) return { inserted: 0 };
  const supabase = createServiceRoleClient();
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error, count } = await supabase.from("customers").upsert(chunk, {
      onConflict: "customer_code",
      count: "exact",
    });
    if (error) throw new Error(`customers upsert失敗: ${error.message}`);
    inserted += count ?? chunk.length;
    console.log(
      `customers: ${Math.min(i + BATCH, rows.length).toLocaleString()} / ${rows.length.toLocaleString()}`
    );
  }
  return { inserted };
}

async function upsertMaintenance(
  rows: MaintenanceImportRow[],
  dryRun: boolean
): Promise<{ attempted: number; errorCount: number }> {
  if (dryRun) return { attempted: 0, errorCount: 0 };
  const supabase = createServiceRoleClient();
  let errorCount = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("maintenance_records").upsert(chunk, {
      onConflict: "source_hash",
      ignoreDuplicates: true,
    });
    if (error) {
      errorCount += 1;
      console.error(`maintenance_records バッチ失敗 @${i}: ${error.message}`);
    } else {
      console.log(
        `maintenance_records: ${Math.min(i + BATCH, rows.length).toLocaleString()} / ${rows.length.toLocaleString()}`
      );
    }
  }
  return { attempted: rows.length, errorCount };
}

async function countTables(): Promise<{ customers: number; maintenance: number }> {
  const supabase = createServiceRoleClient();
  const [c, m] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase
      .from("maintenance_records")
      .select("*", { count: "exact", head: true }),
  ]);
  if (c.error) throw new Error(c.error.message);
  if (m.error) throw new Error(m.error.message);
  return { customers: c.count ?? 0, maintenance: m.count ?? 0 };
}

async function main() {
  loadEnvLocal();
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run") || !args.includes("--execute");

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

  console.log("Excel 読み取り中...");
  const maintenance = readMaintenanceExcel(MAINT_FILE);
  const customers = readCustomerExcel(CUST_FILE);
  const summary = validateImportData(maintenance, customers);
  logSummary("検証結果", summary);

  if (summary.duplicateSourceHash > 0) {
    console.error("source_hash 重複があるため中断します");
    process.exit(1);
  }

  if (dryRun) {
    console.log("\nドライラン完了。問題なければ次を実行:");
    console.log("  npm run import:supabase -- --execute");
    return;
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY が未設定です");
    process.exit(1);
  }

  console.log("\ncustomers 投入中...");
  await upsertCustomers(customers, false);
  console.log("maintenance_records 投入中...");
  const result = await upsertMaintenance(maintenance, false);
  if (result.errorCount > 0) {
    console.error(`バッチエラー: ${result.errorCount}`);
    process.exit(1);
  }

  const counts = await countTables();
  console.log("\n--- 投入後件数 ---");
  console.log(`customers: ${counts.customers.toLocaleString()}`);
  console.log(`maintenance_records: ${counts.maintenance.toLocaleString()}`);
  console.log(`紐付け率（検証時）: ${summary.matchRatePercent}%`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
