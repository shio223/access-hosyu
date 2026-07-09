/**
 * データアップロード画面の表示用ダミーデータ
 *
 * 画像のAccess画面「保守実績データ アップロード」を再現するための値。
 * 実データへの接続・変更は行わない。
 */
import type { UploadDashboardData } from "./upload-types";

export const uploadDashboardDummy: UploadDashboardData = {
  localDataPath: "\\\\Server08\\d\\共有\\保守管理\\sascmd.mdb",
  localRecordCount: null,
  cloudLastUploadAt: "2026/07/09 9:02:47",
  cloudRecordCount: 70586,
  connectionTarget: "tcp:shinkoairsankocsp.database.windows.net,1433",
};

/** 技術情報欄の表示テキスト（画像より） */
export const uploadTechnicalInfo = [
  "DB: tcp:shinkoairsankocsp.database.windows.net,1433",
  "DB名: シンコーエアー検査履歴閲覧R543DB",
  "場所: SO JP-WESTDC",
  "環境: SAAP R543 使用",
  "WEB: SWAP543",
  "URL: http://shinkoair-rireki.azurewebsites.net/",
  "AppService使用",
] as const;

/** 技術資料リンク（画像より） */
export const uploadDocLinks = [
  "SAAP上",
  "メニュー",
  "本フォーム",
  "コピー表",
  "SSMS設定",
] as const;
