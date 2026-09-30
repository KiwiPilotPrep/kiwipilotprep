/**
 * Email verification.
 *
 * The properties under test, in order of how much they would cost if wrong:
 *
 *   1. A token is never recoverable from the database — not from the user row,
 *      not from the email log. Only the person holding the inbox can verify.
 *   2. An unverified account is blocked from the trial and the checkout, and
 *      from nothing else.
 *   3. Accounts that existed before verification did are not locked out.
 *
 *   node tests/verification.mjs
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
// Its own slice of the documentation range. Every suite used to start at
// 203.0.113.1, and the signup form allows twenty accounts an hour from one
// address -- so running the suite twice in an hour failed on a rate limit
// rather than on anything under test.
const IP_BASE = 181;
const nextIp = () => `203.0.113.${IP_BASE + (ipCounter++ % 25)}`;

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
    return { status: res.status, body, landedOn: trail.at(-1) };
  }
  async json(path, body) {
    const res = await this.request(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
  }
  async signup(name, email, password = "Southerly7!wind") {
    const html = await (await this.request("/signup")).text();
    const id = html.match(/ACTION_ID_([a-f0-9]+)/)?.[1];
    const fd = new FormData();
    fd.set("name", name);
    fd.set("consent", "on");
    fd.set("email", email);
    fd.set("password", password);
    fd.set(`$ACTION_ID_${id}`, "");
    return this.request("/signup", { method: "POST", body: fd });
  }
  async login(email, password) {
    const html = await (await this.request("/login")).text();
    const id = html.match(/ACTION_ID_([a-f0-9]+)/)?.[1];
    const fd = new FormData();
    fd.set("email", email);
    fd.set("password", password);
    fd.set(`$ACTION_ID_${id}`, "");
    return this.request("/login", { method: "POST", body: fd });
  }
}

const stamp = Date.now().toString(36).slice(-6);
const NEW_USER = `verif-new-${stamp}@example.com`;
const OLD_USER = `verif-old-${stamp}@example.com`;

async function cleanup() {
  const users = await db.user.findMany({
    where: { email: { startsWith: "verif-" } },
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

/** The raw token only ever exists in the sent message, so read it from there. */
function tokenFromServerLog() {
  try {
    const log = fs.readFileSync(LOG, "utf8");
    return [...log.matchAll(/\/verify\/([A-Za-z0-9_-]{40,})/g)].at(-1)?.[1] ?? null;
  } catch {
    return null;
  }
}

