import { NextRequest, NextResponse } from "next/server";
import { getMasterRows, saveMasterRows } from "@/lib/db/master-queries";
import { isMasterType } from "@/lib/master-registry";
import type { MasterRow } from "@/lib/master-data";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ type: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { type } = await context.params;
    if (!isMasterType(type)) {
      return NextResponse.json({ error: "不明なマスタ種別です" }, { status: 400 });
    }

    const rows = getMasterRows(type);
    return NextResponse.json({ rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "マスタの取得に失敗しました" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { type } = await context.params;
    if (!isMasterType(type)) {
      return NextResponse.json({ error: "不明なマスタ種別です" }, { status: 400 });
    }

    const body = (await request.json()) as { rows?: MasterRow[] };
    if (!Array.isArray(body.rows)) {
      return NextResponse.json({ error: "rows が必要です" }, { status: 400 });
    }

    const rows = saveMasterRows(type, body.rows);
    return NextResponse.json({ rows, message: "登録しました。" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "マスタの登録に失敗しました" }, { status: 500 });
  }
}
