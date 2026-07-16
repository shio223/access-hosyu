import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import {
  checkAuthRateLimit,
  clientKeyFromRequest,
  recordAuthAttempt,
} from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

/**
 * 犬なでなでログイン完了後のサーバー認証。
 * - クライアントからメール/パスワードは受け取らない
 * - AUTH_LOGIN_EMAIL + service_role で magic link を発行し、
 *   anon クライアントで verifyOtp → HttpOnly Cookie セッション
 * - RLS（authenticated）を維持。service_role はブラウザに出さない
 */
export async function POST(request: NextRequest) {
  const key = clientKeyFromRequest(request);
  const limit = checkAuthRateLimit(key);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "しばらくしてから再度お試しください" },
      {
        status: 429,
        headers: limit.retryAfterSec
          ? { "Retry-After": String(limit.retryAfterSec) }
          : undefined,
      }
    );
  }

  // クライアントが誤って秘密を送ってきても無視（ボディは見ない／ログしない）
  try {
    await request.json().catch(() => null);
  } catch {
    /* ignore */
  }

  const email = process.env.AUTH_LOGIN_EMAIL?.trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!email || !url || !anonKey || !serviceKey) {
    recordAuthAttempt(key, false);
    const missing = [
      !email && "AUTH_LOGIN_EMAIL",
      !url && "NEXT_PUBLIC_SUPABASE_URL",
      !anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      !serviceKey && "SUPABASE_SERVICE_ROLE_KEY",
    ].filter(Boolean);
    console.error("[pet-login] missing env:", missing.join(", "));
    return NextResponse.json(
      {
        error: "ログイン設定が完了していません",
        missing,
      },
      { status: 500 }
    );
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "ログイン設定が不正です" },
      { status: 500 }
    );
  }

  try {
    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    const tokenHash = linkData?.properties?.hashed_token;
    if (linkError || !tokenHash) {
      recordAuthAttempt(key, false);
      console.error("[pet-login] generateLink failed", linkError?.message);
      return NextResponse.json(
        { error: "ログインに失敗しました" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error: otpError } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: tokenHash,
    });

    if (otpError) {
      recordAuthAttempt(key, false);
      console.error("[pet-login] verifyOtp failed", otpError.message);
      return NextResponse.json(
        { error: "ログインに失敗しました" },
        { status: 401 }
      );
    }

    recordAuthAttempt(key, true);
    return response;
  } catch (err) {
    recordAuthAttempt(key, false);
    console.error(
      "[pet-login] unexpected",
      err instanceof Error ? err.message : "unknown"
    );
    return NextResponse.json(
      { error: "ログインに失敗しました" },
      { status: 401 }
    );
  }
}
