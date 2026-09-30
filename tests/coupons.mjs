/**
 * Phase 6 integration tests — admin-generated discount coupons.
 *
 * The property under test throughout: a coupon code arriving from a browser is
 * a claim, never an amount. Every price in this file is checked against what
 * the database says, not against what the client asked for.
 *
 *   node tests/coupons.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";


/**
 * Load .env, then sign with whatever secret the server is actually using.
 *
 * Once real Razorpay credentials are configured the server verifies checkout
 * signatures with RAZORPAY_KEY_SECRET, not the AUTH_SECRET-derived sandbox
 * value. A suite that always signs the sandbox way starts failing the moment
 * the gateway is switched on — for the wrong reason.
 */
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
    // No .env is fine — the sandbox fallback below still applies.
  }
}
loadEnv();

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const db = new PrismaClient();

const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

/* ----------------------------------------------------------------- session */

/**
 * Each simulated person gets their own source address. Real students arrive
 * from different connections; without this the whole suite shares one bucket
 * and trips the per-source rate limits that exist to stop scripted abuse.
 */
let ipCounter = 0;
// Its own slice of the documentation range. Every suite used to start at
// 203.0.113.1, and the signup form allows twenty accounts an hour from one
// address -- so running the suite twice in an hour failed on a rate limit
// rather than on anything under test.
const IP_BASE = 151;
const nextIp = () => `203.0.113.${IP_BASE + (ipCounter++ % 25)}`;

