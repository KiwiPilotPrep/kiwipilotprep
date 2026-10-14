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

/**
 * A published package with no hand-written card of its own.
 *
 * The front page is the only pricing surface now, and §19 requires that
 * surface be driven by what is in the database rather than by a list in the
 * source: an administrator who publishes a package must see it offered without
 * waiting for someone to write a card for it. The six known packages keep
 * their written copy; anything else is described from its own rows.
 */
export type ExtraPackage = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  months: number | null;
  nzd: string | null;
  inr: string | null;
  /** What the package grants, named as the database names it. */
  contents: string[];
};

export type HomePricing = {
  plans: Record<string, PlanPrice>;
  extras: ExtraPackage[];
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

const WRITTEN = new Set(Object.values(PLAN_SLUGS));

export async function homePlanPrices(): Promise<HomePricing> {
  // Every published product in one read. It used to be three -- the six cards,
  // then the cheapest single subject in each currency -- and widening the first
  // query answers all three, because the single subjects are in these rows too.
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      accessMonths: true,
      prices: true,
      items: {
        select: {
          courseId: true,
          course: {
            select: {
              title: true,
              _count: { select: { subjects: { where: { status: "PUBLISHED" } } } },
            },
          },
          subject: { select: { title: true } },
        },
      },
    },
  });

  const money = (p: (typeof products)[number], currency: "NZD" | "INR") => {
    const row = p.prices.find((x) => x.currency === currency);
    return row ? formatMinor(row.amountMinor, currency) : null;
  };

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const plans: Record<string, PlanPrice> = {};

  for (const [key, slug] of Object.entries(PLAN_SLUGS)) {
    const product = bySlug.get(slug);
    plans[key] = {
      id: product?.id ?? null,
      nzd: product ? money(product, "NZD") : null,
      inr: product ? money(product, "INR") : null,
      months: product?.accessMonths ?? null,
    };
  }

  /* ------------------------------------------------------ single subjects */

  // A single subject grants a subject and never a course, which is what makes
  // it a single subject -- not its slug. The card advertises the cheapest.
  const singles = products.filter(
    (p) => p.items.length > 0 && p.items.every((i) => i.courseId === null),
  );
  const cheapest = (currency: "NZD" | "INR") => {
    const amounts = singles
      .map((p) => p.prices.find((x) => x.currency === currency)?.amountMinor)
      .filter((m): m is number => typeof m === "number")
      .sort((a, b) => a - b);
    return amounts.length ? formatMinor(amounts[0], currency) : null;
  };
  const cheapestSingle = singles
    .map((p) => ({ p, m: p.prices.find((x) => x.currency === "NZD")?.amountMinor }))
    .filter((x): x is { p: (typeof products)[number]; m: number } => typeof x.m === "number")
    .sort((a, b) => a.m - b.m)[0];

  plans.single = {
    // No single id: which subject is a choice the student makes, so this card
    // points at the picker rather than at one arbitrary subject's checkout.
    id: null,
    nzd: cheapest("NZD"),
    inr: cheapest("INR"),
    months: cheapestSingle?.p.accessMonths ?? null,
  };

  /* ------------------------------------------------------------- extras */

  const extras: ExtraPackage[] = products
    .filter((p) => !WRITTEN.has(p.slug) && p.items.some((i) => i.courseId !== null))
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      months: p.accessMonths,
      nzd: money(p, "NZD"),
      inr: money(p, "INR"),
      contents: p.items.map((item) =>
        item.course
          ? `${item.course.title} — ${item.course._count.subjects} subject${item.course._count.subjects === 1 ? "" : "s"}`
          : (item.subject?.title ?? "Contents being configured"),
      ),
    }));

  return { plans, extras };
}
