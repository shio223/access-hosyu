/**
 * データアップロード画面用の型定義
 *
 * 現時点ではUI表示のみ。Supabase接続後に upload-service.ts で実装する。
 */

/** アップロード処理の状態 */
export type UploadJobStatus =
  | "idle"
  | "counting"
  | "uploading"
  | "completed"
  | "failed";

/** 画面に表示するダッシュボード情報 */
export interface UploadDashboardData {
  /** ローカルAccessデータのパス */
  localDataPath: string;
  /** ローカルデータ件数（未取得時は null） */
  localRecordCount: number | null;
  /** クラウド最終アップロード日時 */
  cloudLastUploadAt: string;
  /** クラウドデータ件数 */
  cloudRecordCount: number;
  /** 接続先（将来はSupabase等に差し替え） */
  connectionTarget: string;
}

/** 一括取込の進捗（将来実装用） */
export interface UploadProgress {
  status: UploadJobStatus;
  processed: number;
  total: number;
  successCount: number;
  failureCount: number;
}

/** 取込結果（将来実装用） */
export interface UploadResult {
  successCount: number;
  failureCount: number;
  errors: string[];
}

/**
 * アップロード処理のサービスインターフェース
 * Supabase移行時にこのインターフェースを実装する。
 */
export interface UploadService {
  getDashboard(): Promise<UploadDashboardData>;
  countLocalRecords(path: string): Promise<number>;
  executeUpload(
    path: string,
    callbacks: {
      onLog: (message: string) => void;
      onProgress: (progress: UploadProgress) => void;
    }
  ): Promise<UploadResult>;
}
