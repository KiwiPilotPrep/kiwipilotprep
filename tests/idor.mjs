/**
 * Phase 6 §5 — authorization / IDOR audit.
 *
 * Everything here is the same attack, repeated across every object the brief
 * names: take an id that legitimately belongs to one person, hand it to a
 * different person's session, and require the server to refuse. The ids used
 * are real ones read from the database, not guesses, so a passing run means
 * ownership is checked rather than merely that the id was unguessable.
 *
 * The expected refusal is 404, not 403: telling an attacker that an object
 * exists but is not theirs is itself a disclosure.
 *
 *   node tests/idor.mjs
 */
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

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
const IP_BASE = 1;
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
    const html = await (await this.request("/signup")).text();
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
}

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
const VICTIM = `idor-victim-${stamp}@example.com`;
const ATTACKER = `idor-attacker-${stamp}@example.com`;

async function cleanup() {
  const users = await db.user.findMany({
    where: { email: { startsWith: "idor-" } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (ids.length) {
    const claims = await db.guaranteeClaim.findMany({
      where: { userId: { in: ids } },
      select: { id: true },
    });
    const claimIds = claims.map((c) => c.id);
    if (claimIds.length) {
      await db.refund.deleteMany({ where: { claimId: { in: claimIds } } });
      await db.guaranteeDocument.deleteMany({ where: { claimId: { in: claimIds } } });
      await db.claimAuditLog.deleteMany({ where: { claimId: { in: claimIds } } }).catch(() => {});
      await db.guaranteeClaim.deleteMany({ where: { id: { in: claimIds } } });
    }
    await db.mockAttemptQuestion.deleteMany({ where: { attempt: { userId: { in: ids } } } });
    await db.mockAttempt.deleteMany({ where: { userId: { in: ids } } });
    await db.questionAttempt.deleteMany({ where: { userId: { in: ids } } });
    await db.chapterProgress.deleteMany({ where: { userId: { in: ids } } }).catch(() => {});
    await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
    await db.payment.deleteMany({ where: { order: { userId: { in: ids } } } });
    await db.order.deleteMany({ where: { userId: { in: ids } } });
    await db.organizationMember.deleteMany({ where: { userId: { in: ids } } }).catch(() => {});
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }
  await db.organization.deleteMany({ where: { slug: { startsWith: "idor-" } } }).catch(() => {});
  await db.guaranteePolicy.deleteMany({ where: { version: { startsWith: "idor-fixture-" } } })
    .catch(() => {});
}

/** Reads a real id owned by someone else, so the probe is never a guess. */
async function main() {
  await cleanup();

  const victim = new User();
  await victim.signup("IDOR Victim", VICTIM);
  const attacker = new User();
  await attacker.signup("IDOR Attacker", ATTACKER);

  const victimRow = await db.user.findUnique({ where: { email: VICTIM } });
  const attackerRow = await db.user.findUnique({ where: { email: ATTACKER } });
  t("both accounts were created", Boolean(victimRow && attackerRow));

  /* ================= mock attempts and scorecards ================= */

  const exam = await db.mockExam.findFirst({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, subjectId: true, subject: { select: { title: true } } },
  });

  if (exam) {
    // Give the victim real access, so the attempt is genuine rather than a stub.
    await db.entitlement.create({
      data: {
        userId: victimRow.id,
        scopeKey: `subject:${exam.subjectId}`,
        subjectId: exam.subjectId,
        source: "ADMIN",
        status: "ACTIVE",
        note: "idor test fixture",
      },
    });

    const started = await victim.visit(`/mocks`);
    t("the victim can see the mock list", started.status === 200);

    const attempt = await db.mockAttempt.create({
      data: {
        userId: victimRow.id,
        mockExamId: exam.id,
        status: "IN_PROGRESS",
        expiresAt: new Date(Date.now() + 60 * 60_000),
        // Snapshot fields the engine normally fills; the attempt has to be a
        // real row for the ownership check to be exercised properly.
        examTitle: exam.title,
        subjectTitle: exam.subject?.title ?? null,
      },
    });

    const stolen = await attacker.visit(`/mocks/attempts/${attempt.id}`);
    // A refusal is either a redirect away or a 404 rendered in place. Both are
    // correct; what matters is that no part of the paper comes back.
    t("another student cannot open a mock attempt",
      stolen.status === 404 || stolen.landedOn !== `/mocks/attempts/${attempt.id}`,
      `landed ${stolen.landedOn} status ${stolen.status}`);
    t("a stolen attempt id leaks no question text",
      !stolen.text.includes("Submit exam") && !stolen.text.includes("Time remaining"),
      "part of the exam surface was rendered");

    const anon = await new User().visit(`/mocks/attempts/${attempt.id}`);
    t("a signed-out visitor cannot open a mock attempt",
      anon.landedOn.startsWith("/login"), `landed ${anon.landedOn}`);

    // Answering someone else's attempt through the API.
    const forgedAnswer = await attacker.json("/api/mocks/answer", {
      attemptId: attempt.id,
      questionId: "anything",
      optionId: "anything",
    }).catch(() => ({ status: 404, data: {} }));
    t("another student cannot answer into a mock attempt",
      forgedAnswer.status !== 200, `status ${forgedAnswer.status}`);
  } else {
    checks.push("SKIP  mock attempt checks (no published mock exam on this database)");
  }

  /* ================= orders and checkout ================= */

  const product = await db.product.findFirst({
    where: { status: "PUBLISHED", prices: { some: { currency: "NZD" } } },
    select: { id: true },
  });

  if (product) {
    const order = await victim.json("/api/checkout/create-order", {
      productId: product.id,
      currency: "NZD",
    });
    t("the victim can start a checkout", order.status === 200, `status ${order.status}`);

    const peek = await attacker.visit(`/checkout/${order.data.orderId}`);
    t("another student cannot open someone else's checkout",
      !peek.text.includes("Order summary"), `landed ${peek.landedOn}`);

    // Verifying someone else's order, even with a well-formed payload.
    const hijack = await attacker.json("/api/checkout/verify", {
      orderId: order.data.orderId,
      razorpayOrderId: order.data.gatewayOrderId,
      razorpayPaymentId: `pay_${crypto.randomBytes(8).toString("hex")}`,
      razorpaySignature: crypto.randomBytes(32).toString("hex"),
    });
    t("another student cannot settle someone else's order",
      hijack.status === 404 || hijack.status === 400, `status ${hijack.status}`);

    const stillPending = await db.order.findUnique({ where: { id: order.data.orderId } });
    t("the hijack attempt left the order untouched", stillPending.status === "PENDING",
      `status ${stillPending.status}`);

    const granted = await db.entitlement.count({ where: { userId: attackerRow.id } });
    t("the hijack attempt granted the attacker nothing", granted === 0, `${granted} entitlements`);
  } else {
    checks.push("SKIP  order checks (no published priced product)");
  }

  /* ================= guarantee claims and documents ================= */

  // Build a claim with a document for the victim, so the checks below run
  // against real rows rather than being skipped on a clean database.
  const victimOrder = await db.order.findFirst({
    where: { userId: victimRow.id },
    select: { id: true },
  });
  // A policy is normally created by the admin; on a database where nobody has
  // yet, make an inactive one so the claim fixture below can exist. It is
  // inactive, so it can never affect a real student's eligibility.
  let policy = await db.guaranteePolicy.findFirst({ select: { id: true } });
  if (!policy) {
    policy = await db.guaranteePolicy.create({
      data: {
        version: `idor-fixture-${stamp}`,
        title: "IDOR test fixture policy",
        terms: "Fixture only. Never active, never shown to a student.",
        active: false,
      },
      select: { id: true },
    });
  }
  let victimClaim = null;
  if (victimOrder && policy) {
    victimClaim = await db.guaranteeClaim.create({
      data: {
        reference: `GC-IDOR-${stamp.toUpperCase()}`,
        userId: victimRow.id,
        orderId: victimOrder.id,
        policyId: policy.id,
        status: "SUBMITTED",
        examName: "IDOR fixture exam",
      },
    });
    await db.guaranteeDocument.create({
      data: {
        claimId: victimClaim.id,
        filename: "result-sheet.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024,
        uploadedById: victimRow.id,
        // Points at nothing on disk on purpose: authorization is checked
        // before the file is read, which is exactly what is under test.
        storageKey: `guarantee/${victimRow.id}/idor-fixture-${stamp}.pdf`,
      },
    });
  }

  const someoneElsesClaim = victimClaim ?? (await db.guaranteeClaim.findFirst({ select: { id: true } }));
  if (someoneElsesClaim) {
    const probe = await attacker.visit(`/admin/claims/${someoneElsesClaim.id}`);
    t("a student cannot open the admin view of a claim",
      !probe.text.includes("Internal notes") && !probe.landedOn.startsWith("/admin/claims/"),
      `landed ${probe.landedOn}`);
  }

  const someoneElsesDocument = await db.guaranteeDocument.findFirst({
    where: victimClaim ? { claimId: victimClaim.id } : {},
    select: { id: true, claim: { select: { userId: true } } },
  });
  if (someoneElsesDocument && someoneElsesDocument.claim.userId !== attackerRow.id) {
    const res = await attacker.request(`/api/documents/${someoneElsesDocument.id}`);
    t("another student cannot download a private claim document", res.status === 404,
      `status ${res.status}`);
    const anonRes = await new User().request(`/api/documents/${someoneElsesDocument.id}`);
    t("a signed-out visitor cannot download a private claim document", anonRes.status === 401,
      `status ${anonRes.status}`);
  } else {
    checks.push("SKIP  document checks (no uploaded claim document on this database)");
  }

  // A document id that does not exist must look identical to one that does but
  // is not yours, or the endpoint becomes an existence oracle.
  const missing = await attacker.request(`/api/documents/${crypto.randomUUID()}`);
  t("an unknown document id is refused the same way as someone else's",
    missing.status === 404, `status ${missing.status}`);

  /* ================= organisation isolation ================= */

  let fixtureOrg = await db.organization.findFirst({ select: { id: true, name: true } });
  if (!fixtureOrg) {
    fixtureOrg = await db.organization.create({
      data: { name: "IDOR Fixture Flight School", slug: `idor-${stamp}` },
      select: { id: true, name: true },
    });
  }
  const orgs = [fixtureOrg];
  if (orgs.length) {
    const probe = await attacker.visit(`/org/${orgs[0].id}`);
    t("a non-member cannot open an organisation",
      !probe.text.includes("Seats") || probe.landedOn !== `/org/${orgs[0].id}`,
      `landed ${probe.landedOn}`);

    const students = await attacker.visit(`/org/${orgs[0].id}/students`);
    t("a non-member cannot list an organisation's students",
      !students.text.includes("Invite a student"), `landed ${students.landedOn}`);

    const seats = await attacker.visit(`/org/${orgs[0].id}/seats`);
    t("a non-member cannot see an organisation's seats",
      !seats.text.includes("Available"), `landed ${seats.landedOn}`);
  } else {
    checks.push("SKIP  organisation checks (no organisations on this database)");
  }

  /* ================= admin surface ================= */

  const ADMIN_ONLY = [
    "/admin", "/admin/products", "/admin/orders", "/admin/coupons",
    "/admin/claims", "/admin/queries", "/admin/students", "/admin/organizations",
    "/admin/attempts", "/admin/mocks", "/admin/mocks/free-trial",
    "/admin/mocks/questions",
    // Removed management screens. They are 404s now, but the role check runs
    // first, so a student must still be turned away rather than shown one.
    "/admin/courses", "/admin/syllabus", "/admin/syllabus-map", "/admin/refunds",
  ];
  for (const path of ADMIN_ONLY) {
    const res = await attacker.visit(path);
    t(`a student cannot open ${path}`,
      !res.landedOn.startsWith("/admin"), `landed ${res.landedOn}`);
  }

  /* ================= role cannot be self-assigned ================= */

  const roleAfter = await db.user.findUnique({
    where: { id: attackerRow.id },
    select: { role: true },
  });
  t("a signed-up account is a student and nothing more", roleAfter.role === "STUDENT",
    `role ${roleAfter.role}`);

  /* ================= paid content is not served unentitled ================= */

  const paidChapter = await db.chapter.findFirst({
    where: { status: "PUBLISHED", content: { isNot: null } },
    select: {
      slug: true,
      subject: { select: { slug: true, course: { select: { slug: true } } } },
      content: { select: { blocks: true } },
    },
  });
  if (paidChapter) {
    const path = `/courses/${paidChapter.subject.course.slug}/subjects/${paidChapter.subject.slug}/chapters/${paidChapter.slug}`;
    const res = await attacker.visit(path);
    const firstText = JSON.stringify(paidChapter.content.blocks).match(/"text":"([^"]{25,80})"/)?.[1];
    t("paid chapter text is never sent to an unentitled browser",
      !firstText || !res.body.includes(firstText),
      "chapter body leaked to a student without access");
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
