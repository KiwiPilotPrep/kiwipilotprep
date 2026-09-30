/**
 * Phase 5 integration tests — guarantee, refunds, flight school enterprise.
 *
 * Covers §33: eligibility, claims, refunds, organisation permissions,
 * invitations and document access. Runs over real HTTP against real Postgres.
 *
 *   node tests/guarantee.mjs
 */
import { PrismaClient } from "@prisma/client";

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
const IP_BASE = 121;
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
  async actionsOn(path) {
    const page = await this.request(path);
    const html = await page.text();
    const decode = (v) => v.replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    const bound = [];
    for (const m of html.matchAll(/name="\$ACTION_REF_(\d+)"/g)) {
      const n = m[1];
      const desc = html.match(new RegExp(`name="\\$ACTION_${n}:0" value="([^"]*)"`))?.[1];
      const args = html.match(new RegExp(`name="\\$ACTION_${n}:1" value="([^"]*)"`))?.[1];
      if (desc) bound.push({ n, desc: decode(desc), args: args ? decode(args) : "[]" });
    }
    return bound;
  }
  /** The plain $ACTION_ID on a page, for actions used without .bind(). */
  async plainAction(path) {
    const page = await this.request(path);
    const html = await page.text();
    return html.match(/ACTION_ID_([a-f0-9]+)/)?.[1] ?? null;
  }

  /** Posts a plain action, optionally with file parts. */
  async postPlain(path, id, fields = {}) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    fd.set(`$ACTION_ID_${id}`, "");
    const res = await this.request(path, { method: "POST", body: fd });
    return { status: res.status, location: res.headers.get("location") };
  }

  async replay(path, envelope, fields = {}) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    fd.set(`$ACTION_REF_${envelope.n}`, "");
    fd.set(`$ACTION_${envelope.n}:0`, envelope.desc);
    fd.set(`$ACTION_${envelope.n}:1`, envelope.args);
    const res = await this.request(path, { method: "POST", body: fd });
    return { status: res.status, location: res.headers.get("location") };
  }
  async submitForm(path, fields = {}, { pick } = {}) {
    const bound = await this.actionsOn(path);
    if (pick) {
      const chosen = pick(bound);
      if (!chosen) throw new Error(`no matching bound action on ${path}`);
      return this.replay(path, chosen, fields);
    }
    const page = await this.request(path);
    const html = await page.text();
    const id = html.match(/ACTION_ID_([a-f0-9]+)/)?.[1];
    if (!id) throw new Error(`no server action on ${path}`);
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    fd.set(`$ACTION_ID_${id}`, "");
    const res = await this.request(path, { method: "POST", body: fd });
    return { status: res.status, location: res.headers.get("location") };
  }
  login(email, password) {
    return this.submitForm("/login", { email, password });
  }
  signUp(name, email, password) {
    return this.submitForm("/signup", { name, email, password, consent: "on" });
  }
}

const stamp = Date.now().toString(36).slice(-6);
const PASSWORD = "Southerly7!wind";
const READY = `g5-ready-${stamp}@example.com`;
const NOTREADY = `g5-notready-${stamp}@example.com`;
const OUTSIDER = `g5-outsider-${stamp}@example.com`;

