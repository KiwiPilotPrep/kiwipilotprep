import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * The subject menu and the subject cards send a visitor to `/#<product slug>`.
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

describe("the subject entry points stay off the standalone pricing page", () => {
  it.each([
    "app/(marketing)/layout.tsx",
    "components/site/CourseTracks.tsx",
    "components/site/Footer.tsx",
    "components/site/Header.tsx",
    "components/site/MobileNav.tsx",
    "app/(student)/courses/[courseSlug]/page.tsx",
  ])("%s points at the home page section", (file) => {
    const src = readFileSync(file, "utf8");
    // `/pricing#…` is the shape that was wrong: it looks like a scroll and is
    // in fact a page load onto a second copy of the same prices.
    expect(src).not.toMatch(/["'`]\/pricing#/);
  });
});
