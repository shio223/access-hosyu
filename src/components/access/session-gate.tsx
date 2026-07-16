"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearSessionGate,
  consumeLoginPending,
  getNavigationType,
  hasSessionGate,
  setSessionGate,
} from "@/lib/auth/session-gate";
import { routes } from "@/lib/routes";

/**
 * リロード・アドレスバー直入力はログアウト。
 * ログイン直後のフル遷移は pending フラグで許可。
 * アプリ内 Link / router 遷移ではルートレイアウトが残るのでゲート維持。
 */
export function SessionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === routes.login;
  const [ready, setReady] = useState(isLogin);
  const bootstrappedRef = useRef(false);
  const loggingOutRef = useRef(false);

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
      if (pathname !== routes.login) {
        router.replace(routes.login);
        router.refresh();
      }
      loggingOutRef.current = false;
    };

    if (isLogin) {
      setReady(true);
      loggingOutRef.current = false;
      return () => {
        cancelled = true;
      };
    }

    // 初回マウント（フルロード）時だけ reload / 直URL を判定
    if (!bootstrappedRef.current) {
      bootstrappedRef.current = true;
      const navType = getNavigationType();
      const pending = consumeLoginPending();

      if (pending) {
        setSessionGate();
        setReady(true);
        return () => {
          cancelled = true;
        };
      }

      if (navType === "reload" || navType === "navigate") {
        void forceLogout();
        return () => {
          cancelled = true;
        };
      }
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
