"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearSessionGate,
  getNavigationType,
  hasSessionGate,
  setSessionGate,
} from "@/lib/auth/session-gate";
import { routes } from "@/lib/routes";

/**
 * リロード時のみログアウト。
 * 入室直後や通常の画面遷移では logout しない。
 */
export function SessionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === routes.login;
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    if (isLogin) return;

    const navType = getNavigationType();
    if (navType !== "reload") {
      if (!hasSessionGate()) setSessionGate();
      return;
    }

    let cancelled = false;
    clearSessionGate();
    void (async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        /* ignore */
      }
      if (cancelled) return;
      router.replace(routes.login);
      router.refresh();
    })();

    return () => {
      cancelled = true;
    };
  }, [isLogin, router]);

  return <>{children}</>;
}
