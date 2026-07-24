import * as fs from "node:fs";
import * as path from "node:path";
import * as XLSX from "xlsx";
import {
  asCodeText,
  asNullableInt,
  asWorkDate,
  computeSourceHash,
  type MaintenanceSourceFields,
} from "./source-hash";
import type {
  CustomerInsert,
  EquipmentMasterInsert,
  MaintenanceRecordInsert,
} from "@/lib/supabase/types";

const MAINT_SHEET = "T_保守実績ファイル";
const EQUIPMENT_SHEET = "T_設備マスタ";

const MAINT_HEADERS = [
  "得意先コード",
  "設備番号",
  "作業日",
  "作業コード",
  "作業内容",
  "稼働時間",
  "担当者コード",
  "客先担当",
  "入力者コード",
] as const;

const CUSTOMER_HEADERS = [
  "得意先コード",
  "得意先名",
  "得意先カナ名",
  "郵便番号",
  "住所１",
  "住所２",
  "電話番号",
  "ＦＡＸ番号",
  "代表者役職名",
  "代表者氏名",
  "地区コード",
  "地区名",
  "業種コード",
  "業種名",
  "担当者コード",
  "担当者名",
  "汎用コード１",
  "汎用名1",
  "汎用コード２",
  "汎用名2",
  "汎用コード３",
  "汎用名3",
  "汎用コード４",
  "汎用名4",
] as const;

export type MaintenanceImportRow = MaintenanceRecordInsert;

function cellToRaw(v: unknown): unknown {
  if (v instanceof Date) return v;
  return v;
}

function emptyToNull(s: string): string | null {
  return s === "" ? null : s;
}

function readWorkbook(filePath: string): XLSX.WorkBook {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`ファイルがありません: ${abs}`);
  }
  // raw:false だと日付が Date になる。コード列は文字列維持のため cellText / type を見る
  const buf = fs.readFileSync(abs);
  return XLSX.read(buf, {
    type: "buffer",
    cellDates: true,
    raw: false,
    codepage: 932,
  });
}

function sheetToMatrix(wb: XLSX.WorkBook, preferredName?: string): unknown[][] {
  const name =
    (preferredName && wb.SheetNames.includes(preferredName)
      ? preferredName
      : wb.SheetNames[0]) ?? "";
  if (!name) throw new Error("シートがありません");
  const sheet = wb.Sheets[name];
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
    raw: false,
    blankrows: false,
  }) as unknown[][];
}

/** xlsx の raw:false は数値を文字列化することがある。設備番号の先頭ゼロ維持のため、可能な限り元セルを見る */
function readMaintenanceWithCellTypes(filePath: string): MaintenanceImportRow[] {
  const abs = path.resolve(filePath);
  const buf = fs.readFileSync(abs);
  const wb = XLSX.read(buf, {
    type: "buffer",
    cellDates: true,
    raw: true,
    codepage: 932,
  });
  const sheetName = wb.SheetNames.includes(MAINT_SHEET)
    ? MAINT_SHEET
    : wb.SheetNames[0];
  if (!sheetName) throw new Error("保守実績シートがありません");
  const sheet = wb.Sheets[sheetName];
  const ref = sheet["!ref"];
  if (!ref) throw new Error("シートが空です");

  const range = XLSX.utils.decode_range(ref);
  const headerRow: string[] = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: range.s.r, c });
    const cell = sheet[addr];
    headerRow.push(cell ? String(cell.v ?? "").trim() : "");
  }

  const idx: Record<(typeof MAINT_HEADERS)[number], number> = {} as never;
  for (const h of MAINT_HEADERS) {
    const i = headerRow.indexOf(h);
    if (i < 0) throw new Error(`列がありません: ${h}`);
    idx[h] = i;
  }

  const rows: MaintenanceImportRow[] = [];
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    const get = (h: (typeof MAINT_HEADERS)[number]) => {
      const addr = XLSX.utils.encode_cell({ r, c: idx[h] });
      const cell = sheet[addr];
      if (!cell) return null;
      // 文字列型セルはそのまま（先頭ゼロ維持）
      if (cell.t === "s" || cell.t === "str") return String(cell.v);
      if (cell.t === "d") return cell.v;
      if (cell.t === "n") return cell.v;
      if (cell.w != null && cell.w !== "") return cell.w;
      return cell.v ?? null;
    };

    const customerCode = asCodeText(get("得意先コード"));
    const equipmentNo = asCodeText(get("設備番号"));
    // 数値セルだった場合の先頭ゼロ喪失を検知（format があれば w を優先済み）
    const workDate = asWorkDate(get("作業日"));
    const workCode = asCodeText(get("作業コード"));
    const workContent = emptyToNull(asCodeText(get("作業内容")));
    const operatingHours = asNullableInt(get("稼働時間"));
    const staffCode = asCodeText(get("担当者コード"));
    const customerContact = emptyToNull(asCodeText(get("客先担当")));
    const inputterCode = emptyToNull(asCodeText(get("入力者コード")));

    if (!customerCode && !equipmentNo && !workDate && !workCode) {
      continue;
    }

    const fields: MaintenanceSourceFields = {
      customerCode,
      equipmentNo,
      workDate,
      workCode,
      workContent,
      operatingHours,
      staffCode,
      customerContact,
      inputterCode,
    };

    rows.push({
      source_hash: computeSourceHash(fields),
      customer_code: customerCode,
      equipment_no: equipmentNo,
      work_date: workDate,
      work_code: workCode,
      work_content: workContent,
      operating_hours: operatingHours,
      staff_code: staffCode,
      customer_contact: customerContact,
      inputter_code: inputterCode,
    });
  }

  return rows;
}

