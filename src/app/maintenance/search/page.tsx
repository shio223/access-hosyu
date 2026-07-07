/**
 * 保守実績データ検索画面
 * URL: /maintenance/search
 * 元フォーム: F-保守実績データ検索
 */
import { routes } from "@/lib/routes";
import { AccessFormWindow } from "@/components/access/access-form-window";
import { AccessSearchForm } from "@/components/access/access-search-form";
import { SearchFooterButtons } from "@/components/access/search-footer-buttons";
import type { SearchField } from "@/components/access/access-search-form";

/** 検索条件の項目定義（16項目） */
const fields: SearchField[] = [
  { label: "得意先コード", type: "range-select" },
  { label: "設備番号", type: "range-select" },
  { label: "運転状況コード", type: "range-select" },
  { label: "機種コード", type: "range-select" },
  { label: "メーカーコード", type: "range-select" },
  { label: "型　　式", type: "single" },
  { label: "管理番号", type: "single" },
  { label: "作業日", type: "range-text" },
  { label: "作業コード", type: "range-select" },
  { label: "作業内容", type: "single" },
  { label: "稼働時間", type: "range-text" },
  { label: "客先担当", type: "single" },
  { label: "担当者コード", type: "range-select" },
  { label: "電話番号", type: "range-text" },
  { label: "郵便番号", type: "range-text" },
  { label: "住　　所", type: "single" },
];

export default function MaintenanceSearchPage() {
  return (
    <AccessFormWindow title="F-保守実績データ検索" formTitle="保守実績データ検索画面">
      <AccessSearchForm fields={fields} headerStyle="green" />
      <SearchFooterButtons exitHref={routes.menuReference} />
    </AccessFormWindow>
  );
}
