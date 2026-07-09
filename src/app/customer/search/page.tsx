"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccessFormWindow } from "@/components/access/access-form-window";
import { InteractiveSearchForm } from "@/components/access/interactive-search-form";
import { SearchFooterButtons } from "@/components/access/search-footer-buttons";
import type { SearchField } from "@/components/access/access-search-form";
import { routes } from "@/lib/routes";

const fields: SearchField[] = [
  { label: "得意先コード", type: "range-select" },
  { label: "地区コード", type: "range-select" },
  { label: "業種コード", type: "range-select" },
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

export default function CustomerSearchPage() {
  const router = useRouter();
  const [values, setValues] = useState(emptyValues);

  const handleChange = (label: string, part: "from" | "to", value: string) => {
    setValues((prev) => ({
      ...prev,
      [label]: { ...prev[label], [part]: value },
    }));
  };

  return (
    <AccessFormWindow title="F_得意先マスタ検索" formTitle="得意先マスタ検索画面">
      <InteractiveSearchForm fields={fields} values={values} onChange={handleChange} />
      <SearchFooterButtons
        exitHref={routes.menuReference}
        onSearch={() => router.push(routes.customerSearchResults)}
        onClear={() => setValues(emptyValues())}
      />
    </AccessFormWindow>
  );
}
