/**
 * 設備別保守実績照会画面
 *
 * 元のAccessフォーム「設備別保守実績照会」を印刷用の作業確認用紙として
 * 使用するため、画像とほぼ同一のレイアウト・配色・データで再現する。
 *
 * 構成:
 * 1. タイトルバー（前/現在/次ボタン付き）
 * 2. 設備・得意先の詳細情報（左=緑ラベル / 中央・右=黄ラベル の3ブロック）
 * 3. 備考（複数行テキスト）
 * 4. 保守履歴テーブル（作業日・作業コード・作業内容・稼働時間・客先担当・担当者・入力者）
 * 5. 操作ボタン（印刷・画面表示・実績修正・設備修正・終了）
 * 6. レコードナビゲーションバー
 */
import { AccessRibbon } from "./access-form-window";
import { routes } from "@/lib/routes";
import { AccessExitButton } from "./access-exit-button";
import { equipmentDetail, maintenanceHistory } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

/** 項目ラベル（緑=左列 / 黄=中央・右列）。Accessのラベルコントロール再現 */
function FieldLabel({
  children,
  variant = "yellow",
  className,
}: {
  children: React.ReactNode;
  variant?: "yellow" | "green";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-[11px] leading-tight px-1 py-0.5 shrink-0 border border-[#808080] flex items-center",
        variant === "yellow" ? "bg-[#FFFF66]" : "bg-[#99FF99]",
        className
      )}
    >
      {children}
    </div>
  );
}

