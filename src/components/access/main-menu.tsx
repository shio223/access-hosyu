"use client";

/**
 * メインメニュー（スイッチボード）
 * 初期表示は参照処理のみ。更新処理はパスワード認証後にタブ表示。
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { isUpdateMenuAuthenticated, setUpdateMenuAuthenticated } from "@/lib/menu-auth";
import { AccessExitButton } from "./access-exit-button";
import { AccessLinkButton } from "./access-button";
import { PasswordDialog } from "./password-dialog";

type MenuMode = "reference" | "update";

type MenuButton = {
  label: string;
  href?: string;
  color: "black" | "blue" | "green" | "red";
  action?: "update-password";
};

const referenceButtons: MenuButton[] = [
  { label: "設備別\n保守実績照会", href: routes.equipmentInquiry, color: "black" },
  { label: "保守実績\nデータ検索", href: routes.maintenanceSearch, color: "black" },
  { label: "", color: "black" },
  { label: "", color: "black" },
  { label: "得意先マスタ\n検索", href: routes.customerSearch, color: "blue" },
  { label: "販売店マスタ\n検索", href: routes.dealerSearch, color: "red" },
  { label: "設備マスタ\n検索", href: routes.equipmentSearch, color: "black" },
  { label: "", color: "black" },
  { label: "", color: "black" },
  { label: "", color: "black" },
  { label: "", color: "black" },
  { label: "", color: "black" },
  { label: "", color: "black" },
  { label: "", color: "black" },
  { label: "", color: "black" },
  { label: "更新処理", color: "black", action: "update-password" },
];

const updateButtons: MenuButton[] = [
  { label: "保守実績\nデータ入力", href: routes.maintenanceEntry, color: "blue" },
  { label: "得意先マスタ\n更新", href: routes.customerUpdate, color: "blue" },
  { label: "機種マスタ\n更新", href: routes.masterModel, color: "blue" },
  { label: "メーカーマスタ\n更新", href: routes.masterMaker, color: "blue" },
  { label: "次回点検日\n自動更新", href: routes.nextInspection, color: "green" },
  { label: "設備マスタ\n更新", href: routes.equipmentEdit, color: "blue" },
  { label: "地区マスタ\n更新", href: routes.masterArea, color: "blue" },
  { label: "汎用マスタ\n更新", href: routes.masterGeneral, color: "blue" },
  { label: "入力者マスタ\n更新", href: routes.masterInputter, color: "blue" },
  { label: "販売店マスタ\n更新", href: routes.masterDealer, color: "blue" },
  { label: "業種マスタ\n更新", href: routes.masterIndustry, color: "blue" },
  { label: "作業マスタ\n更新", href: routes.masterWork, color: "blue" },
  { label: "", color: "black" },
  { label: "運転状況\nマスタ更新", href: routes.masterStatus, color: "blue" },
  { label: "担当者マスタ\n更新", href: routes.masterStaff, color: "blue" },
  { label: "コントロール\nファイル更新", href: routes.controlFile, color: "blue" },
];

export function MainMenu({ mode }: { mode: MenuMode }) {
  const router = useRouter();
  const [updateAuthenticated, setUpdateAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  useEffect(() => {
    setUpdateAuthenticated(isUpdateMenuAuthenticated());
  }, []);

  const buttons = mode === "reference" ? referenceButtons : updateButtons;
  const activeTab = mode === "reference" ? "参照処理" : "更新処理";

  const handlePasswordSuccess = () => {
    setUpdateMenuAuthenticated(true);
    setUpdateAuthenticated(true);
    setShowPasswordDialog(false);
    router.push(routes.menuUpdate);
  };

  const renderMenuButton = (btn: MenuButton, i: number) => {
    if (!btn.label) {
      return (
        <div
          key={i}
          className="bg-white border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] min-h-[52px]"
        />
      );
    }

    if (btn.action === "update-password") {
      return (
        <button
          key={i}
          type="button"
          onClick={() => setShowPasswordDialog(true)}
          className={cn(
            "bg-white border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080]",
            "min-h-[52px] px-2 py-1 text-xs leading-tight rounded-none w-full text-black"
          )}
        >
          {btn.label}
        </button>
      );
    }

    if (btn.href) {
      return (
        <AccessLinkButton
          key={i}
          href={btn.href}
          variant="menu"
          textColor={btn.color}
          className="w-full"
        >
          {btn.label}
        </AccessLinkButton>
      );
    }

    return null;
  };

  return (
    <>
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
              href={routes.maintenanceUpload}
              className="px-3 py-1 text-xs border-r border-[#808080] no-underline text-[#008000] bg-[#C0C0C0] hover:bg-[#D4D0C8]"
            >
              保守実績データアップロード
            </Link>
            {updateAuthenticated && (
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
            )}
          </div>

          <div className="px-3 py-1 text-sm bg-[#D4D0C8]">{activeTab}</div>

          <div className="px-3 pb-2">
            <div className="bg-[#008080] p-2 md:p-3 border border-[#004040]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 md:gap-2">
                {buttons.map(renderMenuButton)}
              </div>
            </div>
          </div>

          <div className="flex justify-end px-3 pb-3">
            <AccessExitButton href={routes.menuReference} />
          </div>
        </div>
      </div>

      {showPasswordDialog && (
        <PasswordDialog
          onSuccess={handlePasswordSuccess}
          onCancel={() => setShowPasswordDialog(false)}
        />
      )}
    </>
  );
}
