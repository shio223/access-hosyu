/** Access風の入力フィールド */
export function AccessFieldInput({
  value,
  onChange,
  className,
  style,
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  className?: string;
  style?: React.CSSProperties;
  readOnly?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      className={`bg-white border border-[#808080] px-1 rounded-none outline-none ${className ?? ""}`}
      style={{ fontSize: 11, lineHeight: "14px", height: 20, ...style }}
    />
  );
}

/** Access風のラベル */
export function AccessFieldLabel({
  children,
  variant = "green",
  style,
}: {
  children: React.ReactNode;
  variant?: "green" | "yellow";
  style?: React.CSSProperties;
}) {
  const bg = variant === "green" ? "bg-[#99FF99]" : "bg-[#FFFF66]";
  return (
    <div
      className={`shrink-0 border border-[#808080] flex items-center px-1 ${bg}`}
      style={{ fontSize: 11, lineHeight: "14px", height: 20, ...style }}
    >
      {children}
    </div>
  );
}

/** Access風フォーム行（ラベル＋入力） */
export function AccessFormRow({
  label,
  value,
  onChange,
  labelWidth = 100,
  labelVariant = "green",
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  labelWidth?: number;
  labelVariant?: "green" | "yellow";
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-stretch" style={{ gap: 1, marginBottom: 1 }}>
      <AccessFieldLabel variant={labelVariant} style={{ width: labelWidth }}>
        {label}
      </AccessFieldLabel>
      <AccessFieldInput
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className="flex-1"
        style={{ flex: 1, width: "auto" }}
      />
    </div>
  );
}

/** Access風の操作ボタン */
export function AccessActionButton({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="bg-[#D4D0C8] border border-[#808080] rounded-none shrink-0"
      style={{
        fontSize: 13,
        padding: "2px 16px",
        height: 28,
        boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
      }}
    >
      {children}
    </button>
  );
}
