import { NextRequest, NextResponse } from "next/server";
import { importCsvContent, clearAllData } from "@/lib/import/csv-importer";
import { getImportStats } from "@/lib/db/queries";
import type { ImportTable } from "@/lib/import/column-maps";

export const runtime = "nodejs";

/** CSVファイルをアップロードしてインポート */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const table = formData.get("table") as ImportTable | null;
    const clear = formData.get("clear") === "true";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CSVファイルが指定されていません" }, { status: 400 });
    }

    if (clear) {
      clearAllData();
    }

    const content = await file.text();
    const result = importCsvContent(content, {
      filename: file.name,
      table: table ?? undefined,
    });
    const stats = getImportStats();

    return NextResponse.json({
      result,
      stats,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "インポートに失敗しました" },
      { status: 500 }
    );
  }
}
