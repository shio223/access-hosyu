import { parse } from "csv-parse/sync";
import { getDb } from "@/lib/db";
import { setLastImportAt } from "@/lib/db/queries";
import type { ImportResult } from "@/lib/db/types";
import {
  COLUMN_ALIASES,
  detectTableFromFilename,
  detectTableFromHeaders,
  mapRow,
  type ImportTable,
} from "./column-maps";

const BATCH_SIZE = 1000;

function normalizeCsvText(text: string): string {
  // Excel保存のUTF-8 BOMを除去
  return text.replace(/^\uFEFF/, "");
}

function parseCsv(content: string): { headers: string[]; rows: Record<string, string>[] } {
  const records = parse(normalizeCsvText(content), {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }) as Record<string, string>[];

  if (records.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = Object.keys(records[0]);
  return { headers, rows: records };
}

function validateRequired(table: ImportTable, mapped: Record<string, string>, lineNo: number): string | null {
  if (!mapped.customer_code) {
    return `行${lineNo}: 得意先コードが空です`;
  }
  if (table !== "customers" && !mapped.equipment_no) {
    return `行${lineNo}: 設備番号が空です`;
  }
  return null;
}

function importMaintenanceRecords(rows: Record<string, string>[], headers: string[]): ImportResult {
  const db = getDb();
  const insert = db.prepare(
    `INSERT INTO maintenance_records (
      customer_code, equipment_no, work_date, work_code, work_type, work_content,
      operating_hours, customer_contact, staff_code, staff_name, inputter_code, inputter_name
    ) VALUES (
      @customer_code, @equipment_no, @work_date, @work_code, @work_type, @work_content,
      @operating_hours, @customer_contact, @staff_code, @staff_name, @inputter_code, @inputter_name
    )`
  );

  const upsertCustomer = db.prepare(
    `INSERT INTO customers (customer_code, customer_name)
     VALUES (@customer_code, '')
     ON CONFLICT(customer_code) DO NOTHING`
  );

  const upsertEquipment = db.prepare(
    `INSERT INTO equipment (customer_code, equipment_no)
     VALUES (@customer_code, @equipment_no)
     ON CONFLICT(customer_code, equipment_no) DO NOTHING`
  );

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  const importBatch = db.transaction((batch: Record<string, string>[], startLine: number) => {
    for (let i = 0; i < batch.length; i++) {
      const mapped = mapRow("maintenance_records", batch[i], headers);
      const lineNo = startLine + i;
      const validationError = validateRequired("maintenance_records", mapped, lineNo);
      if (validationError) {
        skipped++;
        if (errors.length < 50) errors.push(validationError);
        continue;
      }

      upsertCustomer.run({ customer_code: mapped.customer_code });
      upsertEquipment.run({
        customer_code: mapped.customer_code,
        equipment_no: mapped.equipment_no,
      });
      insert.run(mapped);
      inserted++;
    }
  });

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    importBatch(rows.slice(i, i + BATCH_SIZE), i + 2);
  }

  return { table: "maintenance_records", inserted, skipped, errors };
}

