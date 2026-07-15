/**
 * メモリアクセス制限（単一 Node プロセス向け）。
 * キー（通常は IP）ごとに試行回数を制限する。
 */
type Bucket = {
  windowStart: number;
  count: number;
  lockedUntil: number;
};

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const LOCK_MS = 5 * 60_000;
const LOCK_AFTER = 20;

export function checkAuthRateLimit(key: string): {
  allowed: boolean;
  retryAfterSec?: number;
} {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    b = { windowStart: now, count: 0, lockedUntil: 0 };
    buckets.set(key, b);
  }

  if (b.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((b.lockedUntil - now) / 1000),
    };
  }

  if (now - b.windowStart > WINDOW_MS) {
    b.windowStart = now;
    b.count = 0;
  }

  if (b.count >= MAX_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((WINDOW_MS - (now - b.windowStart)) / 1000),
    };
  }

  return { allowed: true };
}

export function recordAuthAttempt(key: string, success: boolean): void {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    b = { windowStart: now, count: 0, lockedUntil: 0 };
    buckets.set(key, b);
  }

  if (success) {
    buckets.delete(key);
    return;
  }

  if (now - b.windowStart > WINDOW_MS) {
    b.windowStart = now;
    b.count = 0;
  }
  b.count += 1;

  // 短時間の連続失敗で一時ロック
  if (b.count >= LOCK_AFTER) {
    b.lockedUntil = now + LOCK_MS;
  }
}

export function clientKeyFromRequest(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "local";
}
