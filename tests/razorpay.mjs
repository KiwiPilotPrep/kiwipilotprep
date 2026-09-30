/**
 * Razorpay payment integration — the brief's §20 test matrix, all twenty cases.
 *
 * Runs against whichever gateway adapter is configured. The signature scheme,
 * the verification code, the fulfilment path, the idempotency constraints and
 * the entitlement grant are identical either way — the only thing the sandbox
 * substitutes is the network call to Razorpay itself. So these tests prove the
 * logic that decides whether someone gets access, which is the part that can
 * lose money or give content away.
 *
 *   node tests/razorpay.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

/**
 * Load .env into this process.
 *
 * The suite has to sign payloads with the *same* secret the server verifies
 * with — that is the whole point of a signature test. Node does not read .env
 * on its own, so without this the suite signs with the sandbox secret while
 * the server verifies with the real Razorpay one, and every webhook is
 * correctly rejected for the wrong reason.
 */
for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const at = trimmed.indexOf("=");
  if (at < 0) continue;
  const key = trimmed.slice(0, at).trim();
  const value = trimmed.slice(at + 1).trim().replace(/^"|"$/g, "");
  if (!(key in process.env)) process.env[key] = value;
}

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const db = new PrismaClient();

const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

let ipCounter = 0;
// Its own slice of the documentation range. Every suite used to start at
// the first address in its range, and the signup form allows twenty accounts
// an hour from one address -- so running the suite twice in an hour failed on
// a rate limit rather than on anything under test.
const IP_BASE = 31;
const nextIp = () => `198.51.100.${IP_BASE + (ipCounter++ % 25)}`;

