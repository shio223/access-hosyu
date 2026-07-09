"use client";

/**
 * 保守実績データ入力画面（添付画像どおり）
 * マスタ行＋作業明細グリッドのマスター・ディテール形式。
 */
import { useState } from "react";
import { AccessRibbon } from "./access-form-window";
import { AccessExitButton } from "./access-exit-button";
import { routes } from "@/lib/routes";

const FORM_WIDTH = 900;

type GridRow = {
  workDate: string;
  workCode: string;
  workContent: string;
  operatingHours: string;
  customerContact: string;
  staffCode: string;
  inputterCode: string;
};

const emptyRow = (): GridRow => ({
  workDate: "",
  workCode: "",
  workContent: "",
  operatingHours: "",
  customerContact: "",
  staffCode: "",
  inputterCode: "",
});

const inputStyle: React.CSSProperties = {
  fontSize: 11,
  width: "100%",
  height: 18,
  padding: "0 2px",
  border: "none",
  outline: "none",
  background: "transparent",
};

const navBtnStyle: React.CSSProperties = {
  fontSize: 11,
  padding: "0 6px",
  height: 20,
  boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
};

function HeaderLabel({
  children,
  variant = "green",
  width,
}: {
  children: React.ReactNode;
  variant?: "green" | "olive" | "navy";
  width?: number;
}) {
  const bg =
    variant === "green"
      ? "bg-[#99FF99] text-black"
      : variant === "olive"
        ? "bg-[#808000] text-[#FFFF66]"
        : "bg-[#000080] text-white";
  return (
    <div
      className={`${bg} border border-[#808080] flex items-center px-1 shrink-0`}
      style={{ width: width ?? 88, fontSize: 11, height: 22 }}
    >
      {children}
    </div>
  );
}

function HeaderField({ value, onChange, readOnly, width }: { value: string; onChange?: (v: string) => void; readOnly?: boolean; width?: number | string }) {
  return (
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      className="bg-white border border-[#808080] rounded-none outline-none"
      style={{
        fontSize: 11,
        height: 20,
        padding: "1px 4px",
        boxShadow: "inset 1px 1px 2px #808080",
        width: width ?? "100%",
        flex: width ? undefined : 1,
      }}
    />
  );
}

