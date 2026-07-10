import { MasterGridUpdate } from "@/components/access/master-grid-update";

export default function ModelMasterPage() {
  return (
    <MasterGridUpdate
      masterType="model"
      windowTitle="F-機種マスタ更新"
      formTitle="機種マスタ更新"
      codeLabel="機種コード"
      nameLabel="機種名"
    />
  );
}