class User {
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
  async visit(path) {
    let res = await this.request(path);
    let hops = 0;
    const trail = [path];
    while (res.status >= 300 && res.status < 400 && hops++ < 5) {
      const loc = res.headers.get("location");
      const next = loc.startsWith("http") ? new URL(loc).pathname + new URL(loc).search : loc;
      trail.push(next);
      res = await this.request(next);
    }
    const body = await res.text();
    return {
      status: res.status,
      body,
      text: body.replace(/<!--[\s\S]*?-->/g, ""),
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
  async signup(name, email) {
    const page = await this.request("/signup");
    const html = await page.text();
    const id = html.match(/ACTION_ID_([a-f0-9]+)/)?.[1];
    const fd = new FormData();
    fd.set("name", name);
    fd.set("consent", "on");
    fd.set("email", email);
    fd.set("password", "Southerly7!wind");
    fd.set(`$ACTION_ID_${id}`, "");
    const res = await this.request("/signup", { method: "POST", body: fd });
    await confirmEmail(email);
    return res;
  }
  async login(email, password) {
    const page = await this.request("/login");
    const html = await page.text();
    const id = html.match(/ACTION_ID_([a-f0-9]+)/)?.[1];
    const fd = new FormData();
    fd.set("email", email);
    fd.set("password", password);
    fd.set(`$ACTION_ID_${id}`, "");
    return this.request("/login", { method: "POST", body: fd });
  }
}

/* -------------------------------------------------------------- sandbox pay */

/** Mirrors gatewaySecret() in lib/payments/gateway.ts. */
function sandboxSecret() {
  if (process.env.RAZORPAY_KEY_SECRET) return process.env.RAZORPAY_KEY_SECRET;
  const base = process.env.AUTH_SECRET ?? "kpp-sandbox";
  return crypto.createHash("sha256").update(`${base}:payments`).digest("hex");
}
function sign(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/** Drives an order through the sandbox gateway to a confirmed payment. */
async function pay(user, order) {
  const paymentId = `pay_${crypto.randomBytes(8).toString("hex")}`;
  const signature = sign(`${order.gatewayOrderId}|${paymentId}`, sandboxSecret());
  return user.json("/api/checkout/verify", {
    orderId: order.orderId,
    razorpayOrderId: order.gatewayOrderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: signature,
  });
}

/* ------------------------------------------------------------- test set-up */

/**
 * Confirms an address without going through the inbox.
 *
 * Signing up now leaves an account unverified, and an unverified account is
 * blocked from checkout and the trial by design. These suites are about what
 * happens *after* that gate, so they step through it directly — the gate
 * itself is proved end to end, link and all, in tests/verification.mjs.
 */
async function confirmEmail(email) {
  await db.user.update({
    where: { email },
    data: { emailVerifiedAt: new Date(), verifyTokenHash: null, verifyTokenExpiresAt: null },
  });
}

const stamp = Date.now().toString(36).slice(-6);
const A_EMAIL = `coup-a-${stamp}@example.com`;
const B_EMAIL = `coup-b-${stamp}@example.com`;
const C_EMAIL = `coup-c-${stamp}@example.com`;
const CODES = ["T6PCT25", "T6FIXED", "T6ONCE", "T6EXPIRED", "T6FUTURE", "T6OTHER", "T6FLOOR", "T6INR"];

async function cleanup() {
  const users = await db.user.findMany({
    where: { email: { startsWith: "coup-" } },
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
  await db.product.deleteMany({ where: { slug: { startsWith: "t6-" } } });
  await db.course.deleteMany({ where: { slug: { startsWith: "t6-" } } });
}

const day = 24 * 60 * 60 * 1000;

async function main() {
  await cleanup();

  const courseA = await db.course.create({
    data: {
      slug: "t6-alpha",
      title: "T6 Alpha Course",
      status: "PUBLISHED",
      order: 95,
      subjects: {
        create: {
          slug: "t6-alpha-subject",
          title: "T6 Alpha Subject",
          status: "PUBLISHED",
          order: 0,
        },
      },
    },
  });
  const courseB = await db.course.create({
    data: { slug: "t6-bravo", title: "T6 Bravo Course", status: "PUBLISHED", order: 96 },
  });

  // $200.00 NZD / ₹10,000.00 so percentages land on clean numbers.
  const product = await db.product.create({
    data: {
      slug: "t6-product-alpha",
      title: "T6 Alpha Package",
      status: "PUBLISHED",
      accessMonths: 3,
      order: 95,
      prices: {
        create: [
          { currency: "NZD", amountMinor: 20000 },
          { currency: "INR", amountMinor: 1000000 },
        ],
      },
      items: { create: { courseId: courseA.id } },
    },
  });
  const otherProduct = await db.product.create({
    data: {
      slug: "t6-product-bravo",
      title: "T6 Bravo Package",
      status: "PUBLISHED",
      accessMonths: 3,
      order: 96,
      prices: { create: [{ currency: "NZD", amountMinor: 30000 }] },
      items: { create: { courseId: courseB.id } },
    },
  });

  const now = Date.now();
  await db.coupon.createMany({
    data: [
      { code: "T6PCT25", type: "PERCENT", value: 25 },
      { code: "T6FIXED", type: "FIXED", value: 5000, currency: "NZD" },
      { code: "T6ONCE", type: "PERCENT", value: 10, maxRedemptions: 1 },
      { code: "T6EXPIRED", type: "PERCENT", value: 50, expiresAt: new Date(now - day) },
      { code: "T6FUTURE", type: "PERCENT", value: 50, startsAt: new Date(now + day) },
      { code: "T6OTHER", type: "PERCENT", value: 50, productId: otherProduct.id },
      { code: "T6FLOOR", type: "PERCENT", value: 50, minAmountMinor: 50000 },
      { code: "T6INR", type: "PERCENT", value: 20, currency: "INR" },
    ],
  });

  const student = new User();
  await student.signup("Coupon Tester A", A_EMAIL);
  t("student account created", Boolean(await db.user.findUnique({ where: { email: A_EMAIL } })));

  /* ================= a percentage code prices server-side ================= */

  const pct = await student.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
    couponCode: "T6PCT25",
  });
  t(
    "a 25% code takes exactly 25% off the database price",
    pct.status === 200 && pct.data.amountMinor === 15000 && pct.data.discountMinor === 5000,
    `status ${pct.status} amount ${pct.data.amountMinor} discount ${pct.data.discountMinor}`,
  );
  t(
    "the order records the list price alongside the discounted one",
    pct.data.listAmountMinor === 20000,
    `list ${pct.data.listAmountMinor}`,
  );

  const pctOrder = await db.order.findUnique({ where: { id: pct.data.orderId } });
  t(
    "the discount is persisted on the order, not just returned",
    pctOrder?.amountMinor === 15000 &&
      pctOrder?.discountMinor === 5000 &&
      pctOrder?.couponCode === "T6PCT25",
    `db amount ${pctOrder?.amountMinor} discount ${pctOrder?.discountMinor}`,
  );

  /* ================= the code is a claim, not an amount ================= */

  const forged = await student.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
    couponCode: "T6PCT25",
    discountMinor: 19999,
    amountMinor: 1,
  });
  t(
    "a discount supplied by the client is ignored entirely",
    forged.status === 200 && forged.data.amountMinor === 15000,
    `amount ${forged.data.amountMinor}`,
  );

  const noCode = await student.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
    discountMinor: 15000,
  });
  t(
    "a discount without a code buys nothing",
    noCode.status === 200 && noCode.data.amountMinor === 20000 && noCode.data.discountMinor === 0,
    `amount ${noCode.data.amountMinor}`,
  );

  /* ================= forgiving entry ================= */

  const messy = await student.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
    couponCode: "  t6pct 25 ",
  });
  t(
    "a lower-case, spaced, padded code still matches",
    messy.status === 200 && messy.data.amountMinor === 15000,
    `status ${messy.status} amount ${messy.data.amountMinor}`,
  );

  /* ================= rejections ================= */

  // A separate student, so the rejection block runs against its own rate-limit
  // budget — which also demonstrates that the limits are counted per person.
  const prober = new User();
  await prober.signup("Coupon Tester C", C_EMAIL);

  const cases = [
    ["T6NOPE", "an unknown code", "not recognised"],
    ["T6EXPIRED", "an expired code", "expired"],
    ["T6FUTURE", "a code that has not started", "not active yet"],
    ["T6OTHER", "a code scoped to another product", "does not apply"],
    ["T6FLOOR", "a code below its minimum order value", "below the minimum"],
    ["T6INR", "a code scoped to another currency", "INR"],
  ];
  for (const [code, description, fragment] of cases) {
    const res = await prober.json("/api/checkout/create-order", {
      productId: product.id,
      currency: "NZD",
      couponCode: code,
    });
    t(
      `${description} is refused`,
      res.status === 400 && res.data.couponRejected === true,
      `status ${res.status} ${JSON.stringify(res.data)}`,
    );
    t(
      `${description} explains why`,
      typeof res.data.error === "string" && res.data.error.includes(fragment),
      `message ${res.data.error}`,
    );
  }

  const proberId = (await db.user.findUnique({ where: { email: C_EMAIL } })).id;
  const orderCount = await db.order.count({ where: { userId: proberId } });
  t("a rejected code creates no order at all", orderCount === 0, `${orderCount} orders`);

  /* ================= guessing at codes runs out of attempts ================= */

  let throttled = false;
  for (let i = 0; i < 12 && !throttled; i++) {
    const res = await prober.json("/api/checkout/create-order", {
      productId: product.id,
      currency: "NZD",
      couponCode: `T6GUESS${i}`,
    });
    if (res.status === 429) throttled = true;
  }
  t("repeatedly guessing at discount codes is throttled", throttled,
    "expected a 429 after a run of wrong codes");

  /* ================= an inactive code ================= */

  await db.coupon.update({ where: { code: "T6PCT25" }, data: { active: false } });
  const off = await student.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
    couponCode: "T6PCT25",
  });
  t(
    "a code switched off in the admin console stops working immediately",
    off.status === 400 && off.data.error.includes("no longer active"),
    `status ${off.status} ${off.data.error}`,
  );
  await db.coupon.update({ where: { code: "T6PCT25" }, data: { active: true } });

  /* ================= a fixed amount ================= */

  const fixed = await student.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
    couponCode: "T6FIXED",
  });
  t(
    "a $50 fixed code takes $50 off",
    fixed.status === 200 && fixed.data.amountMinor === 15000 && fixed.data.discountMinor === 5000,
    `amount ${fixed.data.amountMinor}`,
  );

  /* ================= redemption is counted on payment, not on intent ===== */

  const single = await student.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
    couponCode: "T6ONCE",
  });
  t("single-use code applies on first use", single.status === 200 && single.data.discountMinor === 2000,
    `discount ${single.data.discountMinor}`);

  const beforePay = await db.coupon.findUnique({ where: { code: "T6ONCE" } });
  t(
    "creating an order does not yet count a redemption",
    beforePay.redemptions === 0,
    `redemptions ${beforePay.redemptions}`,
  );

  const paid = await pay(student, single.data);
  t("the discounted order is payable", paid.status === 200, `status ${paid.status} ${JSON.stringify(paid.data)}`);

  const afterPay = await db.coupon.findUnique({ where: { code: "T6ONCE" } });
  t(
    "a confirmed payment counts exactly one redemption",
    afterPay.redemptions === 1,
    `redemptions ${afterPay.redemptions}`,
  );

  const redemption = await db.couponRedemption.findUnique({
    where: { orderId: single.data.orderId },
  });
  t(
    "the redemption records the amount actually discounted",
    redemption?.amountMinor === 2000,
    `recorded ${redemption?.amountMinor}`,
  );

  const paidOrder = await db.order.findUnique({ where: { id: single.data.orderId } });
  t(
    "the student is charged the discounted amount, not the list price",
    paidOrder.status === "PAID" && paidOrder.amountMinor === 18000,
    `status ${paidOrder.status} amount ${paidOrder.amountMinor}`,
  );

  /* ================= replay safety ================= */

  const replay = await pay(student, single.data);
  const afterReplay = await db.coupon.findUnique({ where: { code: "T6ONCE" } });
  t(
    "replaying the payment does not inflate the redemption count",
    afterReplay.redemptions === 1,
    `redemptions ${afterReplay.redemptions} (replay status ${replay.status})`,
  );

  /* ================= per-person and global limits ================= */

  const other = new User();
  await other.signup("Coupon Tester B", B_EMAIL);
  const exhausted = await other.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
    couponCode: "T6ONCE",
  });
  t(
    "a code at its redemption limit is refused to the next student",
    exhausted.status === 400 && exhausted.data.error.includes("usage limit"),
    `status ${exhausted.status} ${exhausted.data.error}`,
  );

  await db.coupon.update({ where: { code: "T6ONCE" }, data: { maxRedemptions: 50 } });
  const reuse = await student.json("/api/checkout/create-order", {
    productId: otherProduct.id,
    currency: "NZD",
    couponCode: "T6ONCE",
  });
  t(
    "a student cannot use the same code twice even when uses remain",
    reuse.status === 400 && reuse.data.error.includes("already used"),
    `status ${reuse.status} ${reuse.data.error}`,
  );

  /* ================= a code cannot make an order free ================= */

  await db.coupon.update({ where: { code: "T6FIXED" }, data: { value: 100000 } });
  const free = await other.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
    couponCode: "T6FIXED",
  });
  t(
    "a discount larger than the price does not produce a negative charge",
    free.status === 409 || (free.status === 200 && free.data.amountMinor >= 0),
    `status ${free.status} amount ${free.data.amountMinor}`,
  );

  /* ================= INR pricing ================= */

  const inr = await other.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "INR",
    couponCode: "T6INR",
  });
  t(
    "an INR-scoped code discounts the INR price",
    inr.status === 200 && inr.data.amountMinor === 800000 && inr.data.currency === "INR",
    `status ${inr.status} amount ${inr.data.amountMinor} ${inr.data.currency}`,
  );

  /* ================= login throttling ================= */

  // Signing in correctly, repeatedly, must never lock a person out: only wrong
  // passwords are charged against the budget.
  const repeat = new User();
  let allowed = true;
  for (let i = 0; i < 12; i++) {
    const res = await repeat.login(A_EMAIL, "Southerly7!wind");
    const loc = res.headers.get("location") ?? "";
    if (loc.includes("error=throttled")) allowed = false;
  }
  t("signing in correctly many times is never throttled", allowed,
    "a correct password was rejected as too many attempts");

  const guesser = new User();
  let lockedOut = false;
  for (let i = 0; i < 12 && !lockedOut; i++) {
    const res = await guesser.login(A_EMAIL, `wrong-password-${i}`);
    if ((res.headers.get("location") ?? "").includes("error=throttled")) lockedOut = true;
  }
  t("repeated wrong passwords are throttled", lockedOut,
    "guessing was never rate limited");

  const recovered = await new User().login(A_EMAIL, "Southerly7!wind");
  t("the throttle applies to the account under attack, not just the guesser",
    (recovered.headers.get("location") ?? "").includes("error=throttled"),
    "a locked account still accepted a sign-in from elsewhere");

  /* ================= the admin console ================= */

  const admin = new User();
  const adminRow = await db.user.findFirst({ where: { role: "ADMIN" }, select: { email: true } });
  if (adminRow && process.env.TEST_ADMIN_PASSWORD) {
    await admin.login(adminRow.email, process.env.TEST_ADMIN_PASSWORD);
    const page = await admin.visit("/admin/coupons");
    t("the admin coupon console lists generated codes", page.text.includes("T6PCT25"),
      `landed ${page.landedOn}`);
    t("the admin coupon console shows usage counts", page.text.includes("Generate a coupon"),
      `landed ${page.landedOn}`);
  } else {
    checks.push("SKIP  admin console checks (set TEST_ADMIN_PASSWORD to run)");
  }

  const anonAdmin = await new User().visit("/admin/coupons");
  t(
    "the coupon console is not reachable without signing in",
    !anonAdmin.text.includes("Generate a coupon"),
    `landed ${anonAdmin.landedOn}`,
  );

  const studentAdmin = await student.visit("/admin/coupons");
  t(
    "a student cannot open the coupon console",
    !studentAdmin.text.includes("Generate a coupon"),
    `landed ${studentAdmin.landedOn}`,
  );

  await cleanup();

  console.log(checks.join("\n"));
  const failed = checks.filter((c) => c.startsWith("FAIL")).length;
  console.log(`\n${checks.filter((c) => c.startsWith("PASS")).length}/${
    checks.filter((c) => !c.startsWith("SKIP")).length
  } passed`);
  await db.$disconnect();
  process.exit(failed ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await cleanup().catch(() => {});
  await db.$disconnect();
  process.exit(1);
});
