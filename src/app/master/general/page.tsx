import { MasterGridUpdate } from "@/components/access/master-grid-update";

export default function GeneralMasterPage() {
  return (
    <MasterGridUpdate
      masterType="general"
      windowTitle="F-汎用マスタ更新"
      formTitle="汎用マスタ更新"
      codeLabel="汎用コード"
      nameLabel="汎用名"
    />
  );
}
