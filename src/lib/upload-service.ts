/**
 * データアップロードサービス（将来実装用スタブ）
 *
 * Supabase接続後にこのファイルで UploadService を実装する。
 * 現時点では未使用。UIはダミーデータで表示のみ。
 */
import type {
  UploadDashboardData,
  UploadProgress,
  UploadResult,
  UploadService,
} from "./upload-types";

export const uploadServiceStub: UploadService = {
  async getDashboard(): Promise<UploadDashboardData> {
    throw new Error("Not implemented: Supabase接続後に実装");
  },
  async countLocalRecords(_path: string): Promise<number> {
    throw new Error("Not implemented: Supabase接続後に実装");
  },
  async executeUpload(
    _path: string,
    _callbacks: {
      onLog: (message: string) => void;
      onProgress: (progress: UploadProgress) => void;
    }
  ): Promise<UploadResult> {
    throw new Error("Not implemented: Supabase接続後に実装");
  },
};
