/**
 * Phase 4 integration tests — mock engine, timer, scoring, KDR, immutability.
 *
 * Covers §27: authorization, entitlements, server-authoritative timer, scoring,
 * KDR aggregation, history stability and the security rules in §22.
 *
 *   node tests/mocks.mjs
 */
import { PrismaClient } from "@prisma/client";

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const db = new PrismaClient();

const checks = [];

/**
 * Scorecard emails recorded against one attempt.
 *
 * Every message is written to EmailLog whatever the provider does with it —
 * SENT when a provider accepted it, LOGGED when none is configured, FAILED
 * when one refused — so the log answers "did we try to tell the student",
 * which is the thing under test here. Delivery is the provider's business.
 */
const scorecardEmails = (attemptId) =>
  db.emailLog.count({ where: { attemptId, template: "mock-scorecard" } });

/** The delivery record for one attempt's report, or null before one exists. */
const reportFor = (attemptId) => db.mockReport.findUnique({ where: { attemptId } });

/** Fetches the report PDF as a given signed-in user. */
async function fetchReport(user, attemptId) {
  const res = await fetch(`${BASE}/mocks/attempts/${attemptId}/report.pdf`, {
    headers: { cookie: user.cookie, "x-forwarded-for": user.ip },
    redirect: "manual",
  });
  const buf = Buffer.from(await res.arrayBuffer());
  return { status: res.status, type: res.headers.get("content-type"), body: buf };
}
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
const IP_BASE = 91;
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
  /** Reads the bound server-action envelopes present on a page. */
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

  /** Replays a captured envelope, as an attacker with a copied form would. */
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

    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);

    if (pick) {
      const chosen = pick(bound);
      if (!chosen) throw new Error(`no matching bound action on ${path}`);
      fd.set(`$ACTION_REF_${chosen.n}`, "");
      fd.set(`$ACTION_${chosen.n}:0`, chosen.desc);
      fd.set(`$ACTION_${chosen.n}:1`, chosen.args);
    } else {
      const id = html.match(/ACTION_ID_([a-f0-9]+)/)?.[1];
      if (!id) throw new Error(`no server action on ${path}`);
      fd.set(`$ACTION_ID_${id}`, "");
    }

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
const OWNER = `mock-owner-${stamp}@example.com`;
const OTHER = `mock-other-${stamp}@example.com`;
const PASSWORD = "Southerly7!wind";

