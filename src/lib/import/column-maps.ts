/** CSV列名のエイリアス定義（Accessエクスポートの表記ゆれに対応） */
export type ImportTable = "maintenance_records" | "equipment" | "customers";

export const COLUMN_ALIASES: Record<ImportTable, Record<string, string[]>> = {
  maintenance_records: {
    customer_code: ["得意先コード", "得意先CD", "customer_code", "CustomerCode"],
    equipment_no: ["設備番号", "設備No", "equipment_no", "EquipmentNo"],
    work_date: ["作業日", "work_date", "WorkDate"],
    work_code: ["作業コード", "作業CD", "work_code", "WorkCode"],
    work_type: ["作業種別", "work_type", "WorkType"],
    work_content: ["作業内容", "work_content", "WorkContent"],
    operating_hours: ["稼働時間", "operating_hours", "OperatingHours"],
    customer_contact: ["客先担当", "customer_contact", "CustomerContact"],
    staff_code: ["担当者コード", "担当者CD", "staff_code", "StaffCode"],
    staff_name: ["担当者名", "staff_name", "StaffName"],
    inputter_code: ["入力者コード", "入力者CD", "inputter_code", "InputterCode"],
    inputter_name: ["入力者名", "inputter_name", "InputterName"],
  },
  equipment: {
    customer_code: ["得意先コード", "得意先CD", "customer_code", "CustomerCode"],
    equipment_no: ["設備番号", "設備No", "equipment_no", "EquipmentNo"],
    equipment_name: ["設備名", "equipment_name", "EquipmentName"],
    status_code: ["運転状況CD", "運転状況コード", "status_code", "StatusCode"],
    status_name: ["運転状況", "status_name", "StatusName"],
    model_code: ["機種コード", "機種CD", "model_code", "ModelCode"],
    model_name: ["機種名", "model_name", "ModelName"],
    maker_code: ["メーカーコード", "メーカーCD", "maker_code", "MakerCode"],
    maker_name: ["メーカー名", "maker_name", "MakerName"],
    model_type: ["型式", "型　　式", "model_type", "ModelType"],
    management_no: ["管理番号", "management_no", "ManagementNo"],
    postal_code: ["郵便番号", "postal_code", "PostalCode"],
    phone: ["電話番号", "phone", "Phone"],
    address1: ["住所１", "住所1", "address1", "Address1"],
    address2: ["住所２", "住所2", "address2", "Address2"],
    delivery_date: ["納入日", "delivery_date", "DeliveryDate"],
    inspection_cycle: ["点検周期", "inspection_cycle", "InspectionCycle"],
    next_inspection_date: ["次回点検日", "next_inspection_date", "NextInspectionDate"],
    inspection_notice: ["点検案内", "inspection_notice", "InspectionNotice"],
    dealer1: ["1次販売店", "dealer1", "Dealer1"],
    dealer2: ["2次販売店", "dealer2", "Dealer2"],
    dealer3: ["3次販売店", "dealer3", "Dealer3"],
    oil_used: ["使用オイル", "oil_used", "OilUsed"],
    remarks: ["備考", "remarks", "Remarks"],
    revision_date: ["修正日", "revision_date", "RevisionDate"],
    customer_name: ["得意先名", "customer_name", "CustomerName"],
  },
  customers: {
    customer_code: ["得意先コード", "得意先CD", "customer_code", "CustomerCode"],
    customer_name: ["得意先名", "customer_name", "CustomerName"],
    postal_code: ["郵便番号", "postal_code", "PostalCode"],
    phone: ["電話番号", "phone", "Phone"],
    address1: ["住所１", "住所1", "address1", "Address1"],
    address2: ["住所２", "住所2", "address2", "Address2"],
  },
};

/** ファイル名からインポート対象テーブルを推定 */
export function detectTableFromFilename(filename: string): ImportTable | null {
  const lower = filename.toLowerCase();
  if (
    lower.includes("maintenance") ||
    lower.includes("保守実績") ||
    lower.includes("hosyu") ||
    lower.includes("jisseki")
  ) {
    return "maintenance_records";
  }
  if (lower.includes("equipment") || lower.includes("設備")) {
    return "equipment";
  }
  if (lower.includes("customer") || lower.includes("得意先")) {
    return "customers";
  }
  return null;
}

/** CSVヘッダーからインポート対象テーブルを推定 */
export function detectTableFromHeaders(headers: string[]): ImportTable | null {
  const normalized = new Set(headers.map((h) => h.trim()));

  const has = (table: ImportTable, field: string) =>
    COLUMN_ALIASES[table][field]?.some((alias) => normalized.has(alias));

  if (has("maintenance_records", "work_date") || has("maintenance_records", "work_code")) {
    return "maintenance_records";
  }
  if (has("equipment", "equipment_name") || has("equipment", "model_type")) {
    return "equipment";
  }
  if (
    has("customers", "customer_name") &&
    !has("equipment", "equipment_no") &&
    !has("maintenance_records", "work_date")
  ) {
    return "customers";
  }
  return null;
}

/** 行データからDBカラム値を抽出 */
export function mapRow(
  table: ImportTable,
  row: Record<string, string>,
  headers: string[]
): Record<string, string> {
  const headerIndex = new Map(headers.map((h, i) => [h.trim(), i]));
  const result: Record<string, string> = {};

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES[table])) {
    for (const alias of aliases) {
      const idx = headerIndex.get(alias);
      if (idx !== undefined) {
        const key = headers[idx];
        result[field] = (row[key] ?? "").trim();
        break;
      }
    }
    if (!(field in result)) {
      result[field] = "";
    }
  }

  return result;
}
