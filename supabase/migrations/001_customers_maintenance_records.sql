-- 新規テーブルのみ作成。既存テーブルの DROP / ALTER は行わない。
-- source_hash のみ UNIQUE（自然キー5列の UNIQUE は付けない）
-- RLS: authenticated のみ SELECT（anon 不可）
-- INSERT/UPDATE/DELETE は service_role（CLI）想定。authenticated には付与しない。

CREATE TABLE IF NOT EXISTS public.customers (
  customer_code text PRIMARY KEY,
  customer_name text,
  customer_name_kana text,
  postal_code text,
  address1 text,
  address2 text,
  phone text,
  fax text,
  representative_title text,
  representative_name text,
  region_code text,
  region_name text,
  industry_code text,
  industry_name text,
  staff_code text,
  staff_name text,
  generic_code1 text,
  generic_name1 text,
  generic_code2 text,
  generic_name2 text,
  generic_code3 text,
  generic_name3 text,
  generic_code4 text,
  generic_name4 text,
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_name
  ON public.customers (customer_name);

CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_hash text NOT NULL,
  customer_code text NOT NULL,
  equipment_no text NOT NULL,
  work_date date,
  work_code text NOT NULL DEFAULT '',
  work_content text,
  operating_hours integer,
  staff_code text NOT NULL DEFAULT '',
  customer_contact text,
  inputter_code text,
  imported_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT maintenance_records_source_hash_key UNIQUE (source_hash)
);

CREATE INDEX IF NOT EXISTS idx_maint_customer_equipment
  ON public.maintenance_records (customer_code, equipment_no);
CREATE INDEX IF NOT EXISTS idx_maint_work_date
  ON public.maintenance_records (work_date DESC);
CREATE INDEX IF NOT EXISTS idx_maint_work_code
  ON public.maintenance_records (work_code);
CREATE INDEX IF NOT EXISTS idx_maint_staff_code
  ON public.maintenance_records (staff_code);
CREATE INDEX IF NOT EXISTS idx_maint_customer_code
  ON public.maintenance_records (customer_code);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;

-- 既存ポリシー名があっても再実行できるよう DROP IF EXISTS
DROP POLICY IF EXISTS customers_select_authenticated ON public.customers;
CREATE POLICY customers_select_authenticated
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS maintenance_records_select_authenticated ON public.maintenance_records;
CREATE POLICY maintenance_records_select_authenticated
  ON public.maintenance_records
  FOR SELECT
  TO authenticated
  USING (true);
