/**
 * Access風カラーパレット定義
 *
 * 既存のMicrosoft Accessアプリの配色を再現するための定数群。
 * Tailwindのクラス内では直接HEX値を指定している箇所もあるが、
 * 今後のテーマ統一や保守のためにここに集約している。
 */
export const accessColors = {
  windowBg: "#D4D0C8",   // フォーム背景（Windowsクラシックグレー）
  formBg: "#E8E8E8",      // 入力エリア背景
  navy: "#000080",       // 項目ラベル・タイトル帯
  blue: "#0000FF",       // 画面タイトルバー
  teal: "#008080",       // メニューグリッド背景・フッター
  darkGreen: "#006400",  // テーブルヘッダー
  yellow: "#FFFF00",     // フィールドラベル
  lightGreen: "#90EE90", // 重要フィールドラベル（得意先・設備番号）
  labelBlue: "#000080",  // 検索フォーム左列ラベル
  buttonGray: "#C0C0C0", // 標準ボタン背景
  white: "#FFFFFF",
  black: "#000000",
  gridLine: "#808080",   // 罫線・ボーダー
} as const;
