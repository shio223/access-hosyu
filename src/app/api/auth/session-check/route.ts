import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { cookies } from "next/headers";

export const runtime = "nodejs";

/** 本番デバッグ用（秘密は出さない） */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "").trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

  let urlHost = "";
  try {
    urlHost = new URL(url).host;
  } catch {
    urlHost = "(invalid)";
  }

  const jar = await cookies();
  const cookieNames = jar.getAll().map((c) => `${c.name}:${c.value.length}`);

  const { supabase, user } = await requireAuth();
  let queryOk = false;
  let queryError: string | null = null;
  let queryRowCount = 0;
  if (supabase) {
    const { data, error } = await supabase
      .from("maintenance_records")
      .select("customer_code")
      .eq("customer_code", "4522")
      .limit(1);
    queryOk = Boolean(data && data.length > 0);
    queryError = error?.message ?? null;
    queryRowCount = data?.length ?? 0;
  }

  return NextResponse.json({
    urlHost,
    anonKeyLen: anonKey.length,
    serviceKeyLen: serviceKey.length,
    cookieNames,
    hasUser: Boolean(user),
    queryOk,
    queryError,
    queryRowCount,
  });
}
