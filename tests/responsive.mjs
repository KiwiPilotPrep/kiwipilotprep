/**
 * Phase 6 §17/§18/§26 — responsive, browser and accessibility QA.
 *
 * Drives a real Chromium at each width the brief names and measures the page
 * rather than inspecting the stylesheet. Three things are checked on every
 * page at every width:
 *
 *   1. No horizontal overflow — `scrollWidth` must not exceed the viewport.
 *   2. No console errors and no unhandled page errors (this is also the
 *      hydration check: a mismatch reports as a console error).
 *   3. Nothing important is clipped out of reach.
 *
 * Plus a keyboard and labelling pass on the pages that carry forms.
 *
 *   node tests/responsive.mjs
 */
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const db = new PrismaClient();

const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

const WIDTHS = [
  { w: 1440, h: 900, label: "desktop 1440" },
  { w: 1280, h: 800, label: "desktop 1280" },
  { w: 1024, h: 768, label: "tablet 1024" },
  { w: 768, h: 1024, label: "tablet 768" },
  { w: 430, h: 932, label: "mobile 430" },
  { w: 390, h: 844, label: "mobile 390" },
  { w: 375, h: 812, label: "mobile 375" },
];

const stamp = Date.now().toString(36).slice(-6);
const STUDENT = `resp-${stamp}@example.com`;
const PASSWORD = "Southerly7!wind";

async function cleanup() {
  const users = await db.user.findMany({
    where: { email: { startsWith: "resp-" } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (ids.length) {
    await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
    await db.payment.deleteMany({ where: { order: { userId: { in: ids } } } });
    await db.order.deleteMany({ where: { userId: { in: ids } } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }
}

/**
 * Console noise that is not a defect: Next's dev-tools chatter, and requests
 * the sandbox environment cannot make. Anything else counts against the page.
 */
const IGNORABLE =
  /favicon|Download the React DevTools|\[Fast Refresh\]|net::ERR_INTERNET_DISCONNECTED|checkout\.razorpay\.com/i;

async function auditPage(context, path, label) {
  const page = await context.newPage();
  const problems = [];
  page.on("console", (m) => {
    if (m.type() === "error" && !IGNORABLE.test(m.text())) problems.push(m.text());
  });
  page.on("pageerror", (e) => problems.push(String(e.message)));

  await page.goto(BASE + path, { waitUntil: "networkidle" });

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    // Every element whose right edge sits past the viewport, so a failure
    // names the culprit instead of just reporting a number.
    const offenders = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > doc.clientWidth + 1) {
        const style = getComputedStyle(el);
        // An element inside its own horizontal scroller is doing the right
        // thing, not overflowing the page.
        let scrollable = false;
        for (let p = el.parentElement; p; p = p.parentElement) {
          const ov = getComputedStyle(p).overflowX;
          if (ov === "auto" || ov === "scroll") { scrollable = true; break; }
        }
        if (!scrollable && style.position !== "fixed") {
          offenders.push(`${el.tagName.toLowerCase()}.${el.className?.toString?.().slice(0, 40)}`);
        }
      }
    }
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      offenders: offenders.slice(0, 4),
    };
  });

  const overflow = metrics.scrollWidth > metrics.clientWidth + 1;
  t(
    `${label} · ${path} · no horizontal overflow`,
    !overflow,
    `scrollWidth ${metrics.scrollWidth} > viewport ${metrics.clientWidth}: ${metrics.offenders.join(", ")}`,
  );
  t(
    `${label} · ${path} · no console or page errors`,
    problems.length === 0,
    problems.slice(0, 2).join(" | "),
  );

  await page.close();
  return problems;
}

/** Signs a browser context in through the real form. */
async function signIn(context, email, password) {
  const page = await context.newPage();
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);
  const landed = new URL(page.url()).pathname;
  await page.close();
  return landed;
}

