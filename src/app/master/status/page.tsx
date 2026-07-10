import { MasterGridUpdate } from "@/components/access/master-grid-update";

export default function StatusMasterPage() {
  return (
    <MasterGridUpdate
      masterType="status"
      windowTitle="F-運転状況マスタ更新"
      formTitle="運転状況マスタ更新"
      codeLabel="運転状況コード"
      nameLabel="運転状況名"
    />
  );
}
