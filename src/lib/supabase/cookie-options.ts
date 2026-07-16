/** 本番 Edge で欠落しないよう、1枚あたりを小さめに分割する */
const CHUNK_SIZE = 1800;

export function authCookieOptions(
  overrides?: Record<string, unknown>
): Record<string, unknown> {
  const secure =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  return {
    path: "/",
    sameSite: "lax" as const,
    secure,
    httpOnly: true,
    ...overrides,
  };
}

function splitChunks(
  name: string,
  value: string,
  size: number
): { name: string; value: string }[] {
  if (value.length <= size) {
    return [{ name, value }];
  }
  const chunks: { name: string; value: string }[] = [];
  for (let i = 0, offset = 0; offset < value.length; i += 1, offset += size) {
    chunks.push({
      name: `${name}.${i}`,
      value: value.slice(offset, offset + size),
    });
  }
  return chunks;
}

/**
 * Supabase の setAll 用。大きい Cookie を強制チャンクし、
 * Secure / HttpOnly を付与する。
 */
export function applyAuthCookies(
  cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[],
  setCookie: (name: string, value: string, options: Record<string, unknown>) => void
): void {
  for (const { name, value, options } of cookiesToSet) {
    const merged = authCookieOptions(options);

    if (!value) {
      setCookie(name, "", { ...merged, maxAge: 0 });
      continue;
    }

    // 既にチャンク名（xxx.0）ならそのまま
    if (/\.\d+$/.test(name)) {
      setCookie(name, value, merged);
      continue;
    }

    if (value.length <= CHUNK_SIZE) {
      setCookie(name, value, merged);
      continue;
    }

    // 非チャンク名を消し、小さいチャンクへ分割
    setCookie(name, "", { ...merged, maxAge: 0 });
    for (const chunk of splitChunks(name, value, CHUNK_SIZE)) {
      setCookie(chunk.name, chunk.value, merged);
    }
  }
}