export function readMaintenanceExcel(filePath: string): MaintenanceImportRow[] {
  return readMaintenanceWithCellTypes(filePath);
}

export type CustomerImportRow = CustomerInsert;

export function readCustomerExcel(filePath: string): CustomerImportRow[] {
  const wb = readWorkbook(filePath);
  const matrix = sheetToMatrix(wb);
  if (matrix.length < 2) return [];

  const header = (matrix[0] as unknown[]).map((h) =>
    String(h ?? "")
      .trim()
      .normalize("NFKC")
  );

  // 全角数字などのゆれを吸収しつつ、期待列名と照合
  const findCol = (name: string) => {
    const n = name.normalize("NFKC");
    let i = header.indexOf(n);
    if (i >= 0) return i;
    // 住所1 / 住所１ など
    i = header.findIndex((h) => h.replace(/\s/g, "") === n.replace(/\s/g, ""));
    return i;
  };

  const colIndex = CUSTOMER_HEADERS.map((h) => findCol(h));
  if (colIndex[0] < 0) {
    throw new Error(
      `得意先マスタに「得意先コード」列がありません。シート先頭: ${header.slice(0, 5).join(", ")}`
    );
  }

  const rows: CustomerImportRow[] = [];
  for (let r = 1; r < matrix.length; r++) {
    const line = matrix[r] as unknown[];
    const get = (hi: number) => {
      const i = colIndex[hi];
      if (i < 0) return null;
      return emptyToNull(asCodeText(cellToRaw(line[i])));
    };

    const customerCode = asCodeText(
      colIndex[0] >= 0 ? line[colIndex[0]] : null
    );
    if (!customerCode) continue;

    rows.push({
      customer_code: customerCode,
      customer_name: get(1),
      customer_name_kana: get(2),
      postal_code: get(3),
      address1: get(4),
      address2: get(5),
      phone: get(6),
      fax: get(7),
      representative_title: get(8),
      representative_name: get(9),
      region_code: get(10),
      region_name: get(11),
      industry_code: get(12),
      industry_name: get(13),
      staff_code: get(14),
      staff_name: get(15),
      generic_code1: get(16),
      generic_name1: get(17),
      generic_code2: get(18),
      generic_name2: get(19),
      generic_code3: get(20),
      generic_name3: get(21),
      generic_code4: get(22),
      generic_name4: get(23),
    });
  }

  return rows;
}

const EQUIPMENT_HEADERS = [
  "得意先コード",
  "設備番号",
  "設備名",
  "機種コード",
  "メーカーコード",
  "型式",
  "管理番号",
  "納入日",
  "点検周期",
  "次回点検日",
  "点検案内",
  "1次販売店コード",
  "2次販売店コード",
  "3次販売店コード",
  "使用オイル",
  "汎用コード1",
  "汎用コード2",
  "汎用コード3",
  "汎用コード4",
  "備考",
  "運転状況コード",
  "修正日",
] as const;