function importEquipment(rows: Record<string, string>[], headers: string[]): ImportResult {
  const db = getDb();
  const upsert = db.prepare(
    `INSERT INTO equipment (
      customer_code, equipment_no, equipment_name, status_code, status_name,
      model_code, model_name, maker_code, maker_name, model_type, management_no,
      postal_code, phone, address1, address2, delivery_date, inspection_cycle,
      next_inspection_date, inspection_notice, dealer1, dealer2, dealer3,
      oil_used, remarks, revision_date
    ) VALUES (
      @customer_code, @equipment_no, @equipment_name, @status_code, @status_name,
      @model_code, @model_name, @maker_code, @maker_name, @model_type, @management_no,
      @postal_code, @phone, @address1, @address2, @delivery_date, @inspection_cycle,
      @next_inspection_date, @inspection_notice, @dealer1, @dealer2, @dealer3,
      @oil_used, @remarks, @revision_date
    )
    ON CONFLICT(customer_code, equipment_no) DO UPDATE SET
      equipment_name = excluded.equipment_name,
      status_code = excluded.status_code,
      status_name = excluded.status_name,
      model_code = excluded.model_code,
      model_name = excluded.model_name,
      maker_code = excluded.maker_code,
      maker_name = excluded.maker_name,
      model_type = excluded.model_type,
      management_no = excluded.management_no,
      postal_code = excluded.postal_code,
      phone = excluded.phone,
      address1 = excluded.address1,
      address2 = excluded.address2,
      delivery_date = excluded.delivery_date,
      inspection_cycle = excluded.inspection_cycle,
      next_inspection_date = excluded.next_inspection_date,
      inspection_notice = excluded.inspection_notice,
      dealer1 = excluded.dealer1,
      dealer2 = excluded.dealer2,
      dealer3 = excluded.dealer3,
      oil_used = excluded.oil_used,
      remarks = excluded.remarks,
      revision_date = excluded.revision_date`
  );

  const upsertCustomer = db.prepare(
    `INSERT INTO customers (customer_code, customer_name)
     VALUES (@customer_code, @customer_name)
     ON CONFLICT(customer_code) DO UPDATE SET
       customer_name = CASE
         WHEN excluded.customer_name != '' THEN excluded.customer_name
         ELSE customers.customer_name
       END`
  );

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  const importBatch = db.transaction((batch: Record<string, string>[], startLine: number) => {
    for (let i = 0; i < batch.length; i++) {
      const mapped = mapRow("equipment", batch[i], headers);
      const lineNo = startLine + i;
      const validationError = validateRequired("equipment", mapped, lineNo);
      if (validationError) {
        skipped++;
        if (errors.length < 50) errors.push(validationError);
        continue;
      }

      upsertCustomer.run({
        customer_code: mapped.customer_code,
        customer_name: mapped.customer_name ?? "",
      });
      upsert.run(mapped);
      inserted++;
    }
  });

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    importBatch(rows.slice(i, i + BATCH_SIZE), i + 2);
  }

  return { table: "equipment", inserted, skipped, errors };
}

function importCustomers(rows: Record<string, string>[], headers: string[]): ImportResult {
  const db = getDb();
  const upsert = db.prepare(
    `INSERT INTO customers (customer_code, customer_name, postal_code, phone, address1, address2)
     VALUES (@customer_code, @customer_name, @postal_code, @phone, @address1, @address2)
     ON CONFLICT(customer_code) DO UPDATE SET
       customer_name = excluded.customer_name,
       postal_code = excluded.postal_code,
       phone = excluded.phone,
       address1 = excluded.address1,
       address2 = excluded.address2`
  );

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  const importBatch = db.transaction((batch: Record<string, string>[], startLine: number) => {
    for (let i = 0; i < batch.length; i++) {
      const mapped = mapRow("customers", batch[i], headers);
      const lineNo = startLine + i;
      const validationError = validateRequired("customers", mapped, lineNo);
      if (validationError) {
        skipped++;
        if (errors.length < 50) errors.push(validationError);
        continue;
      }
      upsert.run(mapped);
      inserted++;
    }
  });

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    importBatch(rows.slice(i, i + BATCH_SIZE), i + 2);
  }

  return { table: "customers", inserted, skipped, errors };
}

/** CSVテキストをインポート */
export function importCsvContent(
  content: string,
  options?: { table?: ImportTable; filename?: string }
): ImportResult {
  const { headers, rows } = parseCsv(content);

  if (headers.length === 0) {
    throw new Error("CSVにデータ行がありません");
  }

  const table =
    options?.table ??
    (options?.filename ? detectTableFromFilename(options.filename) : null) ??
    detectTableFromHeaders(headers);

  if (!table) {
    const expected = Object.values(COLUMN_ALIASES.maintenance_records)
      .flat()
      .slice(0, 5)
      .join("、");
    throw new Error(
      `CSVの種類を判別できません。ファイル名に「保守実績」「設備」「得意先」を含めるか、ヘッダー行（例: ${expected}）を確認してください。`
    );
  }

  let result: ImportResult;
  switch (table) {
    case "maintenance_records":
      result = importMaintenanceRecords(rows, headers);
      break;
    case "equipment":
      result = importEquipment(rows, headers);
      break;
    case "customers":
      result = importCustomers(rows, headers);
      break;
  }

  setLastImportAt(new Date().toISOString());
  return result;
}

/** 既存データを全削除（再インポート用） */
export function clearAllData(): void {
  const db = getDb();
  db.exec(`
    DELETE FROM maintenance_records;
    DELETE FROM equipment;
    DELETE FROM customers;
    DELETE FROM import_meta;
  `);
}

/** 特定テーブルのみ削除 */
export function clearTable(table: ImportTable): void {
  const db = getDb();
  const tableName =
    table === "maintenance_records" ? "maintenance_records" : table === "equipment" ? "equipment" : "customers";
  db.exec(`DELETE FROM ${tableName}`);
}
