/**
 * 設備別保守実績照会画面
 * URL: /equipment/maintenance-inquiry
 * 参照処理メニュー「設備別保守実績照会」から遷移
 */
import { Suspense } from "react";
import { EquipmentMaintenanceInquiry } from "@/components/access/equipment-maintenance-inquiry";

export default function EquipmentMaintenanceInquiryPage() {
  return (
    <Suspense>
      <EquipmentMaintenanceInquiry />
    </Suspense>
  );
}
