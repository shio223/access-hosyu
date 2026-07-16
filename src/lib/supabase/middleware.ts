import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { applyAuthCookies } from "@/lib/supabase/cookie-options";

const PUBLIC_PATHS = [
  "/login",
  "/auth/callback",
  "/api/auth/pet-login",
  "/api/auth/logout",
  "/api/auth/session-check",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function hasAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((c) => c.name.includes("-auth-token"));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;

  // API は各 route で認証（HTML ログインへリダイレクトしない）
  if (pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        applyAuthCookies(cookiesToSet, (name, value, options) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Edge 上の getUser() が Auth 通信に失敗して常に未ログイン扱いになるため、
  // ここでは Cookie / セッション有無で判定する（厳密な検証は API・サーバー側）。
  let signedIn = hasAuthCookie(request);
  if (signedIn) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        signedIn = true;
      }
      // getSession が空でも Cookie があれば通過（getUser 失敗時のフォールバック）
    } catch {
      /* Cookie ありなら通過 */
    }
  }

  if (!signedIn && !isPublicPath(pathname) && !pathname.startsWith("/_next")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
