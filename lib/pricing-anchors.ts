import "server-only";

import { cache } from "react";

import { db } from "./db";

/**
 * Which package sells which course, for the links that scroll to its price.
 *
 * The subject menu in the header and the subject cards further down the home
 * page both need this, and they are rendered by different components -- a
 * layout and a section -- so without memoising it the same rows are fetched
 * twice on every request to the busiest page on the site. Measured: two extra
 * round trips to a hosted database cost the home page about a tenth of its
 * time to first byte.
 *
 * Single-subject products are excluded by the query rather than filtered after
 * it. There are twenty-one of them and none has a card on the home page, so an
 * anchor naming one would scroll nowhere -- and the first matching product is
 * the one that wins, which makes the distinction load-bearing rather than
 * cosmetic.
 */
export const pricingAnchorByCourse = cache(async function pricingAnchorByCourse(): Promise<
  Map<string, string>
> {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED", items: { some: { courseId: { not: null } } } },
    orderBy: { order: "asc" },
    select: { slug: true, items: { select: { courseId: true } } },
  });

  const byCourse = new Map<string, string>();
  for (const product of products) {
    for (const item of product.items) {
      // Ordered by `order`, so the package dedicated to one course is reached
      // before the all-inclusive pass that also contains it.
      if (item.courseId && !byCourse.has(item.courseId)) {
        byCourse.set(item.courseId, product.slug);
      }
    }
  }
  return byCourse;
});

/** Where a reader who cannot open a course should be sent to buy it. */
export function pricingAnchorFor(byCourse: Map<string, string>, courseId: string): string {
  return `/#${byCourse.get(courseId) ?? "pricing"}`;
}
