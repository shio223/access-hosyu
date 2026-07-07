/**
 * Access風検索フォーム
 *
 * 項目名（左・紺色）と検索値（右・グレー）の2列グリッドを生成する。
 * 入力欄は readOnly でデザイン確認用。今後は双方向バインディングに差し替え。
 *
 * フィールド種別:
 * - range-select: コード系の範囲検索（ドロップダウン付き From～To）
 * - range-text: 日付・電話番号などの範囲検索（テキスト From～To）
 * - select: 単一選択（ドロップダウン付き）
 * - single: 単一テキスト入力
 * - textarea: 複数行テキスト
 */
import { cn } from "@/lib/utils";

type SearchFieldType = "range-select" | "range-text" | "single" | "select" | "textarea";

/** 検索画面1行分の定義。各 page.tsx で配列として渡す */
export type SearchField = {
  label: string;
  type: SearchFieldType;
  value?: string;
  valueTo?: string;
};

/** Access風の沈み込みテキスト入力。hasDropdown でコンボボックス風に */
function AccessInput({
  className,
  value,
  hasDropdown = false,
}: {
  className?: string;
  value?: string;
  hasDropdown?: boolean;
}) {
  return (
    <div className={cn("flex flex-1 min-w-0", className)}>
      <input
        type="text"
        readOnly
        defaultValue={value ?? ""}
        className="flex-1 min-w-0 h-6 bg-white border border-[#808080] shadow-[inset_1px_1px_2px_#808080] px-1 text-xs rounded-none outline-none"
      />
      {hasDropdown && (
        <button
          type="button"
          className="w-5 h-6 bg-[#C0C0C0] border border-[#808080] border-l-0 shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] text-[8px] rounded-none shrink-0"
        >
          ▼
        </button>
      )}
    </div>
  );
}

/** 範囲検索用の From ～ To 入力ペア */
function RangeInput({
  type,
  value,
  valueTo,
}: {
  type: "range-select" | "range-text";
  value?: string;
  valueTo?: string;
}) {
  const hasDropdown = type === "range-select";
  return (
    <div className="flex items-center gap-1 flex-1 min-w-0 flex-wrap">
      <AccessInput hasDropdown={hasDropdown} value={value} className="max-w-[140px]" />
      <span className="text-xs shrink-0">～</span>
      <AccessInput hasDropdown={hasDropdown} value={valueTo} className="max-w-[140px]" />
    </div>
  );
}

/**
 * 標準検索フォーム（得意先・販売店・保守実績データ検索で使用）
 * headerStyle: teal=白文字ヘッダー, green=黄文字ヘッダー（元画面の配色差を再現）
 */
export function AccessSearchForm({
  fields,
  headerStyle = "teal",
}: {
  fields: SearchField[];
  headerStyle?: "teal" | "green";
}) {
  const headerBg = headerStyle === "teal" ? "bg-[#008080]" : "bg-[#006400]";
  const headerText = headerStyle === "teal" ? "text-white" : "text-[#FFFF00]";

  return (
    <div className="border border-[#808080]">
      <div className={cn("grid grid-cols-[minmax(120px,180px)_1fr] text-xs font-bold", headerBg, headerText)}>
        <div className="px-2 py-1 border-r border-[#004040]">項　目　名</div>
        <div className="px-2 py-1">検　索　値</div>
      </div>
      {fields.map((field) => (
        <div
          key={field.label}
          className="grid grid-cols-1 md:grid-cols-[minmax(120px,180px)_1fr] border-t border-[#808080]"
        >
          <div className="bg-[#000080] text-white px-2 py-1 text-xs flex items-center min-h-[28px] border-b md:border-b-0 md:border-r border-[#808080]">
            {field.label}
          </div>
          <div className="bg-[#D4D0C8] px-2 py-1 flex items-center min-h-[28px]">
            {field.type === "range-select" || field.type === "range-text" ? (
              <RangeInput type={field.type} value={field.value} valueTo={field.valueTo} />
            ) : field.type === "select" ? (
              <AccessInput hasDropdown value={field.value} className="w-full" />
            ) : field.type === "textarea" ? (
              <textarea
                readOnly
                defaultValue={field.value ?? ""}
                rows={2}
                className="w-full bg-white border border-[#808080] shadow-[inset_1px_1px_2px_#808080] px-1 text-xs rounded-none outline-none resize-none"
              />
            ) : (
              <AccessInput value={field.value} className="w-full" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 設備マスタ検索専用フォーム
 * 元のAccess画面ではヘッダーが紺一色・入力欄背景がやや濃いグレーのため別コンポーネント化
 */
export function AccessEquipmentSearchForm({ fields }: { fields: SearchField[] }) {
  return (
    <div className="border border-[#808080]">
      <div className="grid grid-cols-[minmax(120px,200px)_1fr] text-xs font-bold bg-[#000080] text-white">
        <div className="px-2 py-1 border-r border-[#404080]">項　目　名</div>
        <div className="px-2 py-1">検　索　値</div>
      </div>
      {fields.map((field) => (
        <div
          key={field.label}
          className="grid grid-cols-1 md:grid-cols-[minmax(120px,200px)_1fr] border-t border-[#808080]"
        >
          <div className="bg-[#000080] text-white px-2 py-1 text-xs flex items-center min-h-[28px] border-b md:border-b-0 md:border-r border-[#808080]">
            {field.label}
          </div>
          <div className="bg-[#C0C0C0] px-2 py-1 flex items-center min-h-[28px]">
            {field.type === "range-select" || field.type === "range-text" ? (
              <RangeInput type={field.type} value={field.value} valueTo={field.valueTo} />
            ) : field.type === "select" ? (
              <AccessInput hasDropdown value={field.value} className="w-full" />
            ) : field.type === "textarea" ? (
              <textarea
                readOnly
                defaultValue={field.value ?? ""}
                rows={2}
                className="w-full bg-white border border-[#808080] shadow-[inset_1px_1px_2px_#808080] px-1 text-xs rounded-none outline-none resize-none"
              />
            ) : (
              <AccessInput value={field.value} className="w-full" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
