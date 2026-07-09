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

const FORM_WIDTH = 980;

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

const navBtnStyle: React.CSSProperties = {
  fontSize: 11,
  padding: "0 6px",
  height: 20,
  boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
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
        variant === "yellow" ? "bg-[#FFFF66]" : "bg-[#99FF99]",
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
  labelVariant = "green",
  labelWidth = 88,
  codeWidth = 44,
}: {
  label: string;
  code: string;
  name: string;
  labelVariant?: "yellow" | "green";
  labelWidth?: number;
  codeWidth?: number;
}) {
  return (
    <div className="flex items-stretch" style={{ gap: 1, marginBottom: 1 }}>
      <FieldLabel variant={labelVariant} style={{ width: labelWidth }}>
        {label}
      </FieldLabel>
      <FieldValue style={{ width: codeWidth, justifyContent: "center" }}>{code}</FieldValue>
      <FieldValue className="flex-1" style={{ flex: 1 }}>
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
}: {
  label: string;
  value: string;
  labelVariant?: "yellow" | "green";
  labelWidth?: number;
}) {
  return (
    <div className="flex items-stretch" style={{ gap: 1, marginBottom: 1 }}>
      <FieldLabel variant={labelVariant} style={{ width: labelWidth }}>
        {label}
      </FieldLabel>
      <FieldValue className="flex-1" style={{ flex: 1 }}>
        {value || "\u00A0"}
      </FieldValue>
    </div>
  );
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
      <FieldLabel variant="green" style={{ width: 88 }}>
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
      <FieldLabel variant="green" style={{ width: 88 }}>
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
      const cc = filter?.customerCode ?? searchCustomerCode;
      const en = filter?.equipmentNo ?? searchEquipmentNo;
      const q = filter?.q;

      if (cc.trim()) params.set("customerCode", cc.trim());
      if (en.trim()) params.set("equipmentNo", en.trim());
      if (q?.trim()) params.set("q", q.trim());

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
        if (cc.trim()) labelParts.push(`得意先:${cc}`);
        if (en.trim()) labelParts.push(`設備:${en}`);
        if (q?.trim()) labelParts.push(`検索:${q}`);
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
      setSearchCustomerCode(customerCode);
      setSearchEquipmentNo(equipmentNo);
      performSearch({ customerCode, equipmentNo });
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
            className="bg-[#0000CC] text-white flex items-center print:bg-[#0000CC]"
            style={{ padding: "4px 8px", height: 28 }}
          >
            <div style={{ width: 120 }} />
            <h1 className="font-bold text-center shrink-0" style={{ fontSize: 14, flex: 1 }}>
              設備別保守実績照会
              {loading && <span style={{ fontSize: 10, marginLeft: 8 }}>検索中...</span>}
            </h1>
            <div className="flex justify-end print:invisible" style={{ width: 120, gap: 4 }}>
              {!displayMode &&
                ["前", "現在", "次"].map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => handleHeaderNav(btn)}
                    disabled={btn !== "現在" && !hasRecord}
                    className="bg-[#D4D0C8] text-black border border-[#808080] rounded-none disabled:text-[#808080]"
                    style={navBtnStyle}
                  >
                    {btn}
                  </button>
                ))}
            </div>
          </div>

          <div className="bg-[#D4D0C8] print:bg-white" style={{ padding: 6 }}>
            <div className="flex justify-end" style={{ marginBottom: 4 }}>
              <div className="flex" style={{ gap: 1 }}>
                <FieldLabel variant="yellow" style={{ width: 52, justifyContent: "center" }}>
                  修正日
                </FieldLabel>
                <FieldValue style={{ width: 88, justifyContent: "center" }}>
                  {d.revisionDate || "\u00A0"}
                </FieldValue>
              </div>
            </div>

            <div className="flex" style={{ gap: 8 }}>
              <div style={{ width: 360, flexShrink: 0 }}>
                {!displayMode ? (
                  <>
                    <CustomerSearchRow
                      customerCode={searchCustomerCode}
                      customerName={searchCustomerName}
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
                      equipmentName={searchEquipmentName}
                      onEquipmentNoChange={setSearchEquipmentNo}
                      onSelect={(item) => {
                        setSearchEquipmentNo(item.equipmentNo);
                        setSearchEquipmentName(item.equipmentName);
                      }}
                      onSearch={() => performSearch()}
                    />
                  </>
                ) : (
                  <>
                    <CodeNameRow label="得意先コード" code={d.customerCode} name={d.customerName} />
                    <CodeNameRow label="設備番号" code={d.equipmentNo} name={d.equipmentName} />
                  </>
                )}
                <CodeNameRow label="運転状況CD" code={d.statusCode} name={d.statusName} />
                <CodeNameRow label="機種コード" code={d.modelCode} name={d.modelName} />
                <CodeNameRow label="メーカーコード" code={d.makerCode} name={d.makerName} />
                <SimpleRow label="型　　式" value={d.modelType} labelVariant="green" labelWidth={88} />
                <SimpleRow label="管理番号" value={d.managementNo} labelVariant="green" labelWidth={88} />
              </div>

              <div style={{ width: 200, flexShrink: 0 }}>
                <SimpleRow label="郵便番号" value={d.postalCode} />
                <SimpleRow label="電話番号" value={d.phone} />
                <SimpleRow label="納 入 日" value={d.deliveryDate} />
                <SimpleRow label="点検周期" value={d.inspectionCycle} />
                <SimpleRow label="次回点検日" value={d.nextInspectionDate} />
                <SimpleRow label="点検案内" value={d.inspectionNotice} />
              </div>

              <div style={{ width: 392, flexShrink: 0 }}>
                <SimpleRow label="住 所 1" value={d.address1} labelWidth={72} />
                <SimpleRow label="住 所 2" value={d.address2} labelWidth={72} />
                <SimpleRow label="1次販売店" value={d.dealer1} labelWidth={72} />
                <SimpleRow label="2次販売店" value={d.dealer2} labelWidth={72} />
                <SimpleRow label="3次販売店" value={d.dealer3} labelWidth={72} />
                <SimpleRow label="使用オイル" value={d.oilUsed} labelWidth={72} />
              </div>
            </div>

            <div className="flex items-stretch" style={{ gap: 1, marginTop: 4 }}>
              <FieldLabel variant="green" style={{ width: 88, alignSelf: "stretch", height: "auto", minHeight: 52 }}>
                備　　考
              </FieldLabel>
              <div
                className="flex-1 bg-white border border-[#808080] whitespace-pre-line"
                style={{ fontSize: 11, lineHeight: "14px", padding: "2px 4px", minHeight: 52 }}
              >
                {d.remarks || "\u00A0"}
              </div>
            </div>

            <div className="border border-[#808080]" style={{ marginTop: 6 }}>
              <table className="border-collapse w-full" style={{ fontSize: 11, tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: 76 }} />
                  <col style={{ width: 52 }} />
                  <col style={{ width: 380 }} />
                  <col style={{ width: 60 }} />
                  <col style={{ width: 52 }} />
                  <col style={{ width: 88 }} />
                  <col style={{ width: 76 }} />
                </colgroup>
                <thead>
                  <tr className="bg-[#008000] text-white">
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "2px 4px" }}>作業日</th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "2px 4px" }}>作業コード</th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "2px 4px" }}>作業内容</th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "2px 4px" }}>稼働時間</th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "2px 4px" }}>客先担当</th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "2px 4px" }}>担当者コード</th>
                    <th className="border border-[#004000] font-bold text-center" style={{ padding: "2px 4px" }}>入力者コード</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr className="bg-white">
                      <td colSpan={7} className="border border-[#808080]" style={{ padding: "8px 4px", height: 48 }} />
                    </tr>
                  ) : (
                    history.map((row, i) => (
                      <tr key={i} className="bg-white">
                        <td className="border border-[#808080]" style={{ padding: "2px 4px", whiteSpace: "nowrap" }}>{row.workDate}</td>
                        <td className="border border-[#808080] text-center" style={{ padding: "2px 4px" }}>{row.workCode}</td>
                        <td className="border border-[#808080]" style={{ padding: "2px 4px" }}>
                          <span style={{ display: "inline-block", width: 60, verticalAlign: "top" }}>{row.workType}</span>
                          <span>{row.workContent}</span>
                        </td>
                        <td className="border border-[#808080] text-right" style={{ padding: "2px 4px", whiteSpace: "nowrap" }}>{row.operatingHours}</td>
                        <td className="border border-[#808080] text-center" style={{ padding: "2px 4px" }}>{row.customerContact}</td>
                        <td className="border border-[#808080]" style={{ padding: "2px 4px", whiteSpace: "nowrap" }}>
                          <span style={{ display: "inline-block", width: 20 }}>{row.staffCode}</span>
                          {row.staffName}
                        </td>
                        <td className="border border-[#808080]" style={{ padding: "2px 4px", whiteSpace: "nowrap" }}>
                          <span style={{ display: "inline-block", width: 20 }}>{row.inputterCode}</span>
                          {row.inputterName}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!displayMode && (
            <div
              className="flex items-center bg-[#D4D0C8] border-t border-[#808080] print:hidden"
              style={{ padding: "8px 12px", height: 44 }}
            >
              <div className="flex-1 flex justify-center" style={{ gap: 16 }}>
                {["印　刷", "画面表示", "実績修正", "設備修正"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleButtonClick(label)}
                    className="bg-[#D4D0C8] border border-[#808080] rounded-none shrink-0"
                    style={{
                      fontSize: 13,
                      padding: "2px 16px",
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
            <div className="flex justify-end border-t border-[#808080] bg-[#D4D0C8]" style={{ padding: "8px 12px" }}>
              <button
                type="button"
                onClick={() => setDisplayMode(false)}
                className="bg-[#D4D0C8] border border-[#808080] rounded-none"
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
              className="flex items-center bg-[#D4D0C8] border-t border-[#808080] print:hidden"
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
