/**
 * Products that exist in the catalogue but cannot be bought yet.
 *
 * CPL Flight Test Groundwork is published and priced, but the material behind
 * it has not been supplied. Taking money for it would sell someone an empty
 * course, so the purchase is closed off while the card stays on the page —
 * people looking for it should see that it is coming, not that it is missing.
 *
 * Deliberately a list of slugs rather than a column on Product: this is a
 * temporary state, and it reverses by deleting one line rather than by a
 * migration and a data change.
 *
 * No import of anything server-only, so the pricing page, the home page and
 * the checkout entry point can all ask the same question.
 */

export const COMING_SOON_SLUGS: readonly string[] = ["cpl-flight-test-package"];

export function isComingSoon(slug: string | null | undefined): boolean {
  return slug !== null && slug !== undefined && COMING_SOON_SLUGS.includes(slug);
}
