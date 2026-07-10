import { MasterGridUpdate } from "@/components/access/master-grid-update";

export default function MakerMasterPage() {
  return (
    <MasterGridUpdate
      masterType="maker"
      windowTitle="F-メーカーマスタ更新"
      formTitle="メーカーマスタ更新"
      codeLabel="メーカーコード"
      nameLabel="メーカー名"
    />
  );
}
