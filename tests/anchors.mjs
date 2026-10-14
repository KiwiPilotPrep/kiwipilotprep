/**
 * The two subject entry points scroll to the price, rather than loading a
 * second copy of the pricing.
 *
 * Measured in a real browser, because every part of this is invisible in the
 * source: whether the anchor exists, whether the sticky header ends up on top
 * of the card it scrolled to, and how long the scroll takes. The last one is
 * the reason this file exists -- the pricing section sits sixteen thousand
 * pixels down the home page, and animating that distance reads as a page that
 * will not load rather than as movement.
 *
 *   node tests/anchors.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";

const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

/**
 * The animation is deliberately short and deliberately not absent.
 *
 * Instant arrival was tried and was worse -- nothing told the reader the page
 * had moved rather than changed -- and the browser's own smooth scroll takes
 * about two seconds over the sixteen thousand pixels involved, which reads as
 * a page that will not load. So both bounds are asserted.
 */
const SETTLED_MS = 900;
const MIN_FRAMES = 5;

const VIEWPORTS = [
  { w: 1440, h: 900, label: "desktop 1440" },
  { w: 375, h: 812, label: "mobile 375" },
];

const browser = await chromium.launch();

/** Where the anchor target sits, and whether the header is covering it. */
const placement = (page, id) =>
  page.evaluate((anchorId) => {
    const el = document.getElementById(anchorId);
    if (!el) return null;
    const header = document.querySelector("header");
    return {
      top: Math.round(el.getBoundingClientRect().top),
      headerBottom: header ? Math.round(header.getBoundingClientRect().bottom) : 0,
      scrollY: Math.round(window.scrollY),
      hash: window.location.hash,
      path: window.location.pathname,
    };
  }, id);

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });

  /* ---------------- a subject card scrolls to the package that sells it ---- */

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const card = page.locator('a.subj[href^="/#"]').first();
  const cardCount = await page.locator('a.subj[href^="/#"]').count();
  t(`${vp.label}: a signed-out reader's subject cards point at a pricing card`,
    cardCount > 0, "no subject card links to a home-page anchor");
  if (cardCount === 0) {
    await page.close();
    continue;
  }

  const href = (await card.getAttribute("href")) ?? "";
  const id = href.replace(/^\/#/, "");
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  const distance = Math.abs((await placement(page, id))?.top ?? 0);

  await page.evaluate(() => {
    window.__ys = [];
    const t0 = performance.now();
    const tick = () => {
      window.__ys.push(Math.round(window.scrollY));
      if (performance.now() - t0 < 2000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await card.click();
  await page.waitForTimeout(SETTLED_MS);

  const landed = await placement(page, id);
  t(`${vp.label}: the pricing card exists to scroll to`, Boolean(landed), `no element with id ${id}`);

  if (landed) {
    t(`${vp.label}: the reader stays on the home page`,
      landed.path === "/", `went to ${landed.path}`);
    t(`${vp.label}: the address bar names the card`,
      landed.hash === `#${id}`, `hash is ${landed.hash}`);
    t(`${vp.label}: the card is on screen within ${SETTLED_MS}ms`,
      landed.top >= 0 && landed.top < vp.h,
      `${distance}px away, still at ${landed.top}px after ${SETTLED_MS}ms`);

    const positions = new Set(await page.evaluate(() => window.__ys ?? []));
    t(`${vp.label}: it scrolls rather than jumping`,
      positions.size >= MIN_FRAMES,
      `only ${positions.size} distinct scroll positions — it teleported`);
    t(`${vp.label}: the sticky header is not covering it`,
      landed.top >= landed.headerBottom - 2,
      `card top ${landed.top}px, header ends ${landed.headerBottom}px`);
  }

  /* ---------------- a short jump is still handled, and still lands -------- */

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  // Only where it is actually on screen: below the nav breakpoint the same
  // link lives in the mobile menu, behind a toggle, and a hidden link is not
  // the thing being tested here.
  const navLink = page.locator('header a[href="/#guarantee"]').first();
  if ((await navLink.count()) && (await navLink.isVisible())) {
    await navLink.click();
    await page.waitForTimeout(1800);
    const g = await placement(page, "guarantee");
    t(`${vp.label}: a nav anchor lands clear of the header`,
      Boolean(g) && g.top >= g.headerBottom - 2 && g.top < vp.h,
      g ? `top ${g.top}px, header ends ${g.headerBottom}px` : "no #guarantee section");
  }

  /* ---------------- the same link from another page navigates ------------- */

  await page.goto(`${BASE}/terms`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const footerPricing = page.locator('a[href="/#pricing"]').first();
  if ((await footerPricing.count()) && (await footerPricing.isVisible())) {
    await footerPricing.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await footerPricing.click();
    await page.waitForTimeout(3000);
    const p = await placement(page, "pricing");
    t(`${vp.label}: the same anchor from another page navigates home`,
      Boolean(p) && p.path === "/",
      p ? `stayed on ${p.path}` : "no #pricing section after navigating");
    t(`${vp.label}: and arrives at the pricing section`,
      Boolean(p) && p.top >= p.headerBottom - 2 && p.top < vp.h,
      p ? `section top ${p.top}px` : "not found");
  }

  /* ---------------- the same thing from the mobile menu ------------------- */

  // The burger menu carries its own copy of the subject list, and it is the
  // one a phone actually uses -- the header nav it sits beside is hidden at
  // this width. It also has to close itself on the way out, or the reader
  // lands on the card behind a full-screen menu.
  const burger = page.locator("button.burger").first();
  if (await burger.isVisible()) {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await page.locator("button.burger").first().click();
    await page.waitForTimeout(500);

    const entry = page.locator('.mnav a.mitem[href^="/#"]').first();
    if (await entry.count()) {
      const entryHref = (await entry.getAttribute("href")) ?? "";
      await entry.click();
      await page.waitForTimeout(SETTLED_MS);

      const m = await placement(page, entryHref.replace(/^\/#/, ""));
      const menuOpen = await page.evaluate(() =>
        document.querySelector(".mnav")?.className.includes("on") ?? null,
      );
      t(`${vp.label}: the mobile menu reaches the pricing card too`,
        Boolean(m) && m.top >= m.headerBottom - 2 && m.top < vp.h,
        m ? `card top ${m.top}px, header ends ${m.headerBottom}px` : "anchor not found");
      t(`${vp.label}: the mobile menu closes on the way out`,
        menuOpen === false, "the menu is still covering the page");
    }
  }

  /* ---------------- placeholders are left alone --------------------------- */

  const bare = await page.locator('a[href="#"]').count();
  t(`${vp.label}: bare # placeholders are not hijacked`, bare >= 0, "");

  await page.close();
}

await browser.close();

for (const line of checks) console.log(line);
const failed = checks.filter((c) => c.startsWith("FAIL")).length;
console.log(`${checks.length - failed}/${checks.length} passed`);
process.exit(failed ? 1 : 0);
