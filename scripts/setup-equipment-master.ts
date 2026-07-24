#!/usr/bin/env npx tsx
/**
 * 設備マスタテーブル確認 →（あれば）Excel 投入
 *
 * テーブル未作成の場合は SQL を表示して終了します。
 * Dashboard の SQL Editor で supabase/migrations/002_equipment_master.sql を実行後、
 * 再度このコマンドまたは npm run import:equipment -- --execute を実行してください。
 *
 *   npm run setup:equipment
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { spawnSync } from "node:child_process";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
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

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が必要です");
    process.exit(1);
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await sb
    .from("equipment_master")
    .select("customer_code")
    .limit(1);

  if (error && /schema cache|does not exist|not find/i.test(error.message)) {
    const sqlPath = path.join(
      process.cwd(),
      "supabase/migrations/002_equipment_master.sql"
    );
    console.error("\n❌ equipment_master テーブルがまだありません。\n");
    console.error("次を Supabase Dashboard → SQL Editor で実行してください:\n");
    console.error(`  ファイル: ${sqlPath}\n`);
    if (fs.existsSync(sqlPath)) {
      console.error("--- SQL ここから ---");
      console.error(fs.readFileSync(sqlPath, "utf8"));
      console.error("--- SQL ここまで ---\n");
    }
    console.error("実行後、もう一度:");
    console.error("  npm run setup:equipment");
    console.error("または:");
    console.error("  npm run import:equipment -- --execute\n");
    process.exit(2);
  }

  if (error) {
    console.error("equipment_master 確認失敗:", error.message);
    process.exit(1);
  }

  const { count } = await sb
    .from("equipment_master")
    .select("*", { count: "exact", head: true });
  console.log(`equipment_master 現在件数: ${(count ?? 0).toLocaleString()}`);

  console.log("\nExcel から投入を開始します...");
  const r = spawnSync(
    "npx",
    ["tsx", "scripts/import-equipment-master.ts", "--execute"],
    { stdio: "inherit", cwd: process.cwd(), shell: process.platform === "win32" }
  );
  process.exit(r.status ?? 1);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