export type EquipmentMasterImportRow = EquipmentMasterInsert;

function readEquipmentCell(
  sheet: XLSX.WorkSheet,
  r: number,
  c: number
): unknown {
  const addr = XLSX.utils.encode_cell({ r, c });
  const cell = sheet[addr];
  if (!cell) return null;
  if (cell.t === "s" || cell.t === "str") return String(cell.v);
  if (cell.t === "d") return cell.v;
  if (cell.t === "n") {
    // コード列は表示文字列があれば優先（先頭ゼロ維持）
    if (cell.w != null && cell.w !== "") return cell.w;
    return cell.v;
  }
  if (cell.w != null && cell.w !== "") return cell.w;
  return cell.v ?? null;
}

/** 点検周期など: 数値は文字列化、空は null（先頭ゼロは asCodeText 側） */
function asNullableText(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) {
    return String(Math.trunc(v) === v ? Math.trunc(v) : v);
  }
  const s = asCodeText(v);
  return s === "" ? null : s;
}

export function readEquipmentMasterExcel(
  filePath: string
): EquipmentMasterImportRow[] {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`ファイルがありません: ${abs}`);
  }
  const buf = fs.readFileSync(abs);
  const wb = XLSX.read(buf, {
    type: "buffer",
    cellDates: true,
    raw: true,
    codepage: 932,
  });
  const sheetName = wb.SheetNames.includes(EQUIPMENT_SHEET)
    ? EQUIPMENT_SHEET
    : wb.SheetNames[0];
  if (!sheetName) throw new Error("設備マスタシートがありません");
  const sheet = wb.Sheets[sheetName];
  const ref = sheet["!ref"];
  if (!ref) throw new Error("シートが空です");

  const range = XLSX.utils.decode_range(ref);
  const headerRow: string[] = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: range.s.r, c });
    const cell = sheet[addr];
    headerRow.push(
      cell
        ? String(cell.v ?? "")
            .trim()
            .normalize("NFKC")
        : ""
    );
  }

  const idx: Record<(typeof EQUIPMENT_HEADERS)[number], number> = {} as never;
  for (const h of EQUIPMENT_HEADERS) {
    const target = h.normalize("NFKC");
    let i = headerRow.indexOf(target);
    if (i < 0) {
      i = headerRow.findIndex(
        (x) => x.replace(/\s/g, "") === target.replace(/\s/g, "")
      );
    }
    if (i < 0) throw new Error(`列がありません: ${h}`);
    idx[h] = i;
  }

  const rows: EquipmentMasterImportRow[] = [];
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    const get = (h: (typeof EQUIPMENT_HEADERS)[number]) =>
      readEquipmentCell(sheet, r, idx[h]);

    const customerCode = asCodeText(get("得意先コード"));
    const equipmentNumber = asCodeText(get("設備番号"));
    if (!customerCode && !equipmentNumber) continue;
    if (!customerCode || !equipmentNumber) {
      throw new Error(
        `設備マスタ ${r + 1} 行目: 得意先コードと設備番号は必須です（code=${customerCode}, no=${equipmentNumber}）`
      );
    }

    rows.push({
      customer_code: customerCode,
      equipment_number: equipmentNumber,
      equipment_name: asNullableText(get("設備名")),
      machine_code: asNullableText(get("機種コード")),
      maker_code: asNullableText(get("メーカーコード")),
      model: asNullableText(get("型式")),
      management_number: asNullableText(get("管理番号")),
      installation_date: asWorkDate(get("納入日")),
      inspection_cycle: asNullableText(get("点検周期")),
      next_inspection_date: asWorkDate(get("次回点検日")),
      inspection_notice: asNullableText(get("点検案内")),
      dealer1_code: asNullableText(get("1次販売店コード")),
      dealer2_code: asNullableText(get("2次販売店コード")),
      dealer3_code: asNullableText(get("3次販売店コード")),
      oil_type: asNullableText(get("使用オイル")),
      generic_code1: asNullableText(get("汎用コード1")),
      generic_code2: asNullableText(get("汎用コード2")),
      generic_code3: asNullableText(get("汎用コード3")),
      generic_code4: asNullableText(get("汎用コード4")),
      remarks: asNullableText(get("備考")),
      operation_status_code: asNullableText(get("運転状況コード")),
      updated_at_source: asWorkDate(get("修正日")),
    });
  }

  return rows;
}

