"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearSessionGate,
  hasSessionGate,
} from "@/lib/auth/session-gate";
import { routes } from "@/lib/routes";

/**
 * リロード・アドレスバー変更・タブ閉じ時はゲート消滅 → 再入室が必要。
 * アプリ内 Link / router 遷移では beforeunload が起きないのでログイン維持。
 * （pagehide はタブ切替でも発火するため使わない）
 */
export function SessionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === routes.login;
  const [ready, setReady] = useState(isLogin);
  const loggingOutRef = useRef(false);

  useEffect(() => {
    const onBeforeUnload = () => {
      clearSessionGate();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const forceLogout = async () => {
      if (loggingOutRef.current) return;
      loggingOutRef.current = true;
      setReady(false);
      clearSessionGate();
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        /* ignore */
      }
      if (cancelled) {
        loggingOutRef.current = false;
        return;
      }
      router.replace(routes.login);
      router.refresh();
      loggingOutRef.current = false;
    };

    if (isLogin) {
      setReady(true);
      loggingOutRef.current = false;
      return () => {
        cancelled = true;
      };
    }

    if (hasSessionGate()) {
      setReady(true);
      return () => {
        cancelled = true;
      };
    }

    void forceLogout();
    return () => {
      cancelled = true;
    };
  }, [isLogin, pathname, router]);

  if (!ready && !isLogin) {
    return (
      <div className="min-h-screen bg-[#C0C0C0]" aria-busy="true" />
    );
  }

  return <>{children}</>;
}
