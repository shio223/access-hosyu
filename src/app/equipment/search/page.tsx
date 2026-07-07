/**
 * 設備マスタ検索画面
 * URL: /equipment/search
 * 元フォーム: F-設備マスタ検索（項目数が多いため専用フォームコンポーネント使用）
 */
import { routes } from "@/lib/routes";
import { AccessFormWindow } from "@/components/access/access-form-window";
import { AccessEquipmentSearchForm } from "@/components/access/access-search-form";
import { SearchFooterButtons } from "@/components/access/search-footer-buttons";
import type { SearchField } from "@/components/access/access-search-form";

/** 検索条件の項目定義（23項目） */
const fields: SearchField[] = [
  { label: "得意先コード", type: "select" },
  { label: "設備番号", type: "single" },
  { label: "機種コード", type: "select" },
  { label: "メーカーコード", type: "select" },
  { label: "１次販売店", type: "select" },
  { label: "２次販売店", type: "select" },
  { label: "３次販売店", type: "select" },
  { label: "納入日", type: "range-text" },
  { label: "点検周期", type: "range-text" },
  { label: "次回点検日", type: "range-text" },
  { label: "点検案内", type: "select" },
  { label: "運転状況コード", type: "select" },
  { label: "汎用コード１", type: "select" },
  { label: "汎用コード２", type: "select" },
  { label: "汎用コード３", type: "select" },
  { label: "汎用コード４", type: "select" },
  { label: "型　　式", type: "single" },
  { label: "管理番号", type: "single" },
  { label: "使用オイル", type: "single" },
  { label: "備　　考", type: "textarea" },
  { label: "電話番号", type: "range-text" },
  { label: "郵便番号", type: "range-text" },
  { label: "住　　所", type: "single" },
];

export default function EquipmentSearchPage() {
  return (
    <AccessFormWindow title="F-設備マスタ検索" formTitle="設備マスタ検索画面">
      <AccessEquipmentSearchForm fields={fields} />
      <SearchFooterButtons exitHref={routes.menuReference} />
    </AccessFormWindow>
  );
}
