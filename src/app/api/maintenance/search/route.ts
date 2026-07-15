import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeSearchCode,
  normalizeSearchText,
} from "@/lib/search-normalize";

export const runtime = "nodejs";

const PAGE_SIZE = 50;

type SearchRow = {
  id: string;
  customer_code: string;
  equipment_no: string;
  work_date: string | null;
  work_code: string;
  work_content: string | null;
  operating_hours: number | null;
  staff_code: string;
  customer_contact: string | null;
  inputter_code: string | null;
  customer_name: string | null;
};

/**
 * 保守実績検索（サーバー側絞り込み + 50件ページネーション）
 * customers は LEFT JOIN 相当（得意先未登録でも実績を返す）
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const sp = request.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page") ?? "1") || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(sp.get("pageSize") ?? String(PAGE_SIZE)) || PAGE_SIZE)
    );
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const customerCode = normalizeSearchCode(sp.get("customerCode"));
    const customerName = normalizeSearchText(sp.get("customerName"));
    const equipmentNo = normalizeSearchCode(sp.get("equipmentNo"));
    const workDateFrom = normalizeSearchText(sp.get("workDateFrom"));
    const workDateTo = normalizeSearchText(sp.get("workDateTo"));
    const workCode = normalizeSearchCode(sp.get("workCode"));
    const workContent = normalizeSearchText(sp.get("workContent"));
    const staffCode = normalizeSearchCode(sp.get("staffCode"));

    // 得意先名検索時は一致コードを先に取得（LEFT JOIN 的に使う）
    let nameMatchedCodes: string[] | null = null;
    if (customerName) {
      const { data: nameRows, error: nameErr } = await supabase
        .from("customers")
        .select("customer_code")
        .ilike("customer_name", `%${customerName}%`);
      if (nameErr) {
        return NextResponse.json({ error: nameErr.message }, { status: 500 });
      }
      nameMatchedCodes = (nameRows ?? []).map((r) => r.customer_code);
      if (nameMatchedCodes.length === 0) {
        return NextResponse.json({
          items: [],
          total: 0,
          page,
          pageSize,
        });
      }
    }

    let query = supabase
      .from("maintenance_records")
      .select(
        "id, customer_code, equipment_no, work_date, work_code, work_content, operating_hours, staff_code, customer_contact, inputter_code",
        { count: "exact" }
      );

    if (customerCode) query = query.eq("customer_code", customerCode);
    if (nameMatchedCodes) query = query.in("customer_code", nameMatchedCodes);
    if (equipmentNo) query = query.eq("equipment_no", equipmentNo);
    if (workDateFrom) query = query.gte("work_date", workDateFrom);
    if (workDateTo) query = query.lte("work_date", workDateTo);
    if (workCode) query = query.eq("work_code", workCode);
    if (workContent) query = query.ilike("work_content", `%${workContent}%`);
    if (staffCode) query = query.eq("staff_code", staffCode);

    query = query
      .order("work_date", { ascending: false, nullsFirst: false })
      .order("customer_code", { ascending: true })
      .order("equipment_no", { ascending: true })
      .range(from, to);

    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const records = data ?? [];
    const codes = [...new Set(records.map((r) => r.customer_code))];
    const nameMap = new Map<string, string | null>();
    if (codes.length > 0) {
      const { data: custRows } = await supabase
        .from("customers")
        .select("customer_code, customer_name")
        .in("customer_code", codes);
      for (const c of custRows ?? []) {
        nameMap.set(c.customer_code, c.customer_name);
      }
    }

    const items: SearchRow[] = records.map((r) => ({
      ...r,
      customer_name: nameMap.get(r.customer_code) ?? null,
    }));

    return NextResponse.json({
      items,
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "検索に失敗しました",
      },
      { status: 500 }
    );
  }
}
