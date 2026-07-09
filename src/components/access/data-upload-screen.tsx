"use client";

/**
 * 保守実績データ アップロード画面
 *
 * CSVファイルをローカルSQLite DBへ取り込む。
 * 将来Supabase移行時は upload-service を差し替える。
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { uploadDashboardDummy, uploadDocLinks, uploadTechnicalInfo } from "@/lib/upload-dummy-data";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPath, setLocalPath] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localCount, setLocalCount] = useState<string>("- 件");
  const [cloudLastUploadAt, setCloudLastUploadAt] = useState(
    uploadDashboardDummy.cloudLastUploadAt
  );
  const [cloudRecordCount, setCloudRecordCount] = useState(
    uploadDashboardDummy.cloudRecordCount
  );
  const [commandLog, setCommandLog] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const appendLog = useCallback((message: string) => {
    const line = `[${new Date().toLocaleString("ja-JP")}] ${message}`;
    setCommandLog((prev) => (prev ? `${prev}\n${line}` : line));
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) return;
      const data = await res.json();
      setCloudRecordCount(data.cloudRecordCount ?? 0);
      if (data.cloudLastUploadAt) {
        setCloudLastUploadAt(data.cloudLastUploadAt);
      }
    } catch {
      // 初回起動時などDB未作成の場合は無視
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setLocalPath(file.name);
    setLocalCount("- 件");
    appendLog(`CSVファイルを選択: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      appendLog("CSVファイルを「参照」ボタンで選択してください。");
      return;
    }

    setIsUploading(true);
    appendLog("アップロード実行を開始します...");
    appendLog(`ファイル: ${selectedFile.name}`);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        appendLog(`エラー: ${data.error ?? "インポートに失敗しました"}`);
        return;
      }

      const { result, stats } = data;
      setLocalCount(`${result.inserted.toLocaleString()} 件`);
      setCloudRecordCount(stats.maintenanceRecordCount);
      if (stats.lastImportAt) {
        setCloudLastUploadAt(new Date(stats.lastImportAt).toLocaleString("ja-JP"));
      }

      appendLog(`取込完了: ${result.table}`);
      appendLog(`  成功: ${result.inserted.toLocaleString()} 件`);
      if (result.skipped > 0) {
        appendLog(`  スキップ: ${result.skipped.toLocaleString()} 件`);
      }
      appendLog(`DB合計（保守実績）: ${stats.maintenanceRecordCount.toLocaleString()} 件`);
      appendLog(`DB合計（設備）: ${stats.equipmentCount.toLocaleString()} 件`);

      if (result.errors?.length > 0) {
        appendLog("--- エラー（先頭） ---");
        result.errors.slice(0, 10).forEach((err: string) => appendLog(`  ${err}`));
      }
    } catch (error) {
      appendLog(`エラー: ${error instanceof Error ? error.message : "通信に失敗しました"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#C0C0C0] print:bg-white">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="overflow-x-auto p-2 print:p-0">
        <div
          className="mx-auto border-2 border-[#404040] bg-[#D4D0C8] shadow-lg print:border-0 print:shadow-none"
          style={{ width: FORM_WIDTH, minWidth: FORM_WIDTH, maxWidth: FORM_WIDTH }}
        >
          <div
            className="bg-[#D4D0C8] border-b border-[#808080] flex justify-between print:hidden"
            style={{ padding: "2px 8px", fontSize: 11 }}
          >
            <span>保守実績データ アップロード - 三光ERPAzure</span>
          </div>

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
            <span>接続先: ローカルDB（data/hosyu.db）</span>
          </div>

          <div style={{ padding: "12px 8px" }}>
            <InfoRow
              label="ローカルデータの場所"
              note="AccessからエクスポートしたCSVファイルを「参照」で選択してください。"
            >
              <div className="flex" style={{ gap: 4 }}>
                <ToolbarButton onClick={handleBrowse}>参照</ToolbarButton>
                <input
                  type="text"
                  value={localPath}
                  readOnly
                  placeholder="CSVファイルを選択..."
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
              note="選択したCSVの取込件数です。「アップロード実行」後に表示します。"
            >
              <DisplayField value={localCount} width={120} />
            </InfoRow>

            <InfoRow label="クラウド　最終アップロード日時">
              <DisplayField value={cloudLastUploadAt} width={200} />
            </InfoRow>

            <InfoRow
              label="クラウド　データ件数"
              note="WebアプリDBに取り込み済みの保守実績件数です。"
            >
              <DisplayField
                value={`${cloudRecordCount.toLocaleString()} 件`}
                width={120}
              />
            </InfoRow>

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

            <div style={{ marginTop: 16 }}>
              <div className="text-[#CC0000] font-bold" style={{ fontSize: 12, marginBottom: 6 }}>
                大量データの場合は2～3分かかることがあります。
              </div>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-[#C0C0C0] border-2 border-[#808080] rounded-none font-bold text-[#0000CC] print:hidden disabled:text-[#808080]"
                style={{
                  fontSize: 18,
                  padding: "8px 24px",
                  minWidth: 200,
                  boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
                }}
              >
                {isUploading ? "取込中..." : "アップロード　実行"}
              </button>
              <div className="text-[#CC0000] font-bold" style={{ fontSize: 11, marginTop: 8 }}>
                元のAccessデータは変更されません。CSVのコピーを取り込むだけです。
              </div>
            </div>
          </div>

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

          <div
            className="flex items-center justify-between text-white print:hidden"
            style={{ background: "#800000", padding: "2px 8px", fontSize: 10 }}
          >
            <span>フォーム ビュー</span>
            <span>CSV → SQLite 取込モード</span>
          </div>

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
