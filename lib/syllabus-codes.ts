/**
 * Pure syllabus-code helpers.
 *
 * Separate from lib/syllabus.ts because that module is server-only — it holds
 * database queries and entitlement checks. The navigation runs in the browser
 * and needs to build links, so the code arithmetic lives here where both sides
 * can import it and neither can drift from the other.
 */

/** "12.6.24" → "12-6-24", for use in a URL. */
export function codeToSlug(code: string): string {
  return code.replace(/\./g, "-");
}

/** "12-6-24" → "12.6.24". Returns null for anything that is not a code. */
export function slugToCode(slug: string): string | null {
  if (!/^\d{1,3}(-\d{1,3}){1,2}$/.test(slug)) return null;
  return slug.replace(/-/g, ".");
}

/** Sorts codes numerically — "12.10" must come after "12.6", not before it. */
export function compareCodes(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}
