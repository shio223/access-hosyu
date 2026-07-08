"use client";

/**
 * 保守実績データ入力・修正画面
 * 設備別保守実績照会の「実績修正」ボタンから遷移する。
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccessRibbon } from "./access-form-window";
import { AccessExitButton } from "./access-exit-button";
import { AccessActionButton, AccessFormRow } from "./access-form-fields";
import { equipmentDetail, maintenanceHistory } from "@/lib/dummy-data";
import { routes } from "@/lib/routes";

const FORM_WIDTH = 600;

export function MaintenanceRecordEdit() {
  const router = useRouter();
  const latest = maintenanceHistory[0];
  const d = equipmentDetail;

  const [form, setForm] = useState({
    workDate: latest.workDate,
    workCode: latest.workCode,
    workType: latest.workType,
    workContent: latest.workContent,
    operatingHours: latest.operatingHours,
    customerContact: latest.customerContact,
    staffCode: latest.staffCode,
    staffName: latest.staffName,
    inputterCode: latest.inputterCode,
    inputterName: latest.inputterName,
  });

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
            保守実績データ入力・修正
          </div>

          <div style={{ padding: 8 }}>
            <AccessFormRow label="得意先コード" value={`${d.customerCode} ${d.customerName}`} readOnly labelVariant="yellow" />
            <AccessFormRow label="設備番号" value={`${d.equipmentNo} ${d.equipmentName}`} readOnly labelVariant="yellow" />
            <AccessFormRow label="作業日" value={form.workDate} onChange={set("workDate")} />
            <AccessFormRow label="作業コード" value={form.workCode} onChange={set("workCode")} />
            <AccessFormRow label="作業種別" value={form.workType} onChange={set("workType")} />
            <AccessFormRow label="作業内容" value={form.workContent} onChange={set("workContent")} />
            <AccessFormRow label="稼働時間" value={form.operatingHours} onChange={set("operatingHours")} />
            <AccessFormRow label="客先担当" value={form.customerContact} onChange={set("customerContact")} />
            <AccessFormRow label="担当者コード" value={form.staffCode} onChange={set("staffCode")} />
            <AccessFormRow label="担当者名" value={form.staffName} onChange={set("staffName")} />
            <AccessFormRow label="入力者コード" value={form.inputterCode} onChange={set("inputterCode")} />
            <AccessFormRow label="入力者名" value={form.inputterName} onChange={set("inputterName")} />
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
