import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import type { EquipmentDetail, MaintenanceRecord } from "@/lib/db/types";
import {
  normalizeSearchCode,
  normalizeSearchText,
} from "@/lib/search-normalize";

export const runtime = "nodejs";

function formatWorkDate(value: string | null | undefined): string {
  if (!value) return "";
  return String(value).slice(0, 10).replace(/-/g, "/");
}

const EMPTY_DETAIL = (partial: Partial<EquipmentDetail>): EquipmentDetail => ({
  customerCode: "",
  customerName: "",
  equipmentNo: "",
  equipmentName: "",
  statusCode: "",
  statusName: "",
  modelCode: "",
  modelName: "",
  makerCode: "",
  makerName: "",
  modelType: "",
  managementNo: "",
  remarks: "",
  postalCode: "",
  phone: "",
  address1: "",
  address2: "",
  deliveryDate: "",
  inspectionCycle: "",
  nextInspectionDate: "",
  inspectionNotice: "",
  dealer1: "",
  dealer2: "",
  dealer3: "",
  oilUsed: "",
  revisionDate: "",
  ...partial,
});

/**
 * 設備照会API（設備マスタ未移行のため、実績の得意先コード＋設備番号で照会）
 * 得意先名は customers を LEFT JOIN 相当で付与。
 * 履歴は maintenance_records の9列を紐付けて返す。
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await requireAuth();
    if (!user || !supabase) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const lookup = searchParams.get("lookup");

    if (lookup === "customers") {
      const q = normalizeSearchText(searchParams.get("q"));
      let query = supabase
        .from("customers")
        .select("customer_code, customer_name")
        .order("customer_code")
        .limit(100);
      if (q) {
        query = query.or(
          `customer_code.ilike.%${q}%,customer_name.ilike.%${q}%`
        );
      }
      const { data, error } = await query;
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({
        items: (data ?? []).map((r) => ({
          customerCode: r.customer_code,
          customerName: r.customer_name ?? "",
        })),
      });
    }

    if (lookup === "equipment") {
      const customerCode = normalizeSearchCode(searchParams.get("customerCode"));
      const q = normalizeSearchCode(searchParams.get("q"));
      if (!customerCode) {
        return NextResponse.json({ items: [] });
      }
      let query = supabase
        .from("maintenance_records")
        .select("equipment_no")
        .eq("customer_code", customerCode)
        .order("equipment_no")
        .limit(500);
      if (q) query = query.ilike("equipment_no", `%${q}%`);
      const { data, error } = await query;
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      const seen = new Set<string>();
      const items: { equipmentNo: string; equipmentName: string }[] = [];
      for (const r of data ?? []) {
        if (seen.has(r.equipment_no)) continue;
        seen.add(r.equipment_no);
        items.push({ equipmentNo: r.equipment_no, equipmentName: "" });
      }
      return NextResponse.json({ items });
    }

    if (searchParams.get("search") === "true") {
      const customerCode = normalizeSearchCode(searchParams.get("customerCode"));
      const equipmentNo = normalizeSearchCode(searchParams.get("equipmentNo"));
      const q = normalizeSearchText(searchParams.get("q"));

      let query = supabase
        .from("maintenance_records")
        .select("customer_code, equipment_no")
        .order("customer_code")
        .order("equipment_no")
        .limit(5000);

      if (customerCode) query = query.eq("customer_code", customerCode);
      if (equipmentNo) query = query.eq("equipment_no", equipmentNo);
      if (q) {
        query = query.or(
          `customer_code.ilike.%${q}%,equipment_no.ilike.%${q}%`
        );
      }

      const { data, error } = await query;
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const keySet = new Map<
        string,
        { customerCode: string; equipmentNo: string }
      >();
      for (const r of data ?? []) {
        const key = `${r.customer_code}\t${r.equipment_no}`;
        if (!keySet.has(key)) {
          keySet.set(key, {
            customerCode: r.customer_code,
            equipmentNo: r.equipment_no,
          });
        }
      }

      const pairs = [...keySet.values()].slice(0, 500);
      const codes = [...new Set(pairs.map((p) => p.customerCode))];
      const custDetail = new Map<
        string,
        {
          customer_name: string | null;
          postal_code: string | null;
          phone: string | null;
          address1: string | null;
          address2: string | null;
        }
      >();
      if (codes.length > 0) {
        const { data: custs } = await supabase
          .from("customers")
          .select(
            "customer_code, customer_name, postal_code, phone, address1, address2"
          )
          .in("customer_code", codes);
        for (const c of custs ?? []) {
          custDetail.set(c.customer_code, c);
        }
      }

      const items: EquipmentDetail[] = pairs.map((p) => {
        const c = custDetail.get(p.customerCode);
        return EMPTY_DETAIL({
          customerCode: p.customerCode,
          customerName: c?.customer_name ?? "",
          equipmentNo: p.equipmentNo,
          postalCode: c?.postal_code ?? "",
          phone: c?.phone ?? "",
          address1: c?.address1 ?? "",
          address2: c?.address2 ?? "",
        });
      });

      return NextResponse.json({ items, total: items.length });
    }

    const customerCode = normalizeSearchCode(searchParams.get("customerCode"));
    const equipmentNo = normalizeSearchCode(searchParams.get("equipmentNo"));

    if (!customerCode || !equipmentNo) {
      return NextResponse.json(
        { error: "customerCode と equipmentNo を指定してください" },
        { status: 400 }
      );
    }

    const { data: cust } = await supabase
      .from("customers")
      .select(
        "customer_code, customer_name, postal_code, phone, address1, address2"
      )
      .eq("customer_code", customerCode)
      .maybeSingle();

    // 得意先コード＋設備番号で実績9列を紐付け
    const { data: histRows, error: histErr } = await supabase
      .from("maintenance_records")
      .select(
        "customer_code, equipment_no, work_date, work_code, work_content, operating_hours, staff_code, customer_contact, inputter_code"
      )
      .eq("customer_code", customerCode)
      .eq("equipment_no", equipmentNo)
      .order("work_date", { ascending: false, nullsFirst: false });

    if (histErr) {
      return NextResponse.json({ error: histErr.message }, { status: 500 });
    }

    if ((!histRows || histRows.length === 0) && !cust) {
      return NextResponse.json(
        { error: "該当する設備が見つかりません" },
        { status: 404 }
      );
    }

    const detail = EMPTY_DETAIL({
      customerCode,
      customerName: cust?.customer_name ?? "",
      equipmentNo,
      postalCode: cust?.postal_code ?? "",
      phone: cust?.phone ?? "",
      address1: cust?.address1 ?? "",
      address2: cust?.address2 ?? "",
    });

    const history: MaintenanceRecord[] = (histRows ?? []).map((r) => ({
      workDate: formatWorkDate(r.work_date),
      workCode: r.work_code ?? "",
      workType: "",
      workContent: r.work_content ?? "",
      operatingHours:
        r.operating_hours == null ? "" : String(r.operating_hours),
      customerContact: r.customer_contact ?? "",
      staffCode: r.staff_code ?? "",
      staffName: "",
      inputterCode: r.inputter_code ?? "",
      inputterName: "",
    }));

    return NextResponse.json({ detail, history });
  } catch (error) {
    console.error("[equipment]", error);
    return NextResponse.json(
      { error: "設備照会に失敗しました" },
      { status: 500 }
    );
  }
}
