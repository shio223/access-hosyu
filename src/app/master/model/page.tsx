import { MasterGridUpdate } from "@/components/access/master-grid-update";
import { modelMaster } from "@/lib/master-data";

export default function ModelMasterPage() {
  return (
    <MasterGridUpdate
      windowTitle="F-機種マスタ更新"
      formTitle="機種マスタ更新"
      codeLabel="機種コード"
      nameLabel="機種名"
      initialRows={modelMaster}
    />
  );
}
