import { getDb } from "./index";
import type { EquipmentDetail, ImportStats, MaintenanceRecord } from "./types";

type EquipmentRow = {
  customer_code: string;
  customer_name: string;
  equipment_no: string;
  equipment_name: string;
  status_code: string;
  status_name: string;
  model_code: string;
  model_name: string;
  maker_code: string;
  maker_name: string;
  model_type: string;
  management_no: string;
  postal_code: string;
  phone: string;
  address1: string;
  address2: string;
  delivery_date: string;
  inspection_cycle: string;
  next_inspection_date: string;
  inspection_notice: string;
  dealer1: string;
  dealer2: string;
  dealer3: string;
  oil_used: string;
  remarks: string;
  revision_date: string;
};

function rowToEquipmentDetail(row: EquipmentRow): EquipmentDetail {
  return {
    customerCode: row.customer_code,
    customerName: row.customer_name,
    equipmentNo: row.equipment_no,
    equipmentName: row.equipment_name,
    statusCode: row.status_code,
    statusName: row.status_name,
    modelCode: row.model_code,
    modelName: row.model_name,
    makerCode: row.maker_code,
    makerName: row.maker_name,
    modelType: row.model_type,
    managementNo: row.management_no,
    remarks: row.remarks,
    postalCode: row.postal_code,
    phone: row.phone,
    address1: row.address1,
    address2: row.address2,
    deliveryDate: row.delivery_date,
    inspectionCycle: row.inspection_cycle,
    nextInspectionDate: row.next_inspection_date,
    inspectionNotice: row.inspection_notice,
    dealer1: row.dealer1,
    dealer2: row.dealer2,
    dealer3: row.dealer3,
    oilUsed: row.oil_used,
    revisionDate: row.revision_date,
  };
}

/** インポート統計を取得 */
export function getImportStats(): ImportStats {
  const db = getDb();
  const maintenanceRecordCount =
    (db.prepare("SELECT COUNT(*) AS c FROM maintenance_records").get() as { c: number }).c;
  const equipmentCount =
    (db.prepare("SELECT COUNT(*) AS c FROM equipment").get() as { c: number }).c;
  const customerCount =
    (db.prepare("SELECT COUNT(*) AS c FROM customers").get() as { c: number }).c;
  const lastImportRow = db
    .prepare("SELECT value FROM import_meta WHERE key = 'last_import_at'")
    .get() as { value: string } | undefined;

  return {
    maintenanceRecordCount,
    equipmentCount,
    customerCount,
    lastImportAt: lastImportRow?.value ?? null,
  };
}

/** 最終インポート日時を記録 */
export function setLastImportAt(isoDate: string): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO import_meta (key, value, updated_at)
     VALUES ('last_import_at', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  ).run(isoDate);
}

/** 設備を1件取得（得意先コード＋設備番号） */
export function getEquipmentDetail(
  customerCode: string,
  equipmentNo: string
): EquipmentDetail | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT e.*, COALESCE(c.customer_name, '') AS customer_name
       FROM equipment e
       LEFT JOIN customers c ON c.customer_code = e.customer_code
       WHERE e.customer_code = ? AND e.equipment_no = ?`
    )
    .get(customerCode, equipmentNo) as EquipmentRow | undefined;

  return row ? rowToEquipmentDetail(row) : null;
}

/** 先頭の設備を1件取得 */
export function getFirstEquipment(): EquipmentDetail | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT e.*, COALESCE(c.customer_name, '') AS customer_name
       FROM equipment e
       LEFT JOIN customers c ON c.customer_code = e.customer_code
       ORDER BY e.customer_code, e.equipment_no
       LIMIT 1`
    )
    .get() as EquipmentRow | undefined;

  return row ? rowToEquipmentDetail(row) : null;
}

export type EquipmentSearchFilter = {
  customerCode?: string;
  equipmentNo?: string;
  customerName?: string;
  equipmentName?: string;
  modelType?: string;
  managementNo?: string;
  /** 下部検索ボックス用の横断検索 */
  q?: string;
};

const EQUIPMENT_SELECT = `
  SELECT e.*, COALESCE(c.customer_name, '') AS customer_name
  FROM equipment e
  LEFT JOIN customers c ON c.customer_code = e.customer_code
`;

