/**
 * The path to checkout.
 *
 * One page chooses the product; checkout charges for it. This suite is about
 * the seam between those two, because that is where the money was being lost:
 * a student clicked "Get PPL Package", was shown the whole catalogue again,
 * and had to pick the same thing a second time. Everything below asks the same
 * question in a different place — does the thing they chose survive?
 *
 * Three properties are checked throughout:
 *
 *   1. A click on a card reaches checkout for *that* product. Not a list.
 *   2. The product, the currency and the code survive a login and an email
 *      confirmation, because that detour is where context used to vanish.
 *   3. Nothing about the price is taken from the browser. A discount shown on
 *      a card is a preview; the server prices it again before charging.
 *
 * Real products are only ever read. Anything that creates an order does it
 * against throwaway `t9-` fixtures, removed at both ends of the run.
 *
 *   node tests/pricing-flow.mjs
 */
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

function loadEnv() {
  try {
    for (const line of fs.readFileSync(".env", "utf8").split(String.fromCharCode(10))) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const at = trimmed.indexOf("=");
      if (at < 0) continue;
      const key = trimmed.slice(0, at).trim();
      const value = trimmed.slice(at + 1).trim().replace(/^"|"$/g, "");
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* no .env is fine */
  }
}
loadEnv();

const BASE = process.env.TEST_BASE ?? "http://127.0.0.1:3100";
const db = new PrismaClient();

const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

/* ----------------------------------------------------------------- session */

let ipCounter = 0;
// Its own slice of the documentation range, so this suite does not share a
// rate-limit bucket with any other.
const nextIp = () => `203.0.113.${201 + (ipCounter++ % 40)}`;