async function cleanup() {
  const users = await db.user.findMany({
    where: { email: { startsWith: "mock-" } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (ids.length) {
    await db.mockAttempt.deleteMany({ where: { userId: { in: ids } } });
    await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }
  await db.mockExam.deleteMany({ where: { slug: { startsWith: "t4-" } } });
  await db.course.deleteMany({ where: { slug: { startsWith: "t4-" } } });

  // These are created without a subject, so deleting the course does not
  // cascade to them. Without this they accumulate in the question bank run
  // after run and eventually swamp the real questions.
  const strays = await db.question.findMany({
    where: { prompt: { startsWith: "T4 Q" } },
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

  /* ---------------------------------------------------- fixtures ---------- */

  const course = await db.course.create({
    data: {
      slug: "t4-course",
      title: "T4 Exam Course",
      status: "PUBLISHED",
      order: 95,
      subjects: {
        create: { slug: "t4-subject", title: "T4 Exam Subject", status: "PUBLISHED", order: 0 },
      },
    },
    include: { subjects: true },
  });
  const subject = course.subjects[0];

  // Two KiwiPilotPrep sections of this subject. A question's grouping comes
  // from the section it is assigned to — see lib/report/section.ts — so the
  // fixture assigns them the way the CMS does rather than writing a code on
  // the question by hand.
  const alphaSection = await db.courseModule.create({
    data: {
      subjectId: subject.id,
      title: "Alpha Topic",
      sectionCode: "T4.ALPHA",
      displayOrder: 0,
      status: "PUBLISHED",
      origin: "AUTHORED",
    },
  });
  const bravoSection = await db.courseModule.create({
    data: {
      subjectId: subject.id,
      title: "Bravo Topic",
      sectionCode: "T4.BRAVO",
      displayOrder: 10,
      status: "PUBLISHED",
      origin: "AUTHORED",
    },
  });

  // Six questions across two sections, plus one left deliberately unmapped,
  // so the breakdown has something to band and something to fall through.
  const specs = [
    { p: "T4 Q1 — alpha", section: alphaSection },
    { p: "T4 Q2 — alpha", section: alphaSection },
    { p: "T4 Q3 — alpha", section: alphaSection },
    { p: "T4 Q4 — bravo", section: bravoSection },
    { p: "T4 Q5 — bravo", section: bravoSection },
    { p: "T4 Q6 — no kdr", section: null },
  ];
  for (const [i, s] of specs.entries()) {
    await db.question.create({
      data: {
        subjectId: subject.id,
        prompt: s.p,
        explanation: `Explanation for ${s.p}`,
        moduleId: s.section?.id ?? null,
        kdrCode: s.section?.sectionCode ?? null,
        kdrTopic: s.section?.title ?? null,
        status: "PUBLISHED",
        order: i,
        options: {
          create: [
            { text: "Right answer", isCorrect: true, order: 0 },
            { text: "Wrong answer", isCorrect: false, order: 1 },
          ],
        },
      },
    });
  }

  const exam = await db.mockExam.create({
    data: {
      slug: "t4-mock",
      title: "T4 Mock Exam",
      subjectId: subject.id,
      questionCount: 6,
      durationMinutes: 30,
      passingPercent: 70,
      randomize: false,
      status: "PUBLISHED",
      order: 95,
    },
  });

  /* ------------------------------------------------------ two students ---- */

  const owner = new User();
  await owner.signUp("Mock Owner", OWNER, PASSWORD);
  const ownerRow = await db.user.findUnique({ where: { email: OWNER } });

  const other = new User();
  await other.signUp("Mock Other", OTHER, PASSWORD);
  const otherRow = await db.user.findUnique({ where: { email: OTHER } });

  t("test students created", Boolean(ownerRow && otherRow));

  /* ============== ENTITLEMENTS (§7) ============== */

  const beforeEntitlement = await owner.visit("/mocks");
  t("mock is listed but locked without entitlement",
    beforeEntitlement.text.includes("T4 Mock Exam") &&
      beforeEntitlement.text.includes("Unlock with a package"),
    "expected a locked card");

  // Entitle the second student so we can capture a genuine "start" action,
  // then replay it as the non-entitled student — the hidden-button bypass.
  await db.entitlement.create({
    data: {
      userId: otherRow.id,
      scopeKey: `course:${course.id}`,
      courseId: course.id,
      source: "ADMIN",
      status: "ACTIVE",
    },
  });

  const startEnvelope = (await other.actionsOn("/mocks")).find((b) => b.args.includes(exam.id));
  t("captured a real start action to replay", Boolean(startEnvelope));

  await owner.replay("/mocks", startEnvelope);
  const noAttempt = await db.mockAttempt.count({ where: { userId: ownerRow.id } });
  t("§7 a non-entitled student cannot start, even replaying a valid form",
    noAttempt === 0, `${noAttempt} attempts`);

  // Now grant access the way a purchase would.
  await db.entitlement.create({
    data: {
      userId: ownerRow.id,
      scopeKey: `course:${course.id}`,
      courseId: course.id,
      source: "ADMIN",
      status: "ACTIVE",
    },
  });

  /* ============== STARTING (§4) ============== */

  await owner.submitForm("/mocks", {}, {
    pick: (all) => all.find((b) => b.args.includes(exam.id)),
  });

  const attempt = await db.mockAttempt.findFirst({
    where: { userId: ownerRow.id, mockExamId: exam.id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  t("§7 an entitled student can start", Boolean(attempt));
  t("attempt has the configured number of questions",
    attempt?.questions.length === 6, `${attempt?.questions.length}`);
  t("attempt stores startedAt and expiresAt", Boolean(attempt?.startedAt && attempt?.expiresAt));
  t("expiresAt matches the configured duration",
    Math.round((attempt.expiresAt - attempt.startedAt) / 60000) === 30,
    `${Math.round((attempt.expiresAt - attempt.startedAt) / 60000)} min`);
  t("attempt starts IN_PROGRESS", attempt?.status === "IN_PROGRESS");

  /* ============== STABLE QUESTION SET ON REFRESH (§5) ============== */

  const firstIds = attempt.questions.map((q) => q.id).join(",");
  const page1 = await owner.visit(`/mocks/attempts/${attempt.id}`);
  t("the exam runner renders", page1.text.includes("Question 1 of 6"), `landed ${page1.landedOn}`);

  await owner.visit(`/mocks/attempts/${attempt.id}`);
  const afterRefresh = await db.mockAttempt.findFirst({
    where: { id: attempt.id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  t("§5 refreshing does not regenerate the question set",
    afterRefresh.questions.map((q) => q.id).join(",") === firstIds);

  await owner.submitForm("/mocks", {}, {
    pick: (all) => all.find((b) => b.args.includes(exam.id)),
  });
  const attemptCount = await db.mockAttempt.count({
    where: { userId: ownerRow.id, mockExamId: exam.id },
  });
  t("§5 starting again resumes the live attempt instead of creating a second",
    attemptCount === 1, `${attemptCount} attempts`);

  /* ============== ANSWER KEY IS NOT SHIPPED (§22) ============== */

  t("§22 the answer key is not sent to the browser during a live attempt",
    !page1.body.includes("isCorrect"), "isCorrect appeared in the page payload");
  t("§22 explanations are not exposed during a live attempt",
    !page1.body.includes("Explanation for T4 Q1"), "explanation leaked mid-exam");

  /* ============== ANSWERING + SCORING (§9) ============== */

  // Answer 4 of 6 correctly, 1 wrong, leave 1 blank.
  const qs = afterRefresh.questions;
  const optionsOf = (q) => (Array.isArray(q.optionsSnapshot) ? q.optionsSnapshot : []);

  for (let i = 0; i < 4; i++) {
    const correct = optionsOf(qs[i]).find((o) => o.isCorrect);
    await db.mockAttemptQuestion.update({
      where: { id: qs[i].id },
      data: { selectedOptionId: correct.id, answeredAt: new Date() },
    });
  }
  const wrong = optionsOf(qs[4]).find((o) => !o.isCorrect);
  await db.mockAttemptQuestion.update({
    where: { id: qs[4].id },
    data: { selectedOptionId: wrong.id, answeredAt: new Date() },
  });
  // qs[5] deliberately left unanswered.

  await owner.submitForm(`/mocks/attempts/${attempt.id}`, {}, {
    pick: (all) => all.find((b) => b.args.includes(attempt.id)),
  });

  const scored = await db.mockAttempt.findUnique({
    where: { id: attempt.id },
    include: { kdrResults: true, questions: true },
  });

  t("§9 attempt is finalised on submission", scored.status === "SUBMITTED", scored.status);
  t("§9 correct answers counted server-side", scored.correctCount === 4, `${scored.correctCount}`);
  t("§9 incorrect answers counted", scored.incorrectCount === 1, `${scored.incorrectCount}`);
  t("§9 unanswered questions counted", scored.unansweredCount === 1, `${scored.unansweredCount}`);
  t("§9 percentage computed from the marks", scored.scorePercent === 67, `${scored.scorePercent}`);
  t("§9 pass/fail applied against the configured mark",
    scored.passed === false, `passed=${scored.passed}`);
  t("§9 submittedAt recorded", Boolean(scored.submittedAt));
  t("§16 submitting sends the scorecard exactly once",
    (await scorecardEmails(attempt.id)) === 1, `${await scorecardEmails(attempt.id)} logged`);

  /* ============== REPORT: GENERATION, DELIVERY STATE, OWNERSHIP ============== */

  const report = await reportFor(attempt.id);
  t("§16 finalising records a report for the attempt", Boolean(report), "no MockReport row");
  t("§16 the report knows the score without a join",
    report?.scorePercent === scored.scorePercent, `${report?.scorePercent}`);
  t("§16 delivery reached a terminal state",
    ["SENT", "FAILED"].includes(report?.status), `${report?.status}`);
  t("§16 a PDF was produced and its size recorded",
    typeof report?.pdfBytes === "number" && report.pdfBytes > 1000, `${report?.pdfBytes} bytes`);

  const pdf = await fetchReport(owner, attempt.id);
  t("§17 the student can download their own report", pdf.status === 200, `${pdf.status}`);
  t("§12 the download is a PDF", pdf.type === "application/pdf", `${pdf.type}`);
  t("§12 the file really is a PDF", pdf.body.subarray(0, 5).toString("latin1") === "%PDF-");
  const pdfText = pdf.body.toString("latin1");
  t("§4 the report carries no external branding",
    !/CAA NZ|Aspeq result|AC ?61/.test(pdfText), "external reference in the PDF");
  t("§9 per-question correctness stored",
    scored.questions.filter((q) => q.isCorrect === true).length === 4);
  t("unanswered question has null correctness, not false",
    scored.questions.find((q) => !q.selectedOptionId)?.isCorrect === null);

  /* ============== KDR (§13) ============== */

  const alpha = scored.kdrResults.find((k) => k.kdrCode === "T4.ALPHA");
  const bravo = scored.kdrResults.find((k) => k.kdrCode === "T4.BRAVO");

  t("§13 KDR rows created per code", scored.kdrResults.length === 2, `${scored.kdrResults.length}`);
  t("§13 alpha aggregated correctly",
    alpha?.attempted === 3 && alpha?.correct === 3 && alpha?.accuracy === 100,
    JSON.stringify(alpha));
  t("§13 bravo aggregated correctly",
    bravo?.attempted === 2 && bravo?.correct === 1 && bravo?.accuracy === 50,
    JSON.stringify(bravo));
  t("§13 a question with no KDR is marked but not banded",
    !scored.kdrResults.some((k) => k.kdrCode === null && k.kdrTopic === null));

  /* ============== SCORECARD (§11, §12) ============== */

  const card = await owner.visit(`/mocks/attempts/${attempt.id}`);
  t("§11 scorecard renders after submission", card.text.includes("Scorecard"), `landed ${card.landedOn}`);
  t("§11 scorecard shows the score", card.text.includes("67%"));
  t("§11 scorecard shows the KDR breakdown", card.text.includes("T4.ALPHA") && card.text.includes("T4.BRAVO"));
  t("§12 review reveals explanations after submission",
    card.text.includes("Explanation for T4 Q1"));
  t("§12 review distinguishes unanswered questions", card.text.includes("Unanswered"));

  /* ============== DOUBLE SUBMIT (§9) ============== */

  const before = {
    correct: scored.correctCount,
    kdr: scored.kdrResults.length,
    emails: await scorecardEmails(attempt.id),
  };

  // A finished attempt exposes no submit control, so the way to press
  // finalisation again is to reopen the page — which runs the expiry sweep —
  // and to replay the submit action itself.
  await owner.visit(`/mocks/attempts/${attempt.id}`);
  await owner.visit("/mocks");
  await owner.visit("/dashboard");

  const after = await db.mockAttempt.findUnique({
    where: { id: attempt.id },
    include: { kdrResults: true },
  });
  t("§9 revisiting a finalised attempt does not re-score it",
    after.correctCount === before.correct && after.kdrResults.length === before.kdr,
    `${after.correctCount}/${after.kdrResults.length}`);
  t("§16 revisiting a finalised attempt does not send a second scorecard",
    (await scorecardEmails(attempt.id)) === before.emails,
    `${await scorecardEmails(attempt.id)} logged, was ${before.emails}`);
  const reportsForAttempt = await db.mockReport.count({ where: { attemptId: attempt.id } });
  t("§7 finalisation creates exactly one report, however often it is pressed",
    reportsForAttempt === 1, `${reportsForAttempt} reports`);

  /* ============== RETRY (§15) ============== */

  // Delivery failed in this environment — the provider will not accept
  // example.com — so the owner is offered a resend. It must send again, and it
  // must not produce a second report row.
  const delivery = await db.mockReport.findUnique({ where: { attemptId: attempt.id } });
  if (delivery?.status === "FAILED") {
    const emailsBefore = await scorecardEmails(attempt.id);
    await owner.submitForm(`/mocks/attempts/${attempt.id}`, {}, {
      pick: (all) => all.find((b) => b.args.includes(attempt.id)),
    }).catch(() => null);
    const retried = await db.mockReport.findUnique({ where: { attemptId: attempt.id } });
    t("§15 a failed report can be sent again on request",
      (await scorecardEmails(attempt.id)) === emailsBefore + 1,
      `${await scorecardEmails(attempt.id)} logged, was ${emailsBefore}`);
    t("§15 a retry counts the attempt rather than creating a second report",
      (await db.mockReport.count({ where: { attemptId: attempt.id } })) === 1 &&
        retried.attempts > delivery.attempts,
      `attempts ${delivery.attempts} -> ${retried?.attempts}`);
    t("§15 the result itself is untouched by a delivery failure",
      after.status !== "IN_PROGRESS" && after.scorePercent === scored.scorePercent,
      `${after.status} ${after.scorePercent}%`);
  }

  /* ============== CROSS-USER ACCESS (§22) ============== */

  const stranger = await other.visit(`/mocks/attempts/${attempt.id}`);
  t("§22 another student cannot open this attempt",
    stranger.status === 404 || !stranger.text.includes("T4.ALPHA"),
    `status ${stranger.status}`);

  const anon = await new User().visit(`/mocks/attempts/${attempt.id}`);
  t("§22 a logged-out visitor cannot open an attempt",
    anon.landedOn.startsWith("/login"), `landed ${anon.landedOn}`);

  /* ============== EXPIRY (§5, §10) ============== */

  await other.submitForm("/mocks", {}, {
    pick: (all) => all.find((b) => b.args.includes(exam.id)),
  });

  const expiring = await db.mockAttempt.findFirst({
    where: { userId: otherRow.id, status: "IN_PROGRESS" },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  t("second student started their own attempt", Boolean(expiring));

  // Answer one question, then wind the clock past the deadline.
  const firstCorrect = (Array.isArray(expiring.questions[0].optionsSnapshot)
    ? expiring.questions[0].optionsSnapshot
    : []).find((o) => o.isCorrect);
  await db.mockAttemptQuestion.update({
    where: { id: expiring.questions[0].id },
    data: { selectedOptionId: firstCorrect.id, answeredAt: new Date() },
  });
  await db.mockAttempt.update({
    where: { id: expiring.id },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });

  const afterExpiry = await other.visit(`/mocks/attempts/${expiring.id}`);
  const expired = await db.mockAttempt.findUnique({ where: { id: expiring.id } });

  t("§10 opening an expired attempt finalises it", expired.status === "EXPIRED", expired.status);
  t("§10 expiry is recorded as an automatic submission", expired.autoSubmitted === true);
  t("§10 answers given before expiry are still marked", expired.correctCount === 1, `${expired.correctCount}`);
  t("§10 remaining questions count as unanswered", expired.unansweredCount === 5, `${expired.unansweredCount}`);
  t("§10 the student sees a scorecard, not a blank screen",
    afterExpiry.text.includes("Scorecard"), `landed ${afterExpiry.landedOn}`);
  // The path that used to be silent. A student who closed the tab had the
  // paper marked and the KDR written by the expiry sweep, and was never told.
  t("§16 an attempt finalised by the expiry sweep also sends the scorecard",
    (await scorecardEmails(expiring.id)) === 1, `${await scorecardEmails(expiring.id)} logged`);
  const autoReport = await reportFor(expiring.id);
  t("§6 the auto-submitted attempt gets a report on the same pipeline",
    Boolean(autoReport) && autoReport.pdfBytes > 1000, `${autoReport?.status}/${autoReport?.pdfBytes}`);

  // §17: an attempt id is a claim, not a credential.
  const stolen = await fetchReport(owner, expiring.id);
  t("§17 a student cannot download another student's report",
    stolen.status === 404, `${stolen.status}`);
  const guessed = await fetchReport(owner, "cmxxxxxxxxxxxxxxxxxxxxxxx");
  t("§17 a guessed attempt id is indistinguishable from a forbidden one",
    guessed.status === 404, `${guessed.status}`);

  // §5: the clock cannot be extended from the browser.
  const stillExpired = await db.mockAttempt.findUnique({ where: { id: expiring.id } });
  t("§5 an expired attempt stays closed", stillExpired.status === "EXPIRED");

  /* ============== HISTORICAL IMMUTABILITY (§26) ============== */

  const target = await db.question.findFirst({ where: { prompt: "T4 Q1 — alpha" } });
  // Renaming a section after the fact is the sharper version of this test:
  // the report must keep saying what the student was told on the day.
  const movedSection = await db.courseModule.create({
    data: {
      subjectId: subject.id,
      title: "Changed Topic",
      sectionCode: "T4.CHANGED",
      displayOrder: 20,
      status: "PUBLISHED",
      origin: "AUTHORED",
    },
  });
  await db.question.update({
    where: { id: target.id },
    data: {
      prompt: "T4 Q1 — REWRITTEN AFTER THE EXAM",
      explanation: "Rewritten explanation",
      moduleId: movedSection.id,
      kdrCode: movedSection.sectionCode,
      kdrTopic: movedSection.title,
      status: "ARCHIVED",
    },
  });
  // Flip the correct answer too — the harshest version of the test.
  const opts = await db.questionOption.findMany({ where: { questionId: target.id }, orderBy: { order: "asc" } });
  await db.questionOption.update({ where: { id: opts[0].id }, data: { isCorrect: false } });
  await db.questionOption.update({ where: { id: opts[1].id }, data: { isCorrect: true } });

  const afterEdit = await db.mockAttempt.findUnique({
    where: { id: attempt.id },
    include: { kdrResults: true },
  });
  const reCard = await owner.visit(`/mocks/attempts/${attempt.id}`);

  t("§26 an edited question does not change a finished score",
    afterEdit.correctCount === 4 && afterEdit.scorePercent === 67,
    `${afterEdit.correctCount}/${afterEdit.scorePercent}%`);
  t("§26 the scorecard still shows the question as it was asked",
    reCard.text.includes("T4 Q1 — alpha") && !reCard.text.includes("REWRITTEN AFTER THE EXAM"));
  t("§26 archiving a question does not break the historical attempt",
    reCard.text.includes("Scorecard"));
  t("§26 historical KDR codes are unchanged",
    afterEdit.kdrResults.some((k) => k.kdrCode === "T4.ALPHA") &&
      !afterEdit.kdrResults.some((k) => k.kdrCode === "T4.CHANGED"));

  /* ============== HISTORY (§18) ============== */

  const history = await owner.visit("/mocks/history");
  t("§18 history lists the completed attempt",
    history.text.includes("T4 Mock Exam") && history.text.includes("67%"),
    `landed ${history.landedOn}`);
  t("§18 history shows KDR performance across attempts",
    history.text.includes("T4.ALPHA") || history.text.includes("KDR performance"));

  /* ============== EMAIL FOUNDATION (§16) ============== */

  const emails = await db.emailLog.findMany({ where: { attemptId: attempt.id } });
  t("§16 a scorecard email was recorded", emails.length >= 1, `${emails.length} rows`);
  // The property that matters is honesty, not a particular status: the row
  // must record what actually happened. LOGGED with no provider, SENT only
  // when a provider accepted it, FAILED when one refused. It must never say
  // SENT for a message that was never handed to anyone.
  t("§16 the send outcome is recorded honestly, never falsely reported as sent",
    ["LOGGED", "SENT", "FAILED"].includes(emails[0]?.status ?? "") &&
      !(emails[0]?.status === "SENT" && emails[0]?.provider === "none"),
    `status ${emails[0]?.status} via ${emails[0]?.provider}`);
  // The email names the revision area rather than its internal code: the
  // student is being told what to go and study, and a code means nothing to
  // them. The code stays on the KDR row for the platform's own use.
  t("§16 the email body carries the score and the revision areas",
    emails[0]?.body.includes("67%") && emails[0]?.body.includes("Bravo Topic"),
    "expected the score and a revision area in the body");
  t("§16 the email is KiwiPilotPrep's own, naming no external examiner",
    !/Aspeq result|CAA NZ|AC ?61/.test(emails[0]?.body ?? ""),
    "external reference in the email body");
  // The call to action opens the report itself. A link in an email is
  // followed in whatever browser reads mail, usually with no session, so it
  // carries a signed token scoped to this one attempt and this one student.
  const cta = /View My Result:\s*(\S+)/.exec(emails[0]?.body ?? "");
  t("§13 the email offers a View My Result link", Boolean(cta), "no CTA in the body");
  t("§13 the link resolves to the report, not to a page about it",
    Boolean(cta) && cta[1].includes(`/mocks/attempts/${attempt.id}/report.pdf`),
    cta?.[1] ?? "(none)");
  // The property that matters is where the origin came from, not what it
  // spells. A link must be built from NEXT_PUBLIC_SITE_URL, never from the
  // Host header a client supplied — otherwise `Host: evil.example` puts an
  // attacker's domain inside our own email. Pinning the whole origin tests
  // that; "is not localhost" only tested it by accident, and broke the moment
  // localhost became the configured value for local testing.
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  t("§13 the link is built from the configured origin, not from the Host header",
    Boolean(cta) &&
      (configuredOrigin
        ? cta[1].startsWith(`${configuredOrigin}/`)
        : /localhost|127\.0\.0\.1/.test(cta[1])),
    `${cta?.[1] ?? "(none)"} vs configured ${configuredOrigin ?? "(unset, falls back to Host)"}`);
  // And that origin must be a real public one in production, where a link
  // pointing at localhost reaches nobody.
  t("§13 the configured origin is not localhost in production",
    process.env.NODE_ENV !== "production" ||
      !/localhost|127\.0\.0\.1/.test(configuredOrigin ?? "localhost"),
    `NODE_ENV=${process.env.NODE_ENV}, origin ${configuredOrigin ?? "(unset)"}`);

  if (cta) {
    // Followed exactly as a mail client would: no cookie, no session.
    const local = cta[1].replace(/^https?:\/\/[^/]+/, BASE);
    const opened = await fetch(local, { redirect: "manual" });
    const bytes = Buffer.from(await opened.arrayBuffer());
    t("§13 clicking it opens the PDF with no session at all",
      opened.status === 200 && opened.headers.get("content-type") === "application/pdf",
      `${opened.status} ${opened.headers.get("content-type")}`);
    t("§13 it opens in the viewer rather than downloading",
      (opened.headers.get("content-disposition") ?? "").startsWith("inline"),
      opened.headers.get("content-disposition") ?? "(none)");
    t("§13 the linked report is the same document that was attached",
      bytes.length === (await reportFor(attempt.id))?.pdfBytes,
      `${bytes.length} vs ${(await reportFor(attempt.id))?.pdfBytes}`);

    const noToken = await fetch(local.split("?")[0], { redirect: "manual" });
    t("§17 the same URL without its token gives nothing away",
      noToken.status === 404, `${noToken.status}`);
    const tampered = await fetch(`${local.slice(0, -3)}aaa`, { redirect: "manual" });
    t("§17 a tampered token is refused", tampered.status === 404, `${tampered.status}`);
    const swapped = await fetch(local.replace(attempt.id, expiring.id), { redirect: "manual" });
    t("§17 a token cannot be pointed at a different attempt",
      swapped.status === 404, `${swapped.status}`);
  }

  /* ============== DASHBOARD (§17) ============== */

  const dash = await owner.visit("/dashboard");
  t("§17 dashboard shows mock results", dash.text.includes("Mock exams") && dash.text.includes("67%"));
  t("§17 dashboard shows a best score", dash.text.includes("Best score"));

  /* ============== ADMIN VISIBILITY (§20) ============== */

  const admin = new User();
  await admin.login("admin@kiwipilotprep.com", "admin12345");
  const adminAttempts = await admin.visit("/admin/attempts");
  t("§20 admin can see student attempts",
    adminAttempts.text.includes("Mock Owner") && adminAttempts.text.includes("67%"),
    `status ${adminAttempts.status}`);
  const adminMocks = await admin.visit("/admin/mocks");
  t("§19 admin can manage mocks", adminMocks.text.includes("T4 Mock Exam"));

  const studentAdmin = await owner.visit("/admin/mocks");
  t("§22 a student cannot reach admin mock management",
    !studentAdmin.text.includes("Create a mock exam"), `landed ${studentAdmin.landedOn}`);

  /* ============== EMPTY QUESTION BANK (§25) ============== */

  const emptyExam = await db.mockExam.create({
    data: {
      slug: "t4-empty",
      title: "T4 Empty Mock",
      status: "PUBLISHED",
      order: 96,
      questionCount: 5,
      durationMinutes: 10,
      subjectId: (
        await db.subject.create({
          data: { courseId: course.id, slug: "t4-empty-subject", title: "T4 Empty", status: "PUBLISHED", order: 9 },
        })
      ).id,
    },
  });
  await owner.submitForm("/mocks", {}, {
    pick: (all) => all.find((b) => b.args.includes(emptyExam.id)),
  });
  const emptyAttempts = await db.mockAttempt.count({ where: { mockExamId: emptyExam.id } });
  t("§25 a mock with no questions fails safely without creating an attempt",
    emptyAttempts === 0, `${emptyAttempts} attempts`);

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
