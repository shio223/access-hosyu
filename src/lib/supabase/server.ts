import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import { applyAuthCookies } from "./cookie-options";

/** サーバー用。anon + Cookie セッション。service_role は使わない。 */
export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "").trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です"
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        const all = cookieStore.getAll();
        // チャンクがあるとき空の非チャンク Cookie を除外（誤読防止）
        const hasChunks = all.some(
          (c) => /auth-token\.\d+$/.test(c.name) && c.value
        );
        if (!hasChunks) return all;
        return all.filter(
          (c) => !(c.name.includes("auth-token") && !/\.\d+$/.test(c.name))
        );
      },
      setAll(cookiesToSet) {
        try {
          applyAuthCookies(cookiesToSet, (name, value, options) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component からの set は無視（Middleware で更新）
        }
      },
    },
  });
}
