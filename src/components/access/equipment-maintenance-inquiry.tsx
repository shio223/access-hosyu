"use client";

/**
 * 設備別保守実績照会画面
 *
 * Access同様、空のフォームから得意先コード・設備番号で検索し、
 * 設備情報と保守履歴を照会する。前/次ナビ・下部検索ボックス対応。
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AccessRibbon } from "./access-form-window";
import { routes } from "@/lib/routes";
import { AccessExitButton } from "./access-exit-button";
import type { EquipmentDetail, MaintenanceRecord } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import { normalizeSearchCode } from "@/lib/search-normalize";

const FORM_WIDTH = 1000;
/** 履歴テーブルの空行数（枠のみ表示用） */
const EMPTY_HISTORY_ROWS = 8;

function formatTodayDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

const EMPTY_DETAIL: EquipmentDetail = {
  customerCode: "",
  customerName: "",
  equipmentNo: "",
  equipmentName: "",
  statusCode: "",
  statusName: "",
  modelCode: "",
  modelName: "",
  makerCode: "",
  makerName: "",
  modelType: "",
  managementNo: "",
  remarks: "",
  postalCode: "",
  phone: "",
  address1: "",
  address2: "",
  deliveryDate: "",
  inspectionCycle: "",
  nextInspectionDate: "",
  inspectionNotice: "",
  dealer1: "",
  dealer2: "",
  dealer3: "",
  oilUsed: "",
  revisionDate: "",
};

const inputStyle: React.CSSProperties = {
  fontSize: 11,
  lineHeight: "14px",
  height: 20,
  padding: "1px 4px",
  boxShadow: "inset 1px 1px 2px #808080",
};

/** 添付Access画面の「前／現在／次」に近いスタイル */
const navBtnStyle: React.CSSProperties = {
  fontSize: 11,
  padding: "0 8px",
  height: 20,
  background: "#FFFFFF",
  color: "#000080",
  border: "1px solid #000080",
  borderRadius: 3,
};

function FieldLabel({
  children,
  variant = "yellow",
  className,
  style,
}: {
  children: React.ReactNode;
  variant?: "yellow" | "green";
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        "shrink-0 border border-[#808080] flex items-center px-1",
        // 添付画面寄り: 淡黄ラベル（一部緑は従来どおり）
        variant === "yellow" ? "bg-[#FFFF99]" : "bg-[#99FF99]",
        className
      )}
      style={{ fontSize: 11, lineHeight: "14px", height: 20, ...style }}
    >
      {children}
    </div>
  );
}

function FieldValue({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        "bg-white border border-[#808080] px-1 flex items-center overflow-hidden shrink-0",
        className
      )}
      style={{ fontSize: 11, lineHeight: "14px", height: 20, ...style }}
    >
      {children}
    </div>
  );
}

function CodeNameRow({
  label,
  code,
  name,
  labelVariant = "yellow",
  labelWidth = 88,
  codeWidth = 44,
  nameWidth,
}: {
  label: string;
  code: string;
  name: string;
  labelVariant?: "yellow" | "green";
  labelWidth?: number;
  codeWidth?: number;
  /** 省略時は残り幅を埋める。指定時は Access 同様の短い固定幅 */
  nameWidth?: number;
}) {
  return (
    <div className="flex items-stretch" style={{ gap: 1, marginBottom: 1 }}>
      <FieldLabel variant={labelVariant} style={{ width: labelWidth }}>
        {label}
      </FieldLabel>
      <FieldValue style={{ width: codeWidth, justifyContent: "center" }}>
        {code || "\u00A0"}
      </FieldValue>
      <FieldValue
        className={nameWidth == null ? "flex-1" : undefined}
        style={nameWidth != null ? { width: nameWidth } : { flex: 1 }}
      >
        {name || "\u00A0"}
      </FieldValue>
    </div>
  );
}

function SimpleRow({
  label,
  value,
  labelVariant = "yellow",
  labelWidth = 72,
  valueWidth,
}: {
  label: string;
  value: string;
  labelVariant?: "yellow" | "green";
  labelWidth?: number;
  /** Access 添付どおり、値枠は項目ごとに短い固定幅 */
  valueWidth?: number;
}) {
  return (
    <div className="flex items-stretch" style={{ gap: 1, marginBottom: 1 }}>
      <FieldLabel variant={labelVariant} style={{ width: labelWidth }}>
        {label}
      </FieldLabel>
      <FieldValue
        className={valueWidth == null ? "flex-1" : undefined}
        style={valueWidth != null ? { width: valueWidth } : { flex: 1 }}
      >
        {value || "\u00A0"}
      </FieldValue>
    </div>
  );
}

