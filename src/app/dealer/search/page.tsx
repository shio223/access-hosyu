"use client";

import { useState } from "react";
import { AccessFormWindow } from "@/components/access/access-form-window";
import { InteractiveSearchForm } from "@/components/access/interactive-search-form";
import { SearchFooterButtons } from "@/components/access/search-footer-buttons";
import type { SearchField } from "@/components/access/access-search-form";
import { routes } from "@/lib/routes";

/** 画像どおり：汎用コードは単一選択、販売店・担当者は範囲検索 */
const fields: SearchField[] = [
  { label: "販売店コード", type: "range-select" },
  { label: "担当者コード", type: "range-select" },
  { label: "汎用コード１", type: "select" },
  { label: "汎用コード２", type: "select" },
  { label: "汎用コード３", type: "select" },
  { label: "汎用コード４", type: "select" },
  { label: "電話番号", type: "range-text" },
  { label: "郵便番号", type: "range-text" },
  { label: "住所", type: "single" },
];

function emptyValues() {
  return Object.fromEntries(fields.map((f) => [f.label, { from: "", to: "" }]));
}

export default function DealerSearchPage() {
  const [values, setValues] = useState(emptyValues);

  const handleChange = (label: string, part: "from" | "to", value: string) => {
    setValues((prev) => ({
      ...prev,
      [label]: { ...prev[label], [part]: value },
    }));
  };

  return (
    <AccessFormWindow title="F-販売店マスタ検索" formTitle="販売店マスタ検索画面">
      <InteractiveSearchForm fields={fields} values={values} onChange={handleChange} headerStyle="green" />
      <SearchFooterButtons
        exitHref={routes.menuReference}
        onClear={() => setValues(emptyValues())}
      />
    </AccessFormWindow>
  );
}
