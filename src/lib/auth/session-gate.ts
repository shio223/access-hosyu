/** 画面内遷移用の一時ゲート（同一タブの sessionStorage） */
export const SESSION_GATE_KEY = "hosyu-session-gate";
/** ログイン直後のフル遷移だけ許可するワンタイムフラグ */
export const LOGIN_PENDING_KEY = "hosyu-login-pending";

export function setSessionGate(): void {
  try {
    sessionStorage.setItem(SESSION_GATE_KEY, "1");
  } catch {
    /* private mode 等 */
  }
}

export function markLoginPending(): void {
  try {
    sessionStorage.setItem(LOGIN_PENDING_KEY, "1");
    sessionStorage.setItem(SESSION_GATE_KEY, "1");
  } catch {
    /* private mode 等 */
  }
}

export function consumeLoginPending(): boolean {
  try {
    const pending = sessionStorage.getItem(LOGIN_PENDING_KEY) === "1";
    if (pending) sessionStorage.removeItem(LOGIN_PENDING_KEY);
    return pending;
  } catch {
    return false;
  }
}

export function clearSessionGate(): void {
  try {
    sessionStorage.removeItem(SESSION_GATE_KEY);
    sessionStorage.removeItem(LOGIN_PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export function hasSessionGate(): boolean {
  try {
    return sessionStorage.getItem(SESSION_GATE_KEY) === "1";
  } catch {
    return false;
  }
}

/** フルドキュメント読み込みの種類（SPA内遷移では呼ばれない想定） */
export function getNavigationType(): string {
  try {
    const nav = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming | undefined;
    return nav?.type ?? "navigate";
  } catch {
    return "navigate";
  }
}
