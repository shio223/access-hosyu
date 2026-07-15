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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
