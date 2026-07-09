import { NextResponse } from "next/server";
import { getImportStats } from "@/lib/db/queries";

export const runtime = "nodejs";

/** インポート統計・DB件数を返す */
export async function GET() {
  try {
    const stats = getImportStats();
    return NextResponse.json({
      ...stats,
      cloudLastUploadAt: stats.lastImportAt
        ? new Date(stats.lastImportAt).toLocaleString("ja-JP")
        : null,
      cloudRecordCount: stats.maintenanceRecordCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "統計の取得に失敗しました" },
      { status: 500 }
    );
  }
}
