/**
 * Admin student verification, section mapping and the admin-only routes.
 *
 * Drives the real console over HTTP as a real admin, against real Postgres.
 * Everything it creates is prefixed `ash-` and removed at the end.
 *
 *   node tests/admin-student-history.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const db = new PrismaClient();

const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

let ipCounter = 0;
const IP_BASE = 71;
const nextIp = () => `198.51.100.${IP_BASE + (ipCounter++ % 20)}`;

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
      text: body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "),
      landedOn: trail.at(-1),
      trail,
    };
  }
  /** Captures the bound server-action envelopes rendered on a page. */
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

  /** Submits one captured envelope, as clicking that button would. */
  async replay(path, envelope, fields = {}) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    fd.set(`$ACTION_REF_${envelope.n}`, "");
    fd.set(`$ACTION_${envelope.n}:0`, envelope.desc);
    fd.set(`$ACTION_${envelope.n}:1`, envelope.args);
    const res = await this.request(path, { method: "POST", body: fd });
    return { status: res.status, location: res.headers.get("location") };
  }

  async submitForm(path, fields = {}) {
    const page = await this.request(path);
    const html = await page.text();
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    const id = html.match(/ACTION_ID_([a-f0-9]+)/)?.[1];
    if (!id) throw new Error(`no server action on ${path}`);
    fd.set(`$ACTION_ID_${id}`, "");
    const res = await this.request(path, { method: "POST", body: fd });
    return { status: res.status, location: res.headers.get("location") };
  }
  login(email, password) {
    return this.submitForm("/login", { email, password });
  }
}

const stamp = Date.now().toString(36).slice(-5);
const STUDENT_EMAIL = `ash-student-${stamp}@example.com`;
const STUDENT_NAME = `Ashleigh Verification ${stamp}`;

/** The policy that was active before this run, so it can be put back. */
let previouslyActivePolicyId = null;

