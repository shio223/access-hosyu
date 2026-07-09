import { MasterGridUpdate } from "@/components/access/master-grid-update";
import { staffMaster } from "@/lib/master-data";

export default function StaffMasterPage() {
  return (
    <MasterGridUpdate
      windowTitle="F-担当者マスタ更新"
      formTitle="担当者マスタ更新"
      codeLabel="担当者コード"
      nameLabel="担　当　者　名"
      initialRows={staffMaster}
    />
  );
}
