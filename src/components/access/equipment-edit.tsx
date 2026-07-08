"use client";

/**
 * 設備マスタ修正画面
 * 設備別保守実績照会の「設備修正」ボタンから遷移する。
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccessRibbon } from "./access-form-window";
import { AccessExitButton } from "./access-exit-button";
import { AccessActionButton, AccessFormRow } from "./access-form-fields";
import { equipmentDetail } from "@/lib/dummy-data";
import { routes } from "@/lib/routes";

const FORM_WIDTH = 700;

export function EquipmentEdit() {
  const router = useRouter();
  const [form, setForm] = useState({ ...equipmentDetail });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    alert("登録しました。（デモ：実際の保存は今後Supabase接続後に実装）");
    router.push(routes.equipmentInquiry);
  };

  return (
    <div className="min-h-screen bg-[#C0C0C0]">
      <AccessRibbon />
      <div className="overflow-x-auto p-2">
        <div
          className="mx-auto border-2 border-[#404040] bg-[#D4D0C8] shadow-lg"
          style={{ width: FORM_WIDTH, minWidth: FORM_WIDTH }}
        >
          <div className="bg-[#0000CC] text-white text-center font-bold" style={{ padding: "6px", fontSize: 14 }}>
            設備マスタ修正
          </div>

          <div style={{ padding: 8 }}>
            <AccessFormRow label="得意先コード" value={form.customerCode} onChange={set("customerCode")} />
            <AccessFormRow label="得意先名" value={form.customerName} onChange={set("customerName")} />
            <AccessFormRow label="設備番号" value={form.equipmentNo} onChange={set("equipmentNo")} />
            <AccessFormRow label="設備名" value={form.equipmentName} onChange={set("equipmentName")} />
            <AccessFormRow label="運転状況CD" value={form.statusCode} onChange={set("statusCode")} />
            <AccessFormRow label="運転状況" value={form.statusName} onChange={set("statusName")} />
            <AccessFormRow label="機種コード" value={form.modelCode} onChange={set("modelCode")} />
            <AccessFormRow label="機種名" value={form.modelName} onChange={set("modelName")} />
            <AccessFormRow label="メーカーコード" value={form.makerCode} onChange={set("makerCode")} />
            <AccessFormRow label="メーカー名" value={form.makerName} onChange={set("makerName")} />
            <AccessFormRow label="型　　式" value={form.modelType} onChange={set("modelType")} />
            <AccessFormRow label="管理番号" value={form.managementNo} onChange={set("managementNo")} />
            <AccessFormRow label="郵便番号" value={form.postalCode} onChange={set("postalCode")} labelVariant="yellow" />
            <AccessFormRow label="電話番号" value={form.phone} onChange={set("phone")} labelVariant="yellow" />
            <AccessFormRow label="住所１" value={form.address1} onChange={set("address1")} labelVariant="yellow" />
            <AccessFormRow label="住所２" value={form.address2} onChange={set("address2")} labelVariant="yellow" />
            <AccessFormRow label="納入日" value={form.deliveryDate} onChange={set("deliveryDate")} labelVariant="yellow" />
            <AccessFormRow label="点検周期" value={form.inspectionCycle} onChange={set("inspectionCycle")} labelVariant="yellow" />
            <AccessFormRow label="次回点検日" value={form.nextInspectionDate} onChange={set("nextInspectionDate")} labelVariant="yellow" />
            <AccessFormRow label="点検案内" value={form.inspectionNotice} onChange={set("inspectionNotice")} labelVariant="yellow" />
            <AccessFormRow label="使用オイル" value={form.oilUsed} onChange={set("oilUsed")} labelVariant="yellow" />
            <div className="flex items-stretch" style={{ gap: 1, marginTop: 4 }}>
              <div
                className="shrink-0 border border-[#808080] flex items-center px-1 bg-[#99FF99]"
                style={{ fontSize: 11, width: 100, alignSelf: "stretch" }}
              >
                備　　考
              </div>
              <textarea
                value={form.remarks}
                onChange={(e) => set("remarks")(e.target.value)}
                className="flex-1 bg-white border border-[#808080] rounded-none outline-none resize-none"
                style={{ fontSize: 11, minHeight: 60, padding: "2px 4px" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#808080]" style={{ padding: "8px 12px" }}>
            <div className="flex" style={{ gap: 12 }}>
              <AccessActionButton onClick={handleSave}>登　録</AccessActionButton>
              <AccessActionButton onClick={() => router.push(routes.equipmentInquiry)}>
                戻　る
              </AccessActionButton>
            </div>
            <AccessExitButton href={routes.menuReference} />
          </div>
        </div>
      </div>
    </div>
  );
}
