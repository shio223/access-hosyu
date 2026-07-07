/**
 * Access風ボタンコンポーネント
 *
 * WindowsクラシックUIの立体ボタン（inset shadow）を再現する。
 * - AccessButton: クリック動作のみ（機能未実装のプレースホルダー用）
 * - AccessLinkButton: 画面遷移用（Next.js Link）
 */
import Link from "next/link";
import { cn } from "@/lib/utils";

type AccessButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** menu=メイングリッド, action=ティール操作ボタン, footer/nav=グレー小ボタン */
  variant?: "menu" | "action" | "footer" | "nav" | "exit";
  /** 元のAccess画面に合わせた文字色（青=マスタ系、赤=販売店など） */
  textColor?: "black" | "blue" | "green" | "red" | "white";
};

/** 機能未実装ボタン用。更新処理メニューなど href がない項目に使用 */
export function AccessButton({
  className,
  variant = "menu",
  textColor = "black",
  children,
  ...props
}: AccessButtonProps) {
  const textColors = {
    black: "text-black",
    blue: "text-[#0000FF]",
    green: "text-[#008000]",
    red: "text-[#FF0000]",
    white: "text-white",
  };

  // inset shadow で Windows クラシックの「浮き出し／沈み込み」表現
  const variants = {
    menu: "bg-white border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] hover:bg-[#E8E8E8] min-h-[52px] px-2 py-1 text-xs leading-tight font-normal",
    action:
      "bg-[#008080] border border-[#004040] text-white font-bold min-h-[32px] px-4 py-1 text-sm shadow-[inset_1px_1px_0_#40A0A0,inset_-1px_-1px_0_#004040]",
    footer:
      "bg-[#C0C0C0] border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] min-h-[28px] px-3 py-0.5 text-sm font-normal",
    nav: "bg-[#C0C0C0] border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] min-h-[22px] px-2 py-0 text-xs",
    exit: "bg-[#C0C0C0] border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] min-h-[28px] px-3 py-0.5 text-sm font-normal",
  };

  return (
    <button
      type="button"
      className={cn(
        "rounded-none cursor-pointer whitespace-pre-line text-center",
        variants[variant],
        variant !== "action" && textColors[textColor],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** 画面遷移付きボタン。参照処理メニューの各検索画面へのリンクに使用 */
export function AccessLinkButton({
  href,
  className,
  variant = "menu",
  textColor = "black",
  children,
}: {
  href: string;
  className?: string;
  variant?: "menu" | "action" | "footer" | "nav" | "exit";
  textColor?: "black" | "blue" | "green" | "red" | "white";
  children: React.ReactNode;
}) {
  const textColors = {
    black: "text-black",
    blue: "text-[#0000FF]",
    green: "text-[#008000]",
    red: "text-[#FF0000]",
    white: "text-white",
  };

  const variants = {
    menu: "bg-white border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] hover:bg-[#E8E8E8] min-h-[52px] px-2 py-1 text-xs leading-tight font-normal flex items-center justify-center",
    action:
      "bg-[#008080] border border-[#004040] text-white font-bold min-h-[32px] px-4 py-1 text-sm shadow-[inset_1px_1px_0_#40A0A0,inset_-1px_-1px_0_#004040] flex items-center justify-center",
    footer:
      "bg-[#C0C0C0] border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] min-h-[28px] px-3 py-0.5 text-sm font-normal flex items-center justify-center",
    nav: "bg-[#C0C0C0] border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] min-h-[22px] px-2 py-0 text-xs flex items-center justify-center",
    exit: "bg-[#C0C0C0] border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] min-h-[28px] px-3 py-0.5 text-sm font-normal flex items-center justify-center",
  };

  return (
    <Link
      href={href}
      className={cn(
        "rounded-none cursor-pointer whitespace-pre-line text-center no-underline",
        variants[variant],
        variant !== "action" && textColors[textColor],
        className
      )}
    >
      {children}
    </Link>
  );
}
