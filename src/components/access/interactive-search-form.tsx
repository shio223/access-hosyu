"use client";

/**
 * インタラクティブ検索フォーム
 * Access風の項目名＋検索値グリッド。入力可能。
 */
import { cn } from "@/lib/utils";
import type { SearchField } from "./access-search-form";

function AccessInput({
  className,
  value,
  onChange,
  hasDropdown = false,
}: {
  className?: string;
  value: string;
  onChange: (v: string) => void;
  hasDropdown?: boolean;
}) {
  return (
    <div className={cn("flex flex-1 min-w-0", className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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

export function InteractiveSearchForm({
  fields,
  values,
  onChange,
  headerStyle = "teal",
}: {
  fields: SearchField[];
  values: Record<string, { from: string; to: string }>;
  onChange: (label: string, part: "from" | "to", value: string) => void;
  headerStyle?: "teal" | "green";
}) {
  const headerClass =
    headerStyle === "green"
      ? "bg-[#006400] text-[#FFFF00]"
      : "bg-[#008080] text-white";

  const getVal = (label: string) => values[label] ?? { from: "", to: "" };

  return (
    <div className="border border-[#808080]">
      <div className={cn("flex text-xs font-bold", headerClass)}>
        <div className="w-[140px] md:w-[160px] shrink-0 border-r border-[#004040] px-2 py-1 text-center">
          項目名
        </div>
        <div className="flex-1 px-2 py-1 text-center">検索値</div>
      </div>
      {fields.map((field) => (
        <div key={field.label} className="flex border-t border-[#808080] text-xs">
          <div className="w-[140px] md:w-[160px] shrink-0 bg-[#000080] text-white border-r border-[#808080] px-2 py-1 flex items-center">
            {field.label}
          </div>
          <div className="flex-1 bg-[#C0C0C0] px-2 py-1 flex items-center min-w-0">
            {(field.type === "range-select" || field.type === "range-text") && (
              <div className="flex items-center gap-1 flex-1 min-w-0 flex-wrap">
                <AccessInput
                  hasDropdown={field.type === "range-select"}
                  value={getVal(field.label).from}
                  onChange={(v) => onChange(field.label, "from", v)}
                  className="max-w-[140px]"
                />
                <span className="shrink-0">～</span>
                <AccessInput
                  hasDropdown={field.type === "range-select"}
                  value={getVal(field.label).to}
                  onChange={(v) => onChange(field.label, "to", v)}
                  className="max-w-[140px]"
                />
              </div>
            )}
            {(field.type === "single" || field.type === "select" || field.type === "textarea") && (
              <AccessInput
                hasDropdown={field.type === "select"}
                value={getVal(field.label).from}
                onChange={(v) => onChange(field.label, "from", v)}
                className="w-full"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
