import { MasterGridUpdate } from "@/components/access/master-grid-update";
import { industryMaster } from "@/lib/master-data";

export default function IndustryMasterPage() {
  return (
    <MasterGridUpdate
      windowTitle="F-業種マスタ更新"
      formTitle="業種マスタ更新"
      codeLabel="業種コード"
      nameLabel="業種名"
      initialRows={industryMaster}
    />
  );
}
