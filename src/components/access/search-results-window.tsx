"use client";

/**
 * 検索結果一覧画面（得意先マスタ検索結果等）
 */
import { useState } from "react";
import { AccessExitButton } from "./access-exit-button";
import { ExcelExportDialog } from "./excel-export-dialog";
import { routes } from "@/lib/routes";

export type SearchResultRow = {
  code: string;
  name: string;
  address: string;
  postalCode: string;
  phone: string;
  representative: string;
  title: string;
  repName: string;
  area: string;
  industry: string;
  general1: string;
  general2: string;
};

export function SearchResultsWindow({
  title,
  formTitle,
  rows,
  exitHref = routes.menuReference,
}: {
  title: string;
  formTitle: string;
  rows: SearchResultRow[];
  exitHref?: string;
}) {
  const [showExport, setShowExport] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="min-h-screen bg-[#A0A0A0] flex flex-col">
      <div className="flex-1 flex items-start justify-center p-2 overflow-auto">
        <div className="border-2 border-[#404040] bg-[#D4D0C8] shadow-lg w-full max-w-[900px]">
          <div className="bg-[#D4D0C8] border-b border-[#808080] px-2 py-0.5 text-xs">{title}</div>
          <div className="bg-[#0000FF] text-white flex items-center justify-between px-3 py-1">
            <span className="font-bold">{formTitle}</span>
            <span className="bg-[#FF0000] text-[#FFFF00] font-bold px-2 py-0.5 text-xs border border-[#808080]">
              件数 {rows.length.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="border-collapse w-full text-[10px]" style={{ minWidth: 800 }}>
              <thead>
                <tr className="bg-[#000080] text-white">
                  <th className="border border-[#004080] p-1">コード</th>
                  <th className="border border-[#004080] p-1">得意先名</th>
                  <th className="border border-[#004080] p-1">住所</th>
                  <th className="border border-[#004080] p-1">〒、TEL</th>
                  <th className="border border-[#004080] p-1">代表者名, 役職</th>
                  <th className="border border-[#004080] p-1">地区、業種</th>
                  <th className="border border-[#004080] p-1">担当者</th>
                  <th className="border border-[#004080] p-1">汎用</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.code}
                    className={`cursor-pointer ${i === currentIndex ? "bg-[#000080] text-white" : i % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"}`}
                    onClick={() => setCurrentIndex(i)}
                  >
                    <td className="border border-[#808080] p-1 whitespace-nowrap">{row.code}</td>
                    <td className="border border-[#808080] p-1">{row.name}</td>
                    <td className="border border-[#808080] p-1">{row.address}</td>
                    <td className="border border-[#808080] p-1 whitespace-nowrap">
                      {row.postalCode}<br />{row.phone}
                    </td>
                    <td className="border border-[#808080] p-1">
                      {row.title}<br />{row.repName || row.representative}
                    </td>
                    <td className="border border-[#808080] p-1">{row.area}<br />{row.industry}</td>
                    <td className="border border-[#808080] p-1" />
                    <td className="border border-[#808080] p-1">{row.general1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#008080] border-t border-[#004040] px-2 py-1">
            <div className="flex flex-wrap gap-1 mb-1">
              {["一覧表", "住所録", "宛名ラベル", "葉書宛名", "封筒宛名", "コード表"].map((label) => (
                <button key={label} type="button" className="bg-[#C0C0C0] border border-[#808080] px-2 py-0.5 text-[10px] rounded-none" style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080" }}>
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowExport(true)}
                className="bg-[#C0C0C0] border border-[#808080] px-2 py-0.5 text-[10px] rounded-none font-bold"
                style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080" }}
              >
                EXCEL出力
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] text-white">
                <span>レコード:</span>
                {["|◀", "◀", "▶", "▶|"].map((a) => (
                  <button key={a} type="button" className="bg-[#C0C0C0] text-black border border-[#808080] w-5 h-4 text-[8px] rounded-none">{a}</button>
                ))}
                <span className="bg-white text-black border border-[#808080] px-1">{currentIndex + 1}</span>
                <span>/ {rows.length}</span>
              </div>
              <AccessExitButton href={exitHref} />
            </div>
          </div>
        </div>
      </div>

      {showExport && (
        <ExcelExportDialog
          title={`${formTitle}のファイル出力`}
          defaultPath={`C:\\保守管理\\${formTitle}.XLS`}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
