"use client";

/**
 * 次回点検日自動更新画面
 */
import { useState } from "react";
import { AccessExitButton } from "./access-exit-button";
import { routes } from "@/lib/routes";

const dateStyle: React.CSSProperties = {
  fontSize: 11,
  height: 22,
  width: 100,
  padding: "1px 4px",
  boxShadow: "inset 1px 1px 2px #808080",
};

export function NextInspectionUpdate() {
  const [currentFrom, setCurrentFrom] = useState("2027/07/01");
  const [currentTo, setCurrentTo] = useState("2027/07/31");
  const [lastBefore, setLastBefore] = useState("2024/07/01");
  const [newDate, setNewDate] = useState("2028/07/01");
  const [message, setMessage] = useState("");

  const handleStart = () => {
    setMessage("（デモ）更新処理を開始しました。実際のDB更新は今後実装予定です。");
  };

  return (
    <div className="min-h-screen bg-[#A0A0A0] flex items-start justify-center p-4">
      <div className="border-2 border-[#404040] bg-[#D4D0C8] shadow-lg" style={{ width: 560 }}>
        <div className="bg-[#D4D0C8] border-b border-[#808080] px-2 py-0.5 text-xs">F-次回点検日自動更新</div>
        <div className="bg-[#0000FF] text-white text-center py-1.5 font-bold text-base">次回点検日自動更新</div>

        <div className="p-4 space-y-3 text-xs">
          <div className="flex flex-wrap items-center gap-1">
            <span>現在の次回点検日が</span>
            <input type="text" value={currentFrom} onChange={(e) => setCurrentFrom(e.target.value)} className="bg-white border border-[#808080] rounded-none outline-none" style={dateStyle} />
            <span>～</span>
            <input type="text" value={currentTo} onChange={(e) => setCurrentTo(e.target.value)} className="bg-white border border-[#808080] rounded-none outline-none" style={dateStyle} />
            <span>の設備のうち</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span>最終点検日が</span>
            <input type="text" value={lastBefore} onChange={(e) => setLastBefore(e.target.value)} className="bg-white border border-[#808080] rounded-none outline-none" style={dateStyle} />
            <span>以前のものの</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span>次回点検日を</span>
            <input type="text" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="bg-white border border-[#808080] rounded-none outline-none" style={dateStyle} />
            <span>に変更する。</span>
            <button
              type="button"
              onClick={handleStart}
              className="ml-2 bg-[#C0C0C0] border border-[#808080] px-4 py-0.5 font-bold rounded-none"
              style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080" }}
            >
              開始
            </button>
          </div>

          <div className="bg-white border border-[#808080] p-2 text-[11px] mt-4" style={{ minHeight: 48 }}>
            {message || "各日付を設定して開始ボタンをクリックすれば更新を開始します。"}
          </div>
        </div>

        <div className="flex justify-end bg-[#008080] px-3 py-1.5 border-t border-[#004040]">
          <AccessExitButton href={routes.menuUpdate} />
        </div>
      </div>
    </div>
  );
}