async function cleanup() {
  await db.guaranteeClaim.deleteMany({ where: { policy: { version: { startsWith: "ASHP-" } } } })
    .catch(() => {});
  await db.quaifyingProduct.deleteMany({ where: { policy: { version: { startsWith: "ASHP-" } } } })
    .catch(() => {});
  await db.guaranteePolicy.deleteMany({ where: { version: { startsWith: "ASHP-" } } })
    .catch(() => {});
  if (previouslyActivePolicyId) {
    await db.guaranteePolicy
      .update({ where: { id: previouslyActivePolicyId }, data: { active: true } })
      .catch(() => {});
    previouslyActivePolicyId = null;
  }

  const users = await db.user.findMany({
    where: { email: { startsWith: "ash-" } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (!ids.length) return;
  const attempts = await db.mockAttempt.findMany({
    where: { userId: { in: ids } },
    select: { id: true },
  });
  const attemptIds = attempts.map((a) => a.id);
  await db.claimAuditLog.deleteMany({ where: { claim: { userId: { in: ids } } } }).catch(() => {});
  await db.refund.deleteMany({ where: { claim: { userId: { in: ids } } } });
  await db.guaranteeDocument.deleteMany({ where: { claim: { userId: { in: ids } } } });
  await db.guaranteeClaim.deleteMany({ where: { userId: { in: ids } } });
  await db.freeTrialUse.deleteMany({ where: { userId: { in: ids } } });
  await db.mockReport.deleteMany({ where: { attemptId: { in: attemptIds } } });
  await db.kdrResult.deleteMany({ where: { userId: { in: ids } } });
  await db.mockAttemptQuestion.deleteMany({ where: { attemptId: { in: attemptIds } } });
  await db.mockAttempt.deleteMany({ where: { id: { in: attemptIds } } });
  await db.emailLog.deleteMany({ where: { userId: { in: ids } } });
  await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
  await db.payment.deleteMany({ where: { order: { userId: { in: ids } } } });
  await db.order.deleteMany({ where: { userId: { in: ids } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
}

async function main() {
  await cleanup();

  const admin = new User();
  await admin.login("admin@kiwipilotprep.com", "admin12345");
  const console_ = await admin.visit("/admin");
  t("admin signed in", console_.status === 200 && console_.text.includes("Dashboard"));

  /* ================= a student with a real history ================= */

  const course = await db.course.findFirstOrThrow({
    where: { slug: "ppl-theory" },
    select: { id: true, title: true },
  });
  const product = await db.product.findFirstOrThrow({
    where: { slug: "ppl-theory-package" },
    include: { prices: true },
  });

  const student = await db.user.create({
    data: {
      email: STUDENT_EMAIL,
      name: STUDENT_NAME,
      passwordHash: await bcrypt.hash("Southerly7!wind", 10),
      emailVerifiedAt: new Date(),
    },
  });

  // A second account that also answers to a search for "Ashleigh", so that
  // granting to the chosen student is a real claim and not a coincidence.
  const decoy = await db.user.create({
    data: {
      email: `ash-decoy-${stamp}@example.com`,
      name: `Ashleigh Vermilion ${stamp}`,
      passwordHash: await bcrypt.hash("Northerly4!wind", 10),
      emailVerifiedAt: new Date(),
    },
  });

  // An order placed at a price that is deliberately NOT the current one, so
  // the page can be caught reading ProductPrice instead of the order.
  const HISTORIC_MINOR = 44400;
  const currentNzd = product.prices.find((p) => p.currency === "NZD")?.amountMinor ?? 0;
  t("the historic amount differs from today's price", HISTORIC_MINOR !== currentNzd,
    `${HISTORIC_MINOR} vs ${currentNzd}`);

  const order = await db.order.create({
    data: {
      reference: `ASH-${stamp}`,
      userId: student.id,
      productId: product.id,
      currency: "NZD",
      amountMinor: HISTORIC_MINOR,
      listAmountMinor: HISTORIC_MINOR,
      status: "PAID",
    },
  });
  await db.entitlement.create({
    data: {
      userId: student.id,
      scopeKey: `course:${course.id}`,
      courseId: course.id,
      productId: product.id,
      orderId: order.id,
      source: "PURCHASE",
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 90 * 86_400_000),
    },
  });

  /* ========================= student search ========================= */

  const byEmail = await admin.visit(`/admin/students?q=${encodeURIComponent(`ash-student-${stamp}`)}`);
  t("search by email finds the student", byEmail.text.includes(STUDENT_NAME), byEmail.text.slice(0, 120));

  const partial = await admin.visit(`/admin/students?q=${encodeURIComponent("ashleigh ver")}`);
  t("partial, case-insensitive name search finds them", partial.text.includes(STUDENT_NAME));

  const upper = await admin.visit(`/admin/students?q=${encodeURIComponent("ASHLEIGH")}`);
  t("upper-case search finds them too", upper.text.includes(STUDENT_NAME));

  const none = await admin.visit(`/admin/students?q=${encodeURIComponent("zzzznotarealstudent")}`);
  t("a search with no matches says so", none.text.includes("No student matches that"));

  // The list is the default state of the page, on both screens that show it.
  for (const path of ["/admin/students", "/admin/history"]) {
    const listed = await admin.visit(path);
    t(`${path} lists students without being searched`,
      listed.status === 200 && listed.text.includes(STUDENT_NAME),
      `status ${listed.status}`);
    t(`${path} does not gate the list behind a search`,
      !listed.text.includes("Nothing is listed until you search"));
  }

  const cleared = await admin.visit("/admin/students");
  t("clearing the search restores the full list", cleared.text.includes(STUDENT_NAME));
  t("the search box is offered above the list", cleared.body.includes('name="q"'));

  // Searching is done by the database, not by hiding rows in the browser.
  const other = await admin.visit(
    `/admin/students?q=${encodeURIComponent(`ash-decoy-${stamp}`)}`,
  );
  t("a search excludes the students it does not match",
    other.text.includes(`Ashleigh Vermilion ${stamp}`) && !other.text.includes(STUDENT_EMAIL),
    "a non-matching student was still sent to the browser");

  /* ======================== the history page ======================== */

  const page = await admin.visit(`/admin/students/${student.id}`);
  t("the student history page opens", page.status === 200, `status ${page.status}`);
  t("it shows the account", page.text.includes(STUDENT_EMAIL));
  t("it shows the order reference", page.text.includes(`ASH-${stamp}`));
  t("it shows the amount actually paid", page.text.includes("$444"), "historic amount missing");
  t("it does NOT show today's price for that order",
    !page.text.includes("$699"), "current product price leaked into the history");
  t("it shows the currency", page.text.includes("NZD"));
  t("it shows the entitlement", page.text.includes(course.title));
  t("it shows course progress", page.text.includes("Course progress"));
  t("it shows the mock history section", page.text.includes("Mock history"));
  t("it shows guarantee eligibility", page.text.includes("Guarantee eligibility"));

  /* ================== eligibility is real, not decor ================== */

  // The page must report what the backend says, so give the backend a policy
  // to say something with. The existing active policy (if any) is stood down
  // for the duration and put back by cleanup.
  const wasActive = await db.guaranteePolicy.findFirst({
    where: { active: true },
    select: { id: true },
  });
  if (wasActive) {
    previouslyActivePolicyId = wasActive.id;
    await db.guaranteePolicy.update({ where: { id: wasActive.id }, data: { active: false } });
  }

  const policy = await db.guaranteePolicy.create({
    data: {
      version: `ASHP-${stamp}`,
      title: "Pass guarantee (admin history test)",
      terms: "Finish the course and sit the mocks. Verified before any refund is made.",
      requiredStudyPercent: 100,
      requiredMockCount: 1,
      active: true,
      products: { create: { productId: product.id } },
    },
  });

  // ------------------------------------------------------ NOT ELIGIBLE ---
  // This student has bought the product and done nothing else.
  const strict = await admin.visit(`/admin/students/${student.id}`);
  t("eligibility is assessed once a policy is active",
    strict.text.includes("Guarantee eligibility") &&
      !strict.text.includes("There is no active guarantee policy"));
  t("a student who has done nothing is NOT ELIGIBLE",
    strict.text.includes("NOT ELIGIBLE"), "no verdict rendered");
  t("the study requirement is shown with its real numbers",
    strict.text.includes("Study modules") && /0% complete \(100% required\)/.test(strict.text),
    strict.text.match(/Study modules[^%]*%[^)]*\)/)?.[0]);
  t("the mock requirement is shown with its real numbers",
    strict.text.includes("Mock exams") && strict.text.includes("0 of 1 completed"),
    strict.text.match(/Mock exams.{0,40}/)?.[0]);
  t("unmet requirements are marked with a cross", strict.text.includes("✕"));
  t("the reasons are given",
    /Reason\s*s?\s*:/.test(strict.text) &&
      strict.text.includes("The guarantee requires 100%"));
  t("the policy version is named", strict.text.includes(policy.version));
  t("the order it was assessed against is named", strict.text.includes(`ASH-${stamp}`));

  /* ===================== guarantee claim reuse ===================== */

  // A second, newer qualifying purchase. Assessed on its own, the student's
  // eligibility would now be read against this one — so if the claim review
  // names it, the review is looking at the wrong purchase.
  await db.order.create({
    data: {
      reference: `ASH2-${stamp}`,
      userId: student.id,
      productId: product.id,
      currency: "NZD",
      amountMinor: 55500,
      listAmountMinor: 55500,
      status: "PAID",
    },
  });
  const freshest = await admin.visit(`/admin/students/${student.id}`);
  t("without a claim, the newest qualifying purchase is assessed",
    freshest.text.includes(`ASH2-${stamp}`),
    freshest.text.match(/against order \S+/)?.[0]);

  const claim = await db.guaranteeClaim.create({
    data: {
      reference: `ASHC-${stamp}`,
      userId: student.id,
      orderId: order.id,
      policyId: policy.id,
      status: "SUBMITTED",
      submittedAt: new Date(),
      studyPercentAtClaim: 12,
      mocksCompletedAtClaim: 0,
      policyVersionAtClaim: policy.version,
    },
  });

  const claimPage = await admin.visit(`/admin/claims/${claim.id}`);
  t("the claim page opens", claimPage.status === 200, `status ${claimPage.status}`);
  t("the claim page reuses the student history",
    claimPage.text.includes("Student verification") &&
      claimPage.text.includes(`ASH-${stamp}`) &&
      claimPage.text.includes("Mock history"));
  t("the claim page shows the amount actually paid", claimPage.text.includes("$444"));
  t("the claim page does not show today's price", !claimPage.text.includes("$699"));
  t("the claim page shows real eligibility", claimPage.text.includes("Guarantee eligibility"));
  t("it reports NOT ELIGIBLE for a student who did no work",
    claimPage.text.includes("NOT ELIGIBLE"));
  t("the claim page repeats the same unmet requirements",
    claimPage.text.includes("Study modules") && claimPage.text.includes("Mock exams"));
  t("the claim is assessed against the order it was filed against",
    /against order ASH-/.test(claimPage.text),
    claimPage.text.match(/against order \S+/)?.[0]);
  t("not against the student's newer purchase",
    !claimPage.text.includes(`against order ASH2-${stamp}`));
  t("the existing decision workflow is still there",
    claimPage.text.includes("Begin review") && claimPage.text.includes("Audit trail"));
  t("the refund panel is still there", claimPage.text.includes("Refund"));

  await db.claimAuditLog.deleteMany({ where: { claimId: claim.id } }).catch(() => {});
  await db.guaranteeClaim.delete({ where: { id: claim.id } }).catch(() => {});

  // ---------------------------------------------------------- ELIGIBLE ---
  // Same student, same code path; only the policy thresholds move. If the
  // verdict were decorative it could not follow the policy like this.
  await db.guaranteePolicy.update({
    where: { id: policy.id },
    data: { requiredStudyPercent: 0, requiredMockCount: 0 },
  });

  const lenient = await admin.visit(`/admin/students/${student.id}`);
  t("the verdict follows the backend, not the markup",
    lenient.text.includes("ELIGIBLE") && !lenient.text.includes("NOT ELIGIBLE"),
    lenient.text.match(/NOT ELIGIBLE|ELIGIBLE/)?.[0] ?? "no verdict");
  t("met requirements are marked with a tick", lenient.text.includes("✓"));
  t("no reasons are listed when nothing blocks the claim",
    !/Reason\s*s?\s*:/.test(lenient.text));
  t("the requirements still read from the policy",
    lenient.text.includes("0% complete (0% required)") &&
      lenient.text.includes("0 of 0 completed"),
    lenient.text.match(/Study modules.{0,40}/)?.[0]);

  await db.quaifyingProduct.deleteMany({ where: { policyId: policy.id } });
  await db.guaranteePolicy.delete({ where: { id: policy.id } });
  if (previouslyActivePolicyId) {
    await db.guaranteePolicy.update({
      where: { id: previouslyActivePolicyId },
      data: { active: true },
    });
    previouslyActivePolicyId = null;
  }

  /* ============ attempts stay inside the admin console ============ */

  const attempt = await db.mockAttempt.findFirst({
    where: { status: { not: "IN_PROGRESS" } },
    orderBy: { startedAt: "desc" },
    select: { id: true, userId: true },
  });
  if (attempt) {
    const list = await admin.visit("/admin/attempts");
    t("Inspect points at the admin route",
      list.body.includes(`/admin/attempts/${attempt.id}`),
      "attempts list still links at the student route");

    const detail = await admin.visit(`/admin/attempts/${attempt.id}`);
    t("the admin attempt page opens", detail.status === 200, `status ${detail.status}`);
    t("the admin is not sent to the student dashboard",
      detail.landedOn.startsWith("/admin/"), `landed ${detail.landedOn}`);
    t("no step of the journey left the admin console",
      detail.trail.every((p) => p.startsWith("/admin/")), detail.trail.join(" → "));
    t("the student mock-history link is not offered to an admin",
      !detail.body.includes('href="/mocks/history"'), "student navigation rendered for an admin");
    t("the student mocks link is not offered either",
      !detail.body.includes('href="/mocks"'), "student navigation rendered for an admin");

    // All three controls stay. The fault was where History went, not that
    // History existed.
    t("Back is offered", />\s*Back\s*</.test(detail.body), "Back is missing");
    t("Download result is offered",
      detail.body.includes(`/mocks/attempts/${attempt.id}/report.pdf`),
      "the download is missing");
    t("History is offered",
      detail.body.includes(`/admin/history/${attempt.userId}/mocks`), "History is missing");
    t("Back returns to Attempts & Results",
      detail.body.includes('href="/admin/attempts"'), "Back does not point at the attempts list");

    // Download must actually produce the student's PDF for an admin.
    const pdf = await admin.request(`/mocks/attempts/${attempt.id}/report.pdf`);
    t("an admin can download the student's result",
      pdf.status === 200 && (pdf.headers.get("content-type") ?? "").includes("pdf"),
      `status ${pdf.status} type ${pdf.headers.get("content-type")}`);

    // History opens inside the console and shows that student's attempts.
    const hist = await admin.visit(`/admin/history/${attempt.userId}/mocks`);
    t("History opens an admin mock history",
      hist.status === 200 && hist.text.includes("Student mock history"), `status ${hist.status}`);
    t("History never lands on the student dashboard",
      hist.trail.every((p) => p.startsWith("/admin/")), hist.trail.join(" → "));
    t("the mock history names the student",
      hist.text.includes("Mock") && hist.text.includes("Subject") &&
        hist.text.includes("Percentage") && hist.text.includes("Result"),
      "the history table is missing its columns");
    t("the mock history offers Inspect",
      hist.body.includes(`/admin/attempts/${attempt.id}`), "no inspect action");
  } else {
    checks.push("SKIP  admin attempt inspection (no finished attempt on this database)");
  }

  /* ========================= authorisation ========================= */

  const intruder = new User();
  await intruder.login(STUDENT_EMAIL, "Southerly7!wind");
  for (const path of [
    `/admin/students/${student.id}`,
    "/admin/students",
    attempt ? `/admin/attempts/${attempt.id}` : "/admin/attempts",
  ]) {
    const probe = await intruder.visit(path);
    t(`a student cannot open ${path.replace(student.id, "<id>")}`,
      !probe.landedOn.startsWith("/admin"), `landed ${probe.landedOn}`);
  }

  const anon = new User();
  const anonProbe = await anon.visit(`/admin/students/${student.id}`);
  t("a signed-out visitor is sent to log in",
    anonProbe.landedOn.startsWith("/login"), `landed ${anonProbe.landedOn}`);

  /* ===================== grant access catalogue ===================== */

  const grant = await admin.visit(
    `/admin/students?q=${encodeURIComponent(`ash-student-${stamp}`)}&grant=${student.id}`,
  );
  t("grant access opens for the chosen student", grant.text.includes(`Grant access to ${STUDENT_NAME}`));

  const published = await db.product.findMany({
    where: { status: "PUBLISHED" },
    select: { title: true },
  });
  // JSX renders `+ {title}` as two nodes with a comment between them, so read
  // the button text back out of the markup rather than matching the source.
  const unescape = (v) =>
    v
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&rsquo;|&#x2019;/g, "’")
      .replace(/&mdash;/g, "—");
  const buttonTitles = [...grant.body.matchAll(/>\+ (?:<!-- -->)?([^<]+)<\/button>/g)].map((m) =>
    unescape(m[1]).trim(),
  );
  const counted = published.map((p) => buttonTitles.filter((b) => b === p.title).length);
  t("every published product is offered exactly once",
    counted.every((n) => n === 1),
    `counts ${[...new Set(counted)].join(",")} across ${published.length} products`);
  t("no product button is repeated",
    new Set(buttonTitles).size === buttonTitles.length,
    `${buttonTitles.length} buttons, ${new Set(buttonTitles).size} distinct`);
  t("the six packages are listed as packages",
    /Packages\s*\(\s*6\s*\)/.test(grant.text), grant.text.match(/Packages[^)]*\)/)?.[0]);
  t("the fifteen single subjects are listed separately",
    /Single subjects\s*\(\s*15\s*\)/.test(grant.text),
    grant.text.match(/Single subjects[^)]*\)/)?.[0]);

  const draftOrArchived = await db.product.findMany({
    where: { status: { not: "PUBLISHED" } },
    select: { title: true },
  });
  // One archived product shares a title with a live one (an old PPL
  // Meteorology row), so compare only titles that no published product uses.
  const liveTitles = new Set(published.map((p) => p.title));
  const deadOnly = draftOrArchived.filter((p) => !liveTitles.has(p.title));
  t("no draft or archived product is offered",
    deadOnly.length > 0 && deadOnly.every((p) => !buttonTitles.includes(p.title)),
    `${deadOnly.length} unpublished-only title(s) checked`);

  t("no button claims to grant an individual mock",
    !/\+ .*Mock Exam</.test(grant.body) && !/\+ .*Free 10-Question Mock/.test(grant.body),
    "a mock-specific grant label is present");

  /* ================= granting actually grants ================= */

  // Both accounts answer to this search, so the grant has to pick one.
  const both = await admin.visit(`/admin/students?q=Ashleigh&grant=${student.id}`);
  t("a search that matches two students shows both",
    both.text.includes(STUDENT_NAME) && both.text.includes(`Ashleigh Vermilion ${stamp}`));

  const irProduct = await db.product.findFirstOrThrow({
    where: { status: "PUBLISHED", slug: "ir-theory-package" },
    select: { id: true, title: true, items: { select: { courseId: true, subjectId: true } } },
  });
  const envelopes = await admin.actionsOn(
    `/admin/students?q=Ashleigh&grant=${student.id}`,
  );
  const grantEnvelope = envelopes.find(
    (e) => e.args.includes(irProduct.id) && e.args.includes(student.id),
  );
  t("the grant button carries both the student and the product",
    Boolean(grantEnvelope), `${envelopes.length} bound actions on the page`);
  t("no grant button on the page is bound to the other student",
    !envelopes.some((e) => e.args.includes(decoy.id)), "the decoy is reachable from this panel");

  const entsBefore = await db.entitlement.count({ where: { userId: student.id } });
  await admin.replay(`/admin/students?q=Ashleigh&grant=${student.id}`, grantEnvelope);
  const granted = await db.entitlement.findMany({
    where: { userId: student.id, productId: irProduct.id },
    select: { id: true, scopeKey: true, source: true, status: true, note: true },
  });
  t("the grant creates an entitlement",
    granted.length > 0, `${entsBefore} before, ${granted.length} for that product after`);
  t("it is recorded as a manual grant",
    granted.every((e) => e.source === "ADMIN" && e.status === "ACTIVE"),
    granted.map((e) => `${e.source}/${e.status}`).join(", "));
  t("the grant names the admin who made it",
    granted.every((e) => (e.note ?? "").includes("admin@kiwipilotprep.com")),
    granted.map((e) => e.note ?? "(no note)").join(" | "));
  t("it lands on the chosen student, not the other match",
    (await db.entitlement.count({ where: { userId: decoy.id } })) === 0,
    "the decoy account was granted access");

  // The access table names what was granted — the course — not the product
  // that carried it, so that is what must appear.
  const grantedCourse = await db.course.findFirstOrThrow({
    where: { id: irProduct.items[0].courseId ?? undefined },
    select: { title: true },
  });
  const after = await admin.visit(`/admin/students/${student.id}`);
  t("the new access shows on that student's record",
    after.text.includes(grantedCourse.title) && after.text.includes("ADMIN"),
    `looked for ${grantedCourse.title}`);

  /* ==================== section mapping stability ==================== */

  const air = await db.subject.findFirstOrThrow({
    where: { slug: "air-law", course: { slug: "ppl-theory" } },
    select: {
      id: true,
      modules: {
        orderBy: { chapterNumber: "asc" },
        select: {
          id: true,
          chapterNumber: true,
          sectionCode: true,
          title: true,
          lessons: { orderBy: { pointNumber: "asc" }, select: { pointNumber: true, title: true } },
        },
      },
    },
  });

  // A chapter is numbered inside its own subject, and its code is that
  // number — not the subject's position with the chapter tacked on.
  t("every chapter carries a stored number",
    air.modules.every((m) => m.chapterNumber !== null), "a chapter has no number");
  t("the chapter code is the chapter number",
    air.modules.every((m) => m.sectionCode === String(m.chapterNumber)),
    air.modules.slice(0, 3).map((m) => m.sectionCode).join(","));
  t("no chapter code carries a subject prefix",
    air.modules.every((m) => !m.sectionCode?.includes(".")),
    air.modules.find((m) => m.sectionCode?.includes("."))?.sectionCode ?? "");
  t("chapters run 1..n in curriculum order",
    air.modules.every((m, i) => m.chapterNumber === i + 1), "numbering is not contiguous");
  t("PPL Air Law has 27 chapters", air.modules.length === 27, `${air.modules.length}`);

  // The review's own example: chapter 27 and the points inside it.
  const ch27 = air.modules.find((m) => m.chapterNumber === 27);
  t("chapter 27 exists and is Emergency Communications and Signals",
    ch27?.title === "Emergency Communications and Signals", ch27?.title ?? "missing");
  t("its points are numbered 27.1, 27.2, 27.3 …",
    (ch27?.lessons ?? []).every((l, i) => l.pointNumber === i + 1) &&
      (ch27?.lessons.length ?? 0) >= 3,
    (ch27?.lessons ?? []).map((l) => `27.${l.pointNumber}`).join(", "));

  // Every subject, not only the one the review named.
  const allSubjects = await db.subject.findMany({
    where: { modules: { some: {} } },
    select: {
      title: true,
      modules: {
        orderBy: { chapterNumber: "asc" },
        select: { chapterNumber: true, sectionCode: true },
      },
    },
  });
  const badSubjects = allSubjects.filter(
    (sub) =>
      !sub.modules.every((m, i) => m.chapterNumber === i + 1 && m.sectionCode === String(i + 1)),
  );
  t("every subject numbers its own chapters from 1",
    badSubjects.length === 0, badSubjects.map((b) => b.title).join(", "));

  // If numbering were global, only one subject would own a chapter 1.
  const everyCode = allSubjects.flatMap((sub) => sub.modules.map((m) => m.sectionCode));
  t("chapter numbers restart per subject rather than running globally",
    everyCode.filter((c) => c === "1").length === allSubjects.length,
    `${everyCode.filter((c) => c === "1").length} of ${allSubjects.length} subjects have a chapter 1`);

  // Numbering must not move when the bank is read, edited or sorted.
  const before = air.modules.map((m) => m.sectionCode).join(",");
  const views = [
    `/admin/mocks/questions?subject=${air.id}`,
    `/admin/mocks/questions?subject=${air.id}`,
    "/admin/mocks/questions",
  ];
  for (const v of views) await admin.visit(v);
  const afterViews = await db.courseModule.findMany({
    where: { subjectId: air.id },
    orderBy: { displayOrder: "asc" },
    select: { sectionCode: true },
  });
  t("reading the Question Bank does not renumber anything",
    afterViews.map((m) => m.sectionCode).join(",") === before);

  // Adding and archiving a question must not touch the mapping either.
  const firstModule = await db.courseModule.findFirstOrThrow({
    where: { subjectId: air.id },
    orderBy: { displayOrder: "asc" },
    select: { id: true, sectionCode: true, title: true },
  });
  const probe = await db.question.create({
    data: {
      subjectId: air.id,
      moduleId: firstModule.id,
      kdrCode: firstModule.sectionCode,
      kdrTopic: firstModule.title,
      prompt: `ASH ${stamp} probe question for mapping stability.`,
      explanation: "Probe.",
      status: "PUBLISHED",
      options: {
        create: [
          { text: "a", isCorrect: true, order: 0 },
          { text: "b", isCorrect: false, order: 1 },
          { text: "c", isCorrect: false, order: 2 },
          { text: "d", isCorrect: false, order: 3 },
        ],
      },
    },
    select: { id: true },
  });
  await db.question.update({ where: { id: probe.id }, data: { status: "ARCHIVED" } });
  const afterEdits = await db.courseModule.findMany({
    where: { subjectId: air.id },
    orderBy: { displayOrder: "asc" },
    select: { sectionCode: true },
  });
  t("adding and archiving a question does not renumber anything",
    afterEdits.map((m) => m.sectionCode).join(",") === before);

  const bank = await admin.visit(`/admin/mocks/questions?subject=${air.id}`);
  const shown = [...bank.body.matchAll(/section=[^"]*"[^>]*>\s*(\d+) — ([^<(]+)/g)].map(
    (m) => ({ code: m[1], title: m[2].trim() }),
  );
  t("the Question Bank shows the stored chapter codes",
    shown.length > 0 &&
      shown.every((x) => air.modules.some((m) => m.sectionCode === x.code && m.title === x.title)),
    shown.map((x) => x.code).join(",") || "(no chapters rendered)");
  t("the Question Bank never shows a code the database does not hold",
    shown.every((x) => air.modules.some((m) => m.sectionCode === x.code)),
    "a chapter code appeared that is not stored on any module");

  // The editor's own list, which is what the review was reading.
  const form = await admin.visit(`/admin/mocks/questions/new?subject=${air.id}`);
  const decoded = form.body
    .replace(/\\"/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\u0026/g, "&");
  t("the editor offers chapter 27 by its canonical number",
    decoded.includes('"label":"27 — Emergency Communications and Signals"'),
    "chapter 27 is not offered under its own number");
  t("the editor offers that chapter's points as 27.x",
    (ch27?.lessons ?? []).every((l) =>
      decoded.includes(`"label":"27.${l.pointNumber} — ${l.title}"`)),
    "a point of chapter 27 is missing from the editor");
  t("the editor never labels a chapter with a subject prefix",
    !/"label":"1\.\d+ — Aviation Legislation"/.test(decoded),
    "the old subject-prefixed numbering is still being offered");

  await db.questionOption.deleteMany({ where: { questionId: probe.id } });
  await db.question.delete({ where: { id: probe.id } });

  /* ============ saving a question through the real action ============ */

  // The server must accept a chapter and point of the question's own
  // subject, and refuse anything from outside them — whatever the form says.
  const metRows = await db.subject.findFirstOrThrow({
    where: { slug: "meteorology", course: { slug: "ppl-theory" } },
    select: {
      id: true,
      modules: { orderBy: { chapterNumber: "asc" }, take: 1, select: { id: true } },
    },
  });
  const airCh1 = air.modules[0];
  const airCh2 = air.modules[1];
  const airCh1Point = await db.lesson.findFirstOrThrow({
    where: { moduleId: airCh1.id },
    orderBy: { pointNumber: "asc" },
    select: { id: true, pointNumber: true, title: true },
  });
  const foreignPoint = await db.lesson.findFirstOrThrow({
    where: { moduleId: airCh2.id },
    orderBy: { pointNumber: "asc" },
    select: { id: true },
  });

  const newQ = {
    subjectId: air.id,
    prompt: `ASH ${stamp} canonical mapping save.`,
    explanation: "Probe.",
    optionA: "a",
    optionB: "b",
    optionC: "c",
    optionD: "d",
    answer: "0",
    status: "DRAFT",
  };

  // 1. A chapter and a point of this subject — accepted, and the stored
  //    grouping is the point's code.
  const okRes = await admin.submitForm("/admin/mocks/questions/new", {
    ...newQ,
    moduleId: airCh1.id,
    lessonId: airCh1Point.id,
  });
  const saved = await db.question.findFirst({
    where: { prompt: newQ.prompt },
    select: { id: true, moduleId: true, lessonId: true, kdrCode: true, kdrTopic: true },
  });
  t("a question saves against a chapter and point of its own subject",
    Boolean(saved), `status ${okRes.status}`);
  t("it is stored against that chapter and that point",
    saved?.moduleId === airCh1.id && saved?.lessonId === airCh1Point.id);
  t("its grouping code is the point's canonical code",
    saved?.kdrCode === `${airCh1.chapterNumber}.${airCh1Point.pointNumber}`,
    `${saved?.kdrCode}`);
  t("its grouping title is the point's title", saved?.kdrTopic === airCh1Point.title);

  // 2. A chapter belonging to another subject — refused.
  const crossSubjectPrompt = `ASH ${stamp} cross-subject save.`;
  await admin.submitForm("/admin/mocks/questions/new", {
    ...newQ,
    prompt: crossSubjectPrompt,
    moduleId: metRows.modules[0].id,
  });
  t("a chapter from another subject is refused",
    (await db.question.count({ where: { prompt: crossSubjectPrompt } })) === 0,
    "the question was saved against another subject's chapter");

  // 3. A point belonging to another chapter of the same subject — refused.
  const crossChapterPrompt = `ASH ${stamp} cross-chapter save.`;
  await admin.submitForm("/admin/mocks/questions/new", {
    ...newQ,
    prompt: crossChapterPrompt,
    moduleId: airCh1.id,
    lessonId: foreignPoint.id,
  });
  t("a point from another chapter is refused",
    (await db.question.count({ where: { prompt: crossChapterPrompt } })) === 0,
    "the question was saved against a point of a different chapter");

  if (saved) {
    await db.questionOption.deleteMany({ where: { questionId: saved.id } });
    await db.question.delete({ where: { id: saved.id } });
  }

  // Cross-subject assignment must still be refused by the server.
  const met = await db.subject.findFirstOrThrow({
    where: { slug: "meteorology", course: { slug: "ppl-theory" } },
    select: { id: true },
  });
  const foreign = await db.courseModule.findFirstOrThrow({
    where: { subjectId: met.id },
    select: { id: true },
  });
  const owned = await db.question.findFirstOrThrow({
    where: { subjectId: air.id, moduleId: { not: null } },
    select: { id: true, moduleId: true },
  });
  const crossed = await db.courseModule.count({
    where: { id: foreign.id, subjectId: air.id },
  });
  t("the foreign section genuinely belongs to another subject", crossed === 0);
  t("no Air Law question points at a Meteorology section",
    (await db.question.count({
      where: { subjectId: air.id, module: { subjectId: { not: air.id } } },
    })) === 0);
  t("the question under test is mapped inside its own subject",
    (await db.courseModule.count({ where: { id: owned.moduleId, subjectId: air.id } })) === 1);

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
