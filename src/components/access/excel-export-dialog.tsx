"use client";

/**
 * EXCEL出力ダイアログ（Accessのファイル出力画面を再現）
 */
import { useState } from "react";

export function ExcelExportDialog({
  title,
  defaultPath,
  onClose,
}: {
  title: string;
  defaultPath: string;
  onClose: () => void;
}) {
  const [path, setPath] = useState(defaultPath);
  const [message, setMessage] = useState("");

  const handleExport = () => {
    setMessage("（デモ）EXCEL形式での出力は今後実装予定です。");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="border-2 border-[#404040] bg-[#D4D0C8] shadow-lg" style={{ width: 480 }}>
        <div className="bg-[#D4D0C8] border-b border-[#808080] px-2 py-0.5 text-xs">{title}</div>

        <div className="p-4 space-y-3 text-xs">
          <p className="leading-relaxed">
            出力ボタンをクリックすればＥＸＣＥＬ形式でファイルに出力します。出力先のパス、ファイル名は出力先欄に表示されています。終わるときはキャンセルボタンをクリックして下さい。
          </p>
          <div className="flex items-center gap-2">
            <span className="bg-[#000080] text-white px-2 py-0.5 shrink-0">出力先</span>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="flex-1 bg-white border border-[#808080] rounded-none outline-none text-xs p-1"
              style={{ boxShadow: "inset 1px 1px 2px #808080" }}
            />
          </div>
          {message && <p className="text-[#CC0000]">{message}</p>}
        </div>

        <div className="flex justify-center gap-4 pb-4">
          <button
            type="button"
            onClick={handleExport}
            className="bg-[#C0C0C0] border border-[#808080] px-6 py-1 text-sm rounded-none"
            style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080" }}
          >
            出力
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#C0C0C0] border border-[#808080] px-6 py-1 text-sm text-[#FF0000] rounded-none"
            style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080" }}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
