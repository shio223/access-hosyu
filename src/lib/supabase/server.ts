import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import { applyAuthCookies } from "./cookie-options";

/** サーバー用。anon + Cookie セッション。service_role は使わない。 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
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
    }
  );
}
