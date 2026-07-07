/**
 * 終了ボタンコンポーネント
 *
 * 全画面共通の「終了」ボタン。Accessのドアアイコン付き終了ボタンを再現。
 * デフォルトではメインメニュー（/）へ戻る。
 */
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Access終了アイコン（ドア＋矢印）のSVG再現 */
export function ExitIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("inline-block w-4 h-4 shrink-0", className)}
      aria-hidden="true"
    >
      <rect x="2" y="4" width="14" height="16" fill="#C0C0C0" stroke="#000" strokeWidth="1" />
      <rect x="4" y="6" width="10" height="12" fill="#FFFFCC" stroke="#808080" strokeWidth="0.5" />
      <path d="M16 12 L22 12 M20 9 L22 12 L20 15" stroke="#008000" strokeWidth="2" fill="none" />
    </svg>
  );
}

/** 終了ボタン。href で戻り先を指定可能（通常は "/"） */
export function AccessExitButton({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 bg-[#C0C0C0] border border-[#808080]",
        "shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080]",
        "px-3 py-0.5 text-sm text-black no-underline rounded-none",
        className
      )}
    >
      <ExitIcon />
      <span>終了</span>
    </Link>
  );
}
