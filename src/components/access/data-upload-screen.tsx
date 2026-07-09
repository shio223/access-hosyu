"use client";

/**
 * 保守実績データ アップロード画面（UIのみ）
 *
 * 元のAccessフォーム「保守実績データ アップロード - 三光ERPAzure」を再現。
 * データの読み書き・転送は行わない。Supabase接続後に upload-service を実装する。
 */
import { useState } from "react";
import {
  uploadDashboardDummy,
  uploadDocLinks,
  uploadTechnicalInfo,
} from "@/lib/upload-dummy-data";
import { routes } from "@/lib/routes";
import { AccessExitButton } from "./access-exit-button";

const FORM_WIDTH = 920;

const toolbarButtonStyle: React.CSSProperties = {
  fontSize: 11,
  padding: "2px 8px",
  height: 24,
  boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
};

const disabledButtonStyle: React.CSSProperties = {
  ...toolbarButtonStyle,
  color: "#808080",
};

function ToolbarButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="bg-[#C0C0C0] border border-[#808080] rounded-none shrink-0"
      style={disabled ? disabledButtonStyle : toolbarButtonStyle}
    >
      {children}
    </button>
  );
}

function InfoRow({
  label,
  children,
  note,
}: {
  label: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="flex items-center" style={{ gap: 8 }}>
        <div
          className="shrink-0 text-right font-bold"
          style={{ width: 160, fontSize: 12 }}
        >
          {label}
        </div>
        <div className="flex-1">{children}</div>
      </div>
      {note && (
        <div style={{ marginLeft: 168, marginTop: 2, fontSize: 10, color: "#333" }}>
          {note}
        </div>
      )}
    </div>
  );
}

function DisplayField({ value, width }: { value: string; width?: number | string }) {
  return (
    <div
      className="bg-white border border-[#808080]"
      style={{
        fontSize: 12,
        padding: "2px 6px",
        height: 22,
        display: "flex",
        alignItems: "center",
        width: width ?? "100%",
        boxShadow: "inset 1px 1px 2px #808080",
      }}
    >
      {value}
    </div>
  );
}

