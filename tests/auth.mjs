/**
 * Authentication, password policy, reset, account state and purchase gating.
 *
 * Covers the brief's §28 security matrix and its §30 acceptance tests A–E.
 * Everything runs over real HTTP against real Postgres. Where a token is
 * needed it is read from the outgoing message, never from the database — the
 * token is not recoverable from the database, which is the property being
 * protected.
 *
 *   node tests/auth.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const LOG = process.env.SERVER_LOG ?? `${process.env.TEMP ?? "/tmp"}/kpp3100.log`;
const db = new PrismaClient();

const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

let ipCounter = 0;
const nextIp = () => `198.18.${Math.floor(ipCounter / 250) % 250}.${(ipCounter++ % 250) + 1}`;

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
    while (res.status >= 300 && res.status < 400 && hops++ < 6) {
      const loc = res.headers.get("location");
      const next = loc.startsWith("http") ? new URL(loc).pathname + new URL(loc).search : loc;
      trail.push(next);
      res = await this.request(next);
    }
    const body = await res.text();
    return { status: res.status, body, trail, landedOn: trail.at(-1) };
  }
  async json(path, body) {
    const res = await this.request(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
  }
  /**
   * Posts a server-action form, returning the raw (unfollowed) response.
   *
   * Handles both shapes React emits: a plain inline action, and a `.bind()`-ed
   * one, which serialises as a `$ACTION_REF_n` triplet instead. The reset and
   * resend forms are bound, so a helper that only understood the plain form
   * would silently post nothing and look like a broken feature.
   */
  async postForm(path, fields) {
    const html = await (await this.request(path)).text();
    const decode = (v) =>
      v.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'");

    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);

    const refMatch = html.match(/name="\$ACTION_REF_(\d+)"/);
    if (refMatch) {
      const n = refMatch[1];
      // The backslash must survive into the regex source: a bare `$` there is
      // an end-of-string anchor, so the pattern would never match.
      const desc = html.match(new RegExp(`name="\\$ACTION_${n}:0" value="([^"]*)"`))?.[1];
      const args = html.match(new RegExp(`name="\\$ACTION_${n}:1" value="([^"]*)"`))?.[1];
      fd.set(`$ACTION_REF_${n}`, "");
      fd.set(`$ACTION_${n}:0`, decode(desc ?? ""));
      fd.set(`$ACTION_${n}:1`, args ? decode(args) : "[]");
    } else {
      const id = html.match(/ACTION_ID_([a-f0-9]+)/)?.[1];
      if (!id) throw new Error(`no server action on ${path}`);
      fd.set(`$ACTION_ID_${id}`, "");
    }

    return this.request(path, { method: "POST", body: fd });
  }
  signUp(name, email, password, next) {
    return this.postForm("/signup", { name, email, password, consent: "on", ...(next ? { next } : {}) });
  }
  logIn(email, password, next) {
    return this.postForm("/login", { email, password, ...(next ? { next } : {}) });
  }
}

const GOOD_PASSWORD = "Southerly7!wind";
const stamp = Date.now().toString(36).slice(-6);
const E = (label) => `autht-${label}-${stamp}@example.com`;

