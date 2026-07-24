/**
 * Supabase 接続失敗の分類・ログ・ユーザー向けメッセージ。
 * Free / Pro どちらでも同じ経路（到達不能・一時停止・DNS 等を汎用検知）。
 */

export const SUPABASE_UNREACHABLE_CODE = "SUPABASE_UNREACHABLE" as const;

export type SupabaseErrorInfo = {
  isConnectionError: boolean;
  message: string;
  code: string | null;
  httpStatus: number | null;
  causeCode: string | null;
  causeMessage: string | null;
};

const CONNECTION_PATTERNS =
  /ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENETUNREACH|UND_ERR_|fetch failed|getaddrinfo|network|socket|paused|inactive|project is paused|temporarily unavailable/i;

function readProp(obj: unknown, key: string): unknown {
  if (obj && typeof obj === "object" && key in obj) {
    return (obj as Record<string, unknown>)[key];
  }
  return undefined;
}

function asString(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

/** AuthError / Error / 素のオブジェクトから接続情報を抽出 */
export function classifySupabaseError(err: unknown): SupabaseErrorInfo {
  const message =
    err instanceof Error
      ? err.message
      : asString(readProp(err, "message")) ?? String(err ?? "unknown");

  const code =
    asString(readProp(err, "code")) ??
    asString(readProp(err, "name")) ??
    null;

  let httpStatus: number | null = null;
  const statusRaw =
    readProp(err, "status") ??
    readProp(err, "statusCode") ??
    readProp(readProp(err, "context"), "status");
  if (typeof statusRaw === "number" && Number.isFinite(statusRaw)) {
    httpStatus = statusRaw;
  } else if (typeof statusRaw === "string" && /^\d+$/.test(statusRaw)) {
    httpStatus = Number(statusRaw);
  }

  const cause = err instanceof Error ? err.cause : readProp(err, "cause");
  const causeCode =
    asString(readProp(cause, "code")) ??
    asString(readProp(cause, "errno")) ??
    null;
  const causeMessage =
    cause instanceof Error
      ? cause.message
      : asString(readProp(cause, "message"));

  const blob = [message, code, causeCode, causeMessage]
    .filter(Boolean)
    .join(" ");

  const isConnectionError =
    CONNECTION_PATTERNS.test(blob) ||
    (httpStatus != null && httpStatus >= 500) ||
    httpStatus === 0;

  return {
    isConnectionError,
    message,
    code,
    httpStatus,
    causeCode,
    causeMessage,
  };
}

export function isDevelopmentEnv(): boolean {
  return process.env.NODE_ENV === "development";
}

/** 接続不能時のユーザー向け文言（Pro 移行後も同じ） */
export function supabaseUnreachableUserMessage(): string {
  if (isDevelopmentEnv()) {
    return "Supabaseプロジェクトが一時停止している可能性があります";
  }
  return "現在サービスに接続できません。しばらくしてから再度お試しください。";
}

/**
 * サーバーログへ詳細出力（秘密は出さない）。
 * Console / Vercel Runtime Logs 向け。
 */
export function logSupabaseConnectionError(
  context: string,
  err: unknown,
  extra?: Record<string, unknown>
): SupabaseErrorInfo {
  const info = classifySupabaseError(err);
  const payload = {
    context,
    isConnectionError: info.isConnectionError,
    message: info.message,
    code: info.code,
    httpStatus: info.httpStatus,
    causeCode: info.causeCode,
    causeMessage: info.causeMessage,
    ...extra,
  };
  console.error(`[supabase] ${context}`, payload);
  if (err instanceof Error && err.stack) {
    console.error(`[supabase] ${context} stack`, err.stack);
  }
  return info;
}
