"use client";

/**
 * コントロールファイル更新画面
 */
import { useState } from "react";
import { AccessExitButton } from "./access-exit-button";
import { routes } from "@/lib/routes";

const fieldStyle: React.CSSProperties = {
  fontSize: 11,
  height: 20,
  padding: "1px 4px",
  boxShadow: "inset 1px 1px 2px #808080",
};

export function ControlFileUpdate() {
  const [form, setForm] = useState({
    companyName: "",
    postalCode: "",
    address1: "",
    address2: "",
    phone: "",
    fax: "",
    taxRateOld: "",
    taxRateNew: "",
    taxRevisionDate: "",
    fiscalMonth: "",
  });
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const fields: { label: string; key: keyof typeof form }[] = [
    { label: "自社名", key: "companyName" },
    { label: "郵便番号", key: "postalCode" },
    { label: "住所１", key: "address1" },
    { label: "住所２", key: "address2" },
    { label: "電話番号", key: "phone" },
    { label: "FAX番号", key: "fax" },
    { label: "消費税率(旧)", key: "taxRateOld" },
    { label: "消費税率(新)", key: "taxRateNew" },
    { label: "消費税改訂日", key: "taxRevisionDate" },
    { label: "決算月", key: "fiscalMonth" },
  ];

  return (
    <div className="min-h-screen bg-[#A0A0A0] flex items-start justify-center p-4">
      <div className="border-2 border-[#404040] bg-[#D4D0C8] shadow-lg" style={{ width: 520 }}>
        <div className="bg-[#D4D0C8] border-b border-[#808080] px-2 py-0.5 text-xs">F-コントロールファイル更新</div>
        <div className="bg-[#0000FF] text-white text-center py-1.5 font-bold text-base">コントロールファイル更新</div>

        <div className="p-4 space-y-1">
          {fields.map(({ label, key }) => (
            <div key={key} className="flex items-center gap-1">
              <div className="bg-[#000080] text-white border border-[#808080] text-xs px-1 shrink-0" style={{ width: 110, height: 22, display: "flex", alignItems: "center" }}>
                {label}
              </div>
              <input
                type="text"
                value={form[key]}
                onChange={set(key)}
                className="flex-1 bg-white border border-[#808080] rounded-none outline-none"
                style={fieldStyle}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end bg-[#008080] px-3 py-1.5 border-t border-[#004040]">
          <AccessExitButton href={routes.menuUpdate} />
        </div>
      </div>
    </div>
  );
}
