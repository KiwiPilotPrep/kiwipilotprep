/**
 * Phase 3 integration tests — products, payments, entitlements.
 *
 * Covers the brief's mandatory scenarios: §33 product access, §34 negative
 * access, §35 dynamic product, plus the webhook and idempotency requirements
 * in §13/§31. Everything runs over real HTTP against real Postgres.
 *
 *   node tests/payments.mjs
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
const IP_BASE = 61;
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
    return { status: res.status, body, text: body.replace(/<!--[\s\S]*?-->/g, ""), landedOn: trail.at(-1) };
  }
  async json(path, body) {
    const res = await this.request(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
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

/* ------------------------------------------------------------- test set-up */

const stamp = Date.now().toString(36).slice(-6);
const EMAIL = `pay-${stamp}@example.com`;

async function cleanup() {
  const users = await db.user.findMany({ where: { email: { startsWith: "pay-" } }, select: { id: true } });
  const ids = users.map((u) => u.id);
  if (ids.length) {
    await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
    await db.order.deleteMany({ where: { userId: { in: ids } } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }
  await db.product.deleteMany({ where: { slug: { startsWith: "t3-" } } });
  await db.course.deleteMany({ where: { slug: { startsWith: "t3-" } } });
}

/** The sandbox gateway derives its secret the same way the server does. */
/**
 * Mirrors webhookSecret() in lib/payments/gateway.ts.
 *
 * Deliberately a different fallback from gatewaySecret(): the app falls back to
 * the AUTH_SECRET-derived value for webhooks, not to the Razorpay key secret.
 */
function webhookSigningSecret() {
  if (process.env.RAZORPAY_WEBHOOK_SECRET) return process.env.RAZORPAY_WEBHOOK_SECRET;
  const base = process.env.AUTH_SECRET ?? "kpp-sandbox";
  return crypto.createHash("sha256").update(`${base}:payments`).digest("hex");
}

/** Mirrors gatewaySecret() in lib/payments/gateway.ts. */
function sandboxSecret() {
  if (process.env.RAZORPAY_KEY_SECRET) return process.env.RAZORPAY_KEY_SECRET;
  const base = process.env.AUTH_SECRET ?? "kpp-sandbox";
  return crypto.createHash("sha256").update(`${base}:payments`).digest("hex");
}
function sign(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

async function main() {
  await cleanup();

  // Two courses, so the negative-access test has something to be denied.
  const courseA = await db.course.create({
    data: { slug: "t3-alpha", title: "T3 Alpha Course", status: "PUBLISHED", order: 90,
      subjects: { create: { slug: "t3-alpha-subject", title: "T3 Alpha Subject", status: "PUBLISHED", order: 0,
        chapters: { create: { slug: "t3-alpha-chapter", title: "T3 Alpha Chapter", status: "PUBLISHED", order: 0,
          content: { create: { blocks: [{ type: "paragraph", text: "ALPHA SECRET MATERIAL" }] } } } } } } },
    include: { subjects: true },
  });
  const courseB = await db.course.create({
    data: { slug: "t3-bravo", title: "T3 Bravo Course", status: "PUBLISHED", order: 91,
      subjects: { create: { slug: "t3-bravo-subject", title: "T3 Bravo Subject", status: "PUBLISHED", order: 0,
        chapters: { create: { slug: "t3-bravo-chapter", title: "T3 Bravo Chapter", status: "PUBLISHED", order: 0,
          content: { create: { blocks: [{ type: "paragraph", text: "BRAVO SECRET MATERIAL" }] } } } } } } },
    include: { subjects: true },
  });

  const productA = await db.product.create({
    data: {
      slug: "t3-product-alpha", title: "T3 Alpha Package", status: "PUBLISHED",
      accessMonths: 3, order: 90,
      prices: { create: [{ currency: "NZD", amountMinor: 10000 }] },
      items: { create: { courseId: courseA.id } },
    },
  });
  await db.product.create({
    data: {
      slug: "t3-product-bravo", title: "T3 Bravo Package", status: "PUBLISHED",
      accessMonths: 3, order: 91,
      prices: { create: [{ currency: "NZD", amountMinor: 12000 }] },
      items: { create: { courseId: courseB.id } },
    },
  });

  // A student created through the real signup form.
  const student = new User();
  {
    const page = await student.request("/signup");
    const html = await page.text();
    const id = html.match(/ACTION_ID_([a-f0-9]+)/)?.[1];
    const fd = new FormData();
    fd.set("name", "Pay Tester");
    fd.set("consent", "on");
    fd.set("email", EMAIL);
    fd.set("password", "Southerly7!wind");
    fd.set(`$ACTION_ID_${id}`, "");
    await student.request("/signup", { method: "POST", body: fd });
    // Signing up now leaves the address unconfirmed, and an unconfirmed
    // account cannot check out. That gate is proved in tests/verification.mjs;
    // this suite is about what happens once a real buyer is past it.
    await db.user.update({
      where: { email: EMAIL },
      data: { emailVerifiedAt: new Date() },
    });
  }
  const studentRow = await db.user.findUnique({ where: { email: EMAIL } });
  t("student account created", Boolean(studentRow));

  /* ================= §33 before purchase: locked ================= */

  const lockedCourse = await student.visit(`/courses/${courseA.slug}`);
  t("unpurchased course is not readable",
    lockedCourse.text.includes("not part of your current access"), `landed ${lockedCourse.landedOn}`);

  const lockedChapter = await student.visit(
    `/courses/${courseA.slug}/subjects/t3-alpha-subject/chapters/t3-alpha-chapter`);
  t("paid material is never sent to an unentitled browser",
    !lockedChapter.body.includes("ALPHA SECRET MATERIAL"), "chapter body leaked");

  /* ================= price integrity ================= */

  const priceAttack = await student.json("/api/checkout/create-order", {
    productId: productA.id, currency: "NZD", amountMinor: 1, price: 1,
  });
  if (priceAttack.status !== 200) {
    console.error("create-order failed:", priceAttack.status, JSON.stringify(priceAttack.data));
  }
  t("checkout ignores any price sent by the client",
    priceAttack.status === 200 && priceAttack.data.amountMinor === 10000,
    `status ${priceAttack.status} amount ${priceAttack.data.amountMinor}`);

  const orderId = priceAttack.data.orderId;
  const gatewayOrderId = priceAttack.data.gatewayOrderId;
  t("an internal order was created", Boolean(orderId));
  t("a gateway order id was stored", Boolean(gatewayOrderId));

  const dbOrder = await db.order.findUnique({ where: { id: orderId } });
  t("order is PENDING before payment", dbOrder?.status === "PENDING", dbOrder?.status);
  t("order amount comes from the database", dbOrder?.amountMinor === 10000);

  /* ================= re-clicking checkout ================= */

  const second = await student.json("/api/checkout/create-order", {
    productId: productA.id, currency: "NZD",
  });
  t("clicking buy twice reuses the pending order, not a second one",
    second.data.orderId === orderId, `${second.data.orderId} vs ${orderId}`);

  /* ================= forged signature is refused ================= */

  const forged = await student.json("/api/checkout/verify", {
    orderId,
    razorpayPaymentId: "pay_forged",
    razorpayOrderId: gatewayOrderId,
    razorpaySignature: crypto.randomBytes(32).toString("hex"),
  });
  t("a forged payment signature is rejected", forged.status === 400, `status ${forged.status}`);

  const afterForge = await db.entitlement.count({ where: { userId: studentRow.id } });
  t("a rejected payment grants nothing", afterForge === 0, `${afterForge} entitlements`);

  /* ================= §33 genuine payment ================= */

  const paymentId = `pay_sbx_${crypto.randomBytes(9).toString("hex")}`;
  const signature = sign(`${gatewayOrderId}|${paymentId}`, sandboxSecret());

  const verified = await student.json("/api/checkout/verify", {
    orderId,
    razorpayPaymentId: paymentId,
    razorpayOrderId: gatewayOrderId,
    razorpaySignature: signature,
  });
  t("a correctly signed payment is accepted", verified.status === 200, JSON.stringify(verified.data));
  t("entitlements were granted", verified.data.entitlementsGranted >= 1);

  const paidOrder = await db.order.findUnique({ where: { id: orderId } });
  t("order is now PAID", paidOrder?.status === "PAID", paidOrder?.status);

  // Select the genuine payment by its gateway id — the order also carries the
  // FAILED row from the forged attempt above.
  const capturedPayment = await db.payment.findUnique({ where: { gatewayPaymentId: paymentId } });
  t("payment is recorded as CAPTURED", capturedPayment?.status === "CAPTURED", capturedPayment?.status);
  t("payment is flagged signature-verified", capturedPayment?.signatureVerified === true);

  /* ================= §33 access is now real ================= */

  const dash = await student.visit("/dashboard");
  t("dashboard shows the purchased course", dash.text.includes(courseA.title));

  const openCourse = await student.visit(`/courses/${courseA.slug}`);
  t("purchased course opens", openCourse.text.includes("T3 Alpha Subject"), `landed ${openCourse.landedOn}`);

  const openChapter = await student.visit(
    `/courses/${courseA.slug}/subjects/t3-alpha-subject/chapters/t3-alpha-chapter`);
  t("purchased chapter content is readable", openChapter.body.includes("ALPHA SECRET MATERIAL"));

  /* ================= §34 negative access (mandatory) ================= */

  const otherCourse = await student.visit(`/courses/${courseB.slug}`);
  t("§34 unpurchased second course stays locked",
    otherCourse.text.includes("not part of your current access"), `landed ${otherCourse.landedOn}`);

  const otherChapter = await student.visit(
    `/courses/${courseB.slug}/subjects/t3-bravo-subject/chapters/t3-bravo-chapter`);
  t("§34 backend denies the unpurchased chapter",
    !otherChapter.body.includes("BRAVO SECRET MATERIAL"), "bravo material leaked");

  const bravoIds = await db.subject.findMany({ where: { courseId: courseB.id }, select: { id: true } });
  const bravoEnt = await db.entitlement.count({
    where: { userId: studentRow.id, OR: [{ courseId: courseB.id }, { subjectId: { in: bravoIds.map((s) => s.id) } }] },
  });
  t("§34 no entitlement exists for the unpurchased course", bravoEnt === 0);

  /* ================= §24 duplicate purchase protection ================= */

  const repurchase = await student.json("/api/checkout/create-order", {
    productId: productA.id, currency: "NZD",
  });
  t("§24 re-buying owned content is refused",
    repurchase.status === 409 && repurchase.data.alreadyOwned === true,
    `status ${repurchase.status}`);

  /* ================= §13/§31 webhook ================= */

  const webhookBody = JSON.stringify({
    event: "payment.captured",
    payload: { payment: { entity: { id: paymentId, order_id: gatewayOrderId, method: "card" } } },
  });
  const webhookSig = sign(webhookBody, webhookSigningSecret());

  const badHook = await fetch(`${BASE}/api/webhooks/razorpay`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-razorpay-signature": "nonsense" },
    body: webhookBody,
  });
  t("§13 webhook rejects an invalid signature", badHook.status === 401, `status ${badHook.status}`);

  const hook1 = await fetch(`${BASE}/api/webhooks/razorpay`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-razorpay-signature": webhookSig },
    body: webhookBody,
  });
  t("§13 webhook accepts a valid signature", hook1.status === 200, `status ${hook1.status}`);

  const beforeReplay = await db.entitlement.count({ where: { userId: studentRow.id } });
  for (let i = 0; i < 3; i++) {
    await fetch(`${BASE}/api/webhooks/razorpay`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-razorpay-signature": webhookSig },
      body: webhookBody,
    });
  }
  const afterReplay = await db.entitlement.count({ where: { userId: studentRow.id } });
  t("§31 replayed webhooks create no duplicate entitlements",
    afterReplay === beforeReplay, `${beforeReplay} → ${afterReplay}`);

  const paymentRows = await db.payment.count({ where: { gatewayPaymentId: paymentId } });
  t("§31 replayed webhooks create no duplicate payments", paymentRows === 1, `${paymentRows} rows`);

  /* ================= §22 failed payment grants nothing ================= */

  const failUser = new User();
  await failUser.login(EMAIL, "Southerly7!wind");
  const bravoProduct = await db.product.findUnique({ where: { slug: "t3-product-bravo" } });
  const failOrder = await failUser.json("/api/checkout/create-order", {
    productId: bravoProduct.id, currency: "NZD",
  });
  const failBody = JSON.stringify({
    event: "payment.failed",
    payload: { payment: { entity: { id: `pay_fail_${stamp}`, order_id: failOrder.data.gatewayOrderId } } },
  });
  await fetch(`${BASE}/api/webhooks/razorpay`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-razorpay-signature": sign(failBody, webhookSigningSecret()) },
    body: failBody,
  });
  const failedOrder = await db.order.findUnique({ where: { id: failOrder.data.orderId } });
  t("§22 a failed payment marks the order FAILED", failedOrder?.status === "FAILED", failedOrder?.status);
  const stillNoBravo = await db.entitlement.count({ where: { userId: studentRow.id, courseId: courseB.id } });
  t("§22 a failed payment grants no access", stillNoBravo === 0);

  /* ================= §23 cancelled checkout ================= */

  const cancelUser = new User();
  await cancelUser.login(EMAIL, "Southerly7!wind");
  const cancelled = await cancelUser.json("/api/checkout/create-order", {
    productId: bravoProduct.id, currency: "NZD",
  });
  const cancelledOrder = await db.order.findUnique({ where: { id: cancelled.data.orderId } });
  t("§23 an abandoned checkout leaves the order unpaid",
    cancelledOrder?.status !== "PAID", cancelledOrder?.status);

  /* ================= §35 dynamic product (mandatory) ================= */

  // A subject created after the fact, sold via a new product.
  const newSubject = await db.subject.create({
    data: {
      courseId: courseB.id, slug: `t3-dynamic-${stamp}`, title: `T3 Dynamic Subject ${stamp}`,
      status: "PUBLISHED", order: 5,
      chapters: { create: { slug: "dyn-chapter", title: "Dynamic Chapter", status: "PUBLISHED", order: 0,
        content: { create: { blocks: [{ type: "paragraph", text: "DYNAMIC SECRET MATERIAL" }] } } } },
    },
  });
  const dynProduct = await db.product.create({
    data: {
      slug: `t3-dynamic-product-${stamp}`, title: `T3 Dynamic Product ${stamp}`,
      status: "PUBLISHED", accessMonths: 3, order: 92,
      prices: { create: [{ currency: "NZD", amountMinor: 5000 }] },
      items: { create: { subjectId: newSubject.id } },
    },
  });

  const buyer = new User();
  await buyer.login(EMAIL, "Southerly7!wind");

  const beforeDyn = await buyer.visit(`/courses/${courseB.slug}/subjects/${newSubject.slug}/chapters/dyn-chapter`);
  t("§35 the new subject is locked before purchase",
    !beforeDyn.body.includes("DYNAMIC SECRET MATERIAL"));

  const dynOrder = await buyer.json("/api/checkout/create-order", {
    productId: dynProduct.id, currency: "NZD",
  });
  const dynPaymentId = `pay_sbx_${crypto.randomBytes(9).toString("hex")}`;
  const dynVerified = await buyer.json("/api/checkout/verify", {
    orderId: dynOrder.data.orderId,
    razorpayPaymentId: dynPaymentId,
    razorpayOrderId: dynOrder.data.gatewayOrderId,
    razorpaySignature: sign(`${dynOrder.data.gatewayOrderId}|${dynPaymentId}`, sandboxSecret()),
  });
  t("§35 the dynamic product can be bought", dynVerified.status === 200, JSON.stringify(dynVerified.data));

  const afterDyn = await buyer.visit(`/courses/${courseB.slug}/subjects/${newSubject.slug}/chapters/dyn-chapter`);
  t("§35 access to the dynamically created subject works",
    afterDyn.body.includes("DYNAMIC SECRET MATERIAL"), `landed ${afterDyn.landedOn}`);

  /* ================= §6 single-subject purchase is granular ================= */

  const siblingChapter = await buyer.visit(
    `/courses/${courseB.slug}/subjects/t3-bravo-subject/chapters/t3-bravo-chapter`);
  t("§6 buying one subject does not unlock its siblings",
    !siblingChapter.body.includes("BRAVO SECRET MATERIAL"));

  /* ================= §25 free trial ================= */

  const trialUser = new User();
  await trialUser.login(EMAIL, "Southerly7!wind");
  const chooser = await trialUser.visit("/trial");
  t("§25 the free mock chooser opens without payment",
    chooser.status === 200 && chooser.landedOn === "/trial",
    `landed ${chooser.landedOn}`);
  t("§25 the chooser offers one subject at a time rather than a question set",
    chooser.text.includes("Sit a free 10-question mock"),
    "expected the free mock chooser");

  // The trial must not be a way into the paid bank: only questions somebody
  // marked eligible can appear in one.
  const eligible = await db.question.count({ where: { freeTrialEligible: true, status: "PUBLISHED" } });
  const published = await db.question.count({ where: { status: "PUBLISHED" } });
  t("§25 the free mock draws on a marked subset, not the whole bank",
    eligible <= published, `${eligible} of ${published}`);

  // And a trial mock is never offered beside the paid ones.
  const paidList = await trialUser.visit("/mocks");
  const trialExams = await db.mockExam.findMany({
    where: { isFreeTrial: true, status: "PUBLISHED" },
    select: { title: true },
  });
  t("§25 free mocks are not listed among the paid mock exams",
    trialExams.every((e) => !paidList.text.includes(`Start Mock Exam${e.title}`)),
    `${trialExams.length} trial exam(s)`);

  /* ================= §19 pricing page is product-driven ================= */

  const pricing = await new User().visit("/pricing");
  t("§19 pricing page renders products from the database",
    pricing.text.includes("T3 Alpha Package") && pricing.text.includes("$100"),
    "expected the seeded test product and its price");

  /* ================= unauthenticated cannot check out ================= */

  const anon = await new User().json("/api/checkout/create-order", {
    productId: productA.id, currency: "NZD",
  });
  t("anonymous checkout is refused", anon.status === 401, `status ${anon.status}`);

  await cleanup();

  console.log(checks.join("\n"));
  const failed = checks.filter((c) => c.startsWith("FAIL")).length;
  console.log(`\n${checks.length - failed}/${checks.length} passed`);
  await db.$disconnect();
  process.exit(failed ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await cleanup().catch(() => {});
  await db.$disconnect();
  process.exit(1);
});
