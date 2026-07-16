import { cookies } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/admin";

type SessionUser = {
  id: string;
  email?: string;
};

/**
 * Cookie 内の auth-token（チャンク含む）を結合してセッション JSON を取り出す。
 */
function readAuthSessionFromCookies(
  all: { name: string; value: string }[]
): { access_token?: string; expires_at?: number; user?: SessionUser } | null {
  const authCookies = all.filter((c) => c.name.includes("-auth-token"));
  if (authCookies.length === 0) return null;

  const chunks = authCookies
    .filter((c) => /\.\d+$/.test(c.name))
    .sort((a, b) => {
      const ai = Number(a.name.split(".").pop());
      const bi = Number(b.name.split(".").pop());
      return ai - bi;
    });

  let raw = "";
  if (chunks.length > 0) {
    raw = chunks.map((c) => c.value).join("");
  } else {
    const single = authCookies.find((c) => !/\.\d+$/.test(c.name) && c.value);
    if (!single) return null;
    raw = single.value;
  }

  if (raw.startsWith("base64-")) {
    try {
      raw = Buffer.from(raw.slice("base64-".length), "base64").toString("utf8");
    } catch {
      return null;
    }
  }

  try {
    return JSON.parse(raw) as {
      access_token?: string;
      expires_at?: number;
      user?: SessionUser;
    };
  } catch {
    return null;
  }
}

function isSessionValid(
  session: { access_token?: string; expires_at?: number; user?: SessionUser } | null
): session is { access_token: string; expires_at?: number; user: SessionUser } {
  if (!session?.access_token || !session.user?.id) return false;
  if (session.expires_at && session.expires_at * 1000 < Date.now() - 30_000) {
    return false;
  }
  return true;
}

/**
 * API 用認証 + DB クライアント。
 *
 * Vercel 上で anon + getUser が不安定なため:
 * 1. ログイン Cookie のセッションを検証
 * 2. データ取得は service_role（サーバー専用・RLS バイパス）
 *
 * service_role はブラウザに出さない。API ルートからのみ使用。
 */
export async function requireAuth() {
  const jar = await cookies();
  const session = readAuthSessionFromCookies(jar.getAll());

  if (!isSessionValid(session)) {
    return { supabase: null, user: null };
  }

  try {
    const supabase = createServiceRoleClient();
    return { supabase, user: session.user };
  } catch (e) {
    console.error(
      "[requireAuth] service_role client failed",
      e instanceof Error ? e.message : e
    );
    return { supabase: null, user: null };
  }
}
