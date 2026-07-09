import { NextRequest, NextResponse } from "next/server";
import {
  getEquipmentDetail,
  getMaintenanceHistory,
  listEquipmentKeys,
  lookupCustomers,
  lookupEquipment,
  searchEquipmentList,
} from "@/lib/db/queries";

export const runtime = "nodejs";

/** 設備情報の取得・検索・ルックアップ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const lookup = searchParams.get("lookup");

    if (lookup === "customers") {
      const q = searchParams.get("q") ?? undefined;
      return NextResponse.json({ items: lookupCustomers(q) });
    }

    if (lookup === "equipment") {
      const customerCode = searchParams.get("customerCode") ?? "";
      const q = searchParams.get("q") ?? undefined;
      return NextResponse.json({ items: lookupEquipment(customerCode, q) });
    }

    if (searchParams.get("list") === "true") {
      return NextResponse.json({ items: listEquipmentKeys() });
    }

    if (searchParams.get("search") === "true") {
      const items = searchEquipmentList({
        customerCode: searchParams.get("customerCode") ?? undefined,
        equipmentNo: searchParams.get("equipmentNo") ?? undefined,
        customerName: searchParams.get("customerName") ?? undefined,
        equipmentName: searchParams.get("equipmentName") ?? undefined,
        modelType: searchParams.get("modelType") ?? undefined,
        managementNo: searchParams.get("managementNo") ?? undefined,
        q: searchParams.get("q") ?? undefined,
      });

      return NextResponse.json({ items, total: items.length });
    }

    const customerCode = searchParams.get("customerCode");
    const equipmentNo = searchParams.get("equipmentNo");

    if (!customerCode || !equipmentNo) {
      return NextResponse.json(
        { error: "customerCode と equipmentNo を指定してください" },
        { status: 400 }
      );
    }

    const detail = getEquipmentDetail(customerCode, equipmentNo);

    if (!detail) {
      return NextResponse.json({ error: "該当する設備が見つかりません" }, { status: 404 });
    }

    const history = getMaintenanceHistory(detail.customerCode, detail.equipmentNo);

    return NextResponse.json({ detail, history });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "設備データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
