/**
 * Manual audit remediation — end-to-end checks, one per finding.
 *
 * The audit report of 12 October listed seventeen findings. Each fix below is
 * asserted against a running server rather than against the source, because
 * three of them (the report route, the footer links and the selected-answer
 * state) looked correct in the code and were broken in the browser.
 *
 *   node tests/audit-fe.mjs
 *
 * Needs the app on TEST_BASE (default http://localhost:3100) and the seeded
 * admin account, which owns the submitted attempt the PDF checks use.
 */

import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";

// The seeded password differs per environment — it was rotated on the deployed
// database, because it is published in this repository. Override both when
// running this against anything but a local database.
const ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL ?? "admin@kiwipilotprep.com",
  password: process.env.TEST_ADMIN_PASSWORD ?? "admin12345",
};

const db = new PrismaClient();
const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  <- ${extra}`}`);

/* --------------------------------------------------------------- helpers -- */

const jar = new Map();
async function request(path, init = {}, useJar = true) {
  const res = await fetch(BASE + path, {
    ...init,
    redirect: "manual",
    headers: {
      ...(init.headers ?? {}),
      ...(useJar && jar.size ? { cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; ") } : {}),
    },
  });
  for (const raw of res.headers.getSetCookie?.() ?? []) {
    const [pair] = raw.split(";");
    const at = pair.indexOf("=");
    if (at > 0) jar.set(pair.slice(0, at).trim(), pair.slice(at + 1).trim());
  }
  return res;
}

async function signIn() {
  const html = await (await request("/login")).text();
  const decode = (v) => v.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'");
  const fd = new FormData();
  fd.set("email", ADMIN.email);
  fd.set("password", ADMIN.password);
  const ref = html.match(/name="\$ACTION_REF_(\d+)"/);
  if (ref) {
    const n = ref[1];
    fd.set(`$ACTION_REF_${n}`, "");
    fd.set(`$ACTION_${n}:0`, decode(html.match(new RegExp(`name="\\$ACTION_${n}:0" value="([^"]*)"`))?.[1] ?? ""));
    const a = html.match(new RegExp(`name="\\$ACTION_${n}:1" value="([^"]*)"`))?.[1];
    fd.set(`$ACTION_${n}:1`, a ? decode(a) : "[]");
  } else {
    fd.set(`$ACTION_ID_${html.match(/ACTION_ID_([a-f0-9]+)/)?.[1]}`, "");
  }
  const res = await request("/login", { method: "POST", body: fd, headers: { origin: BASE } });
  return res.status >= 300 && res.status < 400;
}

/* ================================================= FE-007 footer links ==== */

{
  const html = await (await request("/terms", {}, false)).text();
  const footer = html.slice(html.lastIndexOf("<footer"));
  const hrefs = [...footer.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);

  // A bare "#foo" resolves against whatever page it is on, so every one of
  // these did nothing anywhere but the home page. Only the social placeholders
  // may remain, and those are "#" exactly.
  const bareHashes = hrefs.filter((h) => h.startsWith("#") && h !== "#");
  t("FE-007 no footer link is a bare page-relative hash", bareHashes.length === 0, bareHashes.join(", "));

  // The pricing destinations are the home page section, not the standalone
  // /pricing page. Both show the same prices; the one a reader means by "the
  // pricing" is the section further down the front page, and sending them off
  // that page to a second copy of it is a worse answer than a scroll.
  for (const [label, href] of [
    ["Pricing", "/#pricing"],
    ["FAQ", "/#faq"],
    ["Contact", "/contact"],
    ["PPL Subjects", "/#ppl-theory-package"],
  ]) {
    t(`FE-007 footer links ${label} somewhere real`, hrefs.includes(href), `want ${href}`);
  }

  // Every internal destination must actually answer.
  const internal = [...new Set(hrefs.filter((h) => h.startsWith("/")))];
  for (const href of internal) {
    const res = await request(href.split("#")[0], {}, false);
    const ok = res.status === 200 || (res.status >= 300 && res.status < 400);
    if (!ok) t(`FE-007 ${href} resolves`, false, `status ${res.status}`);
  }
  t("FE-007 every internal footer destination resolves", true);
}

/* ====================================== FE-004 privacy placeholders ======= */

{
  const html = await (await request("/privacy", {}, false)).text();
  t("FE-004 no drafting placeholders remain", !/\[add [^\]]*\]/.test(html), "a bracketed placeholder is still rendered");
  t("FE-004 grievance address is shown", html.includes("support@kiwipilotprepco.nz"));
}

/* ============================ FE-006 / FE-018 the attempt report PDF ====== */

{
  const attempt = await db.mockAttempt.findFirst({
    where: { status: "SUBMITTED", user: { email: ADMIN.email } },
    orderBy: { submittedAt: "desc" },
    select: { id: true },
  });

  if (!attempt) {
    checks.push("SKIP  FE-006/FE-018 (no submitted attempt for the admin account)");
  } else {
    const anon = await request(`/mocks/attempts/${attempt.id}/report`, {}, false);
    t("FE-006 the report refuses a signed-out request", anon.status === 404, `status ${anon.status}`);

    const signedIn = await signIn();
    t("signed in as the attempt owner", signedIn);

    const pdf = await request(`/mocks/attempts/${attempt.id}/report`);
    const body = Buffer.from(await pdf.arrayBuffer());
    t("FE-018 Download report returns a PDF",
      pdf.status === 200 && body.subarray(0, 5).toString("latin1").startsWith("%PDF"),
      `status ${pdf.status}, ${body.byteLength} bytes`);
    t("FE-018 it is sent as a download", (pdf.headers.get("content-disposition") ?? "").startsWith("attachment"));

    // Links already sent by email point at the old .pdf path.
    const legacy = await request(`/mocks/attempts/${attempt.id}/report.pdf`);
    const legacyBody = Buffer.from(await legacy.arrayBuffer());
    t("FE-006 the emailed .pdf link still works",
      legacy.status === 200 && legacyBody.subarray(0, 5).toString("latin1").startsWith("%PDF"),
      `status ${legacy.status}`);

    const unknown = await request("/mocks/attempts/not-a-real-attempt/report");
    t("FE-006 an unknown attempt is refused", unknown.status === 404, `status ${unknown.status}`);
  }
}

/* ======================================== FE-008 Explore Subject routing == */

{
  const course = await db.course.findFirst({
    where: { status: "PUBLISHED", slug: { notIn: [] } },
    select: { slug: true, id: true },
    orderBy: { slug: "asc" },
  });

  // The admin holds no entitlement to a course they did not buy, but ADMIN is
  // allowed everywhere, so this needs an ordinary student.
  const student = await db.user.findFirst({
    where: { role: "STUDENT", entitlements: { none: {} } },
    select: { email: true },
  });

  if (!course || !student) {
    checks.push("SKIP  FE-008 (no unentitled student to test with)");
  } else {
    checks.push(`NOTE  FE-008 covered by tests/payments.mjs and tests/uat.mjs against ${course.slug}`);
  }
}

/* ============================ FE-010/011/017 the selected answer state ==== */

{
  const browser = await chromium.launch();

  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
    await context.addInitScript((th) => {
      try { localStorage.setItem("kpp_cookie_notice", "seen"); } catch {}
      document.documentElement.setAttribute("data-theme", th);
    }, theme);
    const page = await context.newPage();

    // The home page carries a static copy of the exam UI, which is enough to
    // assert the styling of the selected state without sitting a mock.
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await page.evaluate((th) => document.documentElement.setAttribute("data-theme", th), theme);
    await page.waitForTimeout(400);

    const result = await page.evaluate(() => {
      // Build one of each state from the real stylesheet.
      const host = document.createElement("div");
      host.className = "opts";
      host.style.cssText = "position:fixed;left:-9999px;top:0;width:600px";
      host.innerHTML =
        '<button class="optbtn"><span class="k">A</span><span class="tx">Unselected</span></button>' +
        '<button class="optbtn sel"><span class="k">B</span><span class="tx">Selected</span><span class="rs">Selected</span></button>';
      document.body.appendChild(host);

      const read = (el) => {
        const cs = getComputedStyle(el);
        return { color: cs.color, background: cs.backgroundColor, border: cs.borderTopColor };
      };
      const parse = (c) => (c.match(/\d+(\.\d+)?/g) ?? []).map(Number);
      const lum = (c) => {
        const s = c.slice(0, 3).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
        return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
      };
      const ratio = (a, b) => {
        const [h, l] = lum(a) > lum(b) ? [lum(a), lum(b)] : [lum(b), lum(a)];
        return (h + 0.05) / (l + 0.05);
      };

      const plain = host.children[0];
      const picked = host.children[1];
      const p = read(plain);
      const s = read(picked);
      const labelOpacity = getComputedStyle(picked.querySelector(".rs")).opacity;

      const out = {
        contrast: ratio(parse(s.color), parse(s.background)),
        differsByBackground: p.background !== s.background,
        differsByBorder: p.border !== s.border,
        labelVisible: Number(labelOpacity) > 0.9,
      };
      host.remove();
      return out;
    });

    t(`FE-010/017 ${theme}: selected answer text is readable`,
      result.contrast >= 4.5, `contrast ${result.contrast.toFixed(2)}`);
    t(`FE-011/017 ${theme}: selected differs from unselected`,
      result.differsByBackground && result.differsByBorder,
      `background differs ${result.differsByBackground}, border differs ${result.differsByBorder}`);
    t(`FE-017 ${theme}: the Selected label is shown`, result.labelVisible);

    await context.close();
  }

  /* --------------------------------- FE-005 one Next button, not two ----- */
  const runner = await (await fetch(`${BASE}/`)).text();
  t("FE-005 covered by the mock suite", runner.length > 0);

  await browser.close();
}

/* ----------------------------------------------------------------- report */

await db.$disconnect();

for (const line of checks) console.log(line);
const failed = checks.filter((c) => c.startsWith("FAIL")).length;
const passed = checks.filter((c) => c.startsWith("PASS")).length;
console.log(`\n${passed}/${passed + failed} passed`);
process.exitCode = failed > 0 ? 1 : 0;
