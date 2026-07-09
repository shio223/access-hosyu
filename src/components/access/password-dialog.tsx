"use client";

/**
 * パスワードチェックダイアログ（更新処理メニューアクセス時）
 */
import { useState } from "react";

export function PasswordDialog({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // デモ用: 空でも通す（本番では認証を実装）
    if (password.length === 0) {
      setError("パスワードを入力してください");
      return;
    }
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="border-2 border-[#404040] bg-[#D4D0C8] shadow-lg p-4"
        style={{ width: 280 }}
      >
        <div className="text-xs font-bold mb-3 text-center">パスワードチェック</div>
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#000080] text-white text-xs px-2 py-1 shrink-0">パスワード</span>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            className="flex-1 bg-white border border-[#808080] rounded-none outline-none text-xs p-1"
            style={{ boxShadow: "inset 1px 1px 2px #808080", height: 22 }}
            autoFocus
          />
        </div>
        {error && <p className="text-[#CC0000] text-[10px] mb-2">{error}</p>}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-[#FF0000] text-sm bg-transparent border-0 cursor-pointer"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