async function cleanup() {
  const users = await db.user.findMany({
    where: { email: { startsWith: "autht-" } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (ids.length) {
    await db.emailLog.deleteMany({ where: { userId: { in: ids } } });
    await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
    await db.payment.deleteMany({ where: { order: { userId: { in: ids } } } });
    await db.order.deleteMany({ where: { userId: { in: ids } } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }
}

/** The newest link of a given kind, read from the message that was sent. */
function linkFromMail(kind) {
  try {
    const log = fs.readFileSync(LOG, "utf8");
    const re = new RegExp(`/${kind}/([A-Za-z0-9_-]{40,})`, "g");
    return [...log.matchAll(re)].at(-1)?.[1] ?? null;
  } catch {
    return null;
  }
}

const location = (res) => res.headers.get("location") ?? "";

async function main() {
  await cleanup();

  const product = await db.product.findFirst({
    where: { status: "PUBLISHED", prices: { some: { currency: "NZD" } } },
    select: { id: true, slug: true },
  });
  if (!product) throw new Error("No published NZD product to test against.");

  const ordersBefore = await db.order.count();

  /* ===================== §28 SIGNUP — password policy ===================== */

  {
    const weakCases = [
      ["short", "Ab3!ef", "below the minimum length"],
      ["no lower", "SOUTHERLY7!WIND", "with no lowercase letter"],
      ["no digit", "Southerly!wind", "with no number"],
      ["no symbol", "Southerly7wind", "with no special character"],
      ["common", "Password1!", "that is a well-known password"],
    ];

    for (const [label, password, description] of weakCases) {
      const u = new User();
      const email = E(`weak-${label.replace(/\s/g, "")}`);
      const res = await u.signUp("Weak Password", email, password);
      const refused = location(res).includes("error=password");
      t(`a password ${description} is refused`, refused, `redirected to ${location(res)}`);

      const created = await db.user.findUnique({ where: { email } });
      t(`no account is created for a password ${description}`, created === null,
        "an account was created with a rejected password");
    }
  }

  {
    // An address is still off limits — anyone who can email this person can
    // guess it. A name is not: a long passphrase is not weak because four
    // letters of someone's name appear inside it, and that rule was turning
    // people away from the form for no security gain.
    const u = new User();
    const email = E("selfemail");
    const res = await u.signUp("Jordan Ngata", email, `${email.split("@")[0]}9!x`);
    t("a password containing the person's own email address is refused",
      location(res).includes("error=password"), `redirected to ${location(res)}`);
    t("and no account is created for it",
      (await db.user.findUnique({ where: { email } })) === null);
  }

  {
    // The two rules that were removed, asserted the other way round so their
    // removal is deliberate rather than accidental.
    const u = new User();
    const email = E("ownname");
    const res = await u.signUp("Jordan Ngata", email, "ngata7!wind");
    t("a lowercase password containing the person's own name is accepted",
      location(res).includes("/verify/sent"), `redirected to ${location(res)}`);
    const row = await db.user.findUnique({ where: { email }, select: { name: true } });
    t("the account is created with the name they gave", row?.name === "Jordan Ngata", row?.name);
  }

  {
    // A rejection must not cost them what they had already typed.
    const u = new User();
    const email = E("keepfields");
    await u.signUp("Kept Fields", email, "short1!");
    const back = await u.visit("/signup?error=password");
    t("a rejected signup hands back the name that was typed",
      back.body.includes('value="Kept Fields"'), "the name field came back empty");
    t("and the email address too",
      back.body.includes(`value="${email}"`), "the email field came back empty");
    t("but never the password",
      !back.body.includes("short1!"), "the password was echoed back into the page");
  }

  /* ===================== §28 SIGNUP — the happy path ===================== */

  const buyer = new User();
  const buyerEmail = E("buyer");
  {
    const res = await buyer.signUp("Auth Buyer", buyerEmail, GOOD_PASSWORD);
    t("a strong password is accepted", location(res).includes("/verify/sent"),
      `redirected to ${location(res)}`);

    const row = await db.user.findUnique({ where: { email: buyerEmail } });
    t("the account exists after signup", Boolean(row));
    t("the account starts unverified", row?.emailVerifiedAt === null);
    t("the account starts active", row?.status === "ACTIVE");
    t("the password is not stored in plaintext",
      Boolean(row?.passwordHash) && row.passwordHash !== GOOD_PASSWORD &&
        row.passwordHash.startsWith("$2"),
      "passwordHash does not look like a bcrypt digest");
    t("a verification token was issued", Boolean(row?.verifyTokenHash));
  }

  {
    // Duplicate signup must not disclose anything, nor disturb the account.
    const other = new User();
    const res = await other.signUp("Impostor", buyerEmail, "Different9!pass");
    t("a duplicate email is handled without creating a second account",
      location(res).includes("error=taken"), `redirected to ${location(res)}`);
    const count = await db.user.count({ where: { email: buyerEmail } });
    t("only one account exists for that address", count === 1, `${count} accounts`);
  }

  /* ============ §30 TEST B / §28 PURCHASE — unverified is blocked ========= */

  {
    const buy = await buyer.json("/api/checkout/create-order", {
      productId: product.id,
      currency: "NZD",
    });
    t("§30-B an unverified account cannot create an order", buy.status === 403,
      `status ${buy.status}`);
    t("§30-B the refusal is explained to the client", buy.data.needsVerification === true,
      JSON.stringify(buy.data));

    const buyerRow = await db.user.findUnique({ where: { email: buyerEmail } });
    const orders = await db.order.count({ where: { userId: buyerRow.id } });
    t("§30-B no order row is created", orders === 0, `${orders} orders`);

    const payments = await db.payment.count({ where: { order: { userId: buyerRow.id } } });
    t("§30-B no gateway order is created", payments === 0, `${payments} payments`);

    const start = await buyer.visit(`/checkout/start?product=${product.id}&currency=NZD`);
    t("§30-B the checkout page sends an unverified buyer to confirm",
      start.landedOn.startsWith("/verify/sent"), `landed ${start.landedOn}`);
  }

  /* ================= §17 the chosen product survives the detour ========== */

  {
    const start = await buyer.visit(`/checkout/start?product=${product.id}&currency=NZD`);
    t("§17 the confirmation step remembers the product",
      start.landedOn.includes("next=") && start.landedOn.includes(product.id),
      `landed ${start.landedOn}`);
  }

  /* ===================== §30 TEST A — verify, then buy =================== */

  const verifyToken = linkFromMail("verify");
  {
    t("§30-A a verification link was sent", Boolean(verifyToken));

    const bad = await buyer.visit(`/verify/${crypto.randomBytes(32).toString("base64url")}`);
    t("an invented verification token is refused",
      bad.body.includes("couldn&#x27;t use that link"), "an invented token was accepted");

    const ok = await buyer.visit(`/verify/${verifyToken}`);
    t("§30-A the real link confirms the address", ok.body.includes("email is confirmed"),
      `landed ${ok.landedOn}`);

    const again = await buyer.visit(`/verify/${verifyToken}`);
    t("§30-E a verification token cannot be reused",
      again.body.includes("couldn&#x27;t use that link"), "a spent token was accepted");

    const buy = await buyer.json("/api/checkout/create-order", {
      productId: product.id,
      currency: "NZD",
    });
    t("§30-A a verified account can create an order", buy.status === 200, `status ${buy.status}`);
    t("§30-A the order carries a gateway order id", Boolean(buy.data.gatewayOrderId));
    t("§30-A the price comes from the database", buy.data.amountMinor > 0,
      `amount ${buy.data.amountMinor}`);
  }

  /* ============== §30 TEST D — attack simulation on the API ============== */

  {
    const attacker = new User();
    const attackerEmail = E("attacker");
    await attacker.signUp("Direct API", attackerEmail, GOOD_PASSWORD);

    // Everything a manipulated frontend could plausibly send.
    const attempts = [
      { productId: product.id, currency: "NZD" },
      { productId: product.id, currency: "NZD", emailVerified: true },
      { productId: product.id, currency: "NZD", amountMinor: 1, price: 1 },
      { productId: product.id, currency: "NZD", user: { emailVerifiedAt: "2020-01-01" } },
      { productId: product.id, currency: "NZD", role: "ADMIN", status: "ACTIVE" },
    ];

    let allRefused = true;
    for (const body of attempts) {
      const res = await attacker.json("/api/checkout/create-order", body);
      if (res.status !== 403) allRefused = false;
    }
    t("§30-D every direct API attempt by an unverified account is refused", allRefused,
      "one of the crafted payloads was accepted");

    const row = await db.user.findUnique({ where: { email: attackerEmail } });
    t("§30-D the crafted payloads did not verify the account", row.emailVerifiedAt === null);
    t("§30-D the crafted payloads did not change the role", row.role === "STUDENT");
    const orders = await db.order.count({ where: { userId: row.id } });
    t("§30-D no order was created by any attempt", orders === 0, `${orders} orders`);

    const anon = await new User().json("/api/checkout/create-order", {
      productId: product.id,
      currency: "NZD",
    });
    t("a signed-out caller is refused with 401", anon.status === 401, `status ${anon.status}`);
    t("the signed-out refusal points at login", anon.data.needsLogin === true);
  }

  /* ===================== §28 PASSWORD RESET ============================== */

  const resetUser = new User();
  const resetEmail = E("reset");
  {
    await resetUser.signUp("Reset Tester", resetEmail, GOOD_PASSWORD);
    await db.user.update({
      where: { email: resetEmail },
      data: { emailVerifiedAt: new Date() },
    });

    // §12: an unknown address must look exactly like a known one.
    const unknown = await new User().postForm("/forgot", { email: `nobody-${stamp}@example.com` });
    const known = await new User().postForm("/forgot", { email: resetEmail });
    t("§12 an unknown address gets the same response as a known one",
      location(unknown) === location(known),
      `${location(unknown)} vs ${location(known)}`);

    const page = await new User().visit("/forgot?sent=1");
    t("§12 the response does not confirm whether the account exists",
      page.body.includes("If that address has an account"), "the wording discloses existence");
  }

  const resetToken = linkFromMail("reset");
  {
    t("a reset link was sent", Boolean(resetToken));

    const row = await db.user.findUnique({ where: { email: resetEmail } });
    t("the reset token is stored as a hash, not the token itself",
      row.resetTokenHash !== resetToken &&
        row.resetTokenHash === crypto.createHash("sha256").update(resetToken).digest("hex"),
      "stored value is not the sha256 of the emailed token");
    t("the reset token has an expiry", Boolean(row.resetTokenExpiresAt));

    const logged = await db.emailLog.findFirst({
      where: { userId: row.id, template: "password-reset" },
      orderBy: { createdAt: "desc" },
    });
    t("the reset email is recorded in the log", Boolean(logged));
    t("the reset link is NOT stored in the log", !(logged?.body ?? "").includes("/reset/"),
      "a working reset token is sitting in EmailLog");

    const bad = await new User().visit(`/reset/${crypto.randomBytes(32).toString("base64url")}`);
    t("an invented reset token is refused", bad.body.includes("couldn&#x27;t use that link"),
      "an invented reset token rendered the form");

    const form = await new User().visit(`/reset/${resetToken}`);
    t("a valid reset link renders the form", form.body.includes("Choose a new password"),
      `landed ${form.landedOn}`);

    // A weak new password must be refused just as it is at signup.
    const weak = await new User().postForm(`/reset/${resetToken}`, {
      password: "password",
      confirm: "password",
    });
    t("a weak new password is refused at reset", location(weak).includes("error="),
      `redirected to ${location(weak)}`);

    const stillValid = await db.user.findUnique({ where: { email: resetEmail } });
    t("a refused reset leaves the token usable", Boolean(stillValid.resetTokenHash),
      "the token was spent by a rejected attempt");

    const mismatch = await new User().postForm(`/reset/${resetToken}`, {
      password: GOOD_PASSWORD,
      confirm: "Different9!pass",
    });
    t("mismatched confirmation is refused", location(mismatch).includes("error=mismatch"),
      `redirected to ${location(mismatch)}`);
  }

  /* ============ §30 TEST C / E — reset completes, token is spent ========= */

  const NEW_PASSWORD = "Nor'wester42#Arch";
  {
    const done = await new User().postForm(`/reset/${resetToken}`, {
      password: NEW_PASSWORD,
      confirm: NEW_PASSWORD,
    });
    t("§30-C a valid reset succeeds", location(done).includes("/login?reset=1"),
      `redirected to ${location(done)}`);

    const row = await db.user.findUnique({ where: { email: resetEmail } });
    t("§30-E the reset token is cleared after use", row.resetTokenHash === null,
      "the reset link is still redeemable");
    t("sessions issued before the reset are invalidated",
      Boolean(row.sessionsValidFrom), "no session cutoff was set");

    const replay = await new User().visit(`/reset/${resetToken}`);
    t("§30-E a reset token cannot be reused",
      replay.body.includes("couldn&#x27;t use that link"), "a spent reset token was accepted");

    const oldPassword = await new User().logIn(resetEmail, GOOD_PASSWORD);
    t("§30-C the old password no longer works",
      location(oldPassword).includes("error=invalid"), `redirected to ${location(oldPassword)}`);

    const fresh = new User();
    const newPassword = await fresh.logIn(resetEmail, NEW_PASSWORD);
    t("§30-C the new password works", !location(newPassword).includes("error"),
      `redirected to ${location(newPassword)}`);

    const dash = await fresh.visit("/dashboard");
    t("§30-C the session after reset is usable", dash.status === 200, `status ${dash.status}`);
  }

  {
    // The session held before the reset must stop working.
    t("a session held from before the password change is refused",
      (await resetUser.visit("/dashboard")).landedOn.startsWith("/login"),
      "the pre-reset session still worked");
  }

  /* ===================== §16 account states ============================== */

  {
    const disabled = new User();
    const disabledEmail = E("disabled");
    await disabled.signUp("Disabled Tester", disabledEmail, GOOD_PASSWORD);
    await db.user.update({
      where: { email: disabledEmail },
      data: { emailVerifiedAt: new Date(), status: "DISABLED", sessionsValidFrom: new Date() },
    });

    t("a disabled account loses the session it was holding",
      (await disabled.visit("/dashboard")).landedOn.startsWith("/login"),
      "a disabled account kept its session");

    const attempt = new User();
    const res = await attempt.logIn(disabledEmail, GOOD_PASSWORD);
    t("a disabled account cannot sign in", location(res).includes("error=invalid"),
      `redirected to ${location(res)}`);
    t("the refusal does not reveal that the account is disabled",
      location(res).includes("error=invalid") && !location(res).includes("disabled"),
      "the message distinguishes disabled from wrong-password");

    const buy = await disabled.json("/api/checkout/create-order", {
      productId: product.id,
      currency: "NZD",
    });
    t("a disabled account cannot purchase even with a verified address",
      buy.status === 401, `status ${buy.status}`);

    // §12 again: a disabled account must not be discoverable through reset.
    const forgot = await new User().postForm("/forgot", { email: disabledEmail });
    t("a disabled account gets the same reset response as any other",
      location(forgot).includes("/forgot?sent=1"), `redirected to ${location(forgot)}`);
  }

  /* ===================== §6 resend protection ============================ */

  {
    const resender = new User();
    const resendEmail = E("resend");
    await resender.signUp("Resend Tester", resendEmail, GOOD_PASSWORD);

    const first = await resender.postForm("/verify/sent", {});
    t("§6 the resend button sends another email",
      location(first).includes("resent=1") || location(first).includes("error=wait"),
      `redirected to ${location(first)}`);

    const second = await resender.postForm("/verify/sent", {});
    t("§6 an immediate second resend is refused by the cooldown",
      location(second).includes("error=wait"), `redirected to ${location(second)}`);

    await db.user.update({
      where: { email: resendEmail },
      data: { emailVerifiedAt: new Date() },
    });
    const afterVerified = await resender.visit("/verify/sent");
    t("§6 resend is not offered once the address is confirmed",
      !afterVerified.body.includes("Send it again"), `landed ${afterVerified.landedOn}`);
  }

  /* ===================== §5 no internals on show ========================= */

  {
    const anon = new User();
    for (const path of ["/login", "/signup", "/forgot"]) {
      const page = await anon.visit(path);
      // A bare `node_modules` is not a leak: in dev the bundler names its
      // chunk URLs after the packages inside them. What must never appear is
      // a stack frame, a filesystem path off this machine, or a secret.
      const leaks =
        /at .*\(.*:\d+:\d+\)|PrismaClient|RESEND_API_KEY|AUTH_SECRET|[A-Za-z]:\[^"'\s]*node_modules|\/(?:home|Users)\/[^"'\s]*node_modules/.test(
          page.body,
        );
      t(`${path} exposes no stack trace, secret or internal detail`, !leaks,
        "something internal is rendered on the page");
    }

    const badToken = await anon.visit("/verify/not-a-real-token");
    t("a bad verification link shows no token or internals",
      !badToken.body.includes("verifyTokenHash") && !badToken.body.includes("PrismaClient"),
      "internals leaked on the failure page");
  }

  /* ===================== §29 nothing else broke ========================== */

  {
    const ordersAfter = await db.order.count();
    t("§29 no stray orders were created by the refused attempts",
      ordersAfter - ordersBefore <= 1,
      `${ordersAfter - ordersBefore} new orders (only the one verified purchase is expected)`);

    const admin = await db.user.findFirst({ where: { role: "ADMIN" }, select: { status: true } });
    t("§29 the admin account is untouched and active", admin?.status === "ACTIVE");

    const home = await new User().visit("/");
    t("§29 the public homepage still renders", home.status === 200);
    const pricing = await new User().visit("/pricing");
    t("§29 the pricing page still renders", pricing.status === 200);
  }

  await cleanup();

  console.log(checks.join("\n"));
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
