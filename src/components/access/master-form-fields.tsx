/** マスタ更新フォーム共通部品 */

export const masterFieldStyle: React.CSSProperties = {
  fontSize: 11,
  height: 20,
  padding: "1px 4px",
  boxShadow: "inset 1px 1px 2px #808080",
};

const btnStyle: React.CSSProperties = {
  fontSize: 10,
  height: 20,
  padding: "0 4px",
  boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
};

export function MasterLabel({
  children,
  width = 100,
  variant = "navy",
}: {
  children: React.ReactNode;
  width?: number;
  variant?: "navy" | "green" | "yellow";
}) {
  const bg =
    variant === "green"
      ? "bg-[#99FF99] text-black"
      : variant === "yellow"
        ? "bg-[#FFFF66] text-black"
        : "bg-[#000080] text-white";
  return (
    <div
      className={`${bg} border border-[#808080] flex items-center px-1 shrink-0`}
      style={{ width, fontSize: 11, height: 22 }}
    >
      {children}
    </div>
  );
}

export function MasterField({
  value,
  onChange,
  readOnly,
  className,
  width,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  className?: string;
  width?: number | string;
}) {
  return (
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      className={`bg-white border border-[#808080] rounded-none outline-none ${width ? "" : "flex-1"} ${className ?? ""}`}
      style={{ ...masterFieldStyle, width }}
    />
  );
}

export function MasterSelectField({ value }: { value: string }) {
  return (
    <div className="flex flex-1">
      <input
        type="text"
        value={value}
        readOnly
        className="flex-1 bg-white border border-[#808080] rounded-none outline-none"
        style={masterFieldStyle}
      />
      <button
        type="button"
        className="w-5 bg-[#C0C0C0] border border-[#808080] border-l-0 text-[8px] rounded-none"
        style={{ height: 20 }}
      >
        ▼
      </button>
    </div>
  );
}

/** 郵便番号＋〒変換ボタン（Accessどおり縦並び） */
export function PostalCodeRow({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-0.5">
      <MasterLabel variant="yellow">郵便番号</MasterLabel>
      <MasterField value={value} onChange={onChange} width={72} />
      <div className="flex flex-col gap-0.5 shrink-0">
        <button type="button" className="bg-[#C0C0C0] border border-[#808080] rounded-none whitespace-nowrap" style={btnStyle}>
          〒→住所
        </button>
        <button type="button" className="bg-[#C0C0C0] border border-[#808080] rounded-none whitespace-nowrap" style={btnStyle}>
          住所→〒
        </button>
      </div>
    </div>
  );
}