async function cleanup() {
  const users = await db.user.findMany({
    where: { email: { startsWith: "g5-" } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (ids.length) {
    await db.guaranteeClaim.deleteMany({ where: { userId: { in: ids } } });
    await db.mockAttempt.deleteMany({ where: { userId: { in: ids } } });
    await db.chapterProgress.deleteMany({ where: { userId: { in: ids } } });
    await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
    await db.order.deleteMany({ where: { userId: { in: ids } } });
    await db.organizationMember.deleteMany({ where: { userId: { in: ids } } });
    await db.organizationStudent.deleteMany({ where: { userId: { in: ids } } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }
  await db.organization.deleteMany({ where: { slug: { startsWith: "g5-" } } });
  await db.guaranteePolicy.deleteMany({ where: { version: { startsWith: "TEST-" } } });
  await db.mockExam.deleteMany({ where: { slug: { startsWith: "g5-" } } });
  await db.product.deleteMany({ where: { slug: { startsWith: "g5-" } } });
  await db.course.deleteMany({ where: { slug: { startsWith: "g5-" } } });

  // Created without a subject, so the course delete above does not reach them.
  const strays = await db.question.findMany({
    where: { prompt: { startsWith: "G5 " } },
    select: { id: true },
  });
  if (strays.length) {
    const ids = strays.map((q) => q.id);
    await db.questionOption.deleteMany({ where: { questionId: { in: ids } } });
    await db.question.deleteMany({ where: { id: { in: ids } } });
  }
}

async function main() {
  await cleanup();

  /* ------------------------------------------------------------ fixtures */

  const course = await db.course.create({
    data: {
      slug: "g5-course",
      title: "G5 Guarantee Course",
      status: "PUBLISHED",
      order: 97,
      subjects: {
        create: {
          slug: "g5-subject",
          title: "G5 Subject",
          status: "PUBLISHED",
          order: 0,
          chapters: {
            create: [
              { slug: "g5-c1", title: "G5 Chapter 1", status: "PUBLISHED", order: 0 },
              { slug: "g5-c2", title: "G5 Chapter 2", status: "PUBLISHED", order: 1 },
            ],
          },
        },
      },
    },
    include: { subjects: { include: { chapters: true } } },
  });
  const subject = course.subjects[0];
  const chapters = subject.chapters;

  await db.question.create({
    data: {
      subjectId: subject.id,
      prompt: "G5 sample question",
      kdrCode: "G5.ONE",
      status: "PUBLISHED",
      options: {
        create: [
          { text: "Right", isCorrect: true, order: 0 },
          { text: "Wrong", isCorrect: false, order: 1 },
        ],
      },
    },
  });

  const product = await db.product.create({
    data: {
      slug: "g5-product",
      title: "G5 Guarantee Package",
      status: "PUBLISHED",
      accessMonths: 3,
      order: 97,
      prices: { create: [{ currency: "NZD", amountMinor: 50000 }] },
      items: { create: { courseId: course.id } },
    },
  });

  const mock = await db.mockExam.create({
    data: {
      slug: "g5-mock",
      title: "G5 Mock",
      subjectId: subject.id,
      questionCount: 1,
      durationMinutes: 20,
      randomize: false,
      status: "PUBLISHED",
      order: 97,
    },
  });

  const policy = await db.guaranteePolicy.create({
    data: {
      version: `TEST-${stamp}`,
      title: "Test Guarantee",
      terms: "Complete all study modules and required mocks. Verified before any refund.",
      requiredStudyPercent: 100,
      requiredMockCount: 1,
      active: true,
      products: { create: { productId: product.id } },
    },
  });
  t("guarantee policy activated", Boolean(policy.active));

  /* -------------------------------------------------------- two students */

  const ready = new User();
  await ready.signUp("G5 Ready", READY, PASSWORD);
  const readyRow = await db.user.findUnique({ where: { email: READY } });

  const notReady = new User();
  await notReady.signUp("G5 Not Ready", NOTREADY, PASSWORD);
  const notReadyRow = await db.user.findUnique({ where: { email: NOTREADY } });

  const outsider = new User();
  await outsider.signUp("G5 Outsider", OUTSIDER, PASSWORD);
  const outsiderRow = await db.user.findUnique({ where: { email: OUTSIDER } });

  // Both buy the qualifying product.
  const orders = {};
  for (const [key, row] of [["ready", readyRow], ["notReady", notReadyRow]]) {
    const order = await db.order.create({
      data: {
        reference: `G5-${key}-${stamp}`,
        userId: row.id,
        productId: product.id,
        currency: "NZD",
        amountMinor: 50000,
        status: "PAID",
        payments: {
          create: {
            gatewayPaymentId: `pay_g5_${key}_${stamp}`,
            status: "CAPTURED",
            amountMinor: 50000,
            currency: "NZD",
            signatureVerified: true,
          },
        },
      },
    });
    orders[key] = order;
    await db.entitlement.create({
      data: {
        userId: row.id,
        scopeKey: `course:${course.id}`,
        courseId: course.id,
        productId: product.id,
        orderId: order.id,
        source: "PURCHASE",
        status: "ACTIVE",
      },
    });
  }

  /* ============== §2 ELIGIBILITY ============== */

  const beforeWork = await ready.visit("/guarantee");
  t("guarantee page loads", beforeWork.status === 200, `landed ${beforeWork.landedOn}`);
  t("§2 an unfinished student is not eligible",
    beforeWork.text.includes("Not eligible"), "expected not-eligible state");
  t("§3 the page explains why, in actionable terms",
    beforeWork.text.includes("Study completion is 0%") ||
      beforeWork.text.includes("0% complete"),
    "expected a study-completion blocker");

  // Complete study and one mock for the ready student.
  for (const ch of chapters) {
    await db.chapterProgress.create({
      data: { userId: readyRow.id, chapterId: ch.id, completedAt: new Date() },
    });
  }
  await db.mockAttempt.create({
    data: {
      userId: readyRow.id,
      mockExamId: mock.id,
      status: "SUBMITTED",
      expiresAt: new Date(Date.now() - 1000),
      submittedAt: new Date(),
      totalQuestions: 1,
      correctCount: 1,
      scorePercent: 100,
      examTitle: mock.title,
    },
  });

  const afterWork = await ready.visit("/guarantee");
  t("§2 a student who finished the work becomes eligible",
    afterWork.text.includes("Eligible") && afterWork.text.includes("Submit a guarantee claim"),
    "expected the claim form");

  // Only partial study for the other student.
  await db.chapterProgress.create({
    data: { userId: notReadyRow.id, chapterId: chapters[0].id, completedAt: new Date() },
  });
  const partial = await notReady.visit("/guarantee");
  t("§2 partial study stays ineligible",
    partial.text.includes("Not eligible"), "expected not-eligible");
  t("§2 mock requirement is reported",
    partial.text.includes("0 of 1"), "expected mock counts");

  /* ============== §6 CLAIM SUBMISSION ============== */

  // A crafted submission from the ineligible student must be refused.
  const submitActionId = await ready.plainAction("/guarantee");
  t("captured the claim submission action", Boolean(submitActionId));

  await notReady.postPlain("/guarantee", submitActionId, {
    examName: "Forged attempt",
  }).catch(() => null);
  const forgedClaims = await db.guaranteeClaim.count({ where: { userId: notReadyRow.id } });
  t("§2 an ineligible student cannot claim by replaying the form",
    forgedClaims === 0, `${forgedClaims} claims`);

  // Genuine submission, with a document.
  const pdf = Buffer.from("%PDF-1.4\nG5 test result sheet\n%%EOF");
  const fd = new FormData();
  fd.set("examName", "G5 Air Law");
  fd.set("examResult", "58% — not achieved");
  fd.set("studentNote", "Sat on the 1st.");
  fd.set("document", new File([pdf], "result.pdf", { type: "application/pdf" }));
  fd.set(`$ACTION_ID_${submitActionId}`, "");
  await ready.request("/guarantee", { method: "POST", body: fd });

  const claim = await db.guaranteeClaim.findFirst({
    where: { userId: readyRow.id },
    include: { documents: true },
  });
  t("§6 a claim is created", Boolean(claim), "no claim row");
  t("§6 the claim is SUBMITTED", claim?.status === "SUBMITTED", claim?.status);
  t("§6 the result sheet is stored", claim?.documents.length === 1);
  t("§5 the policy version is pinned onto the claim",
    claim?.policyVersionAtClaim === policy.version, claim?.policyVersionAtClaim);
  t("§2 the eligibility snapshot is recorded",
    claim?.studyPercentAtClaim === 100 && claim?.mocksCompletedAtClaim === 1,
    `${claim?.studyPercentAtClaim}% / ${claim?.mocksCompletedAtClaim}`);

  const dup = await db.guaranteeClaim.count({ where: { userId: readyRow.id } });
  t("§31 only one claim exists for the purchase", dup === 1, `${dup} claims`);

  /* ============== §7 DOCUMENT SECURITY ============== */

  const doc = claim.documents[0];
  const ownerRead = await ready.request(`/api/documents/${doc.id}`);
  t("§7 the owner can read their own document", ownerRead.status === 200, `status ${ownerRead.status}`);

  const strangerRead = await outsider.request(`/api/documents/${doc.id}`);
  t("§7 another student cannot read it", strangerRead.status === 404, `status ${strangerRead.status}`);

  const anonRead = await new User().request(`/api/documents/${doc.id}`);
  t("§7 an anonymous request is refused", anonRead.status === 401, `status ${anonRead.status}`);

  const admin = new User();
  await admin.login("admin@kiwipilotprep.com", "admin12345");
  const adminRead = await admin.request(`/api/documents/${doc.id}`);
  t("§7 the reviewing admin can read it", adminRead.status === 200, `status ${adminRead.status}`);
  t("§7 documents are served as attachments, never inline",
    (adminRead.headers.get("content-disposition") ?? "").startsWith("attachment"),
    adminRead.headers.get("content-disposition") ?? "none");

  /* ============== §9 STATE MACHINE ============== */

  const claimPage = await admin.visit(`/admin/claims/${claim.id}`);
  t("§8 admin can open the claim", claimPage.status === 200, `status ${claimPage.status}`);
  t("§8 completion evidence is shown", claimPage.text.includes("Completion evidence"));
  t("§8 the audit trail is shown", claimPage.text.includes("Audit trail"));

  const reviewAction = (await admin.actionsOn(`/admin/claims/${claim.id}`)).find((b) =>
    b.args.includes("UNDER_REVIEW"),
  );
  await admin.replay(`/admin/claims/${claim.id}`, reviewAction);
  let current = await db.guaranteeClaim.findUnique({ where: { id: claim.id } });
  t("§9 SUBMITTED → UNDER_REVIEW works", current.status === "UNDER_REVIEW", current.status);
  t("§9 the reviewer is recorded", Boolean(current.reviewedById));

  const approveAction = (await admin.actionsOn(`/admin/claims/${claim.id}`)).find((b) =>
    b.args.includes("APPROVED"),
  );
  await admin.replay(`/admin/claims/${claim.id}`, approveAction);
  current = await db.guaranteeClaim.findUnique({ where: { id: claim.id } });
  t("§9 UNDER_REVIEW → APPROVED works", current.status === "APPROVED", current.status);

  const audit = await db.claimAuditLog.findMany({ where: { claimId: claim.id } });
  t("§13 every transition is audited", audit.length >= 3, `${audit.length} rows`);
  t("§13 audit rows name the actor", audit.every((a) => a.actorId !== null));

  /* ============== §10/§12 REFUND ============== */

  const refundForms = await admin.actionsOn(`/admin/claims/${claim.id}`);
  const openRefundEnvelope = refundForms.find((b) => b.args === JSON.stringify([claim.id]));
  await admin.replay(`/admin/claims/${claim.id}`, openRefundEnvelope, {
    method: "BANK_TRANSFER",
    notes: "Test transfer",
  });

  const refund = await db.refund.findFirst({ where: { claimId: claim.id } });
  t("§10 a refund is created for the approved claim", Boolean(refund));
  t("§12 the amount comes from the order, not the request",
    refund?.amountMinor === 50000, `${refund?.amountMinor}`);
  t("§11 the refund method is recorded", refund?.method === "BANK_TRANSFER", refund?.method);
  t("§13 the processing admin is recorded", Boolean(refund?.processedById));

  current = await db.guaranteeClaim.findUnique({ where: { id: claim.id } });
  t("§9 opening a refund moves the claim to REFUND_PROCESSING",
    current.status === "REFUND_PROCESSING", current.status);

  // A second refund on the same claim must be refused.
  await admin.replay(`/admin/claims/${claim.id}`, openRefundEnvelope, {
    method: "MANUAL",
  }).catch(() => null);
  const refundCount = await db.refund.count({ where: { claimId: claim.id } });
  t("§30 a duplicate refund is blocked", refundCount === 1, `${refundCount} refunds`);

  /* ============== §22 STUDENT ISOLATION ============== */

  const strangerClaim = await outsider.visit(`/admin/claims/${claim.id}`);
  t("§28 a student cannot open the admin claim view",
    !strangerClaim.text.includes("Audit trail"), `landed ${strangerClaim.landedOn}`);

  const studentView = await ready.visit("/guarantee");
  t("§3 the student sees their claim status", studentView.text.includes(claim.reference));
  t("§3 internal notes are never shown to the student",
    !studentView.text.includes("internalNotes"), "internal notes leaked");

  /* ============== §16-§19 FLIGHT SCHOOL ============== */

  const schoolA = await db.organization.create({
    data: {
      slug: "g5-school-a",
      name: "G5 School A",
      members: { create: { userId: outsiderRow.id, role: "OWNER" } },
    },
  });
  const schoolB = await db.organization.create({
    data: { slug: "g5-school-b", name: "G5 School B" },
  });

  const licence = await db.enterpriseLicense.create({
    data: { organizationId: schoolA.id, productId: product.id, seatsTotal: 2 },
  });
  await db.enterpriseSeat.createMany({
    data: [
      { licenseId: licence.id, status: "AVAILABLE" },
      { licenseId: licence.id, status: "AVAILABLE" },
    ],
  });

  const orgDash = await outsider.visit(`/org/${schoolA.id}`);
  t("§20 the owner can open their school dashboard",
    orgDash.status === 200 && orgDash.text.includes("G5 School A"), `status ${orgDash.status}`);

  const crossOrg = await outsider.visit(`/org/${schoolB.id}`);
  t("§22 a member of one school cannot open another",
    crossOrg.status === 404, `status ${crossOrg.status}`);

  const nonMember = await ready.visit(`/org/${schoolA.id}`);
  t("§22 a non-member cannot open a school", nonMember.status === 404, `status ${nonMember.status}`);

  /* ---- invitations ---- */

  const inviteEnvelope = (await outsider.actionsOn(`/org/${schoolA.id}/students`)).find(
    (b) => b.args === JSON.stringify([schoolA.id]),
  );
  t("captured the invite action", Boolean(inviteEnvelope));

  await outsider.replay(`/org/${schoolA.id}/students`, inviteEnvelope, {
    email: `g5-invitee-${stamp}@example.com`,
    licenseId: licence.id,
  });
  const invitation = await db.organizationInvitation.findFirst({
    where: { organizationId: schoolA.id },
  });
  t("§18 an invitation is created", Boolean(invitation));
  t("§28 only the token hash is stored",
    Boolean(invitation?.tokenHash) && invitation.tokenHash.length === 64);

  await outsider.replay(`/org/${schoolA.id}/students`, inviteEnvelope, {
    email: `g5-invitee-${stamp}@example.com`,
    licenseId: licence.id,
  });
  const inviteCount = await db.organizationInvitation.count({
    where: { organizationId: schoolA.id, status: "PENDING" },
  });
  t("§18 a duplicate invitation is refused", inviteCount === 1, `${inviteCount} pending`);

  // Expired invitation.
  await db.organizationInvitation.update({
    where: { id: invitation.id },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });
  const expiredPage = await new User().visit(`/invite/anything-${stamp}`);
  t("§18 an unknown invitation token shows a safe message",
    expiredPage.text.includes("not valid") || expiredPage.text.includes("not found"),
    `landed ${expiredPage.landedOn}`);

  /* ---- seats ---- */

  // A student with NO personal purchase, so the enterprise grant is visible
  // on its own rather than merging into an existing purchased entitlement.
  const seatOnly = new User();
  await seatOnly.signUp("G5 Seat Only", `g5-seatonly-${stamp}@example.com`, PASSWORD);
  const seatOnlyRow = await db.user.findUnique({
    where: { email: `g5-seatonly-${stamp}@example.com` },
  });

  await db.organizationStudent.createMany({
    data: [
      { organizationId: schoolA.id, userId: readyRow.id, status: "ACTIVE" },
      { organizationId: schoolA.id, userId: seatOnlyRow.id, status: "ACTIVE" },
    ],
  });

  const preGrant = await db.entitlement.count({ where: { userId: seatOnlyRow.id } });
  t("the seat-only student starts with no access", preGrant === 0, `${preGrant}`);

  const seatsPage = await outsider.visit(`/org/${schoolA.id}/seats`);
  t("§17 seats page loads", seatsPage.status === 200, `status ${seatsPage.status}`);
  t("§17 seat counts come from the licence",
    seatsPage.text.includes("2 total") || seatsPage.text.includes("available"),
    "expected seat totals");

  const assignEnvelope = (await outsider.actionsOn(`/org/${schoolA.id}/seats`)).find((b) =>
    b.args.includes(seatOnlyRow.id),
  );
  t("captured the seat assignment action", Boolean(assignEnvelope));
  if (assignEnvelope) {
    await outsider.replay(`/org/${schoolA.id}/seats`, assignEnvelope);
  }
  const assignedSeat = await db.enterpriseSeat.findFirst({
    where: { licenseId: licence.id, status: "ASSIGNED" },
  });
  t("§17 a seat can be assigned", Boolean(assignedSeat));

  const enterpriseEntitlement = await db.entitlement.findFirst({
    where: { userId: seatOnlyRow.id, note: { contains: `licence ${licence.id}` } },
  });
  t("§19 assigning a seat grants a Phase 3 entitlement",
    Boolean(enterpriseEntitlement) && enterpriseEntitlement.source === "ADMIN",
    `entitlement ${enterpriseEntitlement?.source ?? "missing"}`);

  const seatStudentAccess = await seatOnly.visit(`/courses/${course.slug}`);
  t("§19 the seated student can now open the course",
    seatStudentAccess.text.includes("G5 Subject"), `landed ${seatStudentAccess.landedOn}`);

  // Releasing the seat withdraws the enterprise access...
  const releaseEnvelope = (await outsider.actionsOn(`/org/${schoolA.id}/seats`)).find((b) =>
    b.args.includes(assignedSeat.id),
  );
  if (releaseEnvelope) {
    await outsider.replay(`/org/${schoolA.id}/seats`, releaseEnvelope);
  }
  const afterRelease = await db.entitlement.findFirst({
    where: { userId: seatOnlyRow.id, note: { contains: `licence ${licence.id}` } },
  });
  t("§19 releasing a seat revokes the enterprise entitlement",
    afterRelease?.status === "REVOKED", afterRelease?.status ?? "missing");

  // ...but never a student's own purchase.
  const purchased = await db.entitlement.findFirst({
    where: { userId: readyRow.id, source: "PURCHASE" },
  });
  t("§19 a student's own purchased access is never revoked by seat changes",
    purchased?.status === "ACTIVE", purchased?.status ?? "missing");

  /* ---- student detail isolation ---- */

  const studentDetail = await outsider.visit(`/org/${schoolA.id}/students/${readyRow.id}`);
  t("§21 an instructor can view their own student",
    studentDetail.status === 200 && studentDetail.text.includes("G5 Ready"),
    `status ${studentDetail.status}`);
  t("§21 the view is academic only — no guarantee or payment data",
    !studentDetail.text.includes(claim.reference) && !studentDetail.text.includes("Refund"),
    "sensitive data leaked into the instructor view");

  const foreignStudent = await outsider.visit(`/org/${schoolA.id}/students/${notReadyRow.id}`);
  t("§28 a student of no school cannot be pulled into one",
    foreignStudent.status === 404, `status ${foreignStudent.status}`);

  /* ---- removal preserves history ---- */

  const beforeRemoval = await db.chapterProgress.count({ where: { userId: readyRow.id } });
  const removeEnvelope = (await outsider.actionsOn(`/org/${schoolA.id}/students`)).find(
    (b) => b.args === JSON.stringify([schoolA.id, readyRow.id]),
  );
  if (removeEnvelope) {
    await outsider.replay(`/org/${schoolA.id}/students`, removeEnvelope);
  }
  const afterRemoval = await db.chapterProgress.count({ where: { userId: readyRow.id } });
  const link = await db.organizationStudent.findFirst({
    where: { organizationId: schoolA.id, userId: readyRow.id },
  });
  t("§23 removing a student preserves their learning history",
    afterRemoval === beforeRemoval, `${beforeRemoval} → ${afterRemoval}`);
  t("§23 the enrolment is marked removed, not deleted",
    link?.status === "REMOVED", link?.status);

  /* ============== §27 ADMIN OVERSIGHT ============== */

  const adminClaims = await admin.visit("/admin/claims");
  t("§27 admin can list claims", adminClaims.text.includes(claim.reference));
  // The separate refunds console was removed: a refund belongs to the claim
  // that caused it, and is opened and completed there. The old route is gone
  // for everyone, admin included.
  const claimRefund = await admin.visit(`/admin/claims/${claim.id}`);
  t("§27 admin can see the refund on its claim",
    claimRefund.text.includes("BANK_TRANSFER") || claimRefund.text.includes("BANK TRANSFER"));
  const oldRefunds = await admin.visit("/admin/refunds");
  t("§27 the separate refunds console is gone",
    !oldRefunds.text.includes("BANK_TRANSFER"), `landed ${oldRefunds.landedOn}`);
  const adminOrgs = await admin.visit("/admin/organizations");
  t("§27 admin can list flight schools", adminOrgs.text.includes("G5 School A"));
  // Guarantee policy is developer-controlled and is no longer editable from
  // the console. The policy itself still exists and is still what a claim is
  // assessed against — the claim records the version it was judged under.
  const oldPolicy = await admin.visit("/admin/guarantee");
  t("§27 the policy console is gone", !oldPolicy.text.includes("Required study"),
    `landed ${oldPolicy.landedOn}`);
  const judged = await db.guaranteeClaim.findUnique({ where: { id: claim.id },
    select: { policyVersionAtClaim: true } });
  t("§27 the claim still records the policy version it was judged under",
    judged?.policyVersionAtClaim === policy.version, `${judged?.policyVersionAtClaim}`);

  /* ============== §26 EMAILS ============== */

  const emails = await db.emailLog.findMany({ where: { userId: readyRow.id } });
  t("§26 a claim-submitted email was recorded", emails.length >= 1, `${emails.length}`);
  // As in tests/mocks.mjs: assert the outcome is recorded truthfully rather
  // than assuming a provider is absent. These suites run against whatever the
  // environment has configured.
  t("§26 every email outcome is recorded honestly",
    emails.every((e) =>
      ["LOGGED", "SENT", "FAILED"].includes(e.status) &&
      !(e.status === "SENT" && e.provider === "none")),
    emails.map((e) => `${e.status}/${e.provider}`).join(", "));

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
