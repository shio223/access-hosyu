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
import { logSupabaseConnectionError } from "@/lib/supabase/connection-error";

export const runtime = "nodejs";

const EQUIPMENT_SELECT =
  "customer_code, equipment_number, equipment_name, machine_code, maker_code, model, management_number, installation_date, inspection_cycle, next_inspection_date, inspection_notice, dealer1_code, dealer2_code, dealer3_code, oil_type, remarks, operation_status_code, updated_at_source";

function formatWorkDate(value: string | null | undefined): string {
  if (!value) return "";
  return String(value).slice(0, 10).replace(/-/g, "/");
}

function isMissingEquipmentMasterTable(message: string | undefined): boolean {
  if (!message) return false;
  return /equipment_master/i.test(message) && /schema cache|does not exist|not find/i.test(message);
}

const EMPTY_MASTER_ROW = (
  customerCode: string,
  equipmentNo: string
): EquipmentMasterDbRow => ({
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
});

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

type SearchFilters = {
  customerCode: string;
  equipmentNo: string;
  q: string;
};

/** equipment_master 検索。テーブル未作成時は null を返す */
async function searchEquipmentMaster(
  supabase: NonNullable<Awaited<ReturnType<typeof requireAuth>>["supabase"]>,
  filters: SearchFilters
): Promise<{ rows: EquipmentMasterDbRow[]; missingTable: boolean; error?: string }> {
  let query = supabase
    .from("equipment_master")
    .select(EQUIPMENT_SELECT)
    .order("customer_code")
    .order("equipment_number")
    .limit(500);

  if (filters.customerCode) query = query.eq("customer_code", filters.customerCode);
  if (filters.equipmentNo) {
    query = query.ilike("equipment_number", `%${filters.equipmentNo}%`);
  }
  if (filters.q) {
    query = query.or(
      `customer_code.ilike.%${filters.q}%,equipment_number.ilike.%${filters.q}%,equipment_name.ilike.%${filters.q}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    logSupabaseConnectionError("equipment.search.master", error, {
      httpStatus: (error as { status?: number }).status ?? null,
      code: error.code ?? null,
    });
    if (isMissingEquipmentMasterTable(error.message)) {
      return { rows: [], missingTable: true, error: error.message };
    }
    return { rows: [], missingTable: false, error: error.message };
  }
  return { rows: (data ?? []) as EquipmentMasterDbRow[], missingTable: false };
}

/** 保守実績から得意先×設備の候補を作成（マスタ未投入時のフォールバック） */
async function searchFromMaintenanceRecords(
  supabase: NonNullable<Awaited<ReturnType<typeof requireAuth>>["supabase"]>,
  filters: SearchFilters
): Promise<{ items: EquipmentDetail[]; error?: string }> {
  let query = supabase
    .from("maintenance_records")
    .select("customer_code, equipment_no")
    .order("customer_code")
    .order("equipment_no")
    .limit(5000);

  if (filters.customerCode) query = query.eq("customer_code", filters.customerCode);
  if (filters.equipmentNo) {
    query = query.ilike("equipment_no", `%${filters.equipmentNo}%`);
  }
  if (filters.q) {
    query = query.or(
      `customer_code.ilike.%${filters.q}%,equipment_no.ilike.%${filters.q}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    logSupabaseConnectionError("equipment.search.maintenance", error, {
      httpStatus: (error as { status?: number }).status ?? null,
      code: error.code ?? null,
    });
    return { items: [], error: error.message };
  }

  const keySet = new Map<string, { customerCode: string; equipmentNo: string }>();
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
  const custMap = await loadCustomerMap(
    supabase,
    pairs.map((p) => p.customerCode)
  );

  // マスタがあれば上書き（テーブルがあるがヒットが実績のみの場合）
  const masterByKey = new Map<string, EquipmentMasterDbRow>();
  if (pairs.length > 0) {
    const codes = [...new Set(pairs.map((p) => p.customerCode))];
    const { data: masters, error: mErr } = await supabase
      .from("equipment_master")
      .select(EQUIPMENT_SELECT)
      .in("customer_code", codes)
      .limit(2000);
    if (!mErr && masters) {
      for (const row of masters as EquipmentMasterDbRow[]) {
        masterByKey.set(`${row.customer_code}\t${row.equipment_number}`, row);
      }
    }
  }

  const items = pairs.map((p) => {
    const master =
      masterByKey.get(`${p.customerCode}\t${p.equipmentNo}`) ??
      EMPTY_MASTER_ROW(p.customerCode, p.equipmentNo);
    return mapEquipmentMasterToDetail(master, custMap.get(p.customerCode));
  });

  return { items };
}

/**
 * 設備照会API
 * - 設備情報: equipment_master（未作成・未投入時は maintenance_records にフォールバック）
 * - 得意先名等: customers
 * - 保守履歴: maintenance_records（customer_code + equipment_no で紐付け）
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
      if (!customerCode && !q) {
        return NextResponse.json({ items: [] });
      }

      let query = supabase
        .from("equipment_master")
        .select("customer_code, equipment_number, equipment_name")
        .order("customer_code")
        .order("equipment_number")
        .limit(100);
      if (customerCode) query = query.eq("customer_code", customerCode);
      if (q) query = query.ilike("equipment_number", `%${q}%`);

      const { data, error } = await query;
      if (!error) {
        return NextResponse.json({
          items: (data ?? []).map((r) => ({
            customerCode: r.customer_code,
            equipmentNo: r.equipment_number,
            equipmentName: r.equipment_name ?? "",
          })),
        });
      }

      if (!isMissingEquipmentMasterTable(error.message)) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // テーブル未作成 → 実績から設備番号候補
      let fallback = supabase
        .from("maintenance_records")
        .select("customer_code, equipment_no")
        .order("equipment_no")
        .limit(500);
      if (customerCode) fallback = fallback.eq("customer_code", customerCode);
      if (q) fallback = fallback.ilike("equipment_no", `%${q}%`);
      const { data: rows, error: fbErr } = await fallback;
      if (fbErr) {
        return NextResponse.json({ error: fbErr.message }, { status: 500 });
      }
      const seen = new Set<string>();
      const items: {
        customerCode: string;
        equipmentNo: string;
        equipmentName: string;
      }[] = [];
      for (const r of rows ?? []) {
        const key = `${r.customer_code}\t${r.equipment_no}`;
        if (seen.has(key)) continue;
        seen.add(key);
        items.push({
          customerCode: r.customer_code,
          equipmentNo: r.equipment_no,
          equipmentName: "",
        });
      }
      return NextResponse.json({ items });
    }

    if (searchParams.get("search") === "true") {
      const filters: SearchFilters = {
        customerCode: normalizeSearchCode(searchParams.get("customerCode")),
        equipmentNo: normalizeSearchCode(searchParams.get("equipmentNo")),
        q: normalizeSearchText(searchParams.get("q")),
      };

      const master = await searchEquipmentMaster(supabase, filters);
      if (master.error && !master.missingTable) {
        return NextResponse.json({ error: master.error }, { status: 500 });
      }

      if (master.rows.length > 0) {
        const custMap = await loadCustomerMap(
          supabase,
          master.rows.map((r) => r.customer_code)
        );
        const items: EquipmentDetail[] = master.rows.map((r) =>
          mapEquipmentMasterToDetail(r, custMap.get(r.customer_code))
        );
        return NextResponse.json({
          items,
          total: items.length,
          source: "equipment_master",
        });
      }

      // マスタ0件 or テーブル未作成 → 実績フォールバック
      const fallback = await searchFromMaintenanceRecords(supabase, filters);
      if (fallback.error) {
        return NextResponse.json({ error: fallback.error }, { status: 500 });
      }
      return NextResponse.json({
        items: fallback.items,
        total: fallback.items.length,
        source: master.missingTable
          ? "maintenance_records_fallback_no_table"
          : "maintenance_records_fallback",
      });
    }

    const customerCode = normalizeSearchCode(searchParams.get("customerCode"));
    const equipmentNo = normalizeSearchCode(searchParams.get("equipmentNo"));

    if (!customerCode || !equipmentNo) {
      return NextResponse.json(
        { error: "customerCode と equipmentNo を指定してください" },
        { status: 400 }
      );
    }

    let eqRow: EquipmentMasterDbRow | null = null;
    const { data: masterRow, error: eqErr } = await supabase
      .from("equipment_master")
      .select(EQUIPMENT_SELECT)
      .eq("customer_code", customerCode)
      .eq("equipment_number", equipmentNo)
      .maybeSingle();

    if (eqErr && !isMissingEquipmentMasterTable(eqErr.message)) {
      return NextResponse.json({ error: eqErr.message }, { status: 500 });
    }
    if (!eqErr && masterRow) {
      eqRow = masterRow as EquipmentMasterDbRow;
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

    const detail = mapEquipmentMasterToDetail(
      eqRow ?? EMPTY_MASTER_ROW(customerCode, equipmentNo),
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

    return NextResponse.json({
      detail,
      history,
      linked: {
        equipmentMaster: Boolean(eqRow),
        customer: Boolean(cust),
        maintenanceCount: history.length,
      },
    });
  } catch (error) {
    logSupabaseConnectionError("equipment", error);
    console.error("[equipment]", error);
    return NextResponse.json(
      { error: "設備照会に失敗しました" },
      { status: 500 }
    );
  }
}
