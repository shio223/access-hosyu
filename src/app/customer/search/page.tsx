/**
 * 得意先マスタ検索画面
 * URL: /customer/search
 * 元フォーム: F_得意先マスタ検索
 */
import { routes } from "@/lib/routes";
import { AccessFormWindow } from "@/components/access/access-form-window";
import { AccessSearchForm } from "@/components/access/access-search-form";
import { SearchFooterButtons } from "@/components/access/search-footer-buttons";
import type { SearchField } from "@/components/access/access-search-form";

/** 検索条件の項目定義（元Accessフォームの行順に対応） */
const fields: SearchField[] = [
  { label: "得意先コード", type: "range-select" },
  { label: "地区コード", type: "range-select" },
  { label: "業種コード", type: "range-select" },
  { label: "担当者コード", type: "range-select" },
  { label: "汎用コード１", type: "range-select" },
  { label: "汎用コード２", type: "range-select" },
  { label: "汎用コード３", type: "range-select" },
  { label: "汎用コード４", type: "range-select" },
  { label: "電話番号", type: "range-text" },
  { label: "郵便番号", type: "range-text" },
  { label: "住所", type: "single" },
];

export default function CustomerSearchPage() {
  return (
    <AccessFormWindow title="F_得意先マスタ検索" formTitle="得意先マスタ検索画面">
      <AccessSearchForm fields={fields} />
      <SearchFooterButtons exitHref={routes.menuReference} />
    </AccessFormWindow>
  );
}
