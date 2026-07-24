import type { EquipmentDetail } from "@/lib/db/types";
import {
  dealerMaster,
  makerMaster,
  modelMaster,
  statusMaster,
} from "@/lib/master-data";

function nameFrom(
  rows: { code: string; name: string }[],
  code: string | null | undefined
): string {
  if (!code) return "";
  return rows.find((r) => r.code === code)?.name ?? "";
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return String(value).slice(0, 10).replace(/-/g, "/");
}

/** YYYY-MM-DD / Date 文字列比較用。空は最古扱い */
export function maxDateString(
  dates: (string | null | undefined)[]
): string | null {
  let best: string | null = null;
  for (const raw of dates) {
    if (raw == null || raw === "") continue;
    const d = String(raw).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
    if (best == null || d > best) best = d;
  }
  return best;
}

function dealerLabel(code: string | null | undefined): string {
  if (!code) return "";
  const name = nameFrom(dealerMaster, code);
  return name ? `${code}　${name}` : code;
}

export type EquipmentMasterDbRow = {
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
  remarks: string | null;
  operation_status_code: string | null;
  updated_at_source: string | null;
};

export type CustomerLite = {
  customer_name: string | null;
  postal_code: string | null;
  phone: string | null;
  address1: string | null;
  address2: string | null;
};

/** equipment_master + customers → 画面用 EquipmentDetail */
export function mapEquipmentMasterToDetail(
  row: EquipmentMasterDbRow,
  customer?: CustomerLite | null,
  options?: {
    /** 同一得意先コード内の最新次回点検日（あれば優先） */
    latestNextInspectionDate?: string | null;
  }
): EquipmentDetail {
  const statusCode = row.operation_status_code ?? "";
  const machineCode = row.machine_code ?? "";
  const makerCode = row.maker_code ?? "";
  const nextInspection =
    options?.latestNextInspectionDate ?? row.next_inspection_date;

  return {
    customerCode: row.customer_code,
    customerName: customer?.customer_name ?? "",
    equipmentNo: row.equipment_number,
    equipmentName: row.equipment_name ?? "",
    statusCode,
    statusName: nameFrom(statusMaster, statusCode),
    modelCode: machineCode,
    modelName: nameFrom(modelMaster, machineCode),
    makerCode,
    makerName: nameFrom(makerMaster, makerCode),
    modelType: row.model ?? "",
    managementNo: row.management_number ?? "",
    remarks: row.remarks ?? "",
    postalCode: customer?.postal_code ?? "",
    phone: customer?.phone ?? "",
    address1: customer?.address1 ?? "",
    address2: customer?.address2 ?? "",
    deliveryDate: formatDate(row.installation_date),
    inspectionCycle: row.inspection_cycle ?? "",
    nextInspectionDate: formatDate(nextInspection),
    inspectionNotice: row.inspection_notice ?? "",
    dealer1: dealerLabel(row.dealer1_code),
    dealer2: dealerLabel(row.dealer2_code),
    dealer3: dealerLabel(row.dealer3_code),
    oilUsed: row.oil_type ?? "",
    revisionDate: formatDate(row.updated_at_source),
  };
}
