import { MasterGridUpdate } from "@/components/access/master-grid-update";
import { workMaster } from "@/lib/master-data";

export default function WorkMasterPage() {
  return (
    <MasterGridUpdate
      windowTitle="F-作業マスタ更新"
      formTitle="作業マスタ更新"
      codeLabel="作業コード"
      nameLabel="作　業　名"
      initialRows={workMaster}
    />
  );
}