/** 設備を条件検索（照会画面の検索・ナビ用） */
export function searchEquipmentList(
  filter: EquipmentSearchFilter,
  limit = 500
): EquipmentDetail[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filter.customerCode?.trim()) {
    conditions.push("e.customer_code LIKE ?");
    params.push(`%${filter.customerCode.trim()}%`);
  }
  if (filter.equipmentNo?.trim()) {
    conditions.push("e.equipment_no LIKE ?");
    params.push(`%${filter.equipmentNo.trim()}%`);
  }
  if (filter.customerName?.trim()) {
    conditions.push("c.customer_name LIKE ?");
    params.push(`%${filter.customerName.trim()}%`);
  }
  if (filter.equipmentName?.trim()) {
    conditions.push("e.equipment_name LIKE ?");
    params.push(`%${filter.equipmentName.trim()}%`);
  }
  if (filter.modelType?.trim()) {
    conditions.push("e.model_type LIKE ?");
    params.push(`%${filter.modelType.trim()}%`);
  }
  if (filter.managementNo?.trim()) {
    conditions.push("e.management_no LIKE ?");
    params.push(`%${filter.managementNo.trim()}%`);
  }
  if (filter.q?.trim()) {
    const q = `%${filter.q.trim()}%`;
    conditions.push(`(
      e.customer_code LIKE ? OR e.equipment_no LIKE ? OR
      c.customer_name LIKE ? OR e.equipment_name LIKE ? OR
      e.management_no LIKE ? OR e.model_type LIKE ?
    )`);
    params.push(q, q, q, q, q, q);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  params.push(limit);

  const rows = db
    .prepare(
      `${EQUIPMENT_SELECT}
       ${where}
       ORDER BY e.customer_code, e.equipment_no
       LIMIT ?`
    )
    .all(...params) as EquipmentRow[];

  return rows.map(rowToEquipmentDetail);
}

/** 設備一覧（ナビゲーション用） */
export function listEquipmentKeys(): Array<{ customerCode: string; equipmentNo: string }> {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT customer_code, equipment_no
       FROM equipment
       ORDER BY customer_code, equipment_no`
    )
    .all() as Array<{ customer_code: string; equipment_no: string }>;

  return rows.map((r) => ({
    customerCode: r.customer_code,
    equipmentNo: r.equipment_no,
  }));
}

/** 得意先コードのルックアップ（コンボボックス用） */
export function lookupCustomers(q?: string, limit = 50): Array<{
  customerCode: string;
  customerName: string;
}> {
  const db = getDb();
  const rows = q?.trim()
    ? (db
        .prepare(
          `SELECT customer_code, customer_name FROM customers
           WHERE customer_code LIKE ? OR customer_name LIKE ?
           ORDER BY customer_code LIMIT ?`
        )
        .all(`%${q.trim()}%`, `%${q.trim()}%`, limit) as Array<{
        customer_code: string;
        customer_name: string;
      }>)
    : (db
        .prepare(
          `SELECT customer_code, customer_name FROM customers
           ORDER BY customer_code LIMIT ?`
        )
        .all(limit) as Array<{ customer_code: string; customer_name: string }>);

  return rows.map((r) => ({
    customerCode: r.customer_code,
    customerName: r.customer_name,
  }));
}

/** 設備番号のルックアップ（得意先コードで絞り込み） */
export function lookupEquipment(
  customerCode: string,
  q?: string,
  limit = 50
): Array<{ equipmentNo: string; equipmentName: string }> {
  const db = getDb();
  if (!customerCode.trim()) return [];

  const rows = q?.trim()
    ? (db
        .prepare(
          `SELECT equipment_no, equipment_name FROM equipment
           WHERE customer_code = ? AND (equipment_no LIKE ? OR equipment_name LIKE ?)
           ORDER BY equipment_no LIMIT ?`
        )
        .all(customerCode.trim(), `%${q.trim()}%`, `%${q.trim()}%`, limit) as Array<{
        equipment_no: string;
        equipment_name: string;
      }>)
    : (db
        .prepare(
          `SELECT equipment_no, equipment_name FROM equipment
           WHERE customer_code = ?
           ORDER BY equipment_no LIMIT ?`
        )
        .all(customerCode.trim(), limit) as Array<{
        equipment_no: string;
        equipment_name: string;
      }>);

  return rows.map((r) => ({
    equipmentNo: r.equipment_no,
    equipmentName: r.equipment_name,
  }));
}

/** 保守実績履歴を取得 */
export function getMaintenanceHistory(
  customerCode: string,
  equipmentNo: string
): MaintenanceRecord[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT work_date, work_code, work_type, work_content,
              operating_hours, customer_contact,
              staff_code, staff_name, inputter_code, inputter_name
       FROM maintenance_records
       WHERE customer_code = ? AND equipment_no = ?
       ORDER BY work_date DESC, id DESC`
    )
    .all(customerCode, equipmentNo) as Array<{
    work_date: string;
    work_code: string;
    work_type: string;
    work_content: string;
    operating_hours: string;
    customer_contact: string;
    staff_code: string;
    staff_name: string;
    inputter_code: string;
    inputter_name: string;
  }>;

  return rows.map((r) => ({
    workDate: r.work_date,
    workCode: r.work_code,
    workType: r.work_type,
    workContent: r.work_content,
    operatingHours: r.operating_hours,
    customerContact: r.customer_contact,
    staffCode: r.staff_code,
    staffName: r.staff_name,
    inputterCode: r.inputter_code,
    inputterName: r.inputter_name,
  }));
}
