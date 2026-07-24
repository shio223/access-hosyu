"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clearSessionGate, setSessionGate } from "@/lib/auth/session-gate";

const REQUIRED_PETS = 1;
const MIN_SWIPE_DX = 48;

type Stroke = {
  pointerId: number;
  startX: number;
  maxX: number;
  active: boolean;
};

/**
 * 犬を左→右へ1回撫でてログイン。
 * 認証本体は /api/auth/pet-login（サーバー側）。
 * マウント時に logout しない（入室と競合するため）。
 */
export function DogPetLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [bark, setBark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const strokeRef = useRef<Stroke | null>(null);
  const petsRef = useRef(0);
  const finishingRef = useRef(false);

  const resetPets = useCallback(() => {
    petsRef.current = 0;
    setBark(false);
  }, []);

  const finishLogin = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setLoading(true);
    setError("");
    setBark(true);

    try {
      const res = await fetch("/api/auth/pet-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gesture: "pet-complete" }),
        credentials: "same-origin",
      });

      if (!res.ok) {
        const status = res.status;
        let detail = "";
        try {
          const body = (await res.json()) as { error?: string };
          detail = body.error ?? "";
        } catch {
          /* ignore */
        }
        setBark(false);
        setError(
          status === 429
            ? "しばらくしてからもう一度お試しください"
            : detail === "ログイン設定が完了していません"
              ? "本番のログイン設定（Vercel環境変数）が未完了です"
              : detail.includes("Supabaseに接続できません")
                ? detail
                : detail || "入れませんでした。もう一度撫でてください"
        );
        clearSessionGate();
        resetPets();
        finishingRef.current = false;
        setLoading(false);
        return;
      }

      setSessionGate();
      // Soft navigation（フル遷移だと middleware / SessionGate とぶつかりやすい）
      router.replace(next);
      router.refresh();
    } catch {
      setBark(false);
      setError("入れませんでした。もう一度撫でてください");
      clearSessionGate();
      resetPets();
      finishingRef.current = false;
      setLoading(false);
    }
  }, [next, resetPets, router]);

  const registerPet = useCallback(() => {
    if (finishingRef.current || loading) return;
    const nextCount = petsRef.current + 1;
    petsRef.current = nextCount;
    if (nextCount >= REQUIRED_PETS) {
      void finishLogin();
    }
  }, [finishLogin, loading]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (loading || finishingRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    strokeRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      maxX: e.clientX,
      active: true,
    };
    setError("");
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = strokeRef.current;
    if (!s?.active || s.pointerId !== e.pointerId) return;
    if (e.clientX > s.maxX) s.maxX = e.clientX;
  };

  const endStroke = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = strokeRef.current;
    if (!s?.active || s.pointerId !== e.pointerId) return;
    s.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    const dx = s.maxX - s.startX;
    if (dx >= MIN_SWIPE_DX) {
      registerPet();
    }
    strokeRef.current = null;
  };

  return (
    <div className="min-h-screen bg-[#C0C0C0] flex items-center justify-center p-4">
      <div
        className="border-2 border-[#404040] bg-[#D4D0C8] shadow-lg p-4"
        style={{ width: 400 }}
      >
        <div className="bg-[#0000CC] text-white text-center font-bold mb-4 -mx-4 -mt-4 px-2 py-2 text-sm">
          保守管理システム　ログイン
        </div>

        <div
          className="relative mx-auto select-none touch-none cursor-grab active:cursor-grabbing bg-[#E8E4DC] border border-[#808080] overflow-hidden"
          style={{
            width: 320,
            height: 300,
            boxShadow: "inset 1px 1px 2px #808080",
            touchAction: "none",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/login-dog.png"
            alt=""
            draggable={false}
            className={`mx-auto pointer-events-none transition-transform object-cover ${
              bark ? "scale-110" : ""
            }`}
            style={{ width: 320, height: 300, objectPosition: "center 20%" }}
          />
          {bark && (
            <div
              className="absolute top-2 right-3 text-[#000080] font-bold"
              style={{ fontSize: 18 }}
            >
              わん！
            </div>
          )}
        </div>

        {loading && (
          <p className="text-[10px] text-center text-[#404040] mt-3">入室中...</p>
        )}
        {error && (
          <p className="text-[#CC0000] text-[10px] text-center mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
