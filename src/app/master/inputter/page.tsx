import { MasterGridUpdate } from "@/components/access/master-grid-update";
import { inputterMaster } from "@/lib/master-data";

export default function InputterMasterPage() {
  return (
    <MasterGridUpdate
      windowTitle="F-入力者マスタ更新"
      formTitle="入力者マスタ更新"
      codeLabel="入力者コード"
      nameLabel="入力者名"
      initialRows={inputterMaster}
    />
  );
}
