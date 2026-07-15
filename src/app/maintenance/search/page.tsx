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
  { label: "得意先名", type: "single" },
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

type SearchItem = {
  id: string;
  customer_code: string;
  customer_name: string | null;
  equipment_no: string;
  work_date: string | null;
  work_code: string;
  work_content: string | null;
  operating_hours: number | null;
  staff_code: string;
};

function emptyValues() {
  return Object.fromEntries(fields.map((f) => [f.label, { from: "", to: "" }]));
}

const PAGE_SIZE = 50;

export default function MaintenanceSearchPage() {
  const router = useRouter();
  const [values, setValues] = useState(emptyValues);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (label: string, part: "from" | "to", value: string) => {
    setValues((prev) => ({
      ...prev,
      [label]: { ...prev[label], [part]: value },
    }));
  };

  const buildParams = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set("page", String(pageNum));
    params.set("pageSize", String(PAGE_SIZE));
    const cc = values["得意先コード"]?.from?.trim() ?? "";
    const cn = values["得意先名"]?.from?.trim() ?? "";
    const en = values["設備番号"]?.from?.trim() ?? "";
    const wdFrom = values["作業日"]?.from?.trim() ?? "";
    const wdTo = values["作業日"]?.to?.trim() ?? "";
    const wc = values["作業コード"]?.from?.trim() ?? "";
    const wcon = values["作業内容"]?.from?.trim() ?? "";
    const sc = values["担当者コード"]?.from?.trim() ?? "";
    if (cc) params.set("customerCode", cc);
    if (cn) params.set("customerName", cn);
    if (en) params.set("equipmentNo", en);
    if (wdFrom) params.set("workDateFrom", wdFrom);
    if (wdTo) params.set("workDateTo", wdTo);
    if (wc) params.set("workCode", wc);
    if (wcon) params.set("workContent", wcon);
    if (sc) params.set("staffCode", sc);
    return params;
  };

  const runSearch = async (pageNum: number) => {
    setLoading(true);
    setStatus("検索中...");
    try {
      const res = await fetch(`/api/maintenance/search?${buildParams(pageNum)}`);
      const data = await res.json();
      if (!res.ok) {
        setItems([]);
        setTotal(0);
        setStatus(data.error ?? "検索に失敗しました");
        return;
      }
      const nextTotal = Number(data.total ?? 0);
      const nextPage = Number(data.page ?? pageNum);
      setItems(data.items ?? []);
      setTotal(nextTotal);
      setPage(nextPage);
      if (nextTotal === 0) {
        setStatus("0 件");
      } else {
        const start = (nextPage - 1) * PAGE_SIZE + 1;
        const end = Math.min(nextPage * PAGE_SIZE, nextTotal);
        setStatus(
          `${nextTotal.toLocaleString()} 件中 ${start.toLocaleString()}–${end.toLocaleString()} 件を表示`
        );
      }
    } catch {
      setStatus("検索に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    runSearch(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AccessFormWindow title="F-保守実績データ検索" formTitle="保守実績データ検索画面">
      <InteractiveSearchForm
        fields={fields}
        values={values}
        onChange={handleChange}
        headerStyle="green"
      />
      <SearchFooterButtons
        exitHref={routes.menuReference}
        onSearch={handleSearch}
        onClear={() => {
          setValues(emptyValues());
          setItems([]);
          setTotal(0);
          setStatus("");
          setPage(1);
        }}
      />

      <div className="border-t border-[#808080] bg-[#D4D0C8] px-2 py-1 text-xs">
        {loading ? "検索中..." : status || "条件を入力して検索開始してください（1ページ50件）"}
      </div>

      {items.length > 0 && (
        <div className="border-t border-[#808080] bg-[#C0C0C0]">
          <div className="overflow-auto max-h-[360px]">
            <table className="w-full border-collapse text-xs" style={{ tableLayout: "fixed" }}>
              <thead>
                <tr className="bg-[#008000] text-white">
                  <th className="border border-[#004000] px-1 py-0.5">得意先コード</th>
                  <th className="border border-[#004000] px-1 py-0.5">得意先名</th>
                  <th className="border border-[#004000] px-1 py-0.5">設備番号</th>
                  <th className="border border-[#004000] px-1 py-0.5">作業日</th>
                  <th className="border border-[#004000] px-1 py-0.5">作業コード</th>
                  <th className="border border-[#004000] px-1 py-0.5">作業内容</th>
                  <th className="border border-[#004000] px-1 py-0.5">担当者</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr
                    key={row.id}
                    className="bg-white hover:bg-[#FFFFCC] cursor-pointer"
                    onDoubleClick={() => {
                      const params = new URLSearchParams({
                        customerCode: row.customer_code,
                        equipmentNo: row.equipment_no,
                      });
                      router.push(`${routes.equipmentInquiry}?${params}`);
                    }}
                  >
                    <td className="border border-[#808080] px-1 py-0.5 text-center">
                      {row.customer_code}
                    </td>
                    <td className="border border-[#808080] px-1 py-0.5 truncate">
                      {row.customer_name ?? ""}
                    </td>
                    <td className="border border-[#808080] px-1 py-0.5 text-center">
                      {row.equipment_no}
                    </td>
                    <td className="border border-[#808080] px-1 py-0.5 text-center">
                      {row.work_date ?? ""}
                    </td>
                    <td className="border border-[#808080] px-1 py-0.5 text-center">
                      {row.work_code}
                    </td>
                    <td className="border border-[#808080] px-1 py-0.5 truncate">
                      {row.work_content ?? ""}
                    </td>
                    <td className="border border-[#808080] px-1 py-0.5 text-center">
                      {row.staff_code}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center gap-2 py-1 text-xs bg-[#D4D0C8]">
            <button
              type="button"
              className="bg-[#C0C0C0] border border-[#808080] px-2 py-0.5 disabled:text-[#808080]"
              disabled={page <= 1 || loading}
              onClick={() => runSearch(page - 1)}
            >
              前へ
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="bg-[#C0C0C0] border border-[#808080] px-2 py-0.5 disabled:text-[#808080]"
              disabled={page >= totalPages || loading}
              onClick={() => runSearch(page + 1)}
            >
              次へ
            </button>
            <span className="text-[10px] text-[#404040]">（ダブルクリックで設備照会）</span>
          </div>
        </div>
      )}
    </AccessFormWindow>
  );
}
