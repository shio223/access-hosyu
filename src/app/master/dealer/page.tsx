import { MasterGridUpdate } from "@/components/access/master-grid-update";
import { dealerMaster } from "@/lib/master-data";

export default function DealerMasterPage() {
  return (
    <MasterGridUpdate
      windowTitle="F-販売店マスタ更新"
      formTitle="販売店マスタ更新"
      codeLabel="販売店コード"
      nameLabel="販売店名"
      initialRows={dealerMaster}
    />
  );
}