/** 販売店「コード　名称」を Access の2枠表示用に分割 */
function splitDealer(raw: string): { code: string; name: string } {
  const s = raw.trim();
  if (!s) return { code: "", name: "" };
  const parts = s.split(/[　\s]+/).filter(Boolean);
  if (parts.length >= 2) {
    return { code: parts[0], name: parts.slice(1).join(" ") };
  }
  if (/^\d+$/.test(s)) return { code: s, name: "" };
  return { code: "", name: s };
}

type LookupCustomer = { customerCode: string; customerName: string };
type LookupEquipment = { equipmentNo: string; equipmentName: string };

/** 得意先コード検索行（コンボボックス付き） */
function CustomerSearchRow({
  customerCode,
  customerName,
  onCustomerCodeChange,
  onSelect,
  onSearch,
}: {
  customerCode: string;
  customerName: string;
  onCustomerCodeChange: (code: string) => void;
  onSelect: (item: LookupCustomer) => void;
  onSearch: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<LookupCustomer[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  const loadOptions = useCallback(async (q?: string) => {
    const params = new URLSearchParams({ lookup: "customers" });
    if (q) params.set("q", q);
    const res = await fetch(`/api/equipment?${params}`);
    if (res.ok) {
      const data = await res.json();
      setOptions(data.items ?? []);
    }
  }, []);

  const handleDropdown = async () => {
    await loadOptions(customerCode);
    setOpen((v) => !v);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-stretch relative" style={{ gap: 1, marginBottom: 1 }} ref={wrapRef}>
      <FieldLabel variant="yellow" style={{ width: 88 }}>
        得意先コード
      </FieldLabel>
      <div className="flex" style={{ gap: 1 }}>
        <button
          type="button"
          onClick={handleDropdown}
          className="bg-[#C0C0C0] border border-[#808080] rounded-none shrink-0 print:hidden"
          style={{ width: 18, height: 20, fontSize: 8, boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080" }}
        >
          ▼
        </button>
        <input
          type="text"
          value={customerCode}
          onChange={(e) => onCustomerCodeChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="bg-white border border-[#808080] rounded-none outline-none"
          style={{ ...inputStyle, width: 44, textAlign: "center" }}
        />
      </div>
      <FieldValue className="flex-1" style={{ flex: 1 }}>
        {customerName || "\u00A0"}
      </FieldValue>
      {open && options.length > 0 && (
        <div
          className="absolute top-full left-[89px] z-50 bg-white border border-[#808080] shadow-md overflow-auto print:hidden"
          style={{ width: 280, maxHeight: 160, fontSize: 11 }}
        >
          {options.map((item) => (
            <button
              key={item.customerCode}
              type="button"
              className="w-full text-left px-2 py-0.5 hover:bg-[#000080] hover:text-white border-0 bg-transparent cursor-pointer"
              onClick={() => {
                onSelect(item);
                setOpen(false);
              }}
            >
              {item.customerCode}　{item.customerName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** 設備番号検索行（コンボボックス付き） */
function EquipmentSearchRow({
  customerCode,
  equipmentNo,
  equipmentName,
  onEquipmentNoChange,
  onSelect,
  onSearch,
}: {
  customerCode: string;
  equipmentNo: string;
  equipmentName: string;
  onEquipmentNoChange: (no: string) => void;
  onSelect: (item: LookupEquipment) => void;
  onSearch: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<LookupEquipment[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  const loadOptions = useCallback(async () => {
    if (!customerCode.trim()) return;
    const params = new URLSearchParams({
      lookup: "equipment",
      customerCode,
    });
    if (equipmentNo) params.set("q", equipmentNo);
    const res = await fetch(`/api/equipment?${params}`);
    if (res.ok) {
      const data = await res.json();
      setOptions(data.items ?? []);
    }
  }, [customerCode, equipmentNo]);

  const handleDropdown = async () => {
    await loadOptions();
    setOpen((v) => !v);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-stretch relative" style={{ gap: 1, marginBottom: 1 }} ref={wrapRef}>
      <FieldLabel variant="yellow" style={{ width: 88 }}>
        設備番号
      </FieldLabel>
      <div className="flex" style={{ gap: 1 }}>
        <button
          type="button"
          onClick={handleDropdown}
          disabled={!customerCode.trim()}
          className="bg-[#C0C0C0] border border-[#808080] rounded-none shrink-0 print:hidden disabled:text-[#808080]"
          style={{ width: 18, height: 20, fontSize: 8, boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080" }}
        >
          ▼
        </button>
        <input
          type="text"
          value={equipmentNo}
          onChange={(e) => onEquipmentNoChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="bg-white border border-[#808080] rounded-none outline-none"
          style={{ ...inputStyle, width: 44, textAlign: "center" }}
        />
      </div>
      <FieldValue className="flex-1" style={{ flex: 1 }}>
        {equipmentName || "\u00A0"}
      </FieldValue>
      {open && options.length > 0 && (
        <div
          className="absolute top-full left-[89px] z-50 bg-white border border-[#808080] shadow-md overflow-auto print:hidden"
          style={{ width: 280, maxHeight: 160, fontSize: 11 }}
        >
          {options.map((item) => (
            <button
              key={item.equipmentNo}
              type="button"
              className="w-full text-left px-2 py-0.5 hover:bg-[#000080] hover:text-white border-0 bg-transparent cursor-pointer"
              onClick={() => {
                onSelect(item);
                setOpen(false);
              }}
            >
              {item.equipmentNo}　{item.equipmentName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function EquipmentMaintenanceInquiry() {
  const router = useRouter();
  const [displayMode, setDisplayMode] = useState(false);
  const [searchCustomerCode, setSearchCustomerCode] = useState("");
  const [searchEquipmentNo, setSearchEquipmentNo] = useState("");
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [searchEquipmentName, setSearchEquipmentName] = useState("");
  const [detail, setDetail] = useState<EquipmentDetail>(EMPTY_DETAIL);
  const [history, setHistory] = useState<MaintenanceRecord[]>([]);
  const [results, setResults] = useState<EquipmentDetail[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [filterLabel, setFilterLabel] = useState("フィルターなし");
  const [bottomSearch, setBottomSearch] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const initialLoadDone = useRef(false);

  const hasRecord = currentIndex >= 0 && results.length > 0;
  const d = hasRecord ? detail : EMPTY_DETAIL;
  const revisionDateDisplay = formatTodayDate();
  const dealer1 = splitDealer(d.dealer1);
  const dealer2 = splitDealer(d.dealer2);
  const dealer3 = splitDealer(d.dealer3);

  const loadHistory = useCallback(async (customerCode: string, equipmentNo: string) => {
    const res = await fetch(
      `/api/equipment?customerCode=${encodeURIComponent(customerCode)}&equipmentNo=${encodeURIComponent(equipmentNo)}`
    );
    if (res.ok) {
      const data = await res.json();
      setHistory(data.history ?? []);
    } else {
      setHistory([]);
    }
  }, []);

  const showRecord = useCallback(
    async (record: EquipmentDetail, index: number, items: EquipmentDetail[]) => {
      setDetail(record);
      setCurrentIndex(index);
      setResults(items);
      setSearchCustomerCode(record.customerCode);
      setSearchEquipmentNo(record.equipmentNo);
      setSearchCustomerName(record.customerName);
      setSearchEquipmentName(record.equipmentName);
      setStatusMessage("");
      await loadHistory(record.customerCode, record.equipmentNo);

      const url = `/equipment/maintenance-inquiry?customerCode=${encodeURIComponent(record.customerCode)}&equipmentNo=${encodeURIComponent(record.equipmentNo)}`;
      window.history.replaceState(null, "", url);
    },
    [loadHistory]
  );

  const performSearch = useCallback(
    async (filter?: {
      customerCode?: string;
      equipmentNo?: string;
      q?: string;
    }) => {
      setLoading(true);
      setStatusMessage("検索中...");

      const params = new URLSearchParams({ search: "true" });
      const cc = normalizeSearchCode(filter?.customerCode ?? searchCustomerCode);
      const en = normalizeSearchCode(filter?.equipmentNo ?? searchEquipmentNo);
      const q = filter?.q?.normalize("NFKC").trim() ?? "";

      // 入力欄も半角寄りにそろえる（全角数字でも同じ結果）
      if (cc !== searchCustomerCode) setSearchCustomerCode(cc);
      if (en !== searchEquipmentNo) setSearchEquipmentNo(en);

      if (cc) params.set("customerCode", cc);
      if (en) params.set("equipmentNo", en);
      if (q) params.set("q", q);

      try {
        const res = await fetch(`/api/equipment?${params}`);
        const data = await res.json();

        if (!res.ok) {
          setStatusMessage(data.error ?? "検索に失敗しました");
          setResults([]);
          setCurrentIndex(-1);
          setDetail(EMPTY_DETAIL);
          setHistory([]);
          return;
        }

        const items: EquipmentDetail[] = data.items ?? [];

        if (items.length === 0) {
          setStatusMessage("該当する設備が見つかりません");
          setResults([]);
          setCurrentIndex(-1);
          setDetail(EMPTY_DETAIL);
          setHistory([]);
          setFilterLabel(
            cc || en || q ? `得意先:${cc || "*"} 設備:${en || "*"}` : "フィルターなし"
          );
          return;
        }

        const labelParts: string[] = [];
        if (cc) labelParts.push(`得意先:${cc}`);
        if (en) labelParts.push(`設備:${en}`);
        if (q) labelParts.push(`検索:${q}`);
        setFilterLabel(labelParts.length > 0 ? labelParts.join(" ") : "フィルターなし");

        await showRecord(items[0], 0, items);
        setStatusMessage(`${items.length.toLocaleString()} 件ヒット`);
      } catch {
        setStatusMessage("検索に失敗しました");
      } finally {
        setLoading(false);
      }
    },
    [searchCustomerCode, searchEquipmentNo, showRecord]
  );

  const navigateTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= results.length) return;
      showRecord(results[index], index, results);
    },
    [results, showRecord]
  );

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const params = new URLSearchParams(window.location.search);
    const customerCode = params.get("customerCode");
    const equipmentNo = params.get("equipmentNo");

    if (customerCode && equipmentNo) {
      setSearchCustomerCode(normalizeSearchCode(customerCode));
      setSearchEquipmentNo(normalizeSearchCode(equipmentNo));
      performSearch({
        customerCode: normalizeSearchCode(customerCode),
        equipmentNo: normalizeSearchCode(equipmentNo),
      });
    }
  }, [performSearch]);

  const handleButtonClick = (label: string) => {
    switch (label) {
      case "印　刷":
        window.print();
        break;
      case "画面表示":
        setDisplayMode(true);
        break;
      case "実績修正":
        router.push(routes.maintenanceEntry);
        break;
      case "設備修正":
        router.push(routes.equipmentEdit);
        break;
    }
  };

  const handleHeaderNav = (btn: string) => {
    if (btn === "前") navigateTo(currentIndex - 1);
    if (btn === "次") navigateTo(currentIndex + 1);
    if (btn === "現在") performSearch();
  };

  const handleBottomNav = (arrow: string) => {
    if (arrow === "|◀") navigateTo(0);
    if (arrow === "◀") navigateTo(currentIndex - 1);
    if (arrow === "▶") navigateTo(currentIndex + 1);
    if (arrow === "▶|") navigateTo(results.length - 1);
  };

  return (
    <div className={`inquiry-print-page min-h-screen print:bg-white ${displayMode ? "bg-white" : "bg-[#C0C0C0]"}`}>
      {!displayMode && (
        <div className="print:hidden">
          <AccessRibbon />
        </div>
      )}

      <div className="inquiry-print-container overflow-x-auto print:overflow-visible">
        <div
          className="inquiry-form-fixed mx-auto border-2 border-[#404040] bg-[#D4D0C8] shadow-lg print:border-0 print:shadow-none"
          style={{ width: FORM_WIDTH, minWidth: FORM_WIDTH, maxWidth: FORM_WIDTH }}
        >
          {!displayMode && (
            <div
              className="bg-[#D4D0C8] border-b border-[#808080] flex justify-between print:hidden"
              style={{ padding: "2px 8px", fontSize: 11 }}
            >
              <span>F-設備照会</span>
              <span className="flex" style={{ gap: 2 }}>
                {["_", "□", "×"].map((c) => (
                  <span
                    key={c}
                    className="border border-[#808080] bg-[#C0C0C0] flex items-center justify-center"
                    style={{ width: 16, height: 12, fontSize: 8 }}
                  >
                    {c}
                  </span>
                ))}
              </span>
            </div>
          )}

          <div
            className="bg-[#0000AA] text-white flex items-center print:bg-[#0000AA]"
            style={{ padding: "4px 10px", height: 32 }}
          >
            <div style={{ width: 130 }} />
            <h1 className="font-bold text-center shrink-0" style={{ fontSize: 15, flex: 1, letterSpacing: 2 }}>
              設備別保守実績照会
              {loading && (
                <span style={{ fontSize: 10, marginLeft: 8, fontWeight: "normal" }}>検索中...</span>
              )}
            </h1>
            <div className="flex justify-end items-center print:invisible" style={{ width: 130, gap: 6 }}>
              {!displayMode &&
                ["前", "現在", "次"].map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => handleHeaderNav(btn)}
                    disabled={btn !== "現在" && !hasRecord}
                    className="rounded-sm disabled:opacity-50"
                    style={navBtnStyle}
                  >
                    {btn}
                  </button>
                ))}
            </div>
          </div>

          <div className="bg-[#C0C0C0] print:bg-white" style={{ padding: "6px 8px 8px" }}>
            <div className="flex justify-end" style={{ marginBottom: 4 }}>
              <div className="flex" style={{ gap: 1 }}>
                <FieldLabel variant="yellow" style={{ width: 52, justifyContent: "center" }}>
                  修正日
                </FieldLabel>
                <FieldValue style={{ width: 88, justifyContent: "center" }}>
                  {revisionDateDisplay}
                </FieldValue>
              </div>
            </div>

            <div className="flex" style={{ gap: 6 }}>
              {/* 左列 */}
              <div style={{ width: 360, flexShrink: 0 }}>
                {!displayMode ? (
                  <>
                    <CustomerSearchRow
                      customerCode={searchCustomerCode}
                      customerName={searchCustomerName || d.customerName}
                      onCustomerCodeChange={(code) => {
                        setSearchCustomerCode(code);
                        setSearchCustomerName("");
                        setSearchEquipmentNo("");
                        setSearchEquipmentName("");
                      }}
                      onSelect={(item) => {
                        setSearchCustomerCode(item.customerCode);
                        setSearchCustomerName(item.customerName);
                        setSearchEquipmentNo("");
                        setSearchEquipmentName("");
                      }}
                      onSearch={() => performSearch()}
                    />
                    <EquipmentSearchRow
                      customerCode={searchCustomerCode}
                      equipmentNo={searchEquipmentNo}
                      equipmentName={searchEquipmentName || d.equipmentName}
                      onEquipmentNoChange={setSearchEquipmentNo}
                      onSelect={(item) => {
                        setSearchEquipmentNo(item.equipmentNo);
                        setSearchEquipmentName(item.equipmentName);
                      }}
                      onSearch={() => performSearch()}
                    />
                    <div
                      className="flex justify-end print:hidden"
                      style={{ marginTop: 4, marginBottom: 2 }}
                    >
                      <button
                        type="button"
                        onClick={() => performSearch()}
                        disabled={loading || !searchCustomerCode.trim()}
                        className="bg-[#F0F0F0] border border-[#000080] rounded-none text-[#000080] disabled:text-[#808080] disabled:border-[#808080]"
                        style={{
                          fontSize: 12,
                          padding: "1px 16px",
                          height: 22,
                          boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
                        }}
                      >
                        検索
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <CodeNameRow
                      label="得意先コード"
                      code={d.customerCode}
                      name={d.customerName}
                    />
                    <CodeNameRow
                      label="設備番号"
                      code={d.equipmentNo}
                      name={d.equipmentName}
                    />
                  </>
                )}
                <CodeNameRow label="運転状況CD" code={d.statusCode} name={d.statusName} />
                <CodeNameRow label="機種コード" code={d.modelCode} name={d.modelName} />
                <CodeNameRow
                  label="メーカーコード"
                  code={d.makerCode}
                  name={d.makerName}
                />
                <SimpleRow
                  label="型　　式"
                  value={d.modelType}
                  labelVariant="yellow"
                  labelWidth={88}
                  valueWidth={200}
                />
                <SimpleRow
                  label="管理番号"
                  value={d.managementNo}
                  labelVariant="yellow"
                  labelWidth={88}
                  valueWidth={120}
                />
              </div>

              {/* 中列（Access: 値枠は短め・点検周期は特に短い） */}
              <div style={{ width: 180, flexShrink: 0 }}>
                <SimpleRow label="郵便番号" value={d.postalCode} valueWidth={72} />
                <SimpleRow label="電話番号" value={d.phone} valueWidth={100} />
                <SimpleRow label="納 入 日" value={d.deliveryDate} valueWidth={80} />
                <SimpleRow label="点検周期" value={d.inspectionCycle} valueWidth={48} />
                <SimpleRow
                  label="次回点検日"
                  value={d.nextInspectionDate}
                  valueWidth={108}
                />
                <SimpleRow label="点検案内" value={d.inspectionNotice} valueWidth={72} />
              </div>

              {/* 右列（住所・オイルは長枠、販売店はコード＋名称） */}
              <div style={{ width: 420, flexShrink: 0 }}>
                <SimpleRow
                  label="住 所 1"
                  value={d.address1}
                  labelWidth={72}
                  valueWidth={320}
                />
                <SimpleRow
                  label="住 所 2"
                  value={d.address2}
                  labelWidth={72}
                  valueWidth={320}
                />
                <CodeNameRow
                  label="1次販売店"
                  code={dealer1.code}
                  name={dealer1.name}
                  labelWidth={72}
                  codeWidth={48}
                  nameWidth={dealer1.name.length > 12 ? 260 : 120}
                />
                <CodeNameRow
                  label="2次販売店"
                  code={dealer2.code}
                  name={dealer2.name}
                  labelWidth={72}
                  codeWidth={48}
                  nameWidth={120}
                />
                <CodeNameRow
                  label="3次販売店"
                  code={dealer3.code}
                  name={dealer3.name}
                  labelWidth={72}
                  codeWidth={52}
                  nameWidth={56}
                />
                <SimpleRow
                  label="使用オイル"
                  value={d.oilUsed}
                  labelWidth={72}
                  valueWidth={320}
                />
              </div>
            </div>

            <div className="flex items-stretch" style={{ gap: 1, marginTop: 4 }}>
              <FieldLabel
                variant="yellow"
                style={{ width: 88, alignSelf: "stretch", height: "auto", minHeight: 56 }}
              >
                備　　考
              </FieldLabel>
              <div
                className="flex-1 bg-white border border-[#808080] whitespace-pre-line"
                style={{ fontSize: 11, lineHeight: "14px", padding: "2px 4px", minHeight: 56 }}
              >
                {d.remarks || "\u00A0"}
              </div>
            </div>

            {/* 履歴テーブル（検索結果の作業日などを反映） */}
            <div className="border border-[#808080]" style={{ marginTop: 8 }}>
              <table className="border-collapse w-full" style={{ fontSize: 11, tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: 80 }} />
                  <col style={{ width: 56 }} />
                  <col />
                  <col style={{ width: 64 }} />
                  <col style={{ width: 56 }} />
                  <col style={{ width: 88 }} />
                  <col style={{ width: 80 }} />
                </colgroup>
                <thead>
                  <tr className="bg-[#008000] text-white">
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "3px 4px" }}>
                      作業日
                    </th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "3px 4px" }}>
                      作業コード
                    </th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "3px 4px" }}>
                      作業内容
                    </th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "3px 4px" }}>
                      稼働時間
                    </th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "3px 4px" }}>
                      客先担当
                    </th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "3px 4px" }}>
                      担当者コード
                    </th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "3px 4px" }}>
                      入力者コード
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0
                    ? Array.from({ length: EMPTY_HISTORY_ROWS }).map((_, i) => (
                        <tr key={`empty-${i}`} className="bg-white">
                          {Array.from({ length: 7 }).map((__, j) => (
                            <td
                              key={j}
                              className="border border-[#808080]"
                              style={{ padding: "2px 4px", height: 20 }}
                            >
                              {"\u00A0"}
                            </td>
                          ))}
                        </tr>
                      ))
                    : (
                      <>
                        {history.map((row, i) => (
                          <tr key={`h-${i}`} className="bg-white">
                            <td
                              className="border border-[#808080]"
                              style={{ padding: "2px 4px", whiteSpace: "nowrap" }}
                            >
                              {row.workDate || "\u00A0"}
                            </td>
                            <td
                              className="border border-[#808080] text-center"
                              style={{ padding: "2px 4px" }}
                            >
                              {row.workCode || "\u00A0"}
                            </td>
                            <td className="border border-[#808080]" style={{ padding: "2px 4px" }}>
                              {row.workContent || "\u00A0"}
                            </td>
                            <td
                              className="border border-[#808080] text-right"
                              style={{ padding: "2px 4px", whiteSpace: "nowrap" }}
                            >
                              {row.operatingHours || "\u00A0"}
                            </td>
                            <td
                              className="border border-[#808080] text-center"
                              style={{ padding: "2px 4px" }}
                            >
                              {row.customerContact || "\u00A0"}
                            </td>
                            <td
                              className="border border-[#808080]"
                              style={{ padding: "2px 4px", whiteSpace: "nowrap" }}
                            >
                              {row.staffCode || "\u00A0"}
                            </td>
                            <td
                              className="border border-[#808080]"
                              style={{ padding: "2px 4px", whiteSpace: "nowrap" }}
                            >
                              {row.inputterCode || "\u00A0"}
                            </td>
                          </tr>
                        ))}
                        {history.length < EMPTY_HISTORY_ROWS &&
                          Array.from({ length: EMPTY_HISTORY_ROWS - history.length }).map(
                            (_, i) => (
                              <tr key={`pad-${i}`} className="bg-white">
                                {Array.from({ length: 7 }).map((__, j) => (
                                  <td
                                    key={j}
                                    className="border border-[#808080]"
                                    style={{ padding: "2px 4px", height: 20 }}
                                  >
                                    {"\u00A0"}
                                  </td>
                                ))}
                              </tr>
                            )
                          )}
                      </>
                    )}
                </tbody>
              </table>
            </div>
          </div>

          {!displayMode && (
            <div
              className="flex items-center bg-[#C0C0C0] border-t border-[#808080] print:hidden"
              style={{ padding: "10px 16px", minHeight: 48 }}
            >
              <div className="flex-1 flex justify-center" style={{ gap: 20 }}>
                {["印　刷", "画面表示", "実績修正", "設備修正"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleButtonClick(label)}
                    className="bg-[#F0F0F0] border border-[#000080] rounded-none shrink-0 text-[#000080]"
                    style={{
                      fontSize: 13,
                      padding: "2px 18px",
                      height: 28,
                      boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <AccessExitButton href={routes.menuReference} />
            </div>
          )}

          {displayMode && (
            <div
              className="flex justify-end border-t border-[#808080] bg-[#C0C0C0]"
              style={{ padding: "8px 12px" }}
            >
              <button
                type="button"
                onClick={() => setDisplayMode(false)}
                className="bg-[#F0F0F0] border border-[#000080] rounded-none text-[#000080]"
                style={{
                  fontSize: 13,
                  padding: "2px 16px",
                  height: 28,
                  boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
                }}
              >
                閉じる
              </button>
            </div>
          )}

          {!displayMode && (
            <div
              className="flex items-center bg-[#C0C0C0] border-t border-[#808080] print:hidden"
              style={{ padding: "4px 8px", fontSize: 11, gap: 8, height: 28 }}
            >
              <span>レコード:</span>
              <div className="flex" style={{ gap: 2 }}>
                {["|◀", "◀", "▶", "▶|"].map((arrow) => (
                  <button
                    key={arrow}
                    type="button"
                    onClick={() => handleBottomNav(arrow)}
                    disabled={!hasRecord}
                    className="bg-[#C0C0C0] border border-[#808080] rounded-none disabled:text-[#808080]"
                    style={{
                      width: 22,
                      height: 18,
                      fontSize: 9,
                      boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
                    }}
                  >
                    {arrow}
                  </button>
                ))}
              </div>
              <span
                className="bg-white border border-[#808080] text-center"
                style={{ padding: "0 6px", minWidth: 20 }}
              >
                {hasRecord ? currentIndex + 1 : 0}
              </span>
              <span>/ {results.length || 0}</span>
              <span className="text-[#0000CC]">{filterLabel}</span>
              {statusMessage && <span className="text-[#CC0000]">{statusMessage}</span>}
              <div className="flex-1" />
              <span>検索</span>
              <input
                type="text"
                value={bottomSearch}
                onChange={(e) => setBottomSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    performSearch({ q: bottomSearch });
                  }
                }}
                className="bg-white border border-[#808080] rounded-none outline-none"
                style={{ ...inputStyle, width: 120 }}
                placeholder=""
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
