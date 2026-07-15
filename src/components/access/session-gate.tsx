"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearSessionGate,
  hasSessionGate,
} from "@/lib/auth/session-gate";
import { routes } from "@/lib/routes";

/**
 * リロードやアドレスバーでのURL変更（pagehide）後はゲートが消えるためログアウト。
 * アプリ内の Link 等による遷移では pagehide が起きないのでログイン維持。
 */
export function SessionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === routes.login;
  const [ready, setReady] = useState(isLogin);

  useEffect(() => {
    const onPageHide = () => {
      clearSessionGate();
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const forceLogout = async () => {
      setReady(false);
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        /* ignore */
      }
      if (cancelled) return;
      clearSessionGate();
      router.replace(routes.login);
      router.refresh();
    };

    const ensureGate = () => {
      if (isLogin) {
        setReady(true);
        return;
      }
      if (hasSessionGate()) {
        setReady(true);
        return;
      }
      void forceLogout();
    };

    ensureGate();

    const onPageShow = () => {
      ensureGate();
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [isLogin, pathname, router]);

  if (!ready && !isLogin) {
    return (
      <div className="min-h-screen bg-[#C0C0C0]" aria-busy="true" />
    );
  }

  return <>{children}</>;
}
