/**
 * PPL Phase 1 — the ATK extraction, and the CAA leak closure.
 *
 * Two things happened in this phase and neither was a rebuild. The Aircraft
 * Technical Knowledge deck was extracted for the first time, and the syllabus
 * rows of the four subjects that have lessons to fall back on were archived so
 * the CAA's examination checklist stops being what a student opens.
 *
 * What this suite is for is the negative space around both: that the
 * extraction lost nothing, that the archiving moved nothing except a status
 * column, and that the subject deliberately left alone was left alone.
 *
 * Runs against real HTTP and real Postgres, as an entitled student.
 *
 *   node tests/ppl-phase1.mjs
 */
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const COURSE = "ppl-theory";
const DECK = ".cache/decks/ppl-atk";
const SOURCE = "PPLAircraftTechnicalKnowledge.pdf";

const db = new PrismaClient();
const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

// Its own slice of the documentation range, so a run does not spend another
// suite's signup allowance.
let ipCounter = 0;
const IP_BASE = 151;
const nextIp = () => `198.51.100.${IP_BASE + (ipCounter++ % 25)}`;

class User {
  constructor() {
    this.cookie = "";
    this.ip = nextIp();
  }
  async request(pathname, init = {}) {
    const res = await fetch(BASE + pathname, {
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
  async visit(pathname) {
    let res = await this.request(pathname);
    let hops = 0;
    const trail = [pathname];
    while (res.status >= 300 && res.status < 400 && hops++ < 5) {
      const loc = res.headers.get("location");
      const next = loc.startsWith("http") ? new URL(loc).pathname + new URL(loc).search : loc;
      trail.push(next);
      res = await this.request(next);
    }
    const body = await res.text();
    return { status: res.status, text: body.replace(/<!--[\s\S]*?-->/g, ""), landedOn: trail.at(-1) };
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
    await this.request("/signup", { method: "POST", body: fd });
    const row = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (!row) throw new Error(`signup did not create ${email} — the form allows 20 accounts an hour per address`);
    await db.user.update({ where: { id: row.id }, data: { emailVerifiedAt: new Date(), verifyTokenHash: null } });
    return row;
  }
}

const stamp = Date.now().toString(36).slice(-6);
const EMAIL = `pplp1-${stamp}@example.com`;

async function cleanup() {
  const users = await db.user.findMany({ where: { email: { startsWith: "pplp1-" } }, select: { id: true } });
  const ids = users.map((u) => u.id);
  if (!ids.length) return;
  await db.lessonProgress.deleteMany({ where: { userId: { in: ids } } });
  await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
  await db.emailLog.deleteMany({ where: { userId: { in: ids } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
}

/**
 * The subjects whose syllabus is archived, and the one that never had one.
 *
 * Aircraft Technical Knowledge was the fifth entry's absence in Phase 1: it
 * was held back because archiving the syllabus of a subject with no lessons
 * would have emptied it. Phase 2 built it 38 chapters and 268 lessons, so it
 * joined the list. The assertions below are the same ones the other four get,
 * plus the invariant that decided the hold in the first place.
 */
const ARCHIVED = [
  "air-law",
  "navigation",
  "meteorology",
  "flight-radiotelephony",
  "aircraft-technical-knowledge",
];
const HELD = "aircraft-technical-knowledge";

async function main() {
  await cleanup();

  /* ============ 1. the ATK source is extracted and complete ============ */

  t("the ATK source file is where the manifest says it is", fs.existsSync(SOURCE));
  const manifestPath = `${DECK}/manifest.json`;
  t("an extraction manifest exists for ATK", fs.existsSync(manifestPath), `no ${manifestPath}`);
  if (!fs.existsSync(manifestPath)) return finish();

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  t("the manifest names the source it came from", manifest.source_file === SOURCE, manifest.source_file);
  t("the source is 506 pages", manifest.total_slides === 506, `${manifest.total_slides}`);
  t("every page is in the manifest", manifest.slides.length === 506, `${manifest.slides.length} entries`);
  t(
    "page numbers run 1..506 with no gap and no repeat",
    manifest.slides.every((s, i) => s.n === i + 1),
    "numbering is not contiguous",
  );

  const textPages = manifest.slides.filter((s) => (s.blocks ?? []).length).length;
  t("text came out of nearly every page", textPages >= 495, `${textPages}/506 carry text`);
  const chars = manifest.slides.reduce(
    (n, s) => n + (s.blocks ?? []).reduce((m, b) => m + String(b.text ?? "").length, 0),
    0,
  );
  t("the extracted text is substantial", chars > 100_000, `${chars} characters`);

  /* ---- figures, with their page provenance ---- */
  const placements = manifest.slides.flatMap((s) => (s.pictures ?? []).map((p) => ({ page: s.n, ...p })));
  t("figures were extracted", placements.length > 500, `${placements.length} placements`);
  t(
    "every figure records the page it came from",
    placements.every((p) => Number.isInteger(p.page) && p.page >= 1 && p.page <= 506),
    "a figure has no usable page",
  );
  t("every figure records a content hash", placements.every((p) => /^[0-9a-f]{40}$/.test(p.sha1 ?? "")), "a figure has no sha1");

  const onDisk = new Set(fs.readdirSync(`${DECK}/assets`).map((f) => f.replace(/\.[^.]+$/, "")));
  const shas = new Set(placements.map((p) => p.sha1));
  const missing = [...shas].filter((s) => !onDisk.has(s));
  const orphan = [...onDisk].filter((s) => !shas.has(s));
  t("every figure in the manifest has a file on disk", missing.length === 0, `${missing.length} missing`);
  t("no asset file is left unreferenced", orphan.length === 0, `${orphan.length} orphans`);

  /* ============ 2. every page is classified, none silently dropped ============ */

  const coveragePath = ".cache/tmp/ppl-atk-pages.json";
  t("the page coverage inventory exists", fs.existsSync(coveragePath), "run scripts/ppl-atk-coverage.mjs");
  if (fs.existsSync(coveragePath)) {
    const cov = JSON.parse(fs.readFileSync(coveragePath, "utf8"));
    t("the inventory covers all 506 pages", cov.pages.length === 506, `${cov.pages.length}`);
    t(
      "every page carries a class",
      cov.pages.every((p) => typeof p.kind === "string" && p.kind.length > 0),
      "a page has no class",
    );
    const numbered = new Set(cov.pages.map((p) => p.n));
    const gaps = [];
    for (let n = 1; n <= 506; n += 1) if (!numbered.has(n)) gaps.push(n);
    t("no page number is absent from the inventory", gaps.length === 0, `missing ${gaps.slice(0, 8).join(", ")}`);
    const teaching = cov.pages.filter((p) => p.kind === "teaching").length;
    t("the deck is mostly teaching", teaching > 350, `${teaching} teaching pages`);

    // The ranges the audit found the old syllabus-anchored import had never
    // cited. If these came back as furniture the gap would have been harmless;
    // they did not.
    const RANGES = [[65, 85], [116, 119], [132, 133], [295, 301], [324, 338], [481, 506]];
    const inRange = cov.pages.filter((p) => RANGES.some(([a, b]) => p.n >= a && p.n <= b));
    const recovered = inRange.filter((p) => p.kind === "teaching").length;
    t(
      "the previously uncited ranges are teaching, not furniture",
      recovered >= 55,
      `${recovered} teaching pages recovered from ${inRange.length}`,
    );
  }

  const figuresPath = ".cache/tmp/ppl-atk-figures.json";
  t("the figure inventory exists", fs.existsSync(figuresPath), "run scripts/ppl-atk-figures.mjs");
  if (fs.existsSync(figuresPath)) {
    const figs = JSON.parse(fs.readFileSync(figuresPath, "utf8"));
    t(
      "every inventoried figure carries page, hash and size",
      figs.figures.every((f) => f.sha1 && f.placements?.length && (f.width || f.error)),
      "a figure is missing its provenance",
    );
    t("nothing was rejected in this phase", figs.figures.every((f) => f.looksLike !== undefined && !("rejected" in f)));
  }

  /* ============ 3. the CAA leak is closed where it should be ============ */

  const course = await db.course.findUnique({ where: { slug: COURSE }, select: { id: true } });
  for (const slug of ARCHIVED) {
    const subject = await db.subject.findFirst({ where: { slug, courseId: course.id }, select: { id: true } });
    const published = await db.syllabusTopic.count({ where: { subjectId: subject.id, status: "PUBLISHED" } });
    const archived = await db.syllabusTopic.count({ where: { subjectId: subject.id, status: "ARCHIVED" } });
    t(`${slug}: no syllabus topic is published`, published === 0, `${published} still published`);
    t(`${slug}: the topics are archived, not deleted`, archived > 0, "no archived topics — were they removed?");
    const items = await db.syllabusItem.count({ where: { topic: { subjectId: subject.id }, status: "PUBLISHED" } });
    t(`${slug}: no syllabus item is published either`, items === 0, `${items} still published`);
    const maps = await db.lessonSyllabusItem.count({ where: { item: { topic: { subjectId: subject.id } } } });
    t(`${slug}: the mapping record survives`, maps > 0, `${maps} mappings`);
  }

  // The rule that governed the hold, checked as a rule rather than as a list:
  // a subject may lose its syllabus index only once it has a course of its own
  // to fall back on. It is what made archiving ATK wrong in Phase 1 and right
  // in Phase 2, and it is what would catch a sixth subject being archived
  // empty by someone editing the list.
  const allSubjects = await db.subject.findMany({
    where: { courseId: course.id },
    select: { id: true, slug: true },
  });
  const emptied = [];
  for (const s of allSubjects) {
    const topics = await db.syllabusTopic.count({ where: { subjectId: s.id } });
    if (topics === 0) continue;
    const archived = await db.syllabusTopic.count({ where: { subjectId: s.id, status: "ARCHIVED" } });
    const lessons = await db.lesson.count({ where: { module: { subjectId: s.id }, status: "PUBLISHED" } });
    if (archived === topics && lessons === 0) emptied.push(s.slug);
  }
  t(
    "no subject had its syllabus archived without lessons to fall back on",
    emptied.length === 0,
    `${emptied.join(", ")} would open empty`,
  );

  const held = await db.subject.findFirst({ where: { slug: HELD, courseId: course.id }, select: { id: true } });
  const heldTopics = await db.syllabusTopic.count({ where: { subjectId: held.id } });
  const heldItems = await db.syllabusItem.count({ where: { topic: { subjectId: held.id } } });
  const heldLessons = await db.lesson.count({ where: { module: { subjectId: held.id }, status: "PUBLISHED" } });
  const heldChapters = await db.courseModule.count({ where: { subjectId: held.id, status: "PUBLISHED" } });
  t(`${HELD}: the Phase 2 rebuild gave it chapters`, heldChapters > 0, `${heldChapters} chapters`);
  t(`${HELD}: and lessons, which is what released the hold`, heldLessons > 0, `${heldLessons} lessons`);
  t(`${HELD}: all 42 of its syllabus topics survive`, heldTopics === 42, `${heldTopics} topics`);
  t(`${HELD}: all 210 of its syllabus items survive`, heldItems === 210, `${heldItems} items`);

  const totalPublished = await db.syllabusTopic.count({ where: { subject: { courseId: course.id }, status: "PUBLISHED" } });
  const totalArchived = await db.syllabusTopic.count({ where: { subject: { courseId: course.id }, status: "ARCHIVED" } });
  // 128 when this suite was written, and 159 now. The 31 new topics are
  // Subject No. 10 Human Factors, which was missing from the AC61-3 pages
  // originally supplied and has since been imported from the CAA's own copy of
  // AC61-3 Revision 31. The claim being made here has not changed — every PPL
  // syllabus topic is archived, none is published to a student, and none was
  // deleted — only the number of rows it is made about.
  const TOPICS = 159;
  t(
    `all ${TOPICS} topics archived, none left published`,
    totalArchived === TOPICS && totalPublished === 0,
    `${totalArchived} archived, ${totalPublished} published`,
  );
  t("no syllabus row was deleted", totalArchived + totalPublished === TOPICS, `${totalArchived + totalPublished} rows`);

  /* ============ 4. what a student actually sees ============ */

  const student = new User();
  const row = await student.signup("PPL Phase 1", EMAIL);
  await db.entitlement.create({
    data: {
      userId: row.id,
      scopeKey: `course:${course.id}`,
      courseId: course.id,
      source: "ADMIN",
      status: "ACTIVE",
      note: "ppl phase 1 test fixture",
    },
  });

  for (const slug of ARCHIVED) {
    const page = await student.visit(`/study/${COURSE}/${slug}`);
    t(
      `${slug}: the subject page goes to the contents, not a syllabus index`,
      page.status === 200 && page.landedOn === `/study/${COURSE}/${slug}/lessons`,
      `status ${page.status}, landed on ${page.landedOn}`,
    );
    t(`${slug}: the page offers no syllabus index`, !page.text.includes("Syllabus items"), "the index is still there");
    t(`${slug}: no CAA code is rendered`, !/\b\d{1,2}\.\d{1,2}\.\d{1,2}\b/.test(page.text), "a syllabus code reached the page");

    const lesson = await db.lesson.findFirst({
      where: { module: { subjectId: (await db.subject.findFirst({ where: { slug, courseId: course.id }, select: { id: true } })).id }, mappings: { some: { status: "CONFIRMED" } } },
      select: { slug: true },
    });
    if (lesson) {
      const lp = await student.visit(`/study/${COURSE}/${slug}/lessons/${lesson.slug}`);
      t(`${slug}: a mapped lesson opens`, lp.status === 200, `status ${lp.status}`);
      t(
        `${slug}: and prints no CAA objective block`,
        !lp.text.includes("What you need to know"),
        `${lesson.slug} still shows one`,
      );
    }
  }

  // Human Factors never had syllabus rows, so it must be exactly as it was.
  const hf = await student.visit(`/study/${COURSE}/human-factors`);
  t(
    "human-factors is unchanged — it never had a syllabus to archive",
    hf.status === 200 && hf.landedOn === `/study/${COURSE}/human-factors/lessons`,
    `landed on ${hf.landedOn}`,
  );

  // ATK is the deliberate exception and must still be reachable.
  const atk = await student.visit(`/study/${COURSE}/${HELD}`);
  t("aircraft-technical-knowledge still opens", atk.status === 200, `status ${atk.status}`);

  /* ============ 5. identity and the other courses ============ */

  const subjects = await db.subject.findMany({ where: { courseId: course.id }, orderBy: { order: "asc" }, select: { slug: true, status: true } });
  t("the course still has its six subjects", subjects.length === 6, `${subjects.length}`);
  t("all six are still published", subjects.every((s) => s.status === "PUBLISHED"), subjects.filter((s) => s.status !== "PUBLISHED").map((s) => s.slug).join(", "));

  const products = await db.productItem.count({ where: { OR: [{ courseId: course.id }, { subject: { courseId: course.id } }] } });
  t("the nine product items still resolve", products === 9, `${products}`);
  // The invariant is that the three long-standing manual grants are still in
  // force. Revoked rows are kept deliberately — they are the audit trail of a
  // revocation — so they are not counted as live access.
  const ents = await db.entitlement.count({ where: { OR: [{ courseId: course.id }, { subject: { courseId: course.id } }], source: "ADMIN", status: "ACTIVE", note: { not: "ppl phase 1 test fixture" } } });
  t("the pre-existing entitlements are intact", ents === 3, `${ents}`);
  const questions = await db.question.count({ where: { subject: { courseId: course.id } } });
  const mocks = await db.mockExam.count({
    // Free trials are provisioned per subject by the application rather than
    // authored against the course, so they are not a curriculum binding.
    // An authored mock binds either to a subject of this course or to the
    // course itself — the full mock is deliberately course-wide.
    where: {
      isFreeTrial: false,
      OR: [{ subject: { courseId: course.id } }, { courseId: course.id }],
    },
  });
  // The bank grows as questions are authored, so the binding is what is
  // checked rather than a count: every question of this course resolves to
  // one of its subjects, and to a section of that same subject.
  const crossSubject = await db.question.count({
    where: {
      subject: { courseId: course.id },
      module: { is: { subject: { courseId: { not: course.id } } } },
    },
  });
  t("question bindings are intact", questions >= 10 && crossSubject === 0,
    `${questions} questions, ${crossSubject} pointing at another course's section`);
  // Mocks are authored, so the count grows. What must hold is that every
  // one of this course's mocks still resolves to one of its subjects.
  // A mock filed under this course must not resolve to another course's
  // subject. (The previous form combined `subject: {...}` with
  // `subjectId: null`, which can never match anything.)
  const strayMocks = await db.mockExam.count({
    where: {
      isFreeTrial: false,
      courseId: course.id,
      subject: { is: { courseId: { not: course.id } } },
    },
  });
  t("mock exam bindings are intact", mocks >= 2 && strayMocks === 0,
    `${mocks} mocks, ${strayMocks} unbound`);

  for (const [slug, expectPublishedTopics] of [["cpl-theory", 0], ["ir-theory", 0]]) {
    const c = await db.course.findUnique({ where: { slug }, select: { id: true } });
    const pub = await db.syllabusTopic.count({ where: { subject: { courseId: c.id }, status: "PUBLISHED" } });
    const mods = await db.courseModule.count({ where: { subject: { courseId: c.id } } });
    t(`${slug} was not touched`, pub === expectPublishedTopics && mods > 0, `${pub} published topics, ${mods} modules`);
  }
  const groundwork = await db.chapter.count({ where: { subject: { course: { slug: "ppl-flight-test" } } } });
  t("PPL Flight Test Groundwork was not touched", groundwork === 8, `${groundwork} chapters`);

  await finish();
}

async function finish() {
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
  await db.$disconnect();
  process.exit(1);
});
