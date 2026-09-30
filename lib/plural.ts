/**
 * Counted nouns, said correctly.
 *
 * "1 months access" and "1 subjects" appeared on the pricing cards, the
 * checkout summary, the admin product list and the receipt email — the same
 * mistake four times, because each one built the string itself. A single
 * subject is the shortest product on sale and the one most likely to be
 * someone's first purchase, so it is exactly the case that must not read as
 * though nobody checked.
 *
 * Plain functions with no imports: the receipt email, a server page and a
 * client component all need them.
 */

/** `count(1, "subject")` → "1 subject"; `count(6, "subject")` → "6 subjects". */
export function count(n: number, singular: string, plural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** How long access lasts. `null` means it never expires. */
export function accessPeriod(months: number | null | undefined): string {
  return months == null ? "Lifetime" : count(months, "month");
}
