import { MasterGridUpdate } from "@/components/access/master-grid-update";
import { generalMaster } from "@/lib/master-data";

export default function GeneralMasterPage() {
  return (
    <MasterGridUpdate
      windowTitle="F-汎用マスタ更新"
      formTitle="汎用マスタ更新"
      codeLabel="汎用コード"
      nameLabel="汎用名"
      initialRows={generalMaster}
    />
  );
}
