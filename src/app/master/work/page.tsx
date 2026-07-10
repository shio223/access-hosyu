import { MasterGridUpdate } from "@/components/access/master-grid-update";

export default function WorkMasterPage() {
  return (
    <MasterGridUpdate
      masterType="work"
      windowTitle="F-作業マスタ更新"
      formTitle="作業マスタ更新"
      codeLabel="作業コード"
      nameLabel="作　業　名"
    />
  );
}
