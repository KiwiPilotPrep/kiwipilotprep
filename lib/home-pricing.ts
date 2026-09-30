import "server-only";

import { db } from "./db";
import { formatMinor } from "./money";

/**
 * Prices for the homepage pricing cards.
 *
 * The cards themselves are hand-written marketing copy, but their prices and
 * access windows must come from the same rows the checkout charges against —
 * otherwise the homepage can quietly advertise a figure nobody is selling at.
 * Each card names the product slug it belongs to; anything not found is
 * reported as unavailable rather than shown as a placeholder.
 */
export type PlanPrice = {
  /** The product to buy. Carried so a homepage card can link straight at
   *  checkout for that exact product instead of at a page listing them all. */
  id: string | null;
  nzd: string | null;
  inr: string | null;
  months: number | null;
};

/** Card key in PricingSection → product slug in the database. */
export const PLAN_SLUGS: Record<string, string> = {
  ppl: "ppl-theory-package",
  cpl: "cpl-theory-package",
  ir: "ir-theory-package",
  ftppl: "ppl-flight-test-package",
  ftcpl: "cpl-flight-test-package",
  complete: "complete-aviator-pass",
};

export async function homePlanPrices(): Promise<Record<string, PlanPrice>> {
  const products = await db.product.findMany({
    where: { slug: { in: Object.values(PLAN_SLUGS) }, status: "PUBLISHED" },
    select: { id: true, slug: true, accessMonths: true, prices: true },
  });

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const out: Record<string, PlanPrice> = {};

  for (const [key, slug] of Object.entries(PLAN_SLUGS)) {
    const product = bySlug.get(slug);
    const nzd = product?.prices.find((p) => p.currency === "NZD");
    const inr = product?.prices.find((p) => p.currency === "INR");
    out[key] = {
      id: product?.id ?? null,
      nzd: nzd ? formatMinor(nzd.amountMinor, "NZD") : null,
      inr: inr ? formatMinor(inr.amountMinor, "INR") : null,
      months: product?.accessMonths ?? null,
    };
  }

  // The "buy a single subject" card advertises the cheapest single subject.
  const cheapest = await db.productPrice.findFirst({
    where: { currency: "NZD", product: { status: "PUBLISHED", slug: { startsWith: "subject-" } } },
    orderBy: { amountMinor: "asc" },
    select: { amountMinor: true, product: { select: { accessMonths: true } } },
  });
  const cheapestInr = await db.productPrice.findFirst({
    where: { currency: "INR", product: { status: "PUBLISHED", slug: { startsWith: "subject-" } } },
    orderBy: { amountMinor: "asc" },
    select: { amountMinor: true },
  });

  out.single = {
    // No single id: which subject is a choice the student makes, so this card
    // points at the picker rather than at one arbitrary subject's checkout.
    id: null,
    nzd: cheapest ? formatMinor(cheapest.amountMinor, "NZD") : null,
    inr: cheapestInr ? formatMinor(cheapestInr.amountMinor, "INR") : null,
    months: cheapest?.product.accessMonths ?? null,
  };

  return out;
}
