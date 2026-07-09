"use client";

/**
 * 検索画面フッターの操作ボタン群
 */
import { cn } from "@/lib/utils";
import { AccessExitButton } from "./access-exit-button";

export function SearchFooterButtons({
  exitHref = "/",
  className,
  onSearch,
  onClear,
  onDisplay,
}: {
  exitHref?: string;
  className?: string;
  onSearch?: () => void;
  onClear?: () => void;
  onDisplay?: () => void;
}) {
  const btnClass =
    "bg-[#C0C0C0] border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] px-3 py-0.5 text-sm rounded-none";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 bg-[#008080] px-2 py-1.5 border-t border-[#004040]",
        className
      )}
    >
      <div className="flex flex-wrap gap-1">
        <button type="button" className={btnClass} onClick={onSearch}>
          検索開始
        </button>
        <button type="button" className={btnClass} onClick={onClear}>
          条件消去
        </button>
        <button type="button" className={btnClass} onClick={onDisplay}>
          画面表示
        </button>
      </div>
      <AccessExitButton href={exitHref} />
    </div>
  );
}