class Visitor {
  constructor() {
    this.ip = nextIp();
    this.cookie = "";
  }
  async request(path, init = {}) {
    const res = await fetch(BASE + path, {
      ...init,
      redirect: "manual",
      headers: { ...(init.headers ?? {}), cookie: this.cookie, "x-forwarded-for": this.ip },
    });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(";");
      const [name] = pair.split("=");
      const rest = this.cookie.split("; ").filter((x) => x && !x.startsWith(`${name}=`));
      this.cookie = [...rest, pair].join("; ");
    }
    return res;
  }
  /** Follows redirects by hand so the trail itself can be asserted on. */
  async visit(path) {
    let res = await this.request(path);
    let hops = 0;
    const trail = [path];
    while (res.status >= 300 && res.status < 400 && hops++ < 6) {
      const loc = res.headers.get("location");
      const next = loc.startsWith("http") ? new URL(loc).pathname + new URL(loc).search : loc;
      trail.push(next);
      res = await this.request(next);
    }
    const body = await res.text();
    return {
      status: res.status,
      body,
      // React leaves comment markers between text nodes; strip them so a
      // phrase can be matched the way a reader sees it.
      text: body.replace(/<!--[\s\S]*?-->/g, ""),
      trail,
      landedOn: trail.at(-1),
    };
  }
  async json(path, body) {
    const res = await this.request(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
  }
  async actionId(path) {
    const html = await (await this.request(path)).text();
    return html.match(/ACTION_ID_([a-f0-9]+)/)?.[1];
  }
  async signup(name, email) {
    const id = await this.actionId("/signup");
    const fd = new FormData();
    fd.set("name", name);
    fd.set("consent", "on");
    fd.set("email", email);
    fd.set("password", "Southerly7!wind");
    fd.set(`$ACTION_ID_${id}`, "");
    await this.request("/signup", { method: "POST", body: fd });
    await db.user.update({
      where: { email },
      data: { emailVerifiedAt: new Date(), verifyTokenHash: null, verifyTokenExpiresAt: null },
    });
  }
  async login(email, next = "") {
    const id = await this.actionId(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
    const fd = new FormData();
    fd.set("email", email);
    fd.set("password", "Southerly7!wind");
    if (next) fd.set("next", next);
    fd.set(`$ACTION_ID_${id}`, "");
    return this.request("/login", { method: "POST", body: fd });
  }
}

/**
 * The same figure the page will print, built from the row it prints it from.
 *
 * These assertions used to name "$699" and "₹35,900" outright, which tied the
 * suite to one product's current price — and it broke the day somebody
 * repriced that product in the admin console, which is a thing they are
 * entitled to do.
 */
const money = (minor, currency) => {
  const major = minor / 100;
  const shown = major.toLocaleString(currency === "INR" ? "en-IN" : "en-NZ", {
    minimumFractionDigits: major % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${currency === "INR" ? "₹" : "$"}${shown}`;
};

/**
 * A product whose two prices are unmistakably different, so "is the page in
 * INR" can be answered by looking for one and not the other. A product priced
 * at 1.00 in both currencies could not answer it.
 */
async function distinctlyPricedProduct() {
  const candidates = await db.product.findMany({
    where: { status: "PUBLISHED", slug: { not: { startsWith: "t9-" } } },
    orderBy: { order: "asc" },
    include: { prices: true },
  });
  for (const product of candidates) {
    const nzd = product.prices.find((x) => x.currency === "NZD");
    const inr = product.prices.find((x) => x.currency === "INR");
    if (!nzd || !inr) continue;
    const a = money(nzd.amountMinor, "NZD");
    const b = money(inr.amountMinor, "INR");
    // Neither may contain the other, or "not present" proves nothing.
    if (a.slice(1) !== b.slice(1) && !b.includes(a.slice(1)) && !a.includes(b.slice(1))) {
      return { slug: product.slug, nzd: a, inr: b };
    }
  }
  throw new Error("No published product has two clearly different prices to test with.");
}

/** Mirrors COMING_SOON_SLUGS in lib/coming-soon.ts — one slug, one string. */
const COMING_SOON = ["cpl-flight-test-package"];
const isComingSoon = (slug) => COMING_SOON.includes(slug);

const unescape = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&middot;/g, "·")
    .replace(/&nbsp;/g, " ");

/* ------------------------------------------------------------- fixtures --- */

const stamp = Date.now().toString(36).slice(-6);
const BUYER = `pf-buyer-${stamp}@example.com`;
const LATE = `pf-late-${stamp}@example.com`;
const CTA = `pf-cta-${stamp}@example.com`;
const SUBJ = `pf-subj-${stamp}@example.com`;
const CODES = ["T9HALF", "T9GONE", "T9ELSE", "T9RUPEE", "T9SUB"];

async function cleanup() {
  const users = await db.user.findMany({
    where: { email: { startsWith: "pf-" } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (ids.length) {
    await db.couponRedemption.deleteMany({ where: { userId: { in: ids } } });
    await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
    await db.payment.deleteMany({ where: { order: { userId: { in: ids } } } });
    await db.order.deleteMany({ where: { userId: { in: ids } } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }
  await db.coupon.deleteMany({ where: { code: { in: CODES } } });
  await db.product.deleteMany({ where: { slug: { startsWith: "t9-" } } });
  await db.course.deleteMany({ where: { slug: { startsWith: "t9-" } } });
}

async function main() {
  await cleanup();

  const course = await db.course.create({
    data: {
      slug: "t9-track",
      title: "T9 Track",
      status: "DRAFT", // never shown on the public pricing page
      order: 97,
      subjects: { create: { slug: "t9-subject", title: "T9 Subject", status: "DRAFT", order: 0 } },
    },
  });

  // $200.00 NZD / ₹10,000.00 — clean numbers, so a 50% coupon is unambiguous.
  const fixture = await db.product.create({
    data: {
      slug: "t9-package",
      title: "T9 Package",
      status: "PUBLISHED",
      accessMonths: 1,
      order: 97,
      prices: {
        create: [
          { currency: "NZD", amountMinor: 20000 },
          { currency: "INR", amountMinor: 1000000 },
        ],
      },
      items: { create: { courseId: course.id } },
    },
  });
  const other = await db.product.create({
    data: {
      slug: "t9-other",
      title: "T9 Other",
      status: "PUBLISHED",
      accessMonths: 3,
      order: 98,
      prices: {
        create: [
          { currency: "NZD", amountMinor: 30000 },
          { currency: "INR", amountMinor: 1500000 },
        ],
      },
      items: { create: { courseId: course.id } },
    },
  });
  const unpublished = await db.product.create({
    data: {
      slug: "t9-hidden",
      title: "T9 Hidden",
      status: "DRAFT",
      accessMonths: 3,
      order: 99,
      prices: { create: [{ currency: "NZD", amountMinor: 40000 }] },
      items: { create: { courseId: course.id } },
    },
  });

  await db.coupon.createMany({
    data: [
      { code: "T9HALF", type: "PERCENT", value: 50, active: true },
      { code: "T9GONE", type: "PERCENT", value: 50, active: true, expiresAt: new Date(Date.now() - 86400000) },
      { code: "T9ELSE", type: "PERCENT", value: 50, active: true, productId: other.id },
      { code: "T9RUPEE", type: "PERCENT", value: 50, active: true, currency: "INR" },
      // Unrestricted, so it can be carried through a login on a real subject.
      { code: "T9SUB", type: "PERCENT", value: 10, active: true },
    ],
  });

  /* =================================================================== */
  /* A. the pricing page is the whole shop                               */
  /* =================================================================== */

  const anon = new Visitor();
  const pricing = await anon.visit("/pricing");
  const real = await db.product.findMany({
    where: { status: "PUBLISHED", slug: { not: { startsWith: "t9-" } } },
    include: { items: { select: { courseId: true, subjectId: true } } },
  });
  const realPackages = real.filter((p) => p.items.some((i) => i.courseId));
  const realSubjects = real.filter((p) => p.items.length > 0 && p.items.every((i) => i.subjectId));

  t("the pricing page loads", pricing.status === 200, `status ${pricing.status}`);

  const subjectCatalogue = await new Visitor().visit("/pricing/subject");
  // Packages are sold on /pricing; single subjects on /pricing/subject. Every
  // published product is offered on one of the two — nothing is stranded.
  const missing = real.filter(
    (p) => !pricing.body.includes(p.id) && !subjectCatalogue.body.includes(p.id),
  );
  t(
    "every published product is offered across the pricing surfaces",
    missing.length === 0,
    `missing: ${missing.map((p) => p.slug).join(", ")}`,
  );

  t(
    "it separates theory packages from groundwork and from single subjects",
    /Theory packages/.test(pricing.text) &&
      /Flight test groundwork/.test(unescape(pricing.text)) &&
      /Buy a single subject/.test(pricing.text),
    "one of the three section headings is missing",
  );

  // Each band carries an anchor, and each card carries its slug, so which
  // product sits in which section can be read off the markup rather than
  // guessed at from prose.
  const bands = ["theory-packages", "groundwork", "single-subject"].map((id) =>
    pricing.body.indexOf(`id="${id}"`),
  );
  t(
    "the sections run packages → groundwork → single subject",
    bands.every((i) => i >= 0) && bands[0] < bands[1] && bands[1] < bands[2],
    `anchors at ${bands.join(",")}`,
  );

  const sectionA = pricing.body.slice(bands[0], bands[1]);
  const sectionB = pricing.body.slice(bands[1], bands[2]);
  const theory = realPackages.filter((p) => p.slug.endsWith("-theory-package"));
  const groundwork = realPackages.filter((p) => p.slug.includes("flight-test"));
  const everything = realPackages.filter((p) => p.items.length > 1);

  t(
    "the three theory packages are in the theory section, and only those",
    theory.length === 3 &&
      theory.every((p) => sectionA.includes(`id="${p.slug}"`)) &&
      !groundwork.some((p) => sectionA.includes(`id="${p.slug}"`)),
    `${theory.length} theory packages found`,
  );
  t(
    "groundwork and the complete pass are in the second section",
    groundwork.length === 2 &&
      everything.length === 1 &&
      [...groundwork, ...everything].every((p) => sectionB.includes(`id="${p.slug}"`)),
    `${groundwork.length} groundwork, ${everything.length} all-inclusive`,
  );

  // The subject picker lives on its own focused page now; the pricing page
  // only carries a card that links to it. The picker's options are props on a
  // client component, so they live in the payload — one `subjectTitle` each.
  const subjectPage = await new Visitor().visit("/pricing/subject");
  const optionCount = (subjectPage.body.match(/subjectTitle/g) ?? []).length;
  t(
    "the single-subject page offers every subject sold on its own",
    realSubjects.length === 15 && optionCount === realSubjects.length,
    `${realSubjects.length} subject products, ${optionCount} options`,
  );
  t(
    "the pricing page links to that page rather than embedding the picker",
    pricing.body.includes('href="/pricing/subject"') &&
      !pricing.body.includes('id="single-subject-card"'),
    "the pricing page still embeds the subject picker",
  );

  const courseChoices = [...subjectPage.body.matchAll(/<option value="c[^"]*">([^<]+)<\/option>/g)].map(
    (m) => unescape(m[1]),
  );
  t(
    "the picker asks for a licence track first, and offers the three theory tracks",
    courseChoices.length === 3 &&
      courseChoices.some((c) => /PPL/.test(c)) &&
      courseChoices.some((c) => /CPL/.test(c)) &&
      courseChoices.some((c) => /IR/.test(c)),
    courseChoices.join(" | "),
  );
  t(
    "flight test groundwork is a package, never a track in the subject picker",
    !courseChoices.some((c) => /Flight Test/i.test(c)),
    courseChoices.join(" | "),
  );

  t(
    "a discount code can be entered on each package card",
    (pricing.text.match(/Have a discount code\?/g) ?? []).length >= 5,
    `${(pricing.text.match(/Have a discount code\?/g) ?? []).length} prompts`,
  );

  t(
    "the old bottom-of-page coupon panel is gone",
    !/Choose your course below/.test(pricing.text) && !/coupon-go/.test(pricing.body),
    "the 'go to checkout' coupon block is still rendered",
  );

  t(
    "an unpublished product is not for sale",
    !pricing.body.includes(unpublished.id),
    "a DRAFT product appeared on the pricing page",
  );

  /* =================================================================== */
  /* B. grammar — a single subject is the commonest first purchase       */
  /* =================================================================== */

  for (const [label, path] of [
    ["pricing page", "/pricing"],
    ["home page", "/"],
  ]) {
    const page = await new Visitor().visit(path);
    const flat = unescape(page.text).replace(/\s+/g, " ");
    t(
      `the ${label} says "1 month", never "1 months"`,
      !/\b1 months\b/.test(flat),
      flat.match(/.{0,40}1 months.{0,20}/)?.[0] ?? "",
    );
    t(
      `the ${label} says "1 subject", never "1 subjects"`,
      !/\b1 subjects\b/.test(flat),
      flat.match(/.{0,40}1 subjects.{0,20}/)?.[0] ?? "",
    );
  }

  /* =================================================================== */
  /* C. currency lives on the pricing page and is remembered             */
  /* =================================================================== */

  const sample = await distinctlyPricedProduct();
  const inr = await anon.visit("/pricing?currency=INR");
  t(
    "asking for INR prices the whole page in INR",
    inr.text.includes(sample.inr) && !inr.text.includes(sample.nzd),
    `${sample.slug}: expected ${sample.inr} and not ${sample.nzd}`,
  );
  // Read straight from the rows, so this fails if anyone ever converts in the
  // browser instead of showing the configured figure.
  const configured = await db.productPrice.findMany({
    where: { currency: "INR", product: { status: "PUBLISHED" } },
    select: { amountMinor: true },
  });
  const shown = [...new Set([...inr.text.matchAll(/₹([\d,]+)/g)].map((m) => m[1]))].filter(Boolean);
  const asMinor = new Set(configured.map((p) => p.amountMinor));
  t(
    "every INR figure on the page is one the database holds — nothing is converted",
    shown.length > 0 &&
      shown.every((v) => asMinor.has(Number(v.replace(/,/g, "")) * 100)),
    `shown: ${shown.join(", ")}`,
  );

  const toggler = new Visitor();
  const actionId = await toggler.actionId("/pricing");
  const fd = new FormData();
  fd.set("currency", "INR");
  fd.set(`$ACTION_ID_${actionId}`, "");
  const toggled = await toggler.request("/pricing", { method: "POST", body: fd });
  t(
    "the toggle remembers the choice",
    toggler.cookie.includes("kpp_currency=INR"),
    `cookie: ${toggler.cookie}`,
  );
  t("the toggle returns to the pricing page", toggled.status >= 300 && toggled.status < 400, `status ${toggled.status}`);

  const remembered = await toggler.visit("/pricing");
  t(
    "the remembered currency prices the page on the next visit, with no parameter",
    remembered.text.includes(sample.inr),
    `expected ${sample.inr} for ${sample.slug}`,
  );

  const homeInr = await toggler.visit("/");
  t(
    "the home page quotes the same currency the pricing page was left in",
    homeInr.text.includes(sample.inr),
    `expected ${sample.inr} for ${sample.slug}`,
  );

  const overridden = await toggler.visit("/pricing?currency=NZD");
  t(
    "a currency in the link wins over the remembered one, so a shared link shows what the sender saw",
    overridden.text.includes(sample.nzd),
    `expected ${sample.nzd} for ${sample.slug}`,
  );

  /* =================================================================== */
  /* D. a card goes straight to that product's checkout                  */
  /* =================================================================== */

  const buyer = new Visitor();
  await buyer.signup("Pricing Flow Buyer", BUYER);

  const straight = await buyer.visit(`/checkout/start?product=${fixture.id}&currency=NZD`);
  t(
    "choosing a product reaches its checkout without a second selection page",
    /^\/checkout\/[^/?]+$/.test(straight.landedOn) &&
      !straight.trail.some((s) => s.startsWith("/pricing")),
    `trail: ${straight.trail.join(" → ")}`,
  );
  // The application's own checkout, with the figures set out — not the
  // gateway. It used to arrive at `?pay=1`, which threw a payment window
  // over the page before the student had seen a total.
  t(
    "it stops at the order summary, and the payment window is not opened for them",
    /Order summary/.test(straight.text) &&
      /Total/.test(straight.text) &&
      !/[?&]pay=1/.test(straight.landedOn),
    `landed ${straight.landedOn}`,
  );
  t(
    "the summary names the product, the access window and the total",
    straight.text.includes("T9 Package") &&
      straight.text.includes("1 month from purchase") &&
      straight.text.includes("$200"),
    straight.text.replace(/\s+/g, " ").match(/Order summary.{0,220}/)?.[0] ?? "",
  );
  t(
    "and payment is a separate, deliberate step on that page",
    /Pay securely|Loading gateway|Simulate successful payment/.test(straight.text),
    "no payment control on the checkout page",
  );

  const firstOrder = await db.order.findFirst({
    where: { user: { email: BUYER } },
    orderBy: { createdAt: "desc" },
  });
  t(
    "the order is for exactly the product that was chosen",
    firstOrder?.productId === fixture.id,
    `ordered ${firstOrder?.productId}`,
  );
  t(
    "at the price the database holds, not one supplied by the browser",
    firstOrder?.amountMinor === 20000 && firstOrder?.currency === "NZD",
    `${firstOrder?.amountMinor} ${firstOrder?.currency}`,
  );

  const bogus = await buyer.visit("/checkout/start?product=not-a-real-id&currency=NZD");
  t(
    "an id that is not a product sells nothing",
    bogus.landedOn.startsWith("/pricing"),
    `landed ${bogus.landedOn}`,
  );
  const draft = await buyer.visit(`/checkout/start?product=${unpublished.id}&currency=NZD`);
  t(
    "an unpublished product cannot be bought by knowing its id",
    draft.landedOn.startsWith("/pricing"),
    `landed ${draft.landedOn}`,
  );
  t(
    "neither attempt left an order behind",
    (await db.order.count({ where: { user: { email: BUYER }, productId: { in: [unpublished.id] } } })) === 0,
    "an order exists for a product that is not for sale",
  );

  /* =================================================================== */
  /* E. the currency chosen on the page is the currency charged          */
  /* =================================================================== */

  const inrOrder = await buyer.visit(`/checkout/start?product=${other.id}&currency=INR`);
  t(
    "a purchase started in INR reaches the application checkout",
    /^\/checkout\/[^/?]+$/.test(inrOrder.landedOn),
    `landed ${inrOrder.landedOn}`,
  );
  t(
    "and that checkout is priced in INR, with no second currency choice to make",
    inrOrder.text.includes("₹15,000") && inrOrder.text.includes("INR"),
    inrOrder.text.replace(/\s+/g, " ").match(/Total.{0,60}/)?.[0] ?? "",
  );
  const otherOrder = await db.order.findFirst({
    where: { user: { email: BUYER }, productId: other.id },
    orderBy: { createdAt: "desc" },
  });
  t(
    "and is charged in INR at the configured INR price",
    otherOrder === null || otherOrder.currency === "INR",
    `${otherOrder?.currency} ${otherOrder?.amountMinor}`,
  );

  /* =================================================================== */
  /* F. signing in does not cost the student their choice                */
  /* =================================================================== */

  const late = new Visitor();
  const wanted = `/checkout/start?product=${fixture.id}&currency=INR&coupon=T9HALF`;
  const bounced = await late.request(wanted);
  const location = bounced.headers.get("location") ?? "";
  t(
    "a signed-out visitor is sent to log in",
    bounced.status >= 300 && bounced.status < 400 && location.includes("/login"),
    `status ${bounced.status} → ${location}`,
  );
  const next = decodeURIComponent(location.split("next=")[1] ?? "");
  t(
    "the product, the currency and the code all travel with them",
    next.includes(fixture.id) && next.includes("currency=INR") && next.includes("coupon=T9HALF"),
    `next = ${next}`,
  );
  t(
    "and they are sent to log in, not back to the pricing page",
    !location.includes("/pricing"),
    location,
  );

  await late.signup("Pricing Flow Late", LATE);
  // Signing up logs them in; start again from a clean session to prove the
  // login form itself carries the context.
  const returning = new Visitor();
  const afterLogin = await returning.login(LATE, next);
  const landed = afterLogin.headers.get("location") ?? "";
  t(
    "logging in returns them to the checkout they chose, not to the pricing page",
    landed.includes("/checkout/start") && landed.includes(fixture.id),
    `redirected to ${landed}`,
  );

  const resumed = await returning.visit(landed.startsWith("http") ? new URL(landed).pathname + new URL(landed).search : landed);
  t(
    "and that lands on the checkout for the product they picked",
    /^\/checkout\/[^/?]+$/.test(resumed.landedOn),
    `landed ${resumed.landedOn}`,
  );
  t(
    "with the discount already worked out and shown, nothing to enter again",
    /Discount/.test(resumed.text) && resumed.text.includes("T9HALF"),
    resumed.text.replace(/\s+/g, " ").match(/Discount.{0,80}/)?.[0] ?? "",
  );

  const resumedOrder = await db.order.findFirst({
    where: { user: { email: LATE } },
    orderBy: { createdAt: "desc" },
  });
  t(
    "the currency survived the login",
    resumedOrder?.currency === "INR",
    `${resumedOrder?.currency}`,
  );
  t(
    "the coupon survived the login and was applied",
    resumedOrder?.discountMinor === 500000 && resumedOrder?.amountMinor === 500000,
    `discount ${resumedOrder?.discountMinor}, charged ${resumedOrder?.amountMinor}`,
  );
  t(
    "the discount was worked out from the stored INR price, not from anything sent",
    resumedOrder?.amountMinor + resumedOrder?.discountMinor === 1000000,
    `${resumedOrder?.amountMinor} + ${resumedOrder?.discountMinor}`,
  );

  /* =================================================================== */
  /* G. the coupon preview is a preview                                  */
  /* =================================================================== */

  const previewer = new Visitor();
  const anonPreview = await previewer.json("/api/checkout/preview-coupon", {
    productId: fixture.id,
    currency: "NZD",
    code: "T9HALF",
  });
  t(
    "a signed-out visitor is asked to sign in rather than given a price",
    anonPreview.data.ok === false && anonPreview.data.needsLogin === true,
    JSON.stringify(anonPreview.data),
  );

  const ok = await buyer.json("/api/checkout/preview-coupon", {
    productId: other.id,
    currency: "NZD",
    code: "t9half",
  });
  t(
    "a valid code is priced against the database, lower case and all",
    ok.data.ok === true && ok.data.discount === "$150" && ok.data.total === "$150",
    JSON.stringify(ok.data),
  );

  const expired = await buyer.json("/api/checkout/preview-coupon", {
    productId: other.id,
    currency: "NZD",
    code: "T9GONE",
  });
  t(
    "an expired code is refused, with the reason",
    expired.data.ok === false && /expired/i.test(expired.data.reason ?? ""),
    JSON.stringify(expired.data),
  );

  const wrongProduct = await buyer.json("/api/checkout/preview-coupon", {
    productId: fixture.id,
    currency: "NZD",
    code: "T9ELSE",
  });
  t(
    "a code tied to another product is refused",
    wrongProduct.data.ok === false && /does not apply/i.test(wrongProduct.data.reason ?? ""),
    JSON.stringify(wrongProduct.data),
  );

  const wrongCurrency = await buyer.json("/api/checkout/preview-coupon", {
    productId: fixture.id,
    currency: "NZD",
    code: "T9RUPEE",
  });
  t(
    "a code that only works in one currency is refused in the other",
    wrongCurrency.data.ok === false && /INR/.test(wrongCurrency.data.reason ?? ""),
    JSON.stringify(wrongCurrency.data),
  );

  const nonsense = await buyer.json("/api/checkout/preview-coupon", {
    productId: fixture.id,
    currency: "NZD",
    code: "NOPE-NOPE",
  });
  t(
    "an unknown code is refused",
    nonsense.data.ok === false && /not recognised/i.test(nonsense.data.reason ?? ""),
    JSON.stringify(nonsense.data),
  );

  const usedByLate = await db.couponRedemption.count({
    where: { coupon: { code: "T9HALF" }, user: { email: LATE } },
  });
  const previewRedemptions = await db.couponRedemption.count({
    where: { coupon: { code: "T9HALF" }, user: { email: BUYER } },
  });
  t(
    "previewing a code redeems nothing",
    previewRedemptions === 0 && usedByLate <= 1,
    `buyer ${previewRedemptions}, late ${usedByLate}`,
  );

  const ordersBefore = await db.order.count({ where: { user: { email: BUYER } } });
  await buyer.json("/api/checkout/preview-coupon", {
    productId: other.id,
    currency: "NZD",
    code: "T9HALF",
  });
  t(
    "previewing a code creates no order",
    (await db.order.count({ where: { user: { email: BUYER } } })) === ordersBefore,
    "an order appeared from a preview",
  );

  /* =================================================================== */
  /* H. the server prices the coupon again before charging               */
  /* =================================================================== */

  // Valid when previewed, switched off a moment later. The student must not
  // be charged the discounted figure they were shown.
  await db.coupon.update({ where: { code: "T9HALF" }, data: { active: false } });
  const stale = await buyer.json("/api/checkout/create-order", {
    productId: other.id,
    currency: "NZD",
    couponCode: "T9HALF",
  });
  t(
    "a code withdrawn after it was previewed is refused at checkout",
    stale.status >= 400 && stale.data.couponRejected === true,
    `${stale.status} ${JSON.stringify(stale.data)}`,
  );
  await db.coupon.update({ where: { code: "T9HALF" }, data: { active: true } });

  const invented = await buyer.json("/api/checkout/create-order", {
    productId: other.id,
    currency: "NZD",
    amountMinor: 1,
    discountMinor: 29900,
    total: 1,
    price: 1,
  });
  const inventedOrder = invented.data.orderId
    ? await db.order.findUnique({ where: { id: invented.data.orderId } })
    : null;
  t(
    "a price sent by the browser is ignored — the order is at the database price",
    inventedOrder === null || (inventedOrder.amountMinor === 30000 && inventedOrder.discountMinor === 0),
    `${inventedOrder?.amountMinor} / discount ${inventedOrder?.discountMinor}`,
  );

  /* =================================================================== */
  /* I. single subjects buy the same way                                 */
  /* =================================================================== */

  const subjectProduct = realSubjects[0];
  const subjectBuyer = new Visitor();
  const subjectRoute = await subjectBuyer.request(
    `/checkout/start?product=${subjectProduct.id}&currency=NZD&coupon=T9HALF`,
  );
  const subjectNext = decodeURIComponent(
    (subjectRoute.headers.get("location") ?? "").split("next=")[1] ?? "",
  );
  t(
    "a single subject chosen while signed out keeps its product, currency and code too",
    subjectNext.includes(subjectProduct.id) &&
      subjectNext.includes("currency=NZD") &&
      subjectNext.includes("coupon=T9HALF"),
    `next = ${subjectNext}`,
  );
  t(
    "the picker knows the access window for each subject, so it can be stated before paying",
    ((await new Visitor().visit("/pricing/subject")).body.match(/accessMonths/g) ?? []).length > 0,
    "no access window reached the picker",
  );

  /* =================================================================== */
  /* J. there is no second product-selection page                        */
  /* =================================================================== */

  const subjectOnly = await new Visitor().visit("/pricing/subject");
  t(
    "the single-subject page is a real, focused page",
    subjectOnly.status === 200 && /Buy a single subject/.test(subjectOnly.text),
    `status ${subjectOnly.status}`,
  );
  t(
    "and it carries only the subject picker, not the whole catalogue again",
    subjectOnly.body.includes('id="single-subject-card"') &&
      realPackages.every((p) => !subjectOnly.body.includes(`id="${p.slug}"`)),
    "a package card leaked onto the single-subject page",
  );
  t(
    "the currency the visitor was browsing in is honoured on that page",
    (await new Visitor().visit("/pricing/subject?currency=INR")).text.includes("INR"),
    "currency not honoured on the single-subject page",
  );

  const home = await new Visitor().visit("/");
  const sellable = realPackages.filter((p) => !isComingSoon(p.slug));
  // The home page is now the whole shop, not a teaser that pushes people to a
  // second page: every buyable package carries the same discount prompt the
  // pricing page does, and the single subject is chosen and bought inline.
  const homePrompts = (unescape(home.body).match(/Have a discount code\?/g) ?? []).length;
  t(
    "every package on sale carries a discount prompt on the home page itself",
    homePrompts === sellable.length,
    `${homePrompts} discount prompts for ${sellable.length} sellable packages`,
  );
  t(
    "the home page offers a single subject via a link to its own focused page",
    unescape(home.body).includes('href="/pricing/subject"') &&
      !unescape(home.body).includes('id="single-subject-card"'),
    "the home single-subject link to its dedicated page is missing",
  );
  t(
    "a product that is not on sale shows Coming Soon and no buy control on the home page",
    /Coming Soon/.test(unescape(home.text)) &&
      // no static checkout link survives for it, and buying is a button not a link
      !/href="\/checkout\/start/.test(home.body),
    "a coming-soon product still had a buy link on the home page",
  );
  t(
    "the home page carries no dead coupon box",
    !/Choose your course below/.test(home.text) && !/coupon-go/.test(home.body),
    "a stale coupon box remains on the home page",
  );

  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  t(
    "the sitemap advertises the single-subject page",
    sitemap.includes("/pricing/subject"),
    "sitemap does not list the single-subject page",
  );

  /* =================================================================== */
  /* L. the coupon box on the card, driven the way a student drives it   */
  /* =================================================================== */

  // Everything above this point talks to the server directly. A discount
  // entered on a pricing card is a browser affair — the prompt only becomes a
  // field when it is clicked, and the answer is drawn from a response — so it
  // has to be proved in a real one.
  {
    let browser = null;
    try {
      const { chromium } = await import("playwright");
      browser = await chromium.launch();
    } catch (e) {
      checks.push(`SKIP  the coupon box on a card (no browser here: ${String(e).slice(0, 60)})`);
    }

    if (browser) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      // The cookie notice is a fixed bar; pre-dismiss it so it never sits over a
      // button mid-click. A real visitor clicks "Got it"; this is that, up front.
      await page.addInitScript(() => { try { localStorage.setItem("kpp_cookie_notice", "seen"); } catch {} });
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      /** The payment control is live — the gateway script has finished loading. */
      const gatewayReady = () =>
        page
          .getByRole("button", { name: /Pay securely|Simulate successful payment/ })
          .first()
          .waitFor({ timeout: 25_000 });

      /**
       * Is the payment window actually in front of the student?
       *
       * Not "has the gateway been contacted" — Razorpay's script fetches its
       * configuration and builds a `.razorpay-container` the moment it loads,
       * on any checkout page, paying or not. That container sits at
       * display:none until the modal opens, so measuring it is the only
       * honest answer; network traffic and its mere presence are not.
       */
      const paymentWindowOpen = () =>
        page.evaluate(() => {
          const el = document.querySelector(".razorpay-container");
          if (!el) return false;
          const box = el.getBoundingClientRect();
          return getComputedStyle(el).display !== "none" && box.width > 0 && box.height > 0;
        });

      await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
      await page.fill("#email", BUYER);
      await page.fill("#password", "Southerly7!wind");
      // The form is a server action: wait for it to take them off /login
      // rather than for the network to fall quiet, or the next page is
      // fetched before the session cookie exists.
      await Promise.all([
        page.waitForURL((u) => !u.toString().includes("/login"), { timeout: 20_000 }),
        page.click("form button[type=submit]"),
      ]);
      t(
        "a student can sign in before choosing",
        (await page.context().cookies()).some((c) => c.name === "kpp_session"),
        `landed ${page.url()}`,
      );

      await page.goto(`${BASE}/pricing`, { waitUntil: "networkidle" });
      const card = page.locator(`#${await db.product.findUnique({ where: { id: other.id }, select: { slug: true } }).then((p) => p.slug)}`);

      t(
        "the card shows a price and a prompt, not a coupon field",
        (await card.locator(".coupon-link").count()) === 1 &&
          (await card.locator(".coupon-row input").count()) === 0,
        "the field is on the card before anyone asked for it",
      );

      await card.locator(".coupon-link").click();
      t(
        "asking for the field opens it",
        await card.locator(".coupon-row input").isVisible(),
        "the field did not appear",
      );

      await card.locator(".coupon-row input").fill("T9HALF");
      await card.getByRole("button", { name: "Apply" }).click();
      await card.locator(".coupon-ok, .coupon-bad").first().waitFor({ timeout: 10_000 });
      const applied = (await card.locator(".coupon-ok").textContent()) ?? "";
      t(
        "a valid code reports the discount and the new total",
        /T9HALF/.test(applied) && applied.includes("$150"),
        applied.replace(/\s+/g, " ").trim(),
      );

      await card.locator(".coupon-row input").fill("NOSUCHCODE");
      await card.getByRole("button", { name: "Apply" }).click();
      await card.locator(".coupon-bad").first().waitFor({ timeout: 10_000 });
      const refused = (await card.locator(".coupon-bad").textContent()) ?? "";
      t(
        "a code that is not recognised says so, and takes the discount away",
        /not recognised/i.test(refused) && (await card.locator(".coupon-ok").count()) === 0,
        refused.replace(/\s+/g, " ").trim(),
      );

      // Back to the good code, then buy — the discount must be on the order
      // because the server worked it out again, not because the card said so.
      await card.locator(".coupon-row input").fill("T9HALF");
      await card.getByRole("button", { name: "Apply" }).click();
      await card.locator(".coupon-ok").first().waitFor({ timeout: 10_000 });
      await card.getByRole("button", { name: /^Get / }).click();
      await page.waitForURL(/\/checkout\/[a-z0-9]+$/i, { timeout: 20_000 });
      t(
        "the card's button reaches the application checkout for that product",
        /\/checkout\/[a-z0-9]+$/i.test(page.url()) && !page.url().includes("pay=1"),
        page.url(),
      );

      // The point of the whole correction: a payment window must not be
      // standing open when they arrive. It used to be.
      await gatewayReady();
      t(
        "no payment window is open on arrival",
        (await paymentWindowOpen()) === false,
        "the gateway modal was already over the page",
      );
      t(
        "the order summary is what they actually see",
        await page.getByText("Order summary").isVisible(),
        "the summary was not on screen",
      );
      const summaryText = (await page.locator(".panel").first().innerText()).replace(/\s+/g, " ");
      t(
        "the checkout sets out the product, the discount and the total before paying",
        /T9 Other/.test(summaryText) &&
          /Discount/.test(summaryText) &&
          /T9HALF/.test(summaryText) &&
          /Total/.test(summaryText),
        summaryText.slice(0, 180),
      );
      // The label starts as "Loading gateway…" and becomes "Pay securely" once
      // Razorpay's script is in; either way it is a button they must press.
      const payButton = page.getByRole("button", {
        name: /Pay securely|Loading gateway|Simulate successful payment/,
      });
      await payButton.first().waitFor({ timeout: 25_000 });
      t(
        "paying is a separate control the student chooses",
        (await payButton.count()) >= 1 && (await payButton.first().isEnabled()),
        "no payment control on the checkout page",
      );

      // And it does open the window when they choose it — the step exists, it
      // is simply theirs to take. (The label becomes "Opening…" on click, so
      // the button is no longer matched by name from here on.)
      await payButton.first().click();
      await page.waitForFunction(
        () => {
          const el = document.querySelector(".razorpay-container");
          return Boolean(el) && getComputedStyle(el).display !== "none";
        },
        undefined,
        { timeout: 25_000 },
      ).catch(() => {});
      t(
        "pressing it is what opens the payment window",
        await paymentWindowOpen(),
        "the payment control did not open the gateway",
      );

      const cardOrder = await db.order.findFirst({
        where: { user: { email: BUYER }, productId: other.id },
        orderBy: { createdAt: "desc" },
      });
      t(
        "and the order carries the discount, priced by the server",
        cardOrder?.discountMinor === 15000 && cardOrder?.amountMinor === 15000,
        `discount ${cardOrder?.discountMinor}, charged ${cardOrder?.amountMinor}`,
      );

      // The currency toggle is a form, so it works without JavaScript too —
      // but it must not be broken by having it.
      await page.goto(`${BASE}/pricing`, { waitUntil: "networkidle" });
      await page.getByRole("button", { name: "INR ₹" }).click();
      // A server action is a fetch and a re-render, not a page load, so the
      // usual load states have nothing to report.
      await page.waitForURL(/currency=INR/, { timeout: 20_000 });
      await page.locator(".plan .amt .c").first().filter({ hasText: "INR" }).waitFor({ timeout: 10_000 });
      t(
        "the toggle reprices every card on the page",
        (await page.locator(".plan .amt .c", { hasText: "NZD" }).count()) === 0 &&
          (await page.locator(".plan .amt .c", { hasText: "INR" }).count()) > 5,
        `${await page.locator(".plan .amt .c", { hasText: "NZD" }).count()} cards still in NZD`,
      );

      await page.getByRole("button", { name: "NZD $" }).click();
      await page.waitForURL(/currency=NZD/, { timeout: 20_000 });
      await page.locator(".plan .amt .c").first().filter({ hasText: "NZD" }).waitFor({ timeout: 10_000 });
      t(
        "and switches back again",
        (await page.locator(".plan .amt .c", { hasText: "INR" }).count()) === 0,
        "cards stayed in INR",
      );

      /* ---- the single subject, on its own focused page ---------------- */

      await page.goto(`${BASE}/pricing/subject`, { waitUntil: "networkidle" });
      const subject = page.locator("#single-subject-card");
      t(
        "the single-subject page shows one picker card, not the whole catalogue",
        (await subject.count()) === 1 &&
          (await page.locator(".plan:not(.subject-card)").count()) === 0 &&
          !(await page.locator("body").innerText()).includes("1 · Choose your course"),
        "the single-subject page is not focused",
      );
      t(
        "and it offers nothing to buy until a subject is chosen",
        await subject.getByRole("button", { name: "Get Subject" }).isDisabled(),
        "the button was live before a subject existed",
      );

      await page.selectOption("#course", { index: 1 });
      // Choosing a track re-renders the subject list; it is disabled until
      // there is something in it.
      await page.locator("#subject:not([disabled])").waitFor({ timeout: 10_000 });
      const wantedSubject = (await page.locator("#subject option").nth(1).textContent())?.trim() ?? "";
      await page.selectOption("#subject", { index: 1 });
      await subject.locator(".coupon-link").waitFor({ timeout: 10_000 });

      const shownPrice = (await subject.locator(".amt").innerText()).replace(/\s+/g, " ");
      const shownAccess = (await subject.locator(".vchip").innerText()).replace(/\s+/g, " ");
      t(
        "choosing a course then a subject prices it in place, on the same card",
        /\$\d/.test(shownPrice) && shownPrice.includes("NZD") && /1 month access/.test(shownAccess),
        `${shownPrice} / ${shownAccess}`,
      );

      await subject.locator(".coupon-link").click();
      await subject.locator(".coupon-row input").fill("T9HALF");
      await subject.getByRole("button", { name: "Apply" }).click();
      await subject.locator(".coupon-ok, .coupon-bad").first().waitFor({ timeout: 10_000 });
      const subjectCoupon = (await subject.locator(".coupon-ok").textContent()) ?? "";
      t(
        "a single subject takes a discount code of its own",
        /T9HALF/.test(subjectCoupon) && /Discount/.test(subjectCoupon),
        subjectCoupon.replace(/\s+/g, " ").trim(),
      );

      await subject.getByRole("button", { name: /^Get / }).click();
      await page.waitForURL(/\/checkout\/[a-z0-9]+$/i, { timeout: 20_000 });
      const subjectSummary = (await page.locator(".panel").first().innerText()).replace(/\s+/g, " ");
      t(
        "Get Subject opens the checkout for that exact subject, with no page in between",
        subjectSummary.includes(wantedSubject) && !page.url().includes("pay=1"),
        `${page.url()} — ${subjectSummary.slice(0, 140)}`,
      );
      t(
        "the subject's discount came through with it",
        /T9HALF/.test(subjectSummary) && /Discount/.test(subjectSummary),
        subjectSummary.slice(0, 200),
      );
      await gatewayReady();
      t(
        "and no payment window opened on the way",
        (await paymentWindowOpen()) === false,
        "the gateway modal was over the page on arrival",
      );

      const subjectOrder = await db.order.findFirst({
        where: { user: { email: BUYER }, product: { slug: { startsWith: "subject-" } } },
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { items: { select: { subject: { select: { title: true } } } } } },
        },
      });
      t(
        "the order is for the subject that was selected",
        subjectOrder?.product.items[0]?.subject?.title === wantedSubject,
        `${subjectOrder?.product.items[0]?.subject?.title} vs ${wantedSubject}`,
      );

      t("nothing on the pricing page throws in the browser", errors.length === 0, errors.join(" | "));
      await browser.close();
    }
  }

  /* =================================================================== */
  /* L2. the currency control, as a visitor sees it                      */
  /* =================================================================== */

  // A sentence saying "switch currency on the pricing page" is not a currency
  // control. This section only accepts two buttons that are on the screen when
  // the page loads, sit above the prices they govern, look different when
  // selected, and change the figures when pressed.
  {
    let browser = null;
    try {
      const { chromium } = await import("playwright");
      browser = await chromium.launch();
    } catch (e) {
      checks.push(`SKIP  the currency control (no browser here: ${String(e).slice(0, 60)})`);
    }

    if (browser) {
      for (const [w, h, size] of [
        [1440, 900, "desktop"],
        [768, 1024, "tablet"],
        [390, 844, "mobile"],
      ]) {
        const page = await browser.newPage({ viewport: { width: w, height: h } });
        await page.addInitScript(() => { try { localStorage.setItem("kpp_cookie_notice", "seen"); } catch {} });
        await page.goto(`${BASE}/pricing`, { waitUntil: "networkidle" });

        const control = page.locator(".cur-switch");
        const nzdBtn = control.getByRole("button", { name: "NZD $" });
        const inrBtn = control.getByRole("button", { name: "INR ₹" });

        /** Opacity through every ancestor — what the eye actually receives. */
        const seen = (loc) =>
          loc.evaluate((el) => {
            let o = 1;
            let n = el;
            while (n && n !== document.documentElement) {
              o *= Number(getComputedStyle(n).opacity);
              n = n.parentElement;
            }
            return o;
          });

        t(
          `${size}: both currency buttons are on the pricing page`,
          (await nzdBtn.count()) === 1 &&
            (await inrBtn.count()) === 1 &&
            (await nzdBtn.isVisible()) &&
            (await inrBtn.isVisible()),
          `${await nzdBtn.count()} NZD, ${await inrBtn.count()} INR`,
        );
        t(
          `${size}: and are actually painted, not faded out waiting for a scroll`,
          (await seen(nzdBtn)) === 1 && (await seen(inrBtn)) === 1,
          `opacity ${await seen(nzdBtn)} / ${await seen(inrBtn)}`,
        );

        const nzdBox = await nzdBtn.boundingBox();
        const firstCard = await page.locator(".plan").first().boundingBox();
        t(
          `${size}: they are in the first screenful, with nothing to scroll or open`,
          nzdBox !== null && nzdBox.y >= 0 && nzdBox.y + nzdBox.height <= h,
          `y=${Math.round(nzdBox?.y ?? -1)} in a ${h}px viewport`,
        );
        t(
          `${size}: and above the first product card, not below the prices`,
          nzdBox !== null && firstCard !== null && nzdBox.y + nzdBox.height < firstCard.y,
          `control ends ${Math.round((nzdBox?.y ?? 0) + (nzdBox?.height ?? 0))}, first card at ${Math.round(firstCard?.y ?? 0)}`,
        );
        t(
          `${size}: they are a real touch target, not a line of text`,
          nzdBox !== null && nzdBox.height >= 40 && nzdBox.width >= 60,
          `${Math.round(nzdBox?.width ?? 0)}x${Math.round(nzdBox?.height ?? 0)}`,
        );

        // Selected and unselected must not merely differ by a class name.
        const paint = (loc) =>
          loc.evaluate((el) => {
            const cs = getComputedStyle(el);
            return { bg: cs.backgroundColor, fg: cs.color, pressed: el.getAttribute("aria-pressed") };
          });
        const onPaint = await paint(nzdBtn);
        const offPaint = await paint(inrBtn);
        t(
          `${size}: the selected currency is obvious to look at`,
          onPaint.bg !== offPaint.bg &&
            onPaint.pressed === "true" &&
            offPaint.pressed === "false",
          `${JSON.stringify(onPaint)} vs ${JSON.stringify(offPaint)}`,
        );

        // And it actually reprices the page it is on.
        const nzdPrice = await page.locator(".plan .amt .v").first().innerText();
        await inrBtn.click();
        await page.waitForURL(/currency=INR/, { timeout: 20_000 });
        await page.locator(".plan .amt .c").first().filter({ hasText: "INR" }).waitFor({ timeout: 10_000 });
        const inrPrice = await page.locator(".plan .amt .v").first().innerText();
        t(
          `${size}: pressing INR reprices the pricing page itself`,
          inrPrice !== nzdPrice && inrPrice.includes("₹"),
          `${nzdPrice} -> ${inrPrice}`,
        );
        t(
          `${size}: and the INR button is now the selected one`,
          (await paint(control.getByRole("button", { name: "INR ₹" }))).bg === onPaint.bg,
          "the selected state did not move",
        );

        await control.getByRole("button", { name: "NZD $" }).click();
        await page.waitForURL(/currency=NZD/, { timeout: 20_000 });
        await page.locator(".plan .amt .c").first().filter({ hasText: "NZD" }).waitFor({ timeout: 10_000 });
        t(
          `${size}: pressing NZD brings the NZD prices back`,
          (await page.locator(".plan .amt .v").first().innerText()) === nzdPrice,
          `expected ${nzdPrice}`,
        );

        // The single subject has its own page with its own currency control;
        // that it reprices there is covered by the dedicated-page checks below.

        /* --- and the same control in the home page's pricing section --- */
        await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
        const homeControl = page.locator("#pricing .cur-switch");
        // Read down the page the way a person does, so the section's own
        // fade-in has a chance to fire before anything is measured.
        for (let y = 0; y < 5000; y += 400) {
          await page.evaluate((to) => window.scrollTo({ top: to, behavior: "instant" }), y);
          await page.waitForTimeout(60);
        }
        await homeControl.scrollIntoViewIfNeeded();
        await page.waitForTimeout(900);
        const homeNzd = homeControl.getByRole("button", { name: "NZD $" });
        const homeInr = homeControl.getByRole("button", { name: "INR ₹" });
        t(
          `${size}: the home page's pricing section carries the control too`,
          (await homeNzd.isVisible()) &&
            (await homeInr.isVisible()) &&
            (await seen(homeNzd)) === 1,
          `visible ${await homeNzd.isVisible()}, opacity ${await seen(homeNzd)}`,
        );
        t(
          `${size}: and does not tell people to go elsewhere to change currency`,
          !/switch currency on the/i.test(await page.locator("#pricing").innerText()),
          "the home page still points at another page for currency",
        );

        await homeNzd.click();
        await page.locator("#pricing .plan .amt .c").first().filter({ hasText: "NZD" }).waitFor({ timeout: 10_000 });
        const homeBefore = await page.locator("#pricing .plan .amt .v").first().innerText();
        await homeInr.click();
        await page.locator("#pricing .plan .amt .c").first().filter({ hasText: "INR" }).waitFor({ timeout: 10_000 });
        const homeAfter = await page.locator("#pricing .plan .amt .v").first().innerText();
        t(
          `${size}: pressing INR there reprices that section on the spot`,
          homeAfter !== homeBefore && homeAfter.includes("₹"),
          `${homeBefore} -> ${homeAfter}`,
        );
        // The home cards now buy through the same BuyButton the pricing page
        // uses (a button, not a link), so "currency carries" is proved by the
        // discount prompt being present on every sellable card rather than by
        // a href — the click path is exercised in the home-buy checks.
        t(
          `${size}: every sellable home card carries a discount prompt`,
          (await page.locator("#pricing .coupon-link").count()) >= 5,
          `${await page.locator("#pricing .coupon-link").count()} discount prompts`,
        );

        await page.close();
      }

      // Every figure the control can show must be one the database holds —
      // the proof that nothing is being converted in the browser. Read off the
      // cards, because that is what a visitor sees.
      const shownEverywhere = new Set();
      {
        const reader = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        await reader.addInitScript(() => { try { localStorage.setItem("kpp_cookie_notice", "seen"); } catch {} });
        for (const currency of ["NZD", "INR"]) {
          await reader.goto(`${BASE}/pricing?currency=${currency}`, { waitUntil: "networkidle" });
          for (const shown of await reader.locator(".plan .amt").allInnerTexts()) {
            const m = /([₹$])\s*([\d,]+)/.exec(shown.replace(/\s+/g, " "));
            if (!m) continue;
            shownEverywhere.add(
              `${m[1] === "₹" ? "INR" : "NZD"}:${Number(m[2].replace(/,/g, "")) * 100}`,
            );
          }
        }
        await reader.close();
      }
      const held = new Set(
        (
          await db.productPrice.findMany({
            where: { product: { status: "PUBLISHED" } },
            select: { currency: true, amountMinor: true },
          })
        ).map((row) => `${row.currency}:${row.amountMinor}`),
      );
      const invented = [...shownEverywhere].filter((k) => !held.has(k));
      t(
        "every figure either side of the toggle is a configured price, never a conversion",
        invented.length === 0,
        invented.join(", "),
      );

      await browser.close();
    }
  }

  /* =================================================================== */
  /* M. every CTA on the page, one at a time                             */
  /* =================================================================== */

  // The acceptance test in plain form: press each button on the pricing page
  // and see where it puts you. Not one of them may reach a catalogue, a course
  // chooser, a subject chooser or another pricing page, and not one of them
  // may reach the gateway.
  {
    const ctaBuyer = new Visitor();
    await ctaBuyer.signup("Pricing Flow CTA", CTA);

    const selectionPages = [/^\/pricing/, /^\/courses/, /\/subject\b/];
    const results = [];

    for (const product of [...realPackages, realSubjects[0]].filter(
      (p) => !isComingSoon(p.slug),
    )) {
      const hop = await ctaBuyer.visit(`/checkout/start?product=${product.id}&currency=NZD`);
      const detour = hop.trail
        .slice(1, -1)
        .concat(hop.landedOn)
        .find((step) => selectionPages.some((re) => re.test(step)));
      const order = await db.order.findFirst({
        where: { user: { email: CTA }, productId: product.id },
        orderBy: { createdAt: "desc" },
      });
      results.push({
        slug: product.slug,
        ok:
          /^\/checkout\/[^/?]+$/.test(hop.landedOn) &&
          detour === undefined &&
          order?.productId === product.id,
        detail: `${hop.landedOn}${detour ? ` via ${detour}` : ""}`,
      });
    }

    const strays = results.filter((r) => !r.ok);
    t(
      "every CTA on the pricing page opens the checkout for its own product, and nothing else",
      results.length === 6 && strays.length === 0,
      strays.map((r) => `${r.slug} → ${r.detail}`).join("; "),
    );

    // The one that is not for sale: its own check, so "blocked" is proved
    // rather than quietly skipped.
    for (const product of realPackages.filter((p) => isComingSoon(p.slug))) {
      const before = await db.order.count({ where: { productId: product.id } });
      const hop = await ctaBuyer.visit(`/checkout/start?product=${product.id}&currency=NZD`);
      t(
        `a product that is not on sale cannot be bought by link (${product.slug})`,
        hop.landedOn.startsWith("/pricing") &&
          (await db.order.count({ where: { productId: product.id } })) === before,
        `landed ${hop.landedOn}`,
      );
    }
    t(
      "and none of them passes through a catalogue, a course chooser or a subject chooser",
      strays.length === 0,
      strays.map((r) => r.detail).join("; "),
    );
    t(
      "each one is charged at its own configured price",
      (
        await Promise.all(
          [...realPackages, realSubjects[0]]
            .filter((product) => !isComingSoon(product.slug))
            .map(async (product) => {
              const order = await db.order.findFirst({
                where: { user: { email: CTA }, productId: product.id },
                orderBy: { createdAt: "desc" },
              });
              const price = await db.productPrice.findFirst({
                where: { productId: product.id, currency: "NZD" },
              });
              return order?.amountMinor === price?.amountMinor;
            }),
        )
      ).every(Boolean),
      "an order was priced at something other than the product's NZD price",
    );
  }

  /* =================================================================== */
  /* N. a single subject bought from a standing start, signed out        */
  /* =================================================================== */

  {
    const stranger = new Visitor();
    const wantedSubject = realSubjects[1];
    const route = `/checkout/start?product=${wantedSubject.id}&currency=INR&coupon=T9SUB`;
    const sentAway = await stranger.request(route);
    const to = sentAway.headers.get("location") ?? "";
    t(
      "a signed-out visitor choosing a subject is sent to log in, not to a chooser",
      to.includes("/login") && !to.includes("/pricing"),
      to,
    );

    const back = decodeURIComponent(to.split("next=")[1] ?? "");
    await stranger.signup("Pricing Flow Subject", SUBJ);

    const fresh = new Visitor();
    const after = await fresh.login(SUBJ, back);
    const goingTo = after.headers.get("location") ?? "";
    const arrived = await fresh.visit(
      goingTo.startsWith("http") ? new URL(goingTo).pathname + new URL(goingTo).search : goingTo,
    );
    t(
      "after logging in they land on that subject's checkout, with no choice to make again",
      /^\/checkout\/[^/?]+$/.test(arrived.landedOn) &&
        !arrived.trail.some((step) => step.startsWith("/pricing")),
      `trail: ${arrived.trail.join(" → ")}`,
    );

    const subjOrder = await db.order.findFirst({
      where: { user: { email: SUBJ } },
      orderBy: { createdAt: "desc" },
    });
    t(
      "for exactly that subject",
      subjOrder?.productId === wantedSubject.id,
      `${subjOrder?.productId} vs ${wantedSubject.id}`,
    );
    t(
      "in the currency they were browsing in",
      subjOrder?.currency === "INR",
      `${subjOrder?.currency}`,
    );
    t(
      "with the code they entered before logging in already applied",
      subjOrder?.couponCode === "T9SUB" && (subjOrder?.discountMinor ?? 0) > 0,
      `${subjOrder?.couponCode}, discount ${subjOrder?.discountMinor}`,
    );
  }

  /* =================================================================== */
  /* K. nothing sensitive travels in a URL                               */
  /* =================================================================== */

  t(
    "the checkout link carries an id and a currency — never an amount",
    !/[?&](amount|price|total|discountMinor)=/.test(unescape(home.body)),
    "a price appeared in a link",
  );
  t(
    "and no card exposes a payment key or order secret",
    !/rzp_(test|live)_/.test(pricing.body.replace(/checkout\.razorpay\.com/g, "")),
    "a gateway key appeared on the pricing page",
  );

  await cleanup();

  console.log(checks.join("\n"));
  const failed = checks.filter((c) => c.startsWith("FAIL")).length;
  console.log(`\n${checks.filter((c) => c.startsWith("PASS")).length}/${checks.length} passed`);
  await db.$disconnect();
  process.exit(failed ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await cleanup().catch(() => {});
  await db.$disconnect();
  process.exit(1);
});
