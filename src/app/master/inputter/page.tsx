import { MasterGridUpdate } from "@/components/access/master-grid-update";

export default function InputterMasterPage() {
  return (
    <MasterGridUpdate
      masterType="inputter"
      windowTitle="F-入力者マスタ更新"
      formTitle="入力者マスタ更新"
      codeLabel="入力者コード"
      nameLabel="入力者名"
    />
  );
}