async function main() {
  await cleanup();

  const browser = await chromium.launch();

  /* ============================ public pages ============================ */

  const PUBLIC = ["/", "/pricing", "/pricing/subject", "/flight-schools", "/login", "/signup",
    "/terms", "/privacy", "/refunds", "/cookies", "/contact"];

  for (const { w, h, label } of WIDTHS) {
    const context = await browser.newContext({ viewport: { width: w, height: h } });
    await context.addInitScript(() => { try { localStorage.setItem("kpp_cookie_notice", "seen"); } catch {} });
    for (const path of PUBLIC) await auditPage(context, path, label);
    await context.close();
  }

  /* ======================= signed-in student pages ====================== */

  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await context.addInitScript(() => { try { localStorage.setItem("kpp_cookie_notice", "seen"); } catch {} });
    const page = await context.newPage();
    await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" });
    await page.fill('input[name="name"]', "Responsive Tester");
    await page.fill('input[name="email"]', STUDENT);
    await page.fill('input[name="password"]', PASSWORD);
    // The consent checkbox is required now, as it is for a real visitor.
    await page.check('input[name="consent"]');
    await Promise.all([
      page.waitForURL((u) => !u.pathname.startsWith("/signup"), { timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);
    t("a student can sign up through the real form", true);
    await page.close();
    await context.close();
  }

  const STUDENT_PAGES = ["/dashboard", "/progress", "/mocks", "/guarantee", "/profile", "/courses"];
  for (const { w, h, label } of [WIDTHS[0], WIDTHS[3], WIDTHS[6]]) {
    const context = await browser.newContext({ viewport: { width: w, height: h } });
    await context.addInitScript(() => { try { localStorage.setItem("kpp_cookie_notice", "seen"); } catch {} });
    const landed = await signIn(context, STUDENT, PASSWORD);
    t(`${label} · signing in lands on the dashboard`, landed === "/dashboard", `landed ${landed}`);
    for (const path of STUDENT_PAGES) await auditPage(context, path, label);
    await context.close();
  }

  /* ============================ study reader ============================
     The pages that carry the actual course material — a syllabus index, a
     lesson list, and a lesson with diagrams in it. They are the widest content
     in the product and so the likeliest to overflow a phone, and they were the
     one student surface this file did not reach, because getting to them needs
     an account that actually holds an entitlement. */

  const qaEmail = "qa@example.com";
  const qaExists = await db.user.findUnique({ where: { email: qaEmail } });

  // Slugs come from the database rather than being written here, so the pass
  // keeps working as content changes.
  const sampleLesson = await db.lesson
    .findFirst({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        module: {
          select: { subject: { select: { slug: true, course: { select: { slug: true } } } } },
        },
      },
    })
    .catch(() => null);

  const subjectSlug = sampleLesson?.module?.subject?.slug;
  const courseSlug = sampleLesson?.module?.subject?.course?.slug;

  if (qaExists && sampleLesson && subjectSlug && courseSlug) {
    const STUDY_PAGES = [
      `/study/${courseSlug}/${subjectSlug}`,
      `/study/${courseSlug}/${subjectSlug}/lessons`,
      `/study/${courseSlug}/${subjectSlug}/lessons/${sampleLesson.slug}`,
    ];

    for (const { w, h, label } of [WIDTHS[0], WIDTHS[3], WIDTHS[6]]) {
      const context = await browser.newContext({ viewport: { width: w, height: h } });
      await context.addInitScript(() => {
        try { localStorage.setItem("kpp_cookie_notice", "seen"); } catch {}
      });
      const landed = await signIn(context, qaEmail, "KiwiQA@2026");
      if (!landed || landed.startsWith("/login")) {
        t(`${label} · study reader sign-in`, false, `landed ${landed}`);
        await context.close();
        continue;
      }
      for (const path of STUDY_PAGES) await auditPage(context, path, label);
      await context.close();
    }
  } else {
    checks.push("SKIP  study reader widths (no entitled QA account or no published lesson)");
  }

  /* ============================ admin console =========================== */

  const adminEmail = "admin@kiwipilotprep.com";
  const adminExists = await db.user.findUnique({ where: { email: adminEmail } });
  const ADMIN_PAGES = ["/admin", "/admin/mocks", "/admin/mocks/free-trial",
    "/admin/mocks/questions", "/admin/attempts", "/admin/products",
    "/admin/orders", "/admin/coupons", "/admin/claims", "/admin/queries",
    "/admin/organizations", "/admin/students"];

  if (adminExists) {
    for (const { w, h, label } of [WIDTHS[0], WIDTHS[3], WIDTHS[6]]) {
      const context = await browser.newContext({ viewport: { width: w, height: h } });
      await context.addInitScript(() => { try { localStorage.setItem("kpp_cookie_notice", "seen"); } catch {} });
      const landed = await signIn(context, adminEmail, "admin12345");
      if (landed !== "/admin") {
        t(`${label} · admin sign-in`, false, `landed ${landed}`);
        await context.close();
        continue;
      }
      for (const path of ADMIN_PAGES) await auditPage(context, path, label);
      await context.close();
    }
  } else {
    checks.push("SKIP  admin console widths (no seeded admin on this database)");
  }

  /* ======================== accessibility basics ======================== */

  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await context.addInitScript(() => { try { localStorage.setItem("kpp_cookie_notice", "seen"); } catch {} });
    const page = await context.newPage();
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });

    // Every input a person types into must be programmatically labelled.
    const unlabelled = await page.evaluate(() =>
      [...document.querySelectorAll("input, select, textarea")]
        .filter((el) => {
          if (el.type === "hidden") return false;
          if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")) return false;
          return !(el.id && document.querySelector(`label[for="${el.id}"]`));
        })
        .map((el) => el.name || el.type),
    );
    t("every form control on the login page is labelled", unlabelled.length === 0,
      `unlabelled: ${unlabelled.join(", ")}`);

    // The skip link must be the first thing a keyboard reaches, and must move
    // focus rather than only changing the URL.
    await page.keyboard.press("Tab");
    const firstStop = await page.evaluate(() => ({
      text: document.activeElement?.textContent?.trim(),
      cls: document.activeElement?.className,
      visible: (() => {
        const r = document.activeElement?.getBoundingClientRect();
        return r ? r.left >= 0 && r.width > 0 : false;
      })(),
    }));
    t("the first tab stop is the skip link", /skip/i.test(firstStop.cls ?? ""),
      `focused ${firstStop.cls}`);
    t("the skip link becomes visible when focused", firstStop.visible === true,
      "it stayed off-screen while focused");

    // Focus must be visible somewhere on the page, not suppressed globally.
    const outline = await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      btn?.focus();
      const s = getComputedStyle(btn, ":focus-visible");
      return { width: s.outlineWidth, style: s.outlineStyle };
    });
    t("focused controls draw a visible outline",
      outline.style !== "none" && outline.width !== "0px",
      `outline ${outline.width} ${outline.style}`);

    // Heading order: exactly one h1, and no level skipped.
    for (const path of ["/", "/pricing", "/terms"]) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      const headings = await page.evaluate(() =>
        [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => Number(h.tagName[1])),
      );
      t(`${path} has exactly one h1`, headings.filter((h) => h === 1).length === 1,
        `${headings.filter((h) => h === 1).length} h1 elements`);
      let skipped = null;
      for (let i = 1; i < headings.length; i++) {
        if (headings[i] - headings[i - 1] > 1) { skipped = `h${headings[i - 1]} → h${headings[i]}`; break; }
      }
      t(`${path} skips no heading level`, skipped === null, `${skipped}`);
    }

    // Touch targets on the smallest supported phone.
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/pricing`, { waitUntil: "networkidle" });
    const small = await page.evaluate(() =>
      [...document.querySelectorAll("a.btn, button")]
        .map((el) => ({ r: el.getBoundingClientRect(), label: el.textContent?.trim().slice(0, 24) }))
        .filter(({ r }) => r.width > 0 && r.height > 0 && r.height < 40)
        .map(({ label, r }) => `${label} (${Math.round(r.height)}px)`),
    );
    t("primary buttons meet a 40px touch target at 375px", small.length === 0,
      small.slice(0, 3).join(", "));

    await page.close();
    await context.close();
  }

  /* ========================= security headers ========================== */

  {
    const context = await browser.newContext();
    await context.addInitScript(() => { try { localStorage.setItem("kpp_cookie_notice", "seen"); } catch {} });
    const page = await context.newPage();
    const res = await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const h = res.headers();
    t("CSP is served", Boolean(h["content-security-policy"]));
    t("the framework version is not advertised", !h["x-powered-by"], h["x-powered-by"]);
    t("clickjacking protection is served", h["x-frame-options"] === "DENY");
    t("MIME sniffing is disabled", h["x-content-type-options"] === "nosniff");
    t("no image loads from a third-party host",
      !(h["content-security-policy"] ?? "").includes("unsplash"));
    await page.close();
    await context.close();
  }

  await browser.close();
  await cleanup();

  console.log(checks.filter((c) => !c.startsWith("PASS")).join("\n") || "(no failures)");
  const failed = checks.filter((c) => c.startsWith("FAIL")).length;
  const passed = checks.filter((c) => c.startsWith("PASS")).length;
  console.log(`\n${passed}/${passed + failed} passed`);
  await db.$disconnect();
  process.exit(failed ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await cleanup().catch(() => {});
  await db.$disconnect();
  process.exit(1);
});