async function main() {
  await cleanup();

  const product = await db.product.findFirst({
    where: { status: "PUBLISHED", prices: { some: { currency: "NZD" } } },
    select: { id: true },
  });
  const subject = await db.subject.findFirst({
    where: { status: "PUBLISHED" },
    select: { slug: true, course: { select: { slug: true } } },
  });

  /* ================= signing up ================= */

  const student = new User();
  const res = await student.signup("Verification Tester", NEW_USER);
  t("signup sends the student to the confirmation page",
    (res.headers.get("location") ?? "").includes("/verify/sent"),
    `redirected to ${res.headers.get("location")}`);

  const row = await db.user.findUnique({ where: { email: NEW_USER } });
  t("the account is created immediately", Boolean(row));
  t("a new account starts unverified", row.emailVerifiedAt === null,
    `emailVerifiedAt ${row.emailVerifiedAt}`);
  t("a verification token is issued", Boolean(row.verifyTokenHash));
  t("the token has an expiry", Boolean(row.verifyTokenExpiresAt));

  /* ================= the token is not in the database ================= */

  const raw = tokenFromServerLog();
  t("the confirmation link reached the outgoing message", Boolean(raw),
    "no link found — is the server logging to the expected file?");

  if (raw) {
    t("the database stores a hash, not the token",
      row.verifyTokenHash !== raw &&
        row.verifyTokenHash === crypto.createHash("sha256").update(raw).digest("hex"),
      "stored value is not the sha256 of the emailed token");
  }

  const logRow = await db.emailLog.findFirst({
    where: { userId: row.id, template: "email-verification" },
    orderBy: { createdAt: "desc" },
  });
  t("the verification email is recorded in the log", Boolean(logRow));
  t("the log records who it went to", logRow?.to === NEW_USER);
  t("the log does NOT store the link", !(logRow?.body ?? "").includes("/verify/"),
    "a working token is sitting in EmailLog");

  const anyLeak = await db.emailLog.count({ where: { body: { contains: "/verify/" } } });
  t("no verification link exists anywhere in the email log", anyLeak === 0,
    `${anyLeak} rows contain one`);
  const inviteLeak = await db.emailLog.count({ where: { body: { contains: "/invite/" } } });
  t("no invitation token exists anywhere in the email log", inviteLeak === 0,
    `${inviteLeak} rows contain one`);

  /* ================= the Resend integration ================= */

  {
    // The subject is specified, and a student scanning an inbox recognises it.
    t("the verification email uses the specified subject",
      logRow?.subject === "Verify your KiwiPilotPrep account",
      `subject was "${logRow?.subject}"`);

    // The log records the outcome honestly: SENT only when a provider took it.
    t("the send outcome is recorded, not assumed",
      ["SENT", "LOGGED", "FAILED"].includes(logRow?.status ?? ""),
      `status ${logRow?.status}`);

    const providerRows = await db.emailLog.count({
      where: { template: "email-verification", status: "SENT", provider: "resend" },
    });
    if (process.env.RESEND_API_KEY) {
      t("with a provider configured, verification mail is actually sent",
        providerRows > 0, "no verification email has ever reached Resend");
    } else {
      checks.push("SKIP  real delivery (no RESEND_API_KEY on this server — by design for tests)");
    }
  }

  {
    // The dev link opt-in must never be on by default, and must never put a
    // token into the stored log.
    const anyLoggedToken = await db.emailLog.count({
      where: { template: "email-verification", body: { contains: "/verify/" } },
    });
    t("no verification link is ever stored in the email log", anyLoggedToken === 0,
      `${anyLoggedToken} rows contain one`);
  }

  /* ================= what unverified is blocked from ================= */

  const dash = await student.visit("/dashboard");
  t("an unverified student can still reach the dashboard", dash.status === 200,
    `status ${dash.status} landed ${dash.landedOn}`);
  t("the dashboard shows a reminder to confirm", dash.body.includes("verify-bar"),
    "no reminder banner rendered");

  const profile = await student.visit("/profile");
  t("an unverified student can still reach their profile", profile.status === 200);

  const pricing = await student.visit("/pricing");
  t("an unverified student can still browse pricing", pricing.status === 200);

  if (product) {
    const buy = await student.json("/api/checkout/create-order", {
      productId: product.id,
      currency: "NZD",
    });
    t("an unverified student cannot start a checkout", buy.status === 403,
      `status ${buy.status}`);
    t("the refusal tells the client why", buy.data.needsVerification === true,
      JSON.stringify(buy.data));

    const orders = await db.order.count({ where: { userId: row.id } });
    t("the blocked checkout created no order", orders === 0, `${orders} orders`);
  }

  if (subject) {
    // One chooser for every subject now — there is no per-subject trial route.
    const trial = await student.visit("/trial");
    t("an unverified student is sent to confirm before the free trial",
      trial.landedOn === "/verify/sent", `landed ${trial.landedOn}`);
  }

  /* ================= confirming ================= */

  const bad = await student.visit(`/verify/${crypto.randomBytes(32).toString("base64url")}`);
  t("an unknown token is refused", bad.body.includes("couldn&#x27;t use that link"),
    "an invented token was accepted");

  const stillUnverified = await db.user.findUnique({ where: { email: NEW_USER } });
  t("a refused token verifies nothing", stillUnverified.emailVerifiedAt === null);

  const confirm = await student.visit(`/verify/${raw}`);
  t("the real link confirms the address", confirm.body.includes("email is confirmed"),
    "confirmation page did not report success");

  const verified = await db.user.findUnique({ where: { email: NEW_USER } });
  t("the account is now verified", Boolean(verified.emailVerifiedAt));
  t("the token is cleared after use", verified.verifyTokenHash === null,
    "the token is still redeemable");

  const replay = await student.visit(`/verify/${raw}`);
  t("the same link cannot be used twice", replay.body.includes("couldn&#x27;t use that link"),
    "a spent token was accepted again");

  /* ================= after confirming ================= */

  if (product) {
    const buy = await student.json("/api/checkout/create-order", {
      productId: product.id,
      currency: "NZD",
    });
    t("a verified student can start a checkout", buy.status === 200, `status ${buy.status}`);
    t("the order is priced from the database", buy.data.amountMinor > 0,
      `amount ${buy.data.amountMinor}`);
  }

  if (subject) {
    // One chooser for every subject now — there is no per-subject trial route.
    const trial = await student.visit("/trial");
    t("a verified student reaches the free trial", trial.landedOn !== "/verify/sent",
      `landed ${trial.landedOn}`);
  }

  const afterDash = await student.visit("/dashboard");
  t("the reminder banner disappears once confirmed", !afterDash.body.includes("verify-bar"),
    "the banner is still showing");

  /* ================= expired tokens ================= */

  const expiring = new User();
  const EXP = `verif-exp-${stamp}@example.com`;
  await expiring.signup("Expiry Tester", EXP);
  const expRow = await db.user.findUnique({ where: { email: EXP } });
  const expToken = tokenFromServerLog();
  await db.user.update({
    where: { id: expRow.id },
    data: { verifyTokenExpiresAt: new Date(Date.now() - 1000) },
  });
  const expired = await expiring.visit(`/verify/${expToken}`);
  t("an expired link says so, rather than failing silently",
    expired.body.includes("has expired"), "expired token was not reported as expired");
  const stillNot = await db.user.findUnique({ where: { id: expRow.id } });
  t("an expired link verifies nothing", stillNot.emailVerifiedAt === null);
  await db.user.delete({ where: { id: expRow.id } }).catch(() => {});

  /* ================= accounts that predate verification ================= */

  // Exactly what the migration's backfill produced: verified, no token.
  const legacy = await db.user.create({
    data: {
      email: OLD_USER,
      name: "Legacy Student",
      // bcrypt of "Southerly7!wind"
      passwordHash: (await db.user.findUnique({ where: { email: NEW_USER } })).passwordHash,
      role: "STUDENT",
      emailVerifiedAt: new Date("2026-01-01"),
    },
  });
  const legacyUser = new User();
  await legacyUser.login(OLD_USER, "Southerly7!wind");
  if (product) {
    const buy = await legacyUser.json("/api/checkout/create-order", {
      productId: product.id,
      currency: "NZD",
    });
    t("an account created before verification existed is not locked out",
      buy.status === 200, `status ${buy.status} — the backfill would have stranded them`);
  }
  const legacyDash = await legacyUser.visit("/dashboard");
  t("a grandfathered account sees no reminder banner",
    !legacyDash.body.includes("verify-bar"));
  await db.order.deleteMany({ where: { userId: legacy.id } });
  await db.user.delete({ where: { id: legacy.id } }).catch(() => {});

  /* ================= resend is throttled ================= */

  const spammer = new User();
  const SPAM = `verif-spam-${stamp}@example.com`;
  await spammer.signup("Resend Tester", SPAM);
  const sentAtBefore = (await db.user.findUnique({ where: { email: SPAM } })).verifySentAt;
  t("the send time is recorded so resends can be throttled", Boolean(sentAtBefore));

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
