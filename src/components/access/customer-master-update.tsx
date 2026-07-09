"use client";

/**
 * 得意先マスタ更新画面
 * 処理区分（追加・修正・削除）付きの入力フォームを再現。
 */
import { useState } from "react";
import { AccessExitButton } from "./access-exit-button";
import { routes } from "@/lib/routes";

type ProcessMode = "追加" | "修正" | "削除";

const fieldStyle: React.CSSProperties = {
  fontSize: 11,
  height: 20,
  padding: "1px 4px",
  boxShadow: "inset 1px 1px 2px #808080",
};

function Label({ children, width = 100 }: { children: React.ReactNode; width?: number }) {
  return (
    <div
      className="bg-[#000080] text-white border border-[#808080] flex items-center px-1 shrink-0"
      style={{ width, fontSize: 11, height: 22 }}
    >
      {children}
    </div>
  );
}

function Field({ value, onChange, readOnly }: { value: string; onChange?: (v: string) => void; readOnly?: boolean }) {
  return (
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      className="flex-1 bg-white border border-[#808080] rounded-none outline-none"
      style={fieldStyle}
    />
  );
}

function SelectField({ value }: { value: string }) {
  return (
    <div className="flex flex-1">
      <input type="text" value={value} readOnly className="flex-1 bg-white border border-[#808080] rounded-none outline-none" style={fieldStyle} />
      <button type="button" className="w-5 bg-[#C0C0C0] border border-[#808080] border-l-0 text-[8px] rounded-none" style={{ height: 20 }}>▼</button>
    </div>
  );
}

export function CustomerMasterUpdate() {
  const [mode, setMode] = useState<ProcessMode>("追加");
  const [form, setForm] = useState({
    customerCode: "",
    customerName: "",
    customerKana: "",
    postalCode: "",
    address1: "",
    address2: "",
    phone: "",
    fax: "",
    repTitle: "",
    repName: "",
    areaCode: "",
    industryCode: "",
    staffCode: "",
    general1: "",
    general2: "",
    general3: "",
    general4: "",
  });

  const set = (key: keyof typeof form) => (v: string) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "/");

  return (
    <div className="min-h-screen bg-[#A0A0A0] flex items-start justify-center p-4">
      <div className="border-2 border-[#404040] bg-[#D4D0C8] shadow-lg" style={{ width: 640 }}>
        <div className="bg-[#D4D0C8] border-b border-[#808080] px-2 py-0.5 text-xs">F-得意先マスタ更新</div>

        <div className="bg-[#0000FF] text-white flex items-center justify-between px-3 py-1.5">
          <span className="font-bold text-base">得意先マスタ更新</span>
          <div className="flex items-center gap-2">
            <span className="bg-[#FFFF00] text-black px-2 py-0.5 text-xs font-bold border border-[#808080]">{today}</span>
            <button type="button" className="bg-[#008080] text-white border border-[#004040] px-3 py-0.5 text-xs rounded-none">確認</button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-[#D4D0C8]">
          <span className="bg-[#008080] text-white px-2 py-0.5 text-xs font-bold">処理区分</span>
          {(["追加", "修正", "削除"] as ProcessMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-0.5 text-xs border border-[#808080] rounded-none ${mode === m ? "bg-[#FFFF00] font-bold" : "bg-[#C0C0C0]"}`}
              style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080" }}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex gap-3 px-3 pb-3">
          <div className="flex-1 space-y-0.5">
            {[
              { label: "得意先コード", key: "customerCode" as const },
              { label: "得意先名", key: "customerName" as const },
              { label: "得意先カナ名", key: "customerKana" as const },
            ].map(({ label, key }) => (
              <div key={key} className="flex gap-0.5">
                <Label>{label}</Label>
                <Field value={form[key]} onChange={set(key)} />
              </div>
            ))}
            <div className="flex gap-0.5">
              <Label>郵便番号</Label>
              <Field value={form.postalCode} onChange={set("postalCode")} />
              <button type="button" className="text-[10px] bg-[#C0C0C0] border border-[#808080] px-1 rounded-none shrink-0">〒→住所</button>
              <button type="button" className="text-[10px] bg-[#C0C0C0] border border-[#808080] px-1 rounded-none shrink-0">住所→〒</button>
            </div>
            {[
              { label: "住所１", key: "address1" as const },
              { label: "住所２", key: "address2" as const },
              { label: "電話番号", key: "phone" as const },
              { label: "FAX番号", key: "fax" as const },
              { label: "代表者役職名", key: "repTitle" as const },
              { label: "代表者氏名", key: "repName" as const },
            ].map(({ label, key }) => (
              <div key={key} className="flex gap-0.5">
                <Label>{label}</Label>
                <Field value={form[key]} onChange={set(key)} />
              </div>
            ))}
          </div>

          <div className="flex-1 space-y-0.5">
            {[
              { label: "地区コード", key: "areaCode" as const },
              { label: "業種コード", key: "industryCode" as const },
              { label: "担当者コード", key: "staffCode" as const },
              { label: "汎用コード１", key: "general1" as const },
              { label: "汎用コード２", key: "general2" as const },
              { label: "汎用コード３", key: "general3" as const },
              { label: "汎用コード４", key: "general4" as const },
            ].map(({ label, key }) => (
              <div key={key} className="flex gap-0.5">
                <Label width={88}>{label}</Label>
                <SelectField value={form[key]} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end bg-[#008080] px-3 py-1.5 border-t border-[#004040]">
          <AccessExitButton href={routes.menuUpdate} />
        </div>
      </div>
    </div>
  );
}
