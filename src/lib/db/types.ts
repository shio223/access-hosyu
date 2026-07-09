/** 設備マスタ（設備別保守実績照会の設備情報） */
export interface EquipmentDetail {
  customerCode: string;
  customerName: string;
  equipmentNo: string;
  equipmentName: string;
  statusCode: string;
  statusName: string;
  modelCode: string;
  modelName: string;
  makerCode: string;
  makerName: string;
  modelType: string;
  managementNo: string;
  remarks: string;
  postalCode: string;
  phone: string;
  address1: string;
  address2: string;
  deliveryDate: string;
  inspectionCycle: string;
  nextInspectionDate: string;
  inspectionNotice: string;
  dealer1: string;
  dealer2: string;
  dealer3: string;
  oilUsed: string;
  revisionDate: string;
}

/** 保守実績1件 */
export interface MaintenanceRecord {
  workDate: string;
  workCode: string;
  workType: string;
  workContent: string;
  operatingHours: string;
  customerContact: string;
  staffCode: string;
  staffName: string;
  inputterCode: string;
  inputterName: string;
}

/** インポート統計 */
export interface ImportStats {
  maintenanceRecordCount: number;
  equipmentCount: number;
  customerCount: number;
  lastImportAt: string | null;
}

/** インポート結果 */
export interface ImportResult {
  table: string;
  inserted: number;
  skipped: number;
  errors: string[];
}
