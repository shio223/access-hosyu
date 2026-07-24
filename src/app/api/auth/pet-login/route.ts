import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import {
  checkAuthRateLimit,
  clientKeyFromRequest,
  recordAuthAttempt,
} from "@/lib/auth/rate-limit";
import { applyAuthCookies } from "@/lib/supabase/cookie-options";
import {
  SUPABASE_UNREACHABLE_CODE,
  logSupabaseConnectionError,
  supabaseUnreachableUserMessage,
} from "@/lib/supabase/connection-error";

export const runtime = "nodejs";

function authFailureResponse(
  err: unknown,
  context: string,
  extra?: Record<string, unknown>
) {
  const info = logSupabaseConnectionError(context, err, extra);
  if (info.isConnectionError) {
    return NextResponse.json(
      {
        error: supabaseUnreachableUserMessage(),
        code: SUPABASE_UNREACHABLE_CODE,
        httpStatus: info.httpStatus ?? 503,
      },
      { status: 503 }
    );
  }
  return NextResponse.json(
    {
      error: "ログインに失敗しました",
      code: "AUTH_FAILED",
      httpStatus: info.httpStatus ?? 401,
    },
    { status: 401 }
  );
}

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
      { error: "しばらくしてから再度お試しください", code: "RATE_LIMITED" },
      {
        status: 429,
        headers: limit.retryAfterSec
          ? { "Retry-After": String(limit.retryAfterSec) }
          : undefined,
      }
    );
  }

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
    console.error("[pet-login] missing env:", {
      missing,
      httpStatus: 500,
      code: "MISSING_ENV",
    });
    return NextResponse.json(
      {
        error: "ログイン設定が完了していません",
        code: "MISSING_ENV",
        missing,
      },
      { status: 500 }
    );
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[pet-login] invalid env", {
      code: "INVALID_ENV",
      httpStatus: 500,
      detail: "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY must not be set",
    });
    return NextResponse.json(
      { error: "ログイン設定が不正です", code: "INVALID_ENV" },
      { status: 500 }
    );
  }

  let urlHost = "";
  try {
    urlHost = new URL(url).host;
  } catch {
    urlHost = "(invalid)";
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
      return authFailureResponse(
        linkError ?? new Error("token_hash missing"),
        "pet-login.generateLink",
        { urlHost }
      );
    }

    const response = NextResponse.json({ ok: true });

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          applyAuthCookies(cookiesToSet, (name, value, options) => {
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
      return authFailureResponse(otpError, "pet-login.verifyOtp", { urlHost });
    }

    recordAuthAttempt(key, true);
    return response;
  } catch (err) {
    recordAuthAttempt(key, false);
    return authFailureResponse(err, "pet-login.unexpected", { urlHost });
  }
}
