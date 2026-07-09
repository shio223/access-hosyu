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
  { label: "住所", type: "single" },
];

function emptyValues() {
  return Object.fromEntries(fields.map((f) => [f.label, { from: "", to: "" }]));
}

export default function MaintenanceSearchPage() {
  const router = useRouter();
  const [values, setValues] = useState(emptyValues);

  const handleChange = (label: string, part: "from" | "to", value: string) => {
    setValues((prev) => ({
      ...prev,
      [label]: { ...prev[label], [part]: value },
    }));
  };

  const handleSearch = () => {
    const cc = values["得意先コード"]?.from ?? "";
    const en = values["設備番号"]?.from ?? "";
    const params = new URLSearchParams();
    if (cc) params.set("customerCode", cc);
    if (en) params.set("equipmentNo", en);
    router.push(`${routes.equipmentInquiry}?${params.toString()}`);
  };

  return (
    <AccessFormWindow title="F-保守実績データ検索" formTitle="保守実績データ検索画面">
      <InteractiveSearchForm fields={fields} values={values} onChange={handleChange} headerStyle="green" />
      <SearchFooterButtons
        exitHref={routes.menuReference}
        onSearch={handleSearch}
        onClear={() => setValues(emptyValues())}
      />
    </AccessFormWindow>
  );
}