export function DataUploadScreen() {
  const [localPath, setLocalPath] = useState(uploadDashboardDummy.localDataPath);
  const [localCount, setLocalCount] = useState<string>("- 件");
  const [commandLog, setCommandLog] = useState("");

  const appendLog = (message: string) => {
    const line = `[${new Date().toLocaleString("ja-JP")}] ${message}`;
    setCommandLog((prev) => (prev ? `${prev}\n${line}` : line));
  };

  const handleBrowse = () => {
    appendLog("（デモ）参照ボタンが押されました。ファイル選択は未実装です。");
  };

  const handleUpload = () => {
    setLocalCount("（未取得） 件");
    appendLog("（デモ）アップロード実行ボタンが押されました。");
    appendLog("実際のデータ転送は行いません。Supabase接続後に実装予定です。");
    appendLog(`指定パス: ${localPath}`);
    appendLog("---");
    appendLog("【将来実装予定】");
    appendLog("・ローカルデータ件数の取得");
    appendLog("・クラウドへの一括取込");
    appendLog("・進捗表示（処理件数 / 全件数）");
    appendLog("・成功件数・失敗件数の表示");
    appendLog("・エラーログの出力");
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#C0C0C0] print:bg-white">
      <div className="overflow-x-auto p-2 print:p-0">
        <div
          className="mx-auto border-2 border-[#404040] bg-[#D4D0C8] shadow-lg print:border-0 print:shadow-none"
          style={{ width: FORM_WIDTH, minWidth: FORM_WIDTH, maxWidth: FORM_WIDTH }}
        >
          {/* ウィンドウタイトル */}
          <div
            className="bg-[#D4D0C8] border-b border-[#808080] flex justify-between print:hidden"
            style={{ padding: "2px 8px", fontSize: 11 }}
          >
            <span>保守実績データ アップロード - 三光ERPAzure</span>
          </div>

          {/* ヘッダー帯 */}
          <div
            className="text-white flex items-center justify-between"
            style={{ background: "#006666", padding: "6px 8px" }}
          >
            <h1 className="font-bold" style={{ fontSize: 16 }}>
              保守実績データ　アップロード
            </h1>
            <div className="flex flex-wrap justify-end print:hidden" style={{ gap: 4 }}>
              <ToolbarButton>HELP表示 (F12)</ToolbarButton>
              <ToolbarButton>訂正履歴表示</ToolbarButton>
              <ToolbarButton onClick={handlePrint}>画面印刷 (P)</ToolbarButton>
              <ToolbarButton disabled>画面クリア (F3)</ToolbarButton>
              <ToolbarButton disabled>複写 (F4)</ToolbarButton>
              <ToolbarButton disabled>前</ToolbarButton>
              <ToolbarButton disabled>次</ToolbarButton>
            </div>
          </div>

          {/* MODE・接続先 */}
          <div
            className="flex items-center border-b border-[#808080]"
            style={{ padding: "6px 8px", gap: 12, fontSize: 11 }}
          >
            <div className="flex items-center" style={{ gap: 4 }}>
              <span className="font-bold">MODE</span>
              <span
                className="border border-[#004000] text-center font-bold"
                style={{
                  background: "#00CC00",
                  padding: "2px 12px",
                  minWidth: 48,
                }}
              >
                転送
              </span>
            </div>
            <span>
              接続先: {uploadDashboardDummy.connectionTarget}
            </span>
          </div>

          {/* メイン入力エリア */}
          <div style={{ padding: "12px 8px" }}>
            <InfoRow
              label="ローカルデータの場所"
              note="保守管理データのフルパスです。サーバーの更新などで変更があった時は「参照」ボタンを押して変更ください。"
            >
              <div className="flex" style={{ gap: 4 }}>
                <ToolbarButton onClick={handleBrowse}>参照</ToolbarButton>
                <input
                  type="text"
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  className="flex-1 bg-white border border-[#808080] rounded-none outline-none"
                  style={{
                    fontSize: 12,
                    padding: "2px 6px",
                    height: 24,
                    boxShadow: "inset 1px 1px 2px #808080",
                  }}
                />
              </div>
            </InfoRow>

            <InfoRow
              label="ローカル　データ件数"
              note="保守管理システムのデータの件数です。「アップロード実行」ボタンを押したタイミングで表示します。"
            >
              <DisplayField value={localCount} width={120} />
            </InfoRow>

            <InfoRow label="クラウド　最終アップロード日時">
              <DisplayField
                value={uploadDashboardDummy.cloudLastUploadAt}
                width={200}
              />
            </InfoRow>

            <InfoRow
              label="クラウド　データ件数"
              note="クラウドにアップロード済みの保守管理データの件数です。"
            >
              <DisplayField
                value={`${uploadDashboardDummy.cloudRecordCount.toLocaleString()} 件`}
                width={120}
              />
            </InfoRow>

            {/* コマンドログ */}
            <div style={{ marginTop: 12 }}>
              <div className="font-bold" style={{ fontSize: 12, marginBottom: 4 }}>
                コマンド
              </div>
              <textarea
                readOnly
                value={commandLog}
                className="w-full bg-white border border-[#808080] rounded-none outline-none resize-none font-mono"
                style={{
                  fontSize: 11,
                  height: 160,
                  padding: 6,
                  boxShadow: "inset 1px 1px 2px #808080",
                }}
                placeholder="処理状況・エラーログがここに表示されます"
              />
            </div>

            {/* アップロード実行 */}
            <div style={{ marginTop: 16 }}>
              <div className="text-[#CC0000] font-bold" style={{ fontSize: 12, marginBottom: 6 }}>
                2～3分かかります。
              </div>
              <button
                type="button"
                onClick={handleUpload}
                className="bg-[#C0C0C0] border-2 border-[#808080] rounded-none font-bold text-[#0000CC] print:hidden"
                style={{
                  fontSize: 18,
                  padding: "8px 24px",
                  minWidth: 200,
                  boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
                }}
              >
                アップロード　実行
              </button>
              <div className="text-[#CC0000] font-bold" style={{ fontSize: 11, marginTop: 8 }}>
                保守管理システム上の入力、更新、集計、検索等の作業を止めてから実行してください。（データ破損の恐れ）
              </div>
            </div>
          </div>

          {/* 技術情報・資料リンク */}
          <div
            className="flex border-t border-[#808080] print:hidden"
            style={{ padding: "8px", gap: 16, fontSize: 10 }}
          >
            <div className="flex-1 text-[#0000CC] leading-relaxed">
              <div className="font-bold mb-1">技術情報</div>
              {uploadTechnicalInfo.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
            <div className="text-[#0000CC] shrink-0" style={{ width: 100 }}>
              <div className="font-bold mb-1">技術資料</div>
              {uploadDocLinks.map((link) => (
                <div key={link}>
                  <button
                    type="button"
                    className="text-[#0000CC] underline bg-transparent border-0 p-0 cursor-pointer"
                    style={{ fontSize: 10 }}
                    onClick={() => appendLog(`（デモ）技術資料「${link}」は未実装です。`)}
                  >
                    {link}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* フッター */}
          <div
            className="flex items-center justify-between text-white print:hidden"
            style={{ background: "#800000", padding: "2px 8px", fontSize: 10 }}
          >
            <span>フォーム ビュー</span>
            <span>MICROSOFT ACCESS の機能を利用しています</span>
          </div>

          {/* 終了ボタン */}
          <div
            className="flex justify-end border-t border-[#808080] print:hidden"
            style={{ padding: "8px 12px" }}
          >
            <AccessExitButton href={routes.menuUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}
