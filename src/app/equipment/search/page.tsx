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
  { label: "設備番号", type: "single" },
  { label: "機種コード", type: "range-select" },
  { label: "メーカーコード", type: "range-select" },
  { label: "１次販売店", type: "range-select" },
  { label: "２次販売店", type: "range-select" },
  { label: "３次販売店", type: "range-select" },
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

function emptyValues() {
  return Object.fromEntries(fields.map((f) => [f.label, { from: "", to: "" }]));
}

export default function EquipmentSearchPage() {
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
    <AccessFormWindow title="F-設備マスタ検索" formTitle="設備マスタ検索画面">
      <InteractiveSearchForm fields={fields} values={values} onChange={handleChange} headerStyle="green" />
      <SearchFooterButtons
        exitHref={routes.menuReference}
        onSearch={handleSearch}
        onClear={() => setValues(emptyValues())}
      />
    </AccessFormWindow>
  );
}
