import { MasterGridUpdate } from "@/components/access/master-grid-update";

export default function IndustryMasterPage() {
  return (
    <MasterGridUpdate
      masterType="industry"
      windowTitle="F-業種マスタ更新"
      formTitle="業種マスタ更新"
      codeLabel="業種コード"
      nameLabel="業種名"
    />
  );
}
