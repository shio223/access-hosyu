"use client";

/**
 * コード＋名称のマスタ更新画面（業種・作業・メーカー・担当者等で共通利用）
 * Accessの「○○マスタ更新」フォームを再現。
 */
import { useState } from "react";
import { AccessExitButton } from "./access-exit-button";
import { routes } from "@/lib/routes";
import type { MasterRow } from "@/lib/master-data";

export function MasterGridUpdate({
  windowTitle,
  formTitle,
  codeLabel,
  nameLabel,
  initialRows,
  exitHref = routes.menuUpdate,
}: {
  windowTitle: string;
  formTitle: string;
  codeLabel: string;
  nameLabel: string;
  initialRows: MasterRow[];
  exitHref?: string;
}) {
  const [rows, setRows] = useState(initialRows);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleDeleteRow = () => {
    if (rows.length === 0) return;
    const next = rows.filter((_, i) => i !== selectedIndex);
    setRows(next);
    setSelectedIndex(Math.min(selectedIndex, Math.max(0, next.length - 1)));
  };

  const emptyRows = Math.max(0, 18 - rows.length);

  return (
    <div className="min-h-screen bg-[#A0A0A0] flex items-start justify-center p-4">
      <div className="border-2 border-[#404040] bg-[#D4D0C8] shadow-lg" style={{ width: 480 }}>
        <div className="bg-[#D4D0C8] border-b border-[#808080] px-2 py-0.5 text-xs flex justify-between">
          <span>{windowTitle}</span>
          <span className="flex gap-0.5">
            {["_", "□", "×"].map((c) => (
              <span key={c} className="w-4 h-3 border border-[#808080] bg-[#C0C0C0] text-[8px] flex items-center justify-center">{c}</span>
            ))}
          </span>
        </div>

        <div className="bg-[#0000FF] text-white text-center py-1.5 font-bold text-base">
          {formTitle}
        </div>

        <div className="border border-[#808080] m-2">
          <div className="flex bg-[#000080] text-white text-xs font-bold">
            <div className="border-r border-[#004080] text-center" style={{ width: 72, padding: "3px 4px" }}>{codeLabel}</div>
            <div className="flex-1 text-center" style={{ padding: "3px 4px" }}>{nameLabel}</div>
          </div>
          <div className="max-h-[360px] overflow-y-auto bg-white">
            {rows.map((row, i) => (
              <div
                key={`${row.code}-${i}`}
                className={`flex border-b border-[#808080] text-xs cursor-pointer ${i === selectedIndex ? "bg-[#000080] text-white" : "bg-white text-black"}`}
                onClick={() => setSelectedIndex(i)}
              >
                <div className="border-r border-[#808080] text-center" style={{ width: 72, padding: "2px 4px" }}>{row.code}</div>
                <div className="flex-1" style={{ padding: "2px 6px" }}>{row.name}</div>
              </div>
            ))}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <div key={`empty-${i}`} className="flex border-b border-[#808080] text-xs bg-white" style={{ height: 20 }}>
                <div className="border-r border-[#808080]" style={{ width: 72 }} />
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between bg-[#008080] px-2 py-1.5 border-t border-[#004040]">
          <button
            type="button"
            onClick={handleDeleteRow}
            className="bg-[#C0C0C0] border border-[#808080] text-[#FF0000] font-bold px-3 py-0.5 text-sm rounded-none"
            style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080" }}
          >
            行削除
          </button>
          <AccessExitButton href={exitHref} />
        </div>
      </div>
    </div>
  );
}
