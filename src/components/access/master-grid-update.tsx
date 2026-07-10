"use client";

/**
 * コード＋名称のマスタ更新画面
 * 更新処理用：空の状態から登録。参照・検索は参照処理メニュー側。
 */
import { useState } from "react";
import { AccessExitButton } from "./access-exit-button";
import { routes } from "@/lib/routes";
import type { MasterRow } from "@/lib/master-data";
import type { MasterType } from "@/lib/master-registry";

const footerBtnStyle: React.CSSProperties = {
  boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
};

const cellInputStyle: React.CSSProperties = {
  fontSize: 11,
  width: "100%",
  height: 18,
  padding: "0 4px",
  border: "none",
  outline: "none",
  background: "transparent",
};

export function MasterGridUpdate({
  masterType,
  windowTitle,
  formTitle,
  codeLabel,
  nameLabel,
  exitHref = routes.menuUpdate,
}: {
  masterType: MasterType;
  windowTitle: string;
  formTitle: string;
  codeLabel: string;
  nameLabel: string;
  exitHref?: string;
}) {
  const [rows, setRows] = useState<MasterRow[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateRow = (index: number, key: keyof MasterRow, value: string) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const handleDeleteRow = () => {
    if (rows.length === 0) return;
    const next = rows.filter((_, i) => i !== selectedIndex);
    setRows(next);
    setSelectedIndex(Math.min(selectedIndex, Math.max(0, next.length - 1)));
  };

  const handleAddRow = () => {
    setRows((prev) => {
      const next = [...prev, { code: "", name: "" }];
      setSelectedIndex(next.length - 1);
      return next;
    });
  };

  const handleRegister = async () => {
    const nextRows = rows.filter((row) => row.code.trim() || row.name.trim());
    if (nextRows.length === 0) {
      alert("登録するデータがありません。");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/masters/${masterType}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: nextRows }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "登録に失敗しました。");
        return;
      }
      setRows([]);
      setSelectedIndex(0);
      setEditMode(false);
      alert(data.message ?? "登録しました。");
    } catch {
      alert("登録に失敗しました。");
    } finally {
      setSaving(false);
    }
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
                key={i}
                className={`flex border-b border-[#808080] text-xs ${i === selectedIndex ? "bg-[#000080] text-white" : "bg-white text-black"}`}
                onClick={() => setSelectedIndex(i)}
              >
                <div className="border-r border-[#808080]" style={{ width: 72, padding: editMode ? 0 : "2px 4px" }}>
                  {editMode ? (
                    <input
                      type="text"
                      value={row.code}
                      onChange={(e) => updateRow(i, "code", e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-center text-black"
                      style={{ ...cellInputStyle, background: "#fff" }}
                      disabled={saving}
                    />
                  ) : (
                    <div className="text-center">{row.code}</div>
                  )}
                </div>
                <div className="flex-1" style={{ padding: editMode ? 0 : "2px 6px" }}>
                  {editMode ? (
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(i, "name", e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-black"
                      style={{ ...cellInputStyle, background: "#fff" }}
                      disabled={saving}
                    />
                  ) : (
                    row.name
                  )}
                </div>
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
          <div className="flex gap-2">
            {!editMode ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                disabled={saving}
                className="bg-[#C0C0C0] border border-[#808080] text-black font-bold px-3 py-0.5 text-sm rounded-none disabled:text-[#808080]"
                style={footerBtnStyle}
              >
                編集
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleAddRow}
                  disabled={saving}
                  className="bg-[#C0C0C0] border border-[#808080] text-black font-bold px-3 py-0.5 text-sm rounded-none disabled:text-[#808080]"
                  style={footerBtnStyle}
                >
                  追加
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRow}
                  disabled={saving}
                  className="bg-[#C0C0C0] border border-[#808080] text-[#FF0000] font-bold px-3 py-0.5 text-sm rounded-none disabled:text-[#808080]"
                  style={footerBtnStyle}
                >
                  削除
                </button>
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={saving}
                  className="bg-[#C0C0C0] border border-[#808080] text-black font-bold px-3 py-0.5 text-sm rounded-none disabled:text-[#808080]"
                  style={footerBtnStyle}
                >
                  {saving ? "登録中..." : "登録"}
                </button>
              </>
            )}
          </div>
          <AccessExitButton href={exitHref} />
        </div>
      </div>
    </div>
  );
}
