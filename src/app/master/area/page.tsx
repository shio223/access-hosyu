import { MasterGridUpdate } from "@/components/access/master-grid-update";

export default function AreaMasterPage() {
  return (
    <MasterGridUpdate
      masterType="area"
      windowTitle="F-地区マスタ更新"
      formTitle="地区マスタ更新"
      codeLabel="地区コード"
      nameLabel="地区名"
    />
  );
}
