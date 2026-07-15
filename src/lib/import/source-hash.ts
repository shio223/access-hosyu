import { createHash } from "node:crypto";

/**
 * Excel 元9列から安定した source_hash（SHA-256 hex）を生成する。
 * 存在しない情報の補完はしない。正規化ルールを変えると再インポートで二重登録になるため固定。
 */
export type MaintenanceSourceFields = {
  customerCode: string;
  equipmentNo: string;
  workDate: string | null;
  workCode: string;
  workContent: string | null;
  operatingHours: number | null;
  staffCode: string;
  customerContact: string | null;
  inputterCode: string | null;
};

const SEP = "\x1f";

function trimStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

/** コード・テキスト列: trim のみ（先頭ゼロを消さない） */
export function asCodeText(v: unknown): string {
  return trimStr(v);
}

/** 空は null。数値以外は変換しない（呼び出し側で型を確定） */
export function asNullableInt(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) {
    return Math.trunc(v);
  }
  if (typeof v === "string" && v.trim() !== "" && /^-?\d+$/.test(v.trim())) {
    return Number.parseInt(v.trim(), 10);
  }
  return null;
}

/** 作業日を YYYY-MM-DD または null に正規化 */
export function asWorkDate(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return null;
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    // Excel シリアル日付（xlsx が Date にしない場合）
    const epoch = Date.UTC(1899, 11, 30);
    const ms = epoch + Math.round(v) * 86400000;
    const dt = new Date(ms);
    if (!Number.isNaN(dt.getTime())) {
      const y = dt.getUTCFullYear();
      const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
      const d = String(dt.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  return null;
}

export function buildSourceHashInput(fields: MaintenanceSourceFields): string {
  const hours =
    fields.operatingHours == null ? "" : String(fields.operatingHours);
  return [
    fields.customerCode,
    fields.equipmentNo,
    fields.workDate ?? "",
    fields.workCode,
    fields.workContent ?? "",
    hours,
    fields.staffCode,
    fields.customerContact ?? "",
    fields.inputterCode ?? "",
  ].join(SEP);
}

export function computeSourceHash(fields: MaintenanceSourceFields): string {
  return createHash("sha256")
    .update(buildSourceHashInput(fields), "utf8")
    .digest("hex");
}
