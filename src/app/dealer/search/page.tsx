/**
 * 販売店マスタ検索画面
 * URL: /dealer/search
 * 元フォーム: F-販売店マスタ検索（ヘッダーは緑＋黄文字スタイル）
 */
import { routes } from "@/lib/routes";
import { AccessFormWindow } from "@/components/access/access-form-window";
import { AccessSearchForm } from "@/components/access/access-search-form";
import { SearchFooterButtons } from "@/components/access/search-footer-buttons";
import type { SearchField } from "@/components/access/access-search-form";

/** 検索条件の項目定義 */
const fields: SearchField[] = [
  { label: "販売店コード", type: "range-select" },
  { label: "担当者コード", type: "range-select" },
  { label: "汎用コード１", type: "range-select" },
  { label: "汎用コード２", type: "range-select" },
  { label: "汎用コード３", type: "range-select" },
  { label: "汎用コード４", type: "range-select" },
  { label: "電話番号", type: "range-text" },
  { label: "郵便番号", type: "range-text" },
  { label: "住　　所", type: "single" },
];

export default function DealerSearchPage() {
  return (
    <AccessFormWindow title="F-販売店マスタ検索" formTitle="販売店マスタ検索画面">
      <AccessSearchForm fields={fields} headerStyle="green" />
      <SearchFooterButtons exitHref={routes.menuReference} />
    </AccessFormWindow>
  );
}
