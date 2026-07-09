import { MasterGridUpdate } from "@/components/access/master-grid-update";
import { makerMaster } from "@/lib/master-data";

export default function MakerMasterPage() {
  return (
    <MasterGridUpdate
      windowTitle="F-メーカーマスタ更新"
      formTitle="メーカーマスタ更新"
      codeLabel="メーカーコード"
      nameLabel="メーカー名"
      initialRows={makerMaster}
    />
  );
}
