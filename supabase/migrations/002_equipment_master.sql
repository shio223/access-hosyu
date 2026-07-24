-- 設備マスタ（Access: T_設備マスタ）
-- 新規テーブルのみ作成。既存テーブルの DROP / ALTER は行わない。
-- UNIQUE は (customer_code, equipment_number)。
--   ※ 元Excelでは設備番号単体の重複が多い（例: "001" が複数得意先に存在）ため、
--     equipment_number 単独 UNIQUE にはしない。
-- RLS: authenticated のみ SELECT（anon 不可）
-- INSERT/UPDATE/DELETE は service_role（CLI）想定。

CREATE TABLE IF NOT EXISTS public.equipment_master (
  customer_code text NOT NULL,
  equipment_number text NOT NULL,
  equipment_name text,
  machine_code text,
  maker_code text,
  model text,
  management_number text,
  installation_date date,
  inspection_cycle text,
  next_inspection_date date,
  inspection_notice text,
  dealer1_code text,
  dealer2_code text,
  dealer3_code text,
  oil_type text,
  generic_code1 text,
  generic_code2 text,
  generic_code3 text,
  generic_code4 text,
  remarks text,
  operation_status_code text,
  updated_at_source date,
  imported_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT equipment_master_pkey PRIMARY KEY (customer_code, equipment_number)
);

CREATE INDEX IF NOT EXISTS idx_equipment_master_equipment_number
  ON public.equipment_master (equipment_number);
CREATE INDEX IF NOT EXISTS idx_equipment_master_customer_code
  ON public.equipment_master (customer_code);
CREATE INDEX IF NOT EXISTS idx_equipment_master_machine_code
  ON public.equipment_master (machine_code);
CREATE INDEX IF NOT EXISTS idx_equipment_master_maker_code
  ON public.equipment_master (maker_code);

ALTER TABLE public.equipment_master ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS equipment_master_select_authenticated ON public.equipment_master;
CREATE POLICY equipment_master_select_authenticated
  ON public.equipment_master
  FOR SELECT
  TO authenticated
  USING (true);
