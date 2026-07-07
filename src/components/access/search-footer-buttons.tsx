/**
 * 検索画面フッターの操作ボタン群
 *
 * 「検索開始」「条件消去」「画面表示」「終了」をAccess風に配置。
 * 現時点では見た目のみで、クリック時の処理は未実装。
 */
import { cn } from "@/lib/utils";
import { AccessExitButton } from "./access-exit-button";

export function SearchFooterButtons({
  exitHref = "/",
  className,
}: {
  exitHref?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 bg-[#008080] px-2 py-1.5 border-t border-[#004040]",
        className
      )}
    >
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          className="bg-[#C0C0C0] border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] px-3 py-0.5 text-sm rounded-none"
        >
          検索開始
        </button>
        <button
          type="button"
          className="bg-[#C0C0C0] border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] px-3 py-0.5 text-sm rounded-none"
        >
          条件消去
        </button>
        <button
          type="button"
          className="bg-[#C0C0C0] border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] px-3 py-0.5 text-sm rounded-none"
        >
          画面表示
        </button>
      </div>
      <AccessExitButton href={exitHref} />
    </div>
  );
}