export type EquipmentMasterValidationSummary = {
  rowCount: number;
  uniquePairCount: number;
  duplicatePairCount: number;
  /** 設備番号単体の重複行数（別得意先での再利用。単独 UNIQUE 不可の根拠） */
  duplicateEquipmentNumberExtraRows: number;
  uniqueEquipmentNumberCount: number;
  leadingZeroEquipmentCount: number;
  missingCustomerCodeCount: number;
  missingEquipmentNumberCount: number;
};

export function validateEquipmentMasterData(
  rows: EquipmentMasterImportRow[]
): EquipmentMasterValidationSummary {
  const pairSet = new Set<string>();
  let duplicatePairCount = 0;
  const equipmentCounts = new Map<string, number>();
  let leadingZero = 0;
  let missingCustomer = 0;
  let missingEquipment = 0;

  for (const row of rows) {
    if (!row.customer_code) missingCustomer += 1;
    if (!row.equipment_number) missingEquipment += 1;
    const pair = `${row.customer_code}\t${row.equipment_number}`;
    if (pairSet.has(pair)) duplicatePairCount += 1;
    else pairSet.add(pair);
    equipmentCounts.set(
      row.equipment_number,
      (equipmentCounts.get(row.equipment_number) ?? 0) + 1
    );
    if (row.equipment_number.startsWith("0")) leadingZero += 1;
  }

  let duplicateEquipmentNumberExtraRows = 0;
  for (const n of equipmentCounts.values()) {
    if (n > 1) duplicateEquipmentNumberExtraRows += n - 1;
  }

  return {
    rowCount: rows.length,
    uniquePairCount: pairSet.size,
    duplicatePairCount,
    duplicateEquipmentNumberExtraRows,
    uniqueEquipmentNumberCount: equipmentCounts.size,
    leadingZeroEquipmentCount: leadingZero,
    missingCustomerCodeCount: missingCustomer,
    missingEquipmentNumberCount: missingEquipment,
  };
}

export type ValidationSummary = {
  maintenanceCount: number;
  customerCount: number;
  uniqueSourceHash: number;
  duplicateSourceHash: number;
  equipmentLeadingZeroCount: number;
  nullWorkDateCount: number;
  nullOperatingHoursCount: number;
  matchCustomerCodes: number;
  onlyInMaintenance: number;
  onlyInCustomers: number;
  matchRatePercent: number;
};

export function validateImportData(
  maintenance: MaintenanceImportRow[],
  customers: CustomerImportRow[]
): ValidationSummary {
  const hashSet = new Set<string>();
  let dup = 0;
  let leadingZero = 0;
  let nullDate = 0;
  let nullHours = 0;
  const maintCodes = new Set<string>();

  for (const row of maintenance) {
    if (hashSet.has(row.source_hash)) dup += 1;
    else hashSet.add(row.source_hash);
    if (row.equipment_no.startsWith("0")) leadingZero += 1;
    if (row.work_date == null) nullDate += 1;
    if (row.operating_hours == null) nullHours += 1;
    if (row.customer_code) maintCodes.add(row.customer_code);
  }

  const custCodes = new Set(customers.map((c) => c.customer_code));
  let matched = 0;
  for (const c of maintCodes) {
    if (custCodes.has(c)) matched += 1;
  }

  return {
    maintenanceCount: maintenance.length,
    customerCount: customers.length,
    uniqueSourceHash: hashSet.size,
    duplicateSourceHash: dup,
    equipmentLeadingZeroCount: leadingZero,
    nullWorkDateCount: nullDate,
    nullOperatingHoursCount: nullHours,
    matchCustomerCodes: matched,
    onlyInMaintenance: maintCodes.size - matched,
    onlyInCustomers: [...custCodes].filter((c) => !maintCodes.has(c)).length,
    matchRatePercent:
      maintCodes.size === 0
        ? 0
        : Math.round((10000 * matched) / maintCodes.size) / 100,
  };
}
