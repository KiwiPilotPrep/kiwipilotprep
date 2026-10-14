import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * The subject menu and the subject cards send a reader to `/#<product slug>`.
 * That only scrolls anywhere if the home page carries an element with that id,
 * and nothing in the type system connects the two: a renamed product slug, or
 * a card rebuilt without its id, turns every one of those links into a no-op
 * that leaves the reader at the top of the page wondering what happened.
 *
 * So the anchors are asserted against the slugs the links are built from.
 */
const SECTION = readFileSync("components/site/PricingSection.tsx", "utf8");

/** Course-selling packages, in the order the home page lays them out. */
const PACKAGE_SLUGS = [
  "ppl-theory-package",
  "cpl-theory-package",
  "ir-theory-package",
  "ppl-flight-test-package",
  "cpl-flight-test-package",
  "complete-aviator-pass",
];

describe("home page pricing anchors", () => {
  it("has a section the Pricing nav link can reach", () => {
    expect(SECTION).toContain('id="pricing"');
  });

  it.each(PACKAGE_SLUGS)("has an anchor for %s", (slug) => {
    expect(SECTION).toContain(`id="${slug}"`);
  });

  it("gives every anchored card room to clear the sticky header", () => {
    const css = readFileSync("app/globals.css", "utf8");
    expect(css).toMatch(/\.plan\[id\]\s*{[^}]*scroll-margin-top/);
  });
});

/**
 * Nothing in the product links at the standalone pricing page any more.
 *
 * There is one set of prices and it is on the front page. The second copy was
 * reachable from fourteen places — a checkout somebody had not finished, a
 * failed payment, the trial, the guarantee, the mocks panel — and arriving
 * there without context is the complaint that removed it. The route survives
 * as a redirect, so a typed address or an old link still lands on the prices,
 * but nothing should be sending anyone through it on purpose.
 */
describe("nothing links at the standalone pricing page", () => {
  const SURFACES = [
    "app/(marketing)/layout.tsx",
    "app/(marketing)/page.tsx",
    "app/(marketing)/flight-schools/page.tsx",
    "app/(marketing)/verify/sent/page.tsx",
    "app/(marketing)/verify/confirmed/page.tsx",
    "app/(purchase)/checkout/start/page.tsx",
    "app/(student)/checkout/[orderId]/page.tsx",
    "app/(student)/checkout/[orderId]/failed/page.tsx",
    "app/(student)/courses/page.tsx",
    "app/(student)/courses/[courseSlug]/page.tsx",
    "app/(student)/guarantee/page.tsx",
    "app/(student)/mocks/page.tsx",
    "app/(student)/trial/page.tsx",
    "components/site/CourseTracks.tsx",
    "components/site/Footer.tsx",
    "components/site/Header.tsx",
    "components/site/MobileNav.tsx",
  ];

  /**
   * Every spelling that reaches the second page, as literals.
   *
   * The quote characters are the point — they are what separates a link to
   * `/pricing` from one to `/pricing/subject`, which is a real page and stays
   * — so they are written out rather than hidden inside a pattern.
   */
  const SHAPES = ['"/pricing"', "'/pricing'", "`/pricing`", "/pricing?", "/pricing#"];

  it.each(SURFACES)("%s sends people to the front page instead", (file) => {
    const src = readFileSync(file, "utf8");
    expect(SHAPES.filter((shape) => src.includes(shape))).toEqual([]);
  });

  it("keeps the route itself, as a redirect rather than a 404", () => {
    const src = readFileSync("app/(marketing)/pricing/page.tsx", "utf8");
    expect(src).toContain("redirect(");
    expect(src).toContain("#pricing");
  });

  it("carries the checkout's own reasons through to the section", () => {
    const start = readFileSync("app/(purchase)/checkout/start/page.tsx", "utf8");
    // A refused code, a course not yet on sale and a product that is gone each
    // bounce the reader back to the prices with the reason. If these stopped
    // being carried, the bounce would look like the click had done nothing.
    expect(start).toContain("coupon=rejected");
    expect(start).toContain("soon=1");
    expect(start).toContain("error=unavailable");

    const section = readFileSync("components/site/PricingSection.tsx", "utf8");
    expect(section).toContain("coupon-rejected");
    expect(section).toContain("coming-soon");
    expect(section).toContain("unavailable");
  });

  it("does not advertise a redirect in the sitemap", () => {
    const src = readFileSync("app/sitemap.ts", "utf8");
    expect(src).not.toContain("/pricing`");
    // The single-subject page is a real page and stays listed.
    expect(src).toContain("/pricing/subject");
  });
});

/**
 * The front page is the only pricing surface, so it cannot be a fixed list.
 *
 * §19 requires the prices to be driven by what is in the database: an
 * administrator who publishes a package must see it offered without waiting
 * for someone to write a card for it. The six known packages keep their
 * written copy; anything else is described from its own rows.
 */
describe("the pricing surface is product-driven", () => {
  it("renders published packages that have no written card", () => {
    expect(SECTION).toContain("extras");
    expect(SECTION).toContain("extraCta");
  });

  it("reads every published product rather than only the six", () => {
    const src = readFileSync("lib/home-pricing.ts", "utf8");
    expect(src).toContain('where: { status: "PUBLISHED" }');
    expect(src).toContain("extras");
  });

  it("does not try to sell somebody a package they already hold", () => {
    expect(SECTION).toContain("You already have this");
    const home = readFileSync("app/(marketing)/page.tsx", "utf8");
    expect(home).toContain("ownedProductIds");
  });
});
