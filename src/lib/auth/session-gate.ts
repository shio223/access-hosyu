/** 画面内遷移用の一時ゲート（タブ閉じ・リロード・URL直入力で消える） */
export const SESSION_GATE_KEY = "hosyu-session-gate";

export function setSessionGate(): void {
  try {
    sessionStorage.setItem(SESSION_GATE_KEY, "1");
  } catch {
    /* private mode 等 */
  }
}

export function clearSessionGate(): void {
  try {
    sessionStorage.removeItem(SESSION_GATE_KEY);
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
