import { MasterGridUpdate } from "@/components/access/master-grid-update";
import { areaMaster } from "@/lib/master-data";

export default function AreaMasterPage() {
  return (
    <MasterGridUpdate
      windowTitle="F-地区マスタ更新"
      formTitle="地区マスタ更新"
      codeLabel="地区コード"
      nameLabel="地区名"
      initialRows={areaMaster}
    />
  );
}
