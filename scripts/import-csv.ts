#!/usr/bin/env npx tsx
/**
 * CSVインポート CLI
 *
 * 使い方:
 *   npm run import:csv -- data/import/保守実績.csv
 *   npm run import:csv -- data/import/設備マスタ.csv --table equipment
 *   npm run import:csv -- data/import/*.csv --clear
 */
import fs from "node:fs";
import path from "node:path";
import { importCsvContent, clearAllData } from "../src/lib/import/csv-importer";
import type { ImportTable } from "../src/lib/import/column-maps";
import { getImportStats } from "../src/lib/db/queries";

const args = process.argv.slice(2);
const shouldClear = args.includes("--clear");
const tableArgIndex = args.indexOf("--table");
const tableArg =
  tableArgIndex >= 0 ? (args[tableArgIndex + 1] as ImportTable | undefined) : undefined;
const files = args.filter((a) => !a.startsWith("--") && a !== tableArg);

if (files.length === 0) {
  console.log(`
CSVインポート

使い方:
  npm run import:csv -- <CSVファイル> [オプション]

オプション:
  --table maintenance_records | equipment | customers
  --clear   インポート前に既存データを全削除

例:
  npm run import:csv -- data/import/保守実績.csv
  npm run import:csv -- data/import/設備.csv --table equipment
  npm run import:csv -- data/import/保守実績.csv --clear
`);
  process.exit(1);
}

if (shouldClear) {
  console.log("既存データを削除しています...");
  clearAllData();
}

for (const file of files) {
  const resolved = path.resolve(file);
  if (!fs.existsSync(resolved)) {
    console.error(`ファイルが見つかりません: ${resolved}`);
    process.exit(1);
  }

  console.log(`インポート中: ${resolved}`);
  const content = fs.readFileSync(resolved, "utf-8");
  const result = importCsvContent(content, {
    filename: path.basename(resolved),
    table: tableArg,
  });

  console.log(`  テーブル: ${result.table}`);
  console.log(`  取込件数: ${result.inserted.toLocaleString()} 件`);
  if (result.skipped > 0) {
    console.log(`  スキップ: ${result.skipped.toLocaleString()} 件`);
  }
  if (result.errors.length > 0) {
    console.log("  エラー（先頭50件まで）:");
    result.errors.forEach((e) => console.log(`    - ${e}`));
  }
}

const stats = getImportStats();
console.log("\n--- 現在のDB件数 ---");
console.log(`保守実績: ${stats.maintenanceRecordCount.toLocaleString()} 件`);
console.log(`設備マスタ: ${stats.equipmentCount.toLocaleString()} 件`);
console.log(`得意先マスタ: ${stats.customerCount.toLocaleString()} 件`);
if (stats.lastImportAt) {
  console.log(`最終インポート: ${new Date(stats.lastImportAt).toLocaleString("ja-JP")}`);
}