/** 白背景の値表示欄（沈み込みボーダー） */
function FieldValue({
  children,
  className,
  wide,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-white border border-[#808080] px-1 py-0.5 text-[11px] leading-tight min-h-[20px] flex items-center overflow-hidden",
        wide && "flex-1",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * コード＋名称の行（例: 得意先コード [4522] TOPPAN㈱）
 * 左列で使用。labelVariant で緑/黄を切替。
 */
function CodeNameRow({
  label,
  code,
  name,
  labelVariant = "green",
  labelWidth = "w-[88px]",
  codeWidth = "w-[44px]",
}: {
  label: string;
  code: string;
  name: string;
  labelVariant?: "yellow" | "green";
  labelWidth?: string;
  codeWidth?: string;
}) {
  return (
    <div className="flex items-stretch gap-0.5">
      <FieldLabel variant={labelVariant} className={labelWidth}>
        {label}
      </FieldLabel>
      <FieldValue className={cn(codeWidth, "justify-center")}>{code}</FieldValue>
      <FieldValue className="flex-1 min-w-0">{name}</FieldValue>
    </div>
  );
}

/** ラベル＋単一値の1行表示 */
function SimpleRow({
  label,
  value,
  labelVariant = "yellow",
  labelWidth = "w-[88px]",
}: {
  label: string;
  value: string;
  labelVariant?: "yellow" | "green";
  labelWidth?: string;
}) {
  return (
    <div className="flex items-stretch gap-0.5">
      <FieldLabel variant={labelVariant} className={labelWidth}>
        {label}
      </FieldLabel>
      <FieldValue wide>{value || "\u00A0"}</FieldValue>
    </div>
  );
}

/** 設備別保守実績照会画面のメインコンポーネント */
export function EquipmentMaintenanceInquiry() {
  const d = equipmentDetail;

  return (
    <div className="min-h-screen bg-[#C0C0C0] flex flex-col print:bg-white print:block">
      <div className="print:hidden">
        <AccessRibbon />
      </div>
      <div className="flex-1 p-1 md:p-2 overflow-auto print:p-0 print:overflow-visible">
        <div className="max-w-[1000px] mx-auto border-2 border-[#404040] bg-[#D4D0C8] shadow-lg print:border-0 print:shadow-none print:max-w-none">
          {/* Window title bar */}
          <div className="bg-[#D4D0C8] border-b border-[#808080] px-2 py-0.5 text-xs flex justify-between print:hidden">
            <span>F-設備照会</span>
            <span className="flex gap-0.5">
              <span className="w-4 h-3 border border-[#808080] bg-[#C0C0C0] text-[8px] flex items-center justify-center">_</span>
              <span className="w-4 h-3 border border-[#808080] bg-[#C0C0C0] text-[8px] flex items-center justify-center">□</span>
              <span className="w-4 h-3 border border-[#808080] bg-[#C0C0C0] text-[8px] flex items-center justify-center">×</span>
            </span>
          </div>

          {/* Blue title header with prev/current/next */}
          <div className="bg-[#0000CC] text-white flex items-center px-2 py-1">
            <div className="flex-1" />
            <h1 className="text-base md:text-lg font-bold text-center shrink-0">
              設備別保守実績照会
            </h1>
            <div className="flex-1 flex justify-end gap-1 print:invisible">
              {["前", "現在", "次"].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  className="bg-[#D4D0C8] text-black border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] px-2 py-0 text-xs rounded-none"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          {/* Main info area */}
          <div className="p-1 md:p-2 bg-[#D4D0C8] print:bg-white">
            {/* 修正日 (top-right) */}
            <div className="flex justify-end mb-1">
              <div className="flex items-stretch gap-0.5">
                <FieldLabel className="w-[56px] justify-center">修正日</FieldLabel>
                <FieldValue className="w-[90px] justify-center">{d.revisionDate}</FieldValue>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1.25fr)] gap-x-3 gap-y-0.5">
              {/* Left column: green labels */}
              <div className="space-y-0.5">
                <CodeNameRow label="得意先コード" code={d.customerCode} name={d.customerName} labelVariant="green" />
                <CodeNameRow label="設備番号" code={d.equipmentNo} name={d.equipmentName} labelVariant="green" />
                <CodeNameRow label="運転状況CD" code={d.statusCode} name={d.statusName} labelVariant="green" />
                <CodeNameRow label="機種コード" code={d.modelCode} name={d.modelName} labelVariant="green" />
                <CodeNameRow label="メーカーコード" code={d.makerCode} name={d.makerName} labelVariant="green" />
                <SimpleRow label="型　　式" value={d.modelType} labelVariant="green" />
                <SimpleRow label="管理番号" value={d.managementNo} labelVariant="green" />
              </div>

              {/* Middle column: yellow labels */}
              <div className="space-y-0.5">
                <SimpleRow label="郵便番号" value={d.postalCode} labelWidth="w-[72px]" />
                <SimpleRow label="電話番号" value={d.phone} labelWidth="w-[72px]" />
                <SimpleRow label="納 入 日" value={d.deliveryDate} labelWidth="w-[72px]" />
                <SimpleRow label="点検周期" value={d.inspectionCycle} labelWidth="w-[72px]" />
                <SimpleRow label="次回点検日" value={d.nextInspectionDate} labelWidth="w-[72px]" />
                <SimpleRow label="点検案内" value={d.inspectionNotice} labelWidth="w-[72px]" />
              </div>

              {/* Right column: yellow labels */}
              <div className="space-y-0.5">
                <SimpleRow label="住 所 1" value={d.address1} labelWidth="w-[72px]" />
                <SimpleRow label="住 所 2" value={d.address2} labelWidth="w-[72px]" />
                <SimpleRow label="1次販売店" value={d.dealer1} labelWidth="w-[72px]" />
                <SimpleRow label="2次販売店" value={d.dealer2} labelWidth="w-[72px]" />
                <SimpleRow label="3次販売店" value={d.dealer3} labelWidth="w-[72px]" />
                <SimpleRow label="使用オイル" value={d.oilUsed} labelWidth="w-[72px]" />
              </div>
            </div>

            {/* Remarks */}
            <div className="flex items-stretch gap-0.5 mt-1">
              <FieldLabel variant="green" className="w-[88px] self-stretch">備　　考</FieldLabel>
              <div className="flex-1 bg-white border border-[#808080] px-1 py-0.5 text-[11px] leading-snug min-h-[48px] whitespace-pre-line">
                {d.remarks}
              </div>
            </div>

            {/* History table */}
            <div className="mt-1.5 overflow-x-auto print:overflow-visible border border-[#808080]">
              <table className="w-full border-collapse text-[11px] min-w-[720px] print:min-w-0">
                <thead>
                  <tr className="bg-[#008000] text-white">
                    <th className="border border-[#004000] px-1 py-0.5 font-bold text-center whitespace-nowrap w-[78px]">作業日</th>
                    <th className="border border-[#004000] px-1 py-0.5 font-bold text-center whitespace-nowrap w-[54px]">作業コード</th>
                    <th className="border border-[#004000] px-1 py-0.5 font-bold text-center">作業内容</th>
                    <th className="border border-[#004000] px-1 py-0.5 font-bold text-center whitespace-nowrap w-[62px]">稼働時間</th>
                    <th className="border border-[#004000] px-1 py-0.5 font-bold text-center whitespace-nowrap w-[54px]">客先担当</th>
                    <th className="border border-[#004000] px-1 py-0.5 font-bold text-center whitespace-nowrap w-[92px]">担当者コード</th>
                    <th className="border border-[#004000] px-1 py-0.5 font-bold text-center whitespace-nowrap w-[80px]">入力者コード</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceHistory.map((row, i) => (
                    <tr key={i} className="bg-white">
                      <td className="border border-[#808080] px-1 py-0.5 whitespace-nowrap">{row.workDate}</td>
                      <td className="border border-[#808080] px-1 py-0.5 text-center">{row.workCode}</td>
                      <td className="border border-[#808080] px-1 py-0.5">
                        <span className="inline-block w-[60px] align-top">{row.workType}</span>
                        <span>{row.workContent}</span>
                      </td>
                      <td className="border border-[#808080] px-1 py-0.5 text-right whitespace-nowrap">{row.operatingHours}</td>
                      <td className="border border-[#808080] px-1 py-0.5 text-center">{row.customerContact}</td>
                      <td className="border border-[#808080] px-1 py-0.5 whitespace-nowrap">
                        <span className="inline-block w-6">{row.staffCode}</span>
                        {row.staffName}
                      </td>
                      <td className="border border-[#808080] px-1 py-0.5 whitespace-nowrap">
                        <span className="inline-block w-6">{row.inputterCode}</span>
                        {row.inputterName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 bg-[#D4D0C8] px-3 py-2 border-t border-[#808080] print:hidden">
            <div className="flex-1 flex flex-wrap justify-center gap-4">
              {["印　刷", "画面表示", "実績修正", "設備修正"].map((label) => (
                <button
                  key={label}
                  type="button"
                  className="bg-[#D4D0C8] border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] px-4 py-1 text-sm rounded-none min-h-[28px]"
                >
                  {label}
                </button>
              ))}
            </div>
            <AccessExitButton href={routes.menuReference} />
          </div>

          {/* Record navigation bar */}
          <div className="flex items-center gap-2 px-2 py-1 bg-[#D4D0C8] border-t border-[#808080] text-xs print:hidden">
            <span>レコード:</span>
            <div className="flex items-center gap-0.5">
              {["|◀", "◀", "▶", "▶|"].map((arrow) => (
                <button
                  key={arrow}
                  type="button"
                  className="w-6 h-5 bg-[#C0C0C0] border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] text-[10px] rounded-none"
                >
                  {arrow}
                </button>
              ))}
            </div>
            <span className="bg-white border border-[#808080] px-2 py-0 min-w-[24px] text-center">1</span>
            <span>/ 6</span>
          </div>
        </div>
      </div>
    </div>
  );
}
