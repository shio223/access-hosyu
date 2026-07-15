/**
 * 検索入力の半角・全角ゆれを吸収する。
 * 全角英数字・記号を半角へ（NFKC）。前後空白も除去。
 */
export function normalizeSearchText(value: string | null | undefined): string {
  if (value == null) return "";
  return String(value).normalize("NFKC").trim();
}

/** コード系（得意先・設備など）検索用。NFKC + 空白除去。 */
export function normalizeSearchCode(value: string | null | undefined): string {
  return normalizeSearchText(value);
}
