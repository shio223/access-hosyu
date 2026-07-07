/**
 * Access風フォームウィンドウ・リボン
 *
 * 検索画面などで使う「Access内に浮かぶフォーム」の外枠。
 * - AccessRibbon: 上部のOffice風リボン（PC表示のみ、装飾用）
 * - AccessFormWindow: フォームタイトルバー＋青ヘッダー＋子要素スロット
 */
import { cn } from "@/lib/utils";

/** Access上部リボンメニューの見た目再現（機能は未実装） */
export function AccessRibbon({ className }: { className?: string }) {
  return (
    <div className={cn("bg-[#D4D0C8] border-b border-[#808080] text-xs hidden md:block", className)}>
      <div className="flex border-b border-[#808080]">
        {["ファイル", "ホーム", "作成", "外部データ", "データベースツール", "ヘルプ"].map(
          (tab, i) => (
            <div
              key={tab}
              className={cn(
                "px-3 py-1 border-r border-[#808080]",
                i === 1 ? "bg-white" : "bg-[#D4D0C8]"
              )}
            >
              {tab}
            </div>
          )
        )}
      </div>
      <div className="flex flex-wrap gap-4 px-2 py-1 text-[10px] text-[#333]">
        <div>
          <div className="font-bold mb-0.5">クリップボード</div>
          <div className="flex gap-1">
            <span className="px-1 border border-[#808080] bg-white">貼り付け</span>
            <span className="px-1 border border-[#808080] bg-white">切り取り</span>
            <span className="px-1 border border-[#808080] bg-white">コピー</span>
          </div>
        </div>
        <div>
          <div className="font-bold mb-0.5">並べ替えとフィルター</div>
          <div className="flex gap-1">
            <span className="px-1 border border-[#808080] bg-white">フィルター</span>
            <span className="px-1 border border-[#808080] bg-white">昇順</span>
          </div>
        </div>
        <div>
          <div className="font-bold mb-0.5">レコード</div>
          <div className="flex gap-1">
            <span className="px-1 border border-[#808080] bg-white">新規</span>
            <span className="px-1 border border-[#808080] bg-white">保存</span>
          </div>
        </div>
        <div>
          <div className="font-bold mb-0.5">検索</div>
          <div className="flex gap-1">
            <span className="px-1 border border-[#808080] bg-white">検索</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 検索フォーム等の共通ウィンドウ枠
 * @param title - ウィンドウ上部の小さなタイトル（例: F_得意先マスタ検索）
 * @param formTitle - 青い帯に表示する画面名
 * @param showRibbon - リボン表示（デフォルト: true、md以上で表示）
 */
export function AccessFormWindow({
  title,
  formTitle,
  children,
  className,
  showRibbon = true,
}: {
  title?: string;
  formTitle: string;
  children: React.ReactNode;
  className?: string;
  showRibbon?: boolean;
}) {
  return (
    <div className={cn("min-h-screen bg-[#A0A0A0] flex flex-col", className)}>
      {showRibbon && <AccessRibbon />}
      <div className="flex-1 flex items-start justify-center p-2 md:p-4 overflow-auto">
        <div className="w-full max-w-[900px] border-2 border-[#404040] bg-[#D4D0C8] shadow-lg">
          {title && (
            <div className="bg-[#D4D0C8] border-b border-[#808080] px-2 py-0.5 text-xs flex items-center justify-between">
              <span>{title}</span>
              <span className="flex gap-0.5">
                <span className="w-4 h-3 border border-[#808080] bg-[#C0C0C0] text-[8px] flex items-center justify-center">_</span>
                <span className="w-4 h-3 border border-[#808080] bg-[#C0C0C0] text-[8px] flex items-center justify-center">□</span>
                <span className="w-4 h-3 border border-[#808080] bg-[#C0C0C0] text-[8px] flex items-center justify-center">×</span>
              </span>
            </div>
          )}
          <div className="bg-[#0000FF] text-white text-center py-1.5 px-2 font-bold text-base md:text-lg">
            {formTitle}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
