/**
 * 設備別保守実績照会画面
 *
 * 印刷用の作業確認用紙として使用するため、画面サイズが変わっても
 * レイアウトが崩れない固定幅（980px）で表示する。
 * ウィンドウが狭い場合は横スクロールで全体を表示する。
 */
import { AccessRibbon } from "./access-form-window";
import { routes } from "@/lib/routes";
import { AccessExitButton } from "./access-exit-button";
import { equipmentDetail, maintenanceHistory } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

const FORM_WIDTH = 980;

/** 項目ラベル（緑=左列 / 黄=中央・右列） */
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

/** 白背景の値表示欄 */
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

/** コード＋名称の行 */
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
      <FieldValue className="flex-1" style={{ width: "auto", flex: 1 }}>
        {name}
      </FieldValue>
    </div>
  );
}

/** ラベル＋単一値の1行表示 */
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

/** 設備別保守実績照会画面のメインコンポーネント */
export function EquipmentMaintenanceInquiry() {
  const d = equipmentDetail;

  return (
    <div className="min-h-screen bg-[#C0C0C0] print:bg-white">
      <div className="print:hidden">
        <AccessRibbon />
      </div>

      {/* 横スクロール領域：画面が狭くてもレイアウトは980px固定 */}
      <div className="overflow-x-auto print:overflow-visible">
        <div
          className="inquiry-form-fixed mx-auto border-2 border-[#404040] bg-[#D4D0C8] shadow-lg print:border-0 print:shadow-none"
          style={{ width: FORM_WIDTH, minWidth: FORM_WIDTH, maxWidth: FORM_WIDTH }}
        >
          {/* Window title bar */}
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

          {/* Blue title header */}
          <div
            className="bg-[#0000CC] text-white flex items-center print:bg-[#0000CC]"
            style={{ padding: "4px 8px", height: 28 }}
          >
            <div style={{ width: 120 }} />
            <h1
              className="font-bold text-center shrink-0"
              style={{ fontSize: 14, flex: 1 }}
            >
              設備別保守実績照会
            </h1>
            <div className="flex justify-end print:invisible" style={{ width: 120, gap: 4 }}>
              {["前", "現在", "次"].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  className="bg-[#D4D0C8] text-black border border-[#808080] rounded-none"
                  style={{
                    fontSize: 11,
                    padding: "0 6px",
                    height: 20,
                    boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
                  }}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          {/* Main info area */}
          <div className="bg-[#D4D0C8] print:bg-white" style={{ padding: 6 }}>
            {/* 修正日 */}
            <div className="flex justify-end" style={{ marginBottom: 4 }}>
              <div className="flex" style={{ gap: 1 }}>
                <FieldLabel variant="yellow" style={{ width: 52, justifyContent: "center" }}>
                  修正日
                </FieldLabel>
                <FieldValue style={{ width: 88, justifyContent: "center" }}>
                  {d.revisionDate}
                </FieldValue>
              </div>
            </div>

            {/* 3カラム固定レイアウト */}
            <div className="flex" style={{ gap: 8 }}>
              {/* 左列 */}
              <div style={{ width: 360, flexShrink: 0 }}>
                <CodeNameRow label="得意先コード" code={d.customerCode} name={d.customerName} />
                <CodeNameRow label="設備番号" code={d.equipmentNo} name={d.equipmentName} />
                <CodeNameRow label="運転状況CD" code={d.statusCode} name={d.statusName} />
                <CodeNameRow label="機種コード" code={d.modelCode} name={d.modelName} />
                <CodeNameRow label="メーカーコード" code={d.makerCode} name={d.makerName} />
                <SimpleRow label="型　　式" value={d.modelType} labelVariant="green" labelWidth={88} />
                <SimpleRow label="管理番号" value={d.managementNo} labelVariant="green" labelWidth={88} />
              </div>

              {/* 中央列 */}
              <div style={{ width: 200, flexShrink: 0 }}>
                <SimpleRow label="郵便番号" value={d.postalCode} />
                <SimpleRow label="電話番号" value={d.phone} />
                <SimpleRow label="納 入 日" value={d.deliveryDate} />
                <SimpleRow label="点検周期" value={d.inspectionCycle} />
                <SimpleRow label="次回点検日" value={d.nextInspectionDate} />
                <SimpleRow label="点検案内" value={d.inspectionNotice} />
              </div>

              {/* 右列 */}
              <div style={{ width: 392, flexShrink: 0 }}>
                <SimpleRow label="住 所 1" value={d.address1} labelWidth={72} />
                <SimpleRow label="住 所 2" value={d.address2} labelWidth={72} />
                <SimpleRow label="1次販売店" value={d.dealer1} labelWidth={72} />
                <SimpleRow label="2次販売店" value={d.dealer2} labelWidth={72} />
                <SimpleRow label="3次販売店" value={d.dealer3} labelWidth={72} />
                <SimpleRow label="使用オイル" value={d.oilUsed} labelWidth={72} />
              </div>
            </div>

            {/* 備考 */}
            <div className="flex items-stretch" style={{ gap: 1, marginTop: 4 }}>
              <FieldLabel variant="green" style={{ width: 88, alignSelf: "stretch", height: "auto", minHeight: 52 }}>
                備　　考
              </FieldLabel>
              <div
                className="flex-1 bg-white border border-[#808080] whitespace-pre-line"
                style={{ fontSize: 11, lineHeight: "14px", padding: "2px 4px", minHeight: 52 }}
              >
                {d.remarks}
              </div>
            </div>

            {/* 履歴テーブル（列幅固定） */}
            <div className="border border-[#808080]" style={{ marginTop: 6 }}>
              <table
                className="border-collapse w-full"
                style={{ fontSize: 11, tableLayout: "fixed" }}
              >
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
                  {maintenanceHistory.map((row, i) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 操作ボタン */}
          <div
            className="flex items-center bg-[#D4D0C8] border-t border-[#808080] print:hidden"
            style={{ padding: "8px 12px", height: 44 }}
          >
            <div className="flex-1 flex justify-center" style={{ gap: 16 }}>
              {["印　刷", "画面表示", "実績修正", "設備修正"].map((label) => (
                <button
                  key={label}
                  type="button"
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

          {/* レコードナビゲーション */}
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
                  className="bg-[#C0C0C0] border border-[#808080] rounded-none"
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
              1
            </span>
            <span>/ 6</span>
          </div>
        </div>
      </div>
    </div>
  );
}
