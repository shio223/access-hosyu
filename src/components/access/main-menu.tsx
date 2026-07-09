/**
 * メインメニュー（スイッチボード）
 */
import Link from "next/link";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { AccessExitButton } from "./access-exit-button";
import { AccessLinkButton } from "./access-button";

type MenuMode = "reference" | "update";

const referenceButtons = [
  { label: "設備別\n保守実績照会", href: routes.equipmentInquiry, color: "black" as const },
  { label: "保守実績\nデータ検索", href: routes.maintenanceSearch, color: "black" as const },
  { label: "", href: "", color: "black" as const },
  { label: "", href: "", color: "black" as const },
  { label: "得意先マスタ\n検索", href: routes.customerSearch, color: "blue" as const },
  { label: "販売店マスタ\n検索", href: routes.dealerSearch, color: "red" as const },
  { label: "設備マスタ\n検索", href: routes.equipmentSearch, color: "black" as const },
  { label: "", href: "", color: "black" as const },
  { label: "", href: "", color: "black" as const },
  { label: "", href: "", color: "black" as const },
  { label: "", href: "", color: "black" as const },
  { label: "", href: "", color: "black" as const },
  { label: "", href: "", color: "black" as const },
  { label: "", href: "", color: "black" as const },
  { label: "", href: "", color: "black" as const },
  { label: "更新処理", href: routes.menuUpdate, color: "black" as const },
];

const updateButtons = [
  { label: "保守実績\nデータ入力", href: routes.maintenanceEntry, color: "blue" as const },
  { label: "得意先マスタ\n更新", href: routes.customerUpdate, color: "blue" as const },
  { label: "機種マスタ\n更新", href: routes.masterModel, color: "blue" as const },
  { label: "メーカーマスタ\n更新", href: routes.masterMaker, color: "blue" as const },
  { label: "次回点検日\n自動更新", href: routes.nextInspection, color: "green" as const },
  { label: "設備マスタ\n更新", href: routes.equipmentEdit, color: "blue" as const },
  { label: "地区マスタ\n更新", href: routes.masterArea, color: "blue" as const },
  { label: "汎用マスタ\n更新", href: routes.masterGeneral, color: "blue" as const },
  { label: "入力者マスタ\n更新", href: routes.masterInputter, color: "blue" as const },
  { label: "販売店マスタ\n更新", href: routes.masterDealer, color: "blue" as const },
  { label: "業種マスタ\n更新", href: routes.masterIndustry, color: "blue" as const },
  { label: "作業マスタ\n更新", href: routes.masterWork, color: "blue" as const },
  { label: "保守実績データ\nアップロード", href: routes.maintenanceUpload, color: "green" as const },
  { label: "運転状況\nマスタ更新", href: routes.masterStatus, color: "blue" as const },
  { label: "担当者マスタ\n更新", href: routes.masterStaff, color: "blue" as const },
  { label: "コントロール\nファイル更新", href: routes.controlFile, color: "blue" as const },
];

export function MainMenu({ mode }: { mode: MenuMode }) {
  const buttons = mode === "reference" ? referenceButtons : updateButtons;
  const activeTab = mode === "reference" ? "参照処理" : "更新処理";

  return (
    <div className="min-h-screen bg-[#A0A0A0] flex items-center justify-center p-2 md:p-4">
      <div className="w-full max-w-[680px] border-2 border-[#404040] bg-[#D4D0C8] shadow-lg">
        <div className="bg-[#000080] text-white px-3 py-2">
          <div className="text-sm md:text-base font-bold">
            （有）シンコーエヤーサービス　保守管理システム
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>32 / 64ビット対応版</span>
            <span>Ver.2.0.3</span>
          </div>
        </div>

        <div className="flex border-b border-[#808080] bg-[#D4D0C8]">
          <Link
            href={routes.menuReference}
            className={cn(
              "px-4 py-1 text-sm border-r border-[#808080] no-underline text-black",
              activeTab === "参照処理"
                ? "bg-[#D4D0C8] font-bold"
                : "bg-[#C0C0C0] hover:bg-[#D4D0C8]"
            )}
          >
            参照処理
          </Link>
          <Link
            href={routes.menuUpdate}
            className={cn(
              "px-4 py-1 text-sm border-r border-[#808080] no-underline text-black",
              activeTab === "更新処理"
                ? "bg-[#D4D0C8] font-bold"
                : "bg-[#C0C0C0] hover:bg-[#D4D0C8]"
            )}
          >
            更新処理
          </Link>
        </div>

        <div className="px-3 py-1 text-sm bg-[#D4D0C8]">{activeTab}</div>

        <div className="px-3 pb-2">
          <div className="bg-[#008080] p-2 md:p-3 border border-[#004040]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 md:gap-2">
              {buttons.map((btn, i) =>
                btn.label ? (
                  btn.href ? (
                    <AccessLinkButton
                      key={i}
                      href={btn.href}
                      variant="menu"
                      textColor={btn.color}
                      className="w-full"
                    >
                      {btn.label}
                    </AccessLinkButton>
                  ) : (
                    <button
                      key={i}
                      type="button"
                      className={cn(
                        "bg-white border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080]",
                        "min-h-[52px] px-2 py-1 text-xs leading-tight rounded-none w-full",
                        btn.color === "blue" && "text-[#0000FF]",
                        btn.color === "green" && "text-[#008000]",
                        btn.color === "red" && "text-[#FF0000]",
                        btn.color === "black" && "text-black"
                      )}
                    >
                      {btn.label}
                    </button>
                  )
                ) : (
                  <div
                    key={i}
                    className="bg-white border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] min-h-[52px]"
                  />
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end px-3 pb-3">
          <AccessExitButton href={routes.menuReference} />
        </div>
      </div>
    </div>
  );
}
