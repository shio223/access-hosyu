"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const REQUIRED_PETS = 3;
const MIN_SWIPE_DX = 48;
const IDLE_RESET_MS = 8000;

type Stroke = {
  pointerId: number;
  startX: number;
  maxX: number;
  active: boolean;
};

/**
 * 犬を左→右へ3回なでなでしてログイン。
 * 認証本体は /api/auth/pet-login（サーバー側）。
 */
export function DogPetLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [pets, setPets] = useState(0);
  const [message, setMessage] = useState("犬を左から右へ撫でてください");
  const [bark, setBark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const strokeRef = useRef<Stroke | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const petsRef = useRef(0);
  const finishingRef = useRef(false);
  const clearedSessionRef = useRef(false);

  // ログイン画面を開いたら既存セッションを切る（犬をスキップして入れないようにする）
  useEffect(() => {
    if (clearedSessionRef.current) return;
    clearedSessionRef.current = true;
    void fetch("/api/auth/logout", { method: "POST" }).then(() => {
      router.refresh();
    });
  }, [router]);

  const clearIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  const resetPets = useCallback(() => {
    petsRef.current = 0;
    setPets(0);
    setBark(false);
    setMessage("犬を左から右へ撫でてください");
    clearIdleTimer();
  }, []);

  const bumpIdleTimer = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      petsRef.current = 0;
      setPets(0);
      setBark(false);
      setMessage("時間切れです。もう一度撫でてください");
    }, IDLE_RESET_MS);
  }, []);

  useEffect(() => () => clearIdleTimer(), []);

  const finishLogin = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setLoading(true);
    setError("");
    setBark(true);
    setMessage("わん！");
    try {
      await new Promise((r) => setTimeout(r, 700));
      const res = await fetch("/api/auth/pet-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gesture: "pet-complete" }),
      });
      if (!res.ok) {
        setBark(false);
        setError("入れませんでした。少し待ってからもう一度撫でてください");
        resetPets();
        finishingRef.current = false;
        setLoading(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setBark(false);
      setError("入れませんでした");
      resetPets();
      finishingRef.current = false;
      setLoading(false);
    }
  }, [next, resetPets, router]);

  const registerPet = useCallback(() => {
    if (finishingRef.current || loading) return;
    const nextCount = petsRef.current + 1;
    petsRef.current = nextCount;
    setPets(nextCount);
    bumpIdleTimer();
    if (nextCount >= REQUIRED_PETS) {
      clearIdleTimer();
      void finishLogin();
    } else {
      setMessage(`いい子！ あと ${REQUIRED_PETS - nextCount} 回撫でてください`);
    }
  }, [bumpIdleTimer, finishLogin, loading]);

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
    // 単なるクリック（移動ほぼなし）は無効。左→右の一定距離以上のみ
    if (dx >= MIN_SWIPE_DX) {
      registerPet();
    }
    strokeRef.current = null;
  };

  return (
    <div className="min-h-screen bg-[#C0C0C0] flex items-center justify-center p-4">
      <div
        className="border-2 border-[#404040] bg-[#D4D0C8] shadow-lg p-4"
        style={{ width: 360 }}
      >
        <div className="bg-[#0000CC] text-white text-center font-bold mb-4 -mx-4 -mt-4 px-2 py-2 text-sm">
          保守管理システム　ログイン
        </div>

        <p className="text-xs text-center mb-2 text-[#000080]">{message}</p>

        <div
          className="relative mx-auto select-none touch-none cursor-grab active:cursor-grabbing bg-[#E8E4DC] border border-[#808080]"
          style={{
            width: 260,
            height: 220,
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
            alt="なでなで用のゴールデンレトリバー"
            draggable={false}
            className={`mx-auto mt-2 pointer-events-none transition-transform object-contain ${
              bark ? "scale-110" : ""
            }`}
            style={{ width: 220, height: 180 }}
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

        <div className="flex justify-center gap-2 mt-3 mb-1">
          {Array.from({ length: REQUIRED_PETS }).map((_, i) => (
            <span
              key={i}
              className={`inline-block border border-[#808080] ${
                i < pets ? "bg-[#000080]" : "bg-white"
              }`}
              style={{ width: 14, height: 14 }}
              aria-hidden
            />
          ))}
        </div>

        <p className="text-[10px] text-center text-[#404040]">
          {loading
            ? "入室中..."
            : "左から右へスワイプ（クリックだけでは開けません）"}
        </p>
        {error && (
          <p className="text-[#CC0000] text-[10px] text-center mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
