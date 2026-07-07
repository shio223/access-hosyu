/**
 * ルートレイアウト
 *
 * 全画面共通のHTML構造・日本語フォント・メタデータを定義。
 * Access風の見た目のため Meiryo / MS PGothic を優先するフォントスタックを使用。
 */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "保守管理システム",
  description: "（有）シンコーエヤーサービス 保守管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col font-[Meiryo,'MS_PGothic','Hiragino_Kaku_Gothic_ProN',sans-serif] antialiased">
        {children}
      </body>
    </html>
  );
}
