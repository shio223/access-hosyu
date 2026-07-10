import { MasterGridUpdate } from "@/components/access/master-grid-update";

export default function StaffMasterPage() {
  return (
    <MasterGridUpdate
      masterType="staff"
      windowTitle="F-担当者マスタ更新"
      formTitle="担当者マスタ更新"
      codeLabel="担当者コード"
      nameLabel="担　当　者　名"
    />
  );
}
