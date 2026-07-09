"use client";

/**
 * 販売店マスタ更新画面（添付画像どおり）
 */
import { useState } from "react";
import { AccessExitButton } from "./access-exit-button";
import {
  MasterField,
  MasterLabel,
  MasterSelectField,
  PostalCodeRow,
} from "./master-form-fields";
import { routes } from "@/lib/routes";

type ProcessMode = "追加" | "修正" | "削除";

export function DealerMasterUpdate() {
  const [mode, setMode] = useState<ProcessMode>("追加");
  const [form, setForm] = useState({
    dealerCode: "",
    dealerName: "",
    dealerKana: "",
    postalCode: "",
    address1: "",
    address2: "",
    phone: "",
    fax: "",
    repTitle: "",
    repName: "",
    staffCode: "",
    general1: "",
    general2: "",
    general3: "",
    general4: "",
  });

  const set = (key: keyof typeof form) => (v: string) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[#A0A0A0] flex items-start justify-center p-4">
      <div className="border-2 border-[#404040] bg-[#D4D0C8] shadow-lg" style={{ width: 640 }}>
        <div className="bg-[#D4D0C8] border-b border-[#808080] px-2 py-0.5 text-xs">F-販売店マスタ更新</div>

        <div className="bg-[#0000FF] text-white flex items-center justify-between px-3 py-1.5">
          <span className="font-bold text-base">販売店マスタ更新</span>
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
            <div className="flex gap-0.5">
              <MasterLabel variant="green">販売店コード</MasterLabel>
              <MasterField value={form.dealerCode} onChange={set("dealerCode")} />
            </div>
            {[
              { label: "販売店名", key: "dealerName" as const },
              { label: "販売店カナ名", key: "dealerKana" as const },
            ].map(({ label, key }) => (
              <div key={key} className="flex gap-0.5">
                <MasterLabel>{label}</MasterLabel>
                <MasterField value={form[key]} onChange={set(key)} />
              </div>
            ))}
            <PostalCodeRow value={form.postalCode} onChange={set("postalCode")} />
            {[
              { label: "住 所 1", key: "address1" as const },
              { label: "住 所 2", key: "address2" as const },
              { label: "電話番号", key: "phone" as const },
              { label: "FAX番号", key: "fax" as const },
            ].map(({ label, key }) => (
              <div key={key} className="flex gap-0.5">
                <MasterLabel variant="yellow">{label}</MasterLabel>
                <MasterField value={form[key]} onChange={set(key)} />
              </div>
            ))}
            {[
              { label: "代表者役職名", key: "repTitle" as const },
              { label: "代表者氏名", key: "repName" as const },
            ].map(({ label, key }) => (
              <div key={key} className="flex gap-0.5">
                <MasterLabel>{label}</MasterLabel>
                <MasterField value={form[key]} onChange={set(key)} />
              </div>
            ))}
          </div>

          <div className="flex-1 space-y-0.5">
            {[
              { label: "担当者コード", key: "staffCode" as const },
              { label: "汎用コード１", key: "general1" as const },
              { label: "汎用コード２", key: "general2" as const },
              { label: "汎用コード３", key: "general3" as const },
              { label: "汎用コード４", key: "general4" as const },
            ].map(({ label, key }) => (
              <div key={key} className="flex gap-0.5">
                <MasterLabel width={88}>{label}</MasterLabel>
                <MasterSelectField value={form[key]} />
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
