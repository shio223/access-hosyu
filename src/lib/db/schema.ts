/** SQLite スキーマ定義（将来 Supabase 移行時も同構造を流用） */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS customers (
  customer_code TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL DEFAULT '',
  postal_code TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address1 TEXT DEFAULT '',
  address2 TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_code TEXT NOT NULL,
  equipment_no TEXT NOT NULL,
  equipment_name TEXT DEFAULT '',
  status_code TEXT DEFAULT '',
  status_name TEXT DEFAULT '',
  model_code TEXT DEFAULT '',
  model_name TEXT DEFAULT '',
  maker_code TEXT DEFAULT '',
  maker_name TEXT DEFAULT '',
  model_type TEXT DEFAULT '',
  management_no TEXT DEFAULT '',
  postal_code TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address1 TEXT DEFAULT '',
  address2 TEXT DEFAULT '',
  delivery_date TEXT DEFAULT '',
  inspection_cycle TEXT DEFAULT '',
  next_inspection_date TEXT DEFAULT '',
  inspection_notice TEXT DEFAULT '',
  dealer1 TEXT DEFAULT '',
  dealer2 TEXT DEFAULT '',
  dealer3 TEXT DEFAULT '',
  oil_used TEXT DEFAULT '',
  remarks TEXT DEFAULT '',
  revision_date TEXT DEFAULT '',
  UNIQUE(customer_code, equipment_no)
);

CREATE TABLE IF NOT EXISTS maintenance_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_code TEXT NOT NULL,
  equipment_no TEXT NOT NULL,
  work_date TEXT DEFAULT '',
  work_code TEXT DEFAULT '',
  work_type TEXT DEFAULT '',
  work_content TEXT DEFAULT '',
  operating_hours TEXT DEFAULT '',
  customer_contact TEXT DEFAULT '',
  staff_code TEXT DEFAULT '',
  staff_name TEXT DEFAULT '',
  inputter_code TEXT DEFAULT '',
  inputter_name TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_maintenance_customer_equipment
  ON maintenance_records(customer_code, equipment_no);
CREATE INDEX IF NOT EXISTS idx_maintenance_work_date
  ON maintenance_records(work_date DESC);
CREATE INDEX IF NOT EXISTS idx_equipment_customer
  ON equipment(customer_code, equipment_no);

CREATE TABLE IF NOT EXISTS import_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS masters (
  master_type TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (master_type, code)
);

CREATE INDEX IF NOT EXISTS idx_masters_type_order
  ON masters(master_type, sort_order);
`;
