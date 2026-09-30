/**
 * Validates a `next` / `back` redirect target so it can only ever point back
 * into this site.
 *
 * The old check — `startsWith("/") && !startsWith("//")` — let `/\evil.example`
 * through: it starts with one slash and not two, but a browser folds `/\` (and
 * `\/`, `\\`) into `//`, which is a protocol-relative URL that leaves the
 * origin. That is an open redirect: an attacker crafts `…?next=/\evil.example`,
 * the victim signs in, and is bounced to the attacker's site — the classic
 * setup for credential phishing.
 *
 * The rule here is strict and positive: a single leading slash, immediately
 * followed by a character that is neither a slash nor a backslash, and no
 * backslash, whitespace or control character anywhere. Real targets in this
 * app ("/checkout/start?product=…", "/dashboard") all pass; anything that
 * could resolve off-origin does not.
 */
export function safeNextPath(raw: string | null | undefined): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 2000) return "";
  // Must begin "/" then a character that is not another slash or a backslash.
  if (!/^\/[^/\\]/.test(raw)) return "";
  // Reject a backslash (browsers fold it into a slash) or any whitespace.
  if (raw.includes("\\") || /\s/.test(raw)) return "";
  // Reject any C0 control character.
  for (let i = 0; i < raw.length; i += 1) {
    if (raw.charCodeAt(i) < 0x20) return "";
  }
  return raw;
}
