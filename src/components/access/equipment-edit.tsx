"use client";

/**
 * 設備マスタ更新画面（添付画像どおり）
 */
import { useState } from "react";
import Link from "next/link";
import { AccessExitButton } from "./access-exit-button";
import {
  MasterField,
  MasterLabel,
  MasterSelectField,
  masterFieldStyle,
} from "./master-form-fields";
import { routes } from "@/lib/routes";

type ProcessMode = "追加" | "修正" | "削除";

function Row({ label, children, labelWidth = 88 }: { label: string; children: React.ReactNode; labelWidth?: number }) {
  return (
    <div className="flex gap-0.5">
      <MasterLabel width={labelWidth}>{label}</MasterLabel>
      {children}
    </div>
  );
}

export function EquipmentEdit() {
  const [mode, setMode] = useState<ProcessMode>("追加");
  const [form, setForm] = useState({
    customerCode: "",
    customerName: "",
    equipmentNo: "",
    equipmentName: "",
    revisionDate: "",
    modelCode: "",
    modelName: "",
    makerCode: "",
    makerName: "",
    modelType: "",
    managementNo: "",
    dealer1: "",
    dealer2: "",
    dealer3: "",
    deliveryDate: "",
    inspectionCycle: "",
    nextInspectionDate: "",
    inspectionNotice: "",
    oilUsed: "",
    statusCode: "",
    statusName: "",
    general1: "",
    general2: "",
    general3: "",
    general4: "",
    remarks: "",
  });

  const set = (key: keyof typeof form) => (v: string) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const handleConfirm = () => {
    alert("登録しました。");
  };

  const footerBtnStyle: React.CSSProperties = {
    fontSize: 11,
    padding: "2px 8px",
    boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
  };

  return (
    <div className="min-h-screen bg-[#A0A0A0] flex items-start justify-center p-4">
      <div className="border-2 border-[#404040] bg-[#D4D0C8] shadow-lg" style={{ width: 780 }}>
        <div className="bg-[#D4D0C8] border-b border-[#808080] px-2 py-0.5 text-xs">F-設備マスタ更新</div>

        <div className="bg-[#0000FF] text-white flex items-center justify-between px-3 py-1.5">
          <span className="font-bold text-base">設備マスタ更新</span>
          <div className="flex items-center gap-2">
            <span className="bg-[#FFFF00] text-black px-2 py-0.5 text-xs font-bold border border-[#808080]">{today}</span>
            <button
              type="button"
              onClick={handleConfirm}
              className="bg-[#008080] text-white border border-[#004040] px-3 py-0.5 text-xs rounded-none"
            >
              確認
            </button>
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

        <div className="px-3 pb-1">
          <div className="flex items-center gap-1 flex-wrap" style={{ marginBottom: 4 }}>
            <MasterLabel variant="green" width={80}>得意先コード</MasterLabel>
            <MasterSelectField value={form.customerCode} />
            <MasterField value={form.customerName} readOnly width={160} />
            <MasterLabel variant="green" width={64}>設備番号</MasterLabel>
            <MasterField value={form.equipmentNo} onChange={set("equipmentNo")} width={48} />
            <div className="ml-auto flex items-center gap-0.5">
              <MasterLabel width={56}>修正日</MasterLabel>
              <MasterField value={form.revisionDate} onChange={set("revisionDate")} width={88} />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 space-y-0.5 min-w-0">
              <Row label="設備名" labelWidth={88}>
                <MasterField value={form.equipmentName} onChange={set("equipmentName")} />
              </Row>
              <Row label="機種コード">
                <MasterSelectField value={form.modelCode} />
                <MasterField value={form.modelName} readOnly width={100} />
              </Row>
              <Row label="メーカーコード">
                <MasterSelectField value={form.makerCode} />
                <MasterField value={form.makerName} readOnly width={100} />
              </Row>
              <Row label="型　　式">
                <MasterField value={form.modelType} onChange={set("modelType")} />
              </Row>
              <Row label="管理番号">
                <MasterField value={form.managementNo} onChange={set("managementNo")} />
              </Row>
              <Row label="１次販売店">
                <MasterSelectField value={form.dealer1} />
              </Row>
              <Row label="２次販売店">
                <MasterSelectField value={form.dealer2} />
              </Row>
              <div className="flex gap-0.5 items-start">
                <MasterLabel width={88}>備　　考</MasterLabel>
                <textarea
                  value={form.remarks}
                  onChange={(e) => set("remarks")(e.target.value)}
                  className="flex-1 bg-white border border-[#808080] rounded-none outline-none resize-none"
                  style={{ ...masterFieldStyle, minHeight: 72, height: "auto", padding: "2px 4px" }}
                />
              </div>
            </div>

            <div className="space-y-0.5" style={{ width: 200 }}>
              <Row label="納入日" labelWidth={72}>
                <MasterField value={form.deliveryDate} onChange={set("deliveryDate")} />
              </Row>
              <div className="flex gap-0.5">
                <MasterLabel width={72}>点検周期</MasterLabel>
                <MasterField value={form.inspectionCycle} onChange={set("inspectionCycle")} width={36} />
                <span className="text-xs self-center">ヶ月</span>
              </div>
              <Row label="次回点検日" labelWidth={72}>
                <MasterField value={form.nextInspectionDate} onChange={set("nextInspectionDate")} />
              </Row>
              <div className="flex gap-0.5 items-start">
                <MasterLabel width={72}>点検案内</MasterLabel>
                <MasterField value={form.inspectionNotice} onChange={set("inspectionNotice")} width={24} />
                <div className="text-[9px] leading-tight self-center text-black">
                  0=不要 1=得意先宛<br />2=両方 3=販売店宛
                </div>
              </div>
              <Row label="３次販売店" labelWidth={72}>
                <MasterSelectField value={form.dealer3} />
              </Row>
              <Row label="使用オイル" labelWidth={72}>
                <MasterField value={form.oilUsed} onChange={set("oilUsed")} />
              </Row>
            </div>

            <div className="space-y-0.5" style={{ width: 168 }}>
              <Row label="運転状況" labelWidth={80}>
                <MasterSelectField value={form.statusCode} />
                <MasterField value={form.statusName} readOnly width={48} />
              </Row>
              {[
                { label: "汎用コード１", key: "general1" as const },
                { label: "汎用コード２", key: "general2" as const },
                { label: "汎用コード３", key: "general3" as const },
                { label: "汎用コード４", key: "general4" as const },
              ].map(({ label, key }) => (
                <Row key={key} label={label} labelWidth={80}>
                  <MasterSelectField value={form[key]} />
                </Row>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-[#008080] px-3 py-1.5 border-t border-[#004040]">
          <div className="flex gap-2">
            <Link
              href={routes.customerUpdate}
              className="bg-[#C0C0C0] border border-[#808080] text-black no-underline rounded-none"
              style={footerBtnStyle}
            >
              得意先マスタの更新
            </Link>
            <Link
              href={routes.masterDealer}
              className="bg-[#C0C0C0] border border-[#808080] text-black no-underline rounded-none"
              style={footerBtnStyle}
            >
              販売店マスタの更新
            </Link>
          </div>
          <AccessExitButton href={routes.menuUpdate} />
        </div>
      </div>
    </div>
  );
}