function ComboField({ value, onChange, width }: { value: string; onChange: (v: string) => void; width?: number | string }) {
  return (
    <div className="flex" style={{ width: width ?? "100%", flex: width ? undefined : 1 }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-white border border-[#808080] rounded-none outline-none"
        style={{ fontSize: 11, height: 20, padding: "1px 4px", boxShadow: "inset 1px 1px 2px #808080" }}
      />
      <button type="button" className="w-5 bg-[#C0C0C0] border border-[#808080] border-l-0 text-[8px] rounded-none" style={{ height: 20 }}>▼</button>
    </div>
  );
}

export function MaintenanceRecordEdit() {
  const [header, setHeader] = useState({
    customerCode: "",
    customerName: "",
    equipmentNo: "",
    nextInspectionDate: "",
    inspectionCycle: "",
    revisionDate: "",
  });

  const [rows, setRows] = useState<GridRow[]>([emptyRow()]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recordIndex, setRecordIndex] = useState(0);

  const setHeaderField = (key: keyof typeof header) => (v: string) =>
    setHeader((prev) => ({ ...prev, [key]: v }));

  const updateRow = (index: number, key: keyof GridRow, value: string) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const handleDeleteRow = () => {
    if (rows.length === 0) return;
    const next = rows.filter((_, i) => i !== selectedIndex);
    setRows(next);
    setSelectedIndex(Math.max(0, Math.min(selectedIndex, next.length - 1)));
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
    setSelectedIndex(rows.length);
  };

  const handleConfirm = () => {
    alert("登録しました。（デモ：実際の保存は今後DB接続後に実装）");
  };

  const totalRecords = 0;

  return (
    <div className="min-h-screen bg-[#C0C0C0]">
      <AccessRibbon />
      <div className="overflow-x-auto p-2">
        <div
          className="mx-auto border-2 border-[#404040] bg-[#D4D0C8] shadow-lg"
          style={{ width: FORM_WIDTH, minWidth: FORM_WIDTH }}
        >
          <div className="bg-[#D4D0C8] border-b border-[#808080] px-2 py-0.5 text-xs">F-保守データ入力</div>

          <div className="bg-[#0000CC] text-white flex items-center" style={{ padding: "4px 8px", height: 28 }}>
            <div style={{ width: 80 }} />
            <h1 className="font-bold text-center shrink-0" style={{ fontSize: 14, flex: 1 }}>
              保守実績データ入力
            </h1>
            <div className="flex justify-end" style={{ width: 120, gap: 4 }}>
              {["前", "現在", "次"].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  className="bg-[#D4D0C8] text-black border border-[#808080] rounded-none"
                  style={navBtnStyle}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#D4D0C8]" style={{ padding: "6px 8px" }}>
            <div className="flex items-center gap-1" style={{ marginBottom: 4 }}>
              <HeaderLabel variant="green">得意先コード</HeaderLabel>
              <ComboField value={header.customerCode} onChange={setHeaderField("customerCode")} width={56} />
              <HeaderField value={header.customerName} readOnly width={200} />
              <HeaderLabel variant="green" width={72}>設備番号</HeaderLabel>
              <HeaderField value={header.equipmentNo} onChange={setHeaderField("equipmentNo")} width={48} />
              <button
                type="button"
                onClick={handleConfirm}
                className="ml-auto bg-[#008080] text-white border border-[#004040] px-3 text-xs rounded-none"
                style={{ height: 22 }}
              >
                確認
              </button>
            </div>

            <div className="flex items-center gap-1" style={{ marginBottom: 6 }}>
              <HeaderLabel variant="olive" width={80}>次回点検日</HeaderLabel>
              <HeaderField value={header.nextInspectionDate} onChange={setHeaderField("nextInspectionDate")} width={120} />
              <HeaderLabel variant="olive" width={72}>点検周期</HeaderLabel>
              <HeaderField value={header.inspectionCycle} onChange={setHeaderField("inspectionCycle")} width={72} />
              <HeaderLabel variant="navy" width={56}>修正日</HeaderLabel>
              <HeaderField value={header.revisionDate} onChange={setHeaderField("revisionDate")} width={88} />
            </div>

            <div className="border border-[#808080]">
              <table className="border-collapse w-full" style={{ fontSize: 11, tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: 20 }} />
                  <col style={{ width: 76 }} />
                  <col style={{ width: 52 }} />
                  <col />
                  <col style={{ width: 64 }} />
                  <col style={{ width: 56 }} />
                  <col style={{ width: 72 }} />
                  <col style={{ width: 72 }} />
                </colgroup>
                <thead>
                  <tr className="bg-[#006400] text-[#FFFF00]">
                    <th className="border border-[#004000]" style={{ padding: "2px" }} />
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "2px 4px" }}>作業日</th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "2px 4px" }}>作業コード</th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "2px 4px" }}>作業内容</th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "2px 4px" }}>稼働時間</th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "2px 4px" }}>客先担当</th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "2px 4px" }}>担当者コード</th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "2px 4px" }}>入力者コード</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      className={i === selectedIndex ? "bg-[#000080] text-white" : "bg-white text-black"}
                      onClick={() => setSelectedIndex(i)}
                    >
                      <td className="border border-[#808080] text-center" style={{ padding: 0, fontSize: 10 }}>
                        {i === selectedIndex ? "▶" : ""}
                      </td>
                      <td className="border border-[#808080]" style={{ padding: 0 }}>
                        <input type="text" value={row.workDate} onChange={(e) => updateRow(i, "workDate", e.target.value)} style={{ ...inputStyle, color: "inherit" }} />
                      </td>
                      <td className="border border-[#808080]" style={{ padding: 0 }}>
                        <div className="flex">
                          <input type="text" value={row.workCode} onChange={(e) => updateRow(i, "workCode", e.target.value)} style={{ ...inputStyle, color: "inherit", flex: 1 }} />
                          <span className="text-[8px] leading-[18px] px-0.5">▼</span>
                        </div>
                      </td>
                      <td className="border border-[#808080]" style={{ padding: 0 }}>
                        <input type="text" value={row.workContent} onChange={(e) => updateRow(i, "workContent", e.target.value)} style={{ ...inputStyle, color: "inherit" }} />
                      </td>
                      <td className="border border-[#808080]" style={{ padding: 0 }}>
                        <input type="text" value={row.operatingHours} onChange={(e) => updateRow(i, "operatingHours", e.target.value)} style={{ ...inputStyle, color: "inherit", textAlign: "right" }} />
                      </td>
                      <td className="border border-[#808080]" style={{ padding: 0 }}>
                        <input type="text" value={row.customerContact} onChange={(e) => updateRow(i, "customerContact", e.target.value)} style={{ ...inputStyle, color: "inherit", textAlign: "center" }} />
                      </td>
                      <td className="border border-[#808080]" style={{ padding: 0 }}>
                        <div className="flex">
                          <input type="text" value={row.staffCode} onChange={(e) => updateRow(i, "staffCode", e.target.value)} style={{ ...inputStyle, color: "inherit", flex: 1 }} />
                          <span className="text-[8px] leading-[18px] px-0.5">▼</span>
                        </div>
                      </td>
                      <td className="border border-[#808080]" style={{ padding: 0 }}>
                        <div className="flex">
                          <input type="text" value={row.inputterCode} onChange={(e) => updateRow(i, "inputterCode", e.target.value)} style={{ ...inputStyle, color: "inherit", flex: 1 }} />
                          <span className="text-[8px] leading-[18px] px-0.5">▼</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-white">
                    <td colSpan={8} className="border border-[#808080]" style={{ padding: "2px 4px", height: 24 }}>
                      <button type="button" onClick={handleAddRow} className="text-[10px] text-[#808080]">+ 行追加</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#006400] border-t border-[#004000]" style={{ padding: "6px 12px" }}>
            <button
              type="button"
              onClick={handleDeleteRow}
              className="bg-[#D4D0C8] border-2 border-red-600 text-green-700 px-2 text-xs rounded-none font-bold"
              style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080" }}
            >
              行削除
            </button>
            <AccessExitButton href={routes.menuUpdate} />
          </div>

          <div
            className="flex items-center bg-[#D4D0C8] border-t border-[#808080]"
            style={{ padding: "4px 8px", fontSize: 11, gap: 8, height: 28 }}
          >
            <span>レコード:</span>
            <div className="flex" style={{ gap: 2 }}>
              {["|◀", "◀", "▶", "▶|"].map((arrow) => (
                <button
                  key={arrow}
                  type="button"
                  onClick={() => {
                    if (arrow === "|◀") setRecordIndex(0);
                    if (arrow === "◀") setRecordIndex(Math.max(0, recordIndex - 1));
                    if (arrow === "▶") setRecordIndex(Math.min(totalRecords - 1, recordIndex + 1));
                    if (arrow === "▶|") setRecordIndex(totalRecords - 1);
                  }}
                  className="bg-[#C0C0C0] border border-[#808080] rounded-none"
                  style={{
                    width: 22,
                    height: 18,
                    fontSize: 9,
                    boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
                  }}
                >
                  {arrow}
                </button>
              ))}
            </div>
            <span className="bg-white border border-[#808080] text-center" style={{ padding: "0 6px", minWidth: 20 }}>
              {totalRecords > 0 ? recordIndex + 1 : 0}
            </span>
            <span>/ {totalRecords || "—"}</span>
            <input
              type="text"
              placeholder="検索"
              className="ml-auto bg-white border border-[#808080] rounded-none outline-none"
              style={{ fontSize: 11, height: 18, width: 120, padding: "0 4px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
