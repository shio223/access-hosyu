import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import type { EquipmentDetail, MaintenanceRecord } from "@/lib/db/types";
import {
  mapEquipmentMasterToDetail,
  type CustomerLite,
  type EquipmentMasterDbRow,
} from "@/lib/equipment-master-map";
import {
  normalizeSearchCode,
  normalizeSearchText,
} from "@/lib/search-normalize";

export const runtime = "nodejs";

const EQUIPMENT_SELECT =
  "customer_code, equipment_number, equipment_name, machine_code, maker_code, model, management_number, installation_date, inspection_cycle, next_inspection_date, inspection_notice, dealer1_code, dealer2_code, dealer3_code, oil_type, remarks, operation_status_code, updated_at_source";

function formatWorkDate(value: string | null | undefined): string {
  if (!value) return "";
  return String(value).slice(0, 10).replace(/-/g, "/");
}

async function loadCustomerMap(
  supabase: NonNullable<Awaited<ReturnType<typeof requireAuth>>["supabase"]>,
  codes: string[]
): Promise<Map<string, CustomerLite>> {
  const map = new Map<string, CustomerLite>();
  const unique = [...new Set(codes.filter(Boolean))];
  if (unique.length === 0) return map;

  const { data } = await supabase
    .from("customers")
    .select("customer_code, customer_name, postal_code, phone, address1, address2")
    .in("customer_code", unique);

  for (const c of data ?? []) {
    map.set(c.customer_code, c);
  }
  return map;
}

/**
 * 設備照会API
 * - 設備情報: equipment_master
 * - 得意先名等: customers
 * - 保守履歴: maintenance_records
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

      let query = supabase
        .from("equipment_master")
        .select("customer_code, equipment_number, equipment_name")
        .order("customer_code")
        .order("equipment_number")
        .limit(100);

      if (customerCode) query = query.eq("customer_code", customerCode);
      if (q) query = query.ilike("equipment_number", `%${q}%`);
      if (!customerCode && !q) {
        return NextResponse.json({ items: [] });
      }

      const { data, error } = await query;
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        items: (data ?? []).map((r) => ({
          customerCode: r.customer_code,
          equipmentNo: r.equipment_number,
          equipmentName: r.equipment_name ?? "",
        })),
      });
    }

    if (searchParams.get("search") === "true") {
      const customerCode = normalizeSearchCode(searchParams.get("customerCode"));
      const equipmentNo = normalizeSearchCode(searchParams.get("equipmentNo"));
      const q = normalizeSearchText(searchParams.get("q"));

      let query = supabase
        .from("equipment_master")
        .select(EQUIPMENT_SELECT)
        .order("customer_code")
        .order("equipment_number")
        .limit(500);

      if (customerCode) query = query.eq("customer_code", customerCode);
      if (equipmentNo) {
        query = query.ilike("equipment_number", `%${equipmentNo}%`);
      }
      if (q) {
        query = query.or(
          `customer_code.ilike.%${q}%,equipment_number.ilike.%${q}%,equipment_name.ilike.%${q}%`
        );
      }

      const { data, error } = await query;
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const rows = (data ?? []) as EquipmentMasterDbRow[];
      const custMap = await loadCustomerMap(
        supabase,
        rows.map((r) => r.customer_code)
      );

      const items: EquipmentDetail[] = rows.map((r) =>
        mapEquipmentMasterToDetail(r, custMap.get(r.customer_code))
      );

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

    const { data: eqRow, error: eqErr } = await supabase
      .from("equipment_master")
      .select(EQUIPMENT_SELECT)
      .eq("customer_code", customerCode)
      .eq("equipment_number", equipmentNo)
      .maybeSingle();

    if (eqErr) {
      return NextResponse.json({ error: eqErr.message }, { status: 500 });
    }

    const { data: cust } = await supabase
      .from("customers")
      .select(
        "customer_code, customer_name, postal_code, phone, address1, address2"
      )
      .eq("customer_code", customerCode)
      .maybeSingle();

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

    if (!eqRow && (!histRows || histRows.length === 0) && !cust) {
      return NextResponse.json(
        { error: "該当する設備が見つかりません" },
        { status: 404 }
      );
    }

    const detail = eqRow
      ? mapEquipmentMasterToDetail(eqRow as EquipmentMasterDbRow, cust)
      : mapEquipmentMasterToDetail(
          {
            customer_code: customerCode,
            equipment_number: equipmentNo,
            equipment_name: null,
            machine_code: null,
            maker_code: null,
            model: null,
            management_number: null,
            installation_date: null,
            inspection_cycle: null,
            next_inspection_date: null,
            inspection_notice: null,
            dealer1_code: null,
            dealer2_code: null,
            dealer3_code: null,
            oil_type: null,
            remarks: null,
            operation_status_code: null,
            updated_at_source: null,
          },
          cust
        );

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
