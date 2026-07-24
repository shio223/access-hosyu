/** Supabase テーブル型（customers / maintenance_records） */

export type CustomerRow = {
  customer_code: string;
  customer_name: string | null;
  customer_name_kana: string | null;
  postal_code: string | null;
  address1: string | null;
  address2: string | null;
  phone: string | null;
  fax: string | null;
  representative_title: string | null;
  representative_name: string | null;
  region_code: string | null;
  region_name: string | null;
  industry_code: string | null;
  industry_name: string | null;
  staff_code: string | null;
  staff_name: string | null;
  generic_code1: string | null;
  generic_name1: string | null;
  generic_code2: string | null;
  generic_name2: string | null;
  generic_code3: string | null;
  generic_name3: string | null;
  generic_code4: string | null;
  generic_name4: string | null;
  imported_at: string;
};

export type CustomerInsert = {
  customer_code: string;
  customer_name?: string | null;
  customer_name_kana?: string | null;
  postal_code?: string | null;
  address1?: string | null;
  address2?: string | null;
  phone?: string | null;
  fax?: string | null;
  representative_title?: string | null;
  representative_name?: string | null;
  region_code?: string | null;
  region_name?: string | null;
  industry_code?: string | null;
  industry_name?: string | null;
  staff_code?: string | null;
  staff_name?: string | null;
  generic_code1?: string | null;
  generic_name1?: string | null;
  generic_code2?: string | null;
  generic_name2?: string | null;
  generic_code3?: string | null;
  generic_name3?: string | null;
  generic_code4?: string | null;
  generic_name4?: string | null;
  imported_at?: string;
};

export type MaintenanceRecordRow = {
  id: string;
  source_hash: string;
  customer_code: string;
  equipment_no: string;
  work_date: string | null;
  work_code: string;
  work_content: string | null;
  operating_hours: number | null;
  staff_code: string;
  customer_contact: string | null;
  inputter_code: string | null;
  imported_at: string;
};

export type MaintenanceRecordInsert = {
  id?: string;
  source_hash: string;
  customer_code: string;
  equipment_no: string;
  work_date?: string | null;
  work_code?: string;
  work_content?: string | null;
  operating_hours?: number | null;
  staff_code?: string;
  customer_contact?: string | null;
  inputter_code?: string | null;
  imported_at?: string;
};

export type EquipmentMasterRow = {
  customer_code: string;
  equipment_number: string;
  equipment_name: string | null;
  machine_code: string | null;
  maker_code: string | null;
  model: string | null;
  management_number: string | null;
  installation_date: string | null;
  inspection_cycle: string | null;
  next_inspection_date: string | null;
  inspection_notice: string | null;
  dealer1_code: string | null;
  dealer2_code: string | null;
  dealer3_code: string | null;
  oil_type: string | null;
  generic_code1: string | null;
  generic_code2: string | null;
  generic_code3: string | null;
  generic_code4: string | null;
  remarks: string | null;
  operation_status_code: string | null;
  updated_at_source: string | null;
  imported_at: string;
};

export type EquipmentMasterInsert = {
  customer_code: string;
  equipment_number: string;
  equipment_name?: string | null;
  machine_code?: string | null;
  maker_code?: string | null;
  model?: string | null;
  management_number?: string | null;
  installation_date?: string | null;
  inspection_cycle?: string | null;
  next_inspection_date?: string | null;
  inspection_notice?: string | null;
  dealer1_code?: string | null;
  dealer2_code?: string | null;
  dealer3_code?: string | null;
  oil_type?: string | null;
  generic_code1?: string | null;
  generic_code2?: string | null;
  generic_code3?: string | null;
  generic_code4?: string | null;
  remarks?: string | null;
  operation_status_code?: string | null;
  updated_at_source?: string | null;
  imported_at?: string;
};

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: CustomerRow;
        Insert: CustomerInsert;
        Update: Partial<CustomerInsert>;
        Relationships: [];
      };
      maintenance_records: {
        Row: MaintenanceRecordRow;
        Insert: MaintenanceRecordInsert;
        Update: Partial<MaintenanceRecordInsert>;
        Relationships: [];
      };
      equipment_master: {
        Row: EquipmentMasterRow;
        Insert: EquipmentMasterInsert;
        Update: Partial<EquipmentMasterInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