class User {
  constructor() {
    this.cookie = "";
    this.ip = nextIp();
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
  async signup(name, email, { verify = true } = {}) {
    const html = await (await this.request("/signup")).text();
    const id = html.match(/ACTION_ID_([a-f0-9]+)/)?.[1];
    const fd = new FormData();
    fd.set("name", name);
    fd.set("consent", "on");
    fd.set("email", email);
    fd.set("password", "Southerly7!wind");
    fd.set(`$ACTION_ID_${id}`, "");
    const res = await this.request("/signup", { method: "POST", body: fd });
    if (verify) {
      await db.user.update({
        where: { email },
        data: { emailVerifiedAt: new Date(), verifyTokenHash: null },
      });
    }
    return res;
  }
}

/* ------------------------------------------------------------- signatures */

/** The gateway's signing secret, mirroring lib/payments/gateway.ts. */
function gatewaySecret() {
  if (process.env.RAZORPAY_KEY_SECRET) return process.env.RAZORPAY_KEY_SECRET;
  const base = process.env.AUTH_SECRET ?? "kpp-sandbox";
  return crypto.createHash("sha256").update(`${base}:payments`).digest("hex");
}
/**
 * Mirrors lib/payments/gateway.ts exactly.
 *
 * Note the fallback is the AUTH_SECRET-derived value, NOT the Razorpay key
 * secret — the two are different, and getting it wrong here made every webhook
 * look rejected when the endpoint was behaving correctly.
 *
 * In production RAZORPAY_WEBHOOK_SECRET must be set: without it the app would
 * verify against a secret Razorpay does not know, so genuine webhooks would be
 * refused. That fails closed, which is the right direction, but it means the
 * secret is mandatory before go-live.
 */
function sandboxSecretDerived() {
  const base = process.env.AUTH_SECRET ?? "kpp-sandbox";
  return crypto.createHash("sha256").update(`${base}:payments`).digest("hex");
}
function webhookSecret() {
  return process.env.RAZORPAY_WEBHOOK_SECRET ?? sandboxSecretDerived();
}
const hmac = (payload, secret) =>
  crypto.createHmac("sha256", secret).update(payload).digest("hex");

/** Razorpay signs `${order_id}|${payment_id}` with the key secret. */
const checkoutSignature = (orderId, paymentId) =>
  hmac(`${orderId}|${paymentId}`, gatewaySecret());

const stamp = Date.now().toString(36).slice(-6);
const E = (label) => `rzp-${label}-${stamp}@example.com`;

async function cleanup() {
  const users = await db.user.findMany({
    where: { email: { startsWith: "rzp-" } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (ids.length) {
    await db.emailLog.deleteMany({ where: { userId: { in: ids } } });
    await db.couponRedemption.deleteMany({ where: { userId: { in: ids } } });
    await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
    await db.payment.deleteMany({ where: { order: { userId: { in: ids } } } });
    await db.order.deleteMany({ where: { userId: { in: ids } } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }
}

/** Posts a webhook exactly as Razorpay would, with a real signature. */
async function postWebhook(event, { signature } = {}) {
  const raw = JSON.stringify(event);
  const sig = signature ?? hmac(raw, webhookSecret());
  const res = await fetch(`${BASE}/api/webhooks/razorpay`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-razorpay-signature": sig },
    body: raw,
  });
  return { status: res.status, body: await res.text().catch(() => "") };
}

const paymentEvent = (name, { gatewayOrderId, paymentId, amount, currency }) => ({
  event: name,
  payload: {
    payment: {
      entity: {
        id: paymentId,
        order_id: gatewayOrderId,
        amount,
        currency,
        status: name === "payment.failed" ? "failed" : "captured",
        method: "card",
      },
    },
  },
});

async function main() {
  await cleanup();

  const product = await db.product.findFirst({
    where: { status: "PUBLISHED", prices: { some: { currency: "NZD" } }, items: { some: {} } },
    include: { prices: true, items: true },
  });
  if (!product) throw new Error("No published, priced product to test against.");
  const listPrice = product.prices.find((p) => p.currency === "NZD").amountMinor;

  /* ============ 1–3: who may create an order ============ */

  const buyer = new User();
  await buyer.signup("Rzp Buyer", E("buyer"));
  const buyerRow = await db.user.findUnique({ where: { email: E("buyer") } });

  const created = await buyer.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
  });
  t("1. a verified user can create an order", created.status === 200, `status ${created.status}`);
  t("1. the order carries a gateway order id", Boolean(created.data.gatewayOrderId));

  const unverified = new User();
  await unverified.signup("Rzp Unverified", E("unverified"), { verify: false });
  const blocked = await unverified.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
  });
  t("2. an unverified user cannot create an order", blocked.status === 403, `status ${blocked.status}`);
  const unverifiedRow = await db.user.findUnique({ where: { email: E("unverified") } });
  t("2. no order row exists for the unverified user",
    (await db.order.count({ where: { userId: unverifiedRow.id } })) === 0);

  const anon = await new User().json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
  });
  t("3. an unauthenticated caller cannot create an order", anon.status === 401, `status ${anon.status}`);

  /* ============ 4–5: the browser cannot set the price ============ */

  const forged = await buyer.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
    amount: 1,
    amountMinor: 1,
    price: 1,
    listAmountMinor: 1,
    discountMinor: listPrice - 1,
  });
  t("4. an amount sent by the browser is ignored",
    forged.status === 200 && forged.data.amountMinor === listPrice,
    `charged ${forged.data.amountMinor}, list is ${listPrice}`);

  const dbOrder = await db.order.findUnique({ where: { id: forged.data.orderId } });
  t("5. the stored order carries the database price", dbOrder.amountMinor === listPrice,
    `stored ${dbOrder.amountMinor}`);
  t("5. the stored order carries the database currency", dbOrder.currency === "NZD");

  /* ============ 6–7: signature verification ============ */

  const orderId = created.data.orderId;
  const gatewayOrderId = created.data.gatewayOrderId;

  const badSig = await buyer.json("/api/checkout/verify", {
    orderId,
    razorpayOrderId: gatewayOrderId,
    razorpayPaymentId: `pay_${crypto.randomBytes(8).toString("hex")}`,
    razorpaySignature: crypto.randomBytes(32).toString("hex"),
  });
  t("7. an invalid payment signature is rejected", badSig.status === 400, `status ${badSig.status}`);
  t("9. a rejected payment grants no entitlement",
    (await db.entitlement.count({ where: { userId: buyerRow.id } })) === 0);
  const afterBad = await db.order.findUnique({ where: { id: orderId } });
  t("9. a rejected payment does not mark the order paid", afterBad.status !== "PAID",
    `status ${afterBad.status}`);

  const paymentId = `pay_${crypto.randomBytes(8).toString("hex")}`;
  const good = await buyer.json("/api/checkout/verify", {
    orderId,
    razorpayOrderId: gatewayOrderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: checkoutSignature(gatewayOrderId, paymentId),
  });
  t("6. a valid payment signature succeeds", good.status === 200, `status ${good.status}`);

  /* ============ 8: entitlement created ============ */

  const paid = await db.order.findUnique({ where: { id: orderId } });
  t("8. a confirmed payment marks the order PAID", paid.status === "PAID", `status ${paid.status}`);
  const grants = await db.entitlement.count({ where: { userId: buyerRow.id, status: "ACTIVE" } });
  t("8. a confirmed payment creates an entitlement", grants > 0, `${grants} entitlements`);

  /* ============ 16: the receipt email ============ */

  await new Promise((r) => setTimeout(r, 1500));
  const receipts = await db.emailLog.count({
    where: { userId: buyerRow.id, template: "payment-receipt" },
  });
  t("16. a confirmation email is sent after confirmed payment", receipts === 1,
    `${receipts} receipts`);

  const receipt = await db.emailLog.findFirst({
    where: { userId: buyerRow.id, template: "payment-receipt" },
  });
  t("16. the receipt names the package", (receipt?.body ?? "").includes(product.title));
  t("16. the receipt carries the order reference", (receipt?.body ?? "").includes(paid.reference));
  t("16. the receipt shows the amount actually charged",
    (receipt?.body ?? "").includes(String(Math.round(listPrice / 100))),
    "amount not found in the receipt");

  /* ============ 11: replayed browser callback ============ */

  const replay = await buyer.json("/api/checkout/verify", {
    orderId,
    razorpayOrderId: gatewayOrderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: checkoutSignature(gatewayOrderId, paymentId),
  });
  const afterReplay = await db.entitlement.count({ where: { userId: buyerRow.id, status: "ACTIVE" } });
  t("11. a replayed payment callback creates no second entitlement", afterReplay === grants,
    `${grants} → ${afterReplay} (replay status ${replay.status})`);

  /* ============ 12, 17: replayed webhook ============ */

  const hook = await postWebhook(
    paymentEvent("payment.captured", {
      gatewayOrderId,
      paymentId,
      amount: listPrice,
      currency: "NZD",
    }),
  );
  t("12. a valid webhook is accepted", hook.status === 200, `status ${hook.status}`);

  await postWebhook(
    paymentEvent("payment.captured", {
      gatewayOrderId,
      paymentId,
      amount: listPrice,
      currency: "NZD",
    }),
  );
  const afterHooks = await db.entitlement.count({ where: { userId: buyerRow.id, status: "ACTIVE" } });
  t("12. repeated webhooks create no duplicate entitlement", afterHooks === grants,
    `${grants} → ${afterHooks}`);

  await new Promise((r) => setTimeout(r, 1000));
  const receiptsAfter = await db.emailLog.count({
    where: { userId: buyerRow.id, template: "payment-receipt" },
  });
  t("17. repeated webhook processing sends no duplicate email", receiptsAfter === 1,
    `${receiptsAfter} receipts`);

  /* ============ 13: webhook signature ============ */

  const badHook = await postWebhook(
    paymentEvent("payment.captured", {
      gatewayOrderId,
      paymentId: `pay_${crypto.randomBytes(8).toString("hex")}`,
      amount: listPrice,
      currency: "NZD",
    }),
    { signature: crypto.randomBytes(32).toString("hex") },
  );
  // 401, not 400: an unverifiable signature is an authenticity failure, and
  // it is the status Razorpay retries on — which is what you want if the
  // secret was briefly misconfigured.
  t("13. a webhook with an invalid signature is rejected", badHook.status === 401,
    `status ${badHook.status}`);
  t("13. the rejection body leaks no secret",
    !/secret|key/i.test(badHook.body), badHook.body.slice(0, 80));

  const noSigHook = await fetch(`${BASE}/api/webhooks/razorpay`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event: "payment.captured" }),
  });
  t("13. a webhook with no signature at all is rejected", noSigHook.status === 401,
    `status ${noSigHook.status}`);

  const getHook = await fetch(`${BASE}/api/webhooks/razorpay`, { method: "GET" });
  t("12. the webhook endpoint accepts POST only", getHook.status === 405 || getHook.status === 404,
    `GET returned ${getHook.status}`);

  /* ============ 14: duplicate purchase ============ */

  const again = await buyer.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
  });
  t("14. an existing owner cannot buy the same package again",
    again.status === 409 && again.data.alreadyOwned === true,
    `status ${again.status} ${JSON.stringify(again.data)}`);

  /* ============ 10: cancelled checkout ============ */

  const canceller = new User();
  await canceller.signup("Rzp Canceller", E("cancel"));
  const cancelRow = await db.user.findUnique({ where: { email: E("cancel") } });
  const pending = await canceller.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
  });
  // Closing Checkout sends nothing: the order simply stays pending.
  const stillPending = await db.order.findUnique({ where: { id: pending.data.orderId } });
  t("10. a cancelled checkout leaves the order unpaid", stillPending.status === "PENDING",
    `status ${stillPending.status}`);
  t("10. a cancelled checkout grants no entitlement",
    (await db.entitlement.count({ where: { userId: cancelRow.id } })) === 0);
  t("10. a cancelled checkout sends no receipt",
    (await db.emailLog.count({ where: { userId: cancelRow.id, template: "payment-receipt" } })) === 0);

  // …and they can retry: the same pending order is reused, not forked.
  const retry = await canceller.json("/api/checkout/create-order", {
    productId: product.id,
    currency: "NZD",
  });
  t("10. retrying reuses the pending order rather than forking a second one",
    retry.data.orderId === pending.data.orderId,
    `${pending.data.orderId} vs ${retry.data.orderId}`);

  /* ============ 9: failed payment ============ */

  const failEvent = paymentEvent("payment.failed", {
    gatewayOrderId: pending.data.gatewayOrderId,
    paymentId: `pay_${crypto.randomBytes(8).toString("hex")}`,
    amount: listPrice,
    currency: "NZD",
  });
  await postWebhook(failEvent);
  const failed = await db.order.findUnique({ where: { id: pending.data.orderId } });
  t("9. a failed payment does not mark the order paid", failed.status !== "PAID",
    `status ${failed.status}`);
  t("9. a failed payment creates no entitlement",
    (await db.entitlement.count({ where: { userId: cancelRow.id } })) === 0);

  /* ============ 15: the Complete Aviator Pass ============ */

  const pass = await db.product.findFirst({
    where: { slug: "complete-aviator-pass", status: "PUBLISHED" },
    include: { items: true, prices: true },
  });
  if (pass) {
    const passBuyer = new User();
    await passBuyer.signup("Rzp Pass", E("pass"));
    const passRow = await db.user.findUnique({ where: { email: E("pass") } });
    const order = await passBuyer.json("/api/checkout/create-order", {
      productId: pass.id,
      currency: "NZD",
    });
    const pid = `pay_${crypto.randomBytes(8).toString("hex")}`;
    await passBuyer.json("/api/checkout/verify", {
      orderId: order.data.orderId,
      razorpayOrderId: order.data.gatewayOrderId,
      razorpayPaymentId: pid,
      razorpaySignature: checkoutSignature(order.data.gatewayOrderId, pid),
    });
    const granted = await db.entitlement.count({
      where: { userId: passRow.id, status: "ACTIVE" },
    });
    t("15. the Complete Aviator Pass grants access to every item it contains",
      granted >= pass.items.length && pass.items.length > 1,
      `${granted} entitlements for ${pass.items.length} product items`);
  } else {
    checks.push("SKIP  15. Complete Aviator Pass (not published on this database)");
  }

  /* ============ 18: refreshing the success page ============ */

  const success1 = await buyer.visit(`/checkout/${orderId}/success`);
  const success2 = await buyer.visit(`/checkout/${orderId}/success`);
  t("18. the success page can be refreshed without breaking anything",
    success1.status === 200 && success2.status === 200,
    `${success1.status} then ${success2.status}`);
  const afterRefresh = await db.entitlement.count({ where: { userId: buyerRow.id, status: "ACTIVE" } });
  t("18. refreshing the success page does not change access", afterRefresh === grants,
    `${grants} → ${afterRefresh}`);

  /* ============ 19: content is gated by entitlement, not by UI ============ */

  {
    const outsider = new User();
    await outsider.signup("Rzp Outsider", E("outsider"));
    const item = product.items.find((i) => i.courseId);
    if (item) {
      const course = await db.course.findUnique({
        where: { id: item.courseId },
        select: { slug: true },
      });
      const res = await outsider.visit(`/courses/${course.slug}`);
      t("19. content is refused to a student with no entitlement",
        !res.text.includes("Continue") || res.text.includes("not part of your current access") ||
          res.landedOn !== `/courses/${course.slug}`,
        `landed ${res.landedOn}`);
    }
  }

  /* ============ 20: unknown gateway order ============ */

  {
    const stranger = new User();
    await stranger.signup("Rzp Stranger", E("stranger"));
    const strangerRow = await db.user.findUnique({ where: { email: E("stranger") } });

    const invented = `order_${crypto.randomBytes(8).toString("hex")}`;
    const inventedPayment = `pay_${crypto.randomBytes(8).toString("hex")}`;
    const res = await stranger.json("/api/checkout/verify", {
      orderId: crypto.randomUUID(),
      razorpayOrderId: invented,
      razorpayPaymentId: inventedPayment,
      razorpaySignature: checkoutSignature(invented, inventedPayment),
    });
    t("20. an unknown internal order cannot be settled", res.status === 404,
      `status ${res.status}`);
    t("20. an invented order grants nothing",
      (await db.entitlement.count({ where: { userId: strangerRow.id } })) === 0);

    // A webhook naming an order we never created must be a harmless no-op.
    const ghost = await postWebhook(
      paymentEvent("payment.captured", {
        gatewayOrderId: invented,
        paymentId: inventedPayment,
        amount: 99_999,
        currency: "NZD",
      }),
    );
    t("20. a webhook for an unknown order is accepted but grants nothing",
      ghost.status === 200 &&
        (await db.entitlement.count({ where: { userId: strangerRow.id } })) === 0,
      `status ${ghost.status}`);
  }

  /* ============ secrets never leave the server ============ */

  {
    const page = await buyer.visit(`/checkout/${orderId}`);
    const secret = process.env.RAZORPAY_KEY_SECRET ?? "";
    if (secret) {
      t("no key secret appears in a page response", !page.body.includes(secret));
    }
    const hookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
    if (hookSecret) {
      t("no webhook secret appears in a page response", !page.body.includes(hookSecret));
    }
    t("no card data is stored", (await db.payment.count({ where: { raw: { string_contains: "cvv" } } })) === 0);
  }

  await cleanup();

  console.log(checks.join("\n"));
  const failed2 = checks.filter((c) => c.startsWith("FAIL")).length;
  const passed = checks.filter((c) => c.startsWith("PASS")).length;
  console.log(`\n${passed}/${passed + failed2} passed`);
  await db.$disconnect();
  process.exit(failed2 ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await cleanup().catch(() => {});
  await db.$disconnect();
  process.exit(1);
});
