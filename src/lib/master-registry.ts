import type { MasterRow } from "@/lib/master-data";
import {
  areaMaster,
  generalMaster,
  industryMaster,
  inputterMaster,
  makerMaster,
  modelMaster,
  staffMaster,
  statusMaster,
  workMaster,
} from "@/lib/master-data";

export type MasterType =
  | "staff"
  | "status"
  | "work"
  | "industry"
  | "inputter"
  | "general"
  | "area"
  | "maker"
  | "model";

export const MASTER_DEFAULTS: Record<MasterType, MasterRow[]> = {
  staff: staffMaster,
  status: statusMaster,
  work: workMaster,
  industry: industryMaster,
  inputter: inputterMaster,
  general: generalMaster,
  area: areaMaster,
  maker: makerMaster,
  model: modelMaster,
};

export function isMasterType(value: string): value is MasterType {
  return Object.prototype.hasOwnProperty.call(MASTER_DEFAULTS, value);
}
