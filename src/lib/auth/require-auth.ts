import { createClient } from "@/lib/supabase/server";

/**
 * API 用認証。
 * Vercel 上で getUser()（Auth サーバー通信）が失敗することがあるため、
 * Cookie から読む getSession() をフォールバックする。
 */
export async function requireAuth() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (user) {
    return { supabase, user };
  }

  if (userError) {
    console.warn("[requireAuth] getUser failed:", userError.message);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user) {
    return { supabase, user: session.user };
  }

  return { supabase, user: null };
}
