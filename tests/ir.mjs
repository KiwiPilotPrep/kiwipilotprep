/**
 * The IR course, walked the way a student walks it.
 *
 * The IR material arrived as three PDF study manuals and had to be turned into
 * a course. The failures that mattered were not crashes — every page returned
 * 200 throughout — they were that the course advertised five subjects when
 * three manuals existed, that chapters were named after whatever heading opened
 * a run of slides, that topics were named after half of their own heading or
 * after a sentence from the body text, and that the reader announced which
 * slide you were on. None of that shows up in a status code, so it is asserted
 * here.
 *
 * The course is now built from a curriculum rather than from the running order
 * of the manuals, so the checks below are mostly about that: that the structure
 * is authored, that every topic carries teaching of its own and not only
 * extracted text, and that no name reads like something lifted off a slide.
 *
 * Runs against real HTTP and real Postgres, as an entitled student.
 *
 *   node tests/ir.mjs
 */
import { PrismaClient } from "@prisma/client";

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const COURSE = "ir-theory";

/** The three supplied manuals. There is no fourth. */
const SUBJECTS = ["ifr-navigation", "ifr-navaids", "ir-air-law"];

const db = new PrismaClient();

const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

// Its own slice of the range, so a run does not spend another suite's signup
// allowance: the signup form allows twenty accounts an hour per address.
let ipCounter = 0;
const IP_BASE = 91;
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
      const location = res.headers.get("location");
      const next = location.startsWith("http")
        ? new URL(location).pathname + new URL(location).search
        : location;
      trail.push(next);
      res = await this.request(next);
    }
    const body = await res.text();
    return { status: res.status, body, text: body.replace(/<!--[\s\S]*?-->/g, ""), landedOn: trail.at(-1) };
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
    const row = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (!row) {
      throw new Error(
        `signup did not create ${email} (landed on ${res.headers.get("location")}). ` +
          "The signup form allows 20 accounts an hour per address; a long-lived dev " +
          "server that has already run the suite will refuse the next one.",
      );
    }
    await db.user.update({
      where: { id: row.id },
      data: { emailVerifiedAt: new Date(), verifyTokenHash: null },
    });
    return row;
  }
}

const stamp = Date.now().toString(36).slice(-6);
const EMAIL = `ir-${stamp}@example.com`;

async function cleanup() {
  const users = await db.user.findMany({
    where: { email: { startsWith: "ir-" } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (!ids.length) return;
  await db.lessonProgress.deleteMany({ where: { userId: { in: ids } } });
  await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
  await db.emailLog.deleteMany({ where: { userId: { in: ids } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
}

/**
 * Wording that means the reader is showing its workings.
 *
 * These are the phrases the migration left behind: the marker for a source
 * page with nothing on it, the marker for a diagram that could not be read,
 * and the source-page citation that used to sit under every topic.
 */
const PIPELINE_LEAKS = [
  /NO CONTENT IN SOURCE/i,
  /PRESERVE FROM SOURCE/i,
  /\bslides? \d+\s*[\u2013-]\s*\d+/i,
  /\.pdf,\s*slides?\b/i,
  /Slide No\.?\s*\d/i,
];

/**
 * The author talking to themselves.
 *
 * Every one of these was in the shipped course: "FOR Review AGAIN until its in
 * there?" as a chapter name, "(Check this out people.)" inside a sentence about
 * alternate minima, "NOW CONTINUE QUIETLY" at the end of a worked example.
 */
const REVIEWER_TEXT = [
  /\bfor review\b/i,
  /\bcheck (?:this|it) out\b/i,
  /\bcheck again\b/i,
  /\bTODO\b/,
  /\bFIXME\b/,
  /\buntil (?:its|it's|it is) in there\b/i,
  /\bcontinue quietly\b/i,
];

/**
 * Wording that presents the course as somebody else's.
 *
 * KiwiPilotPrep prepares people for these exams and is not affiliated with the
 * bodies that set them, so the course cannot be described as theirs. The
 * disclaimer that says exactly that is not caught here — it is the opposite of
 * a claim of affiliation — and neither is source material that happens to name
 * an authority, which is the manuals' own text.
 */
const BORROWED_IDENTITY = [
  /aspeq theory/i,
  /theory subjects?\.?\s*$/i,
  /official (?:caa )?syllabus/i,
  /caa theory course/i,
];

async function main() {
  await cleanup();

  /* ============ 1. the course is the three manuals, and only those ======== */

  const course = await db.course.findUnique({
    where: { slug: COURSE },
    select: { id: true, title: true },
  });
  if (!course) throw new Error(`no ${COURSE} course — run the importer first`);

  const published = await db.subject.findMany({
    where: { courseId: course.id, status: "PUBLISHED" },
    orderBy: { order: "asc" },
    select: {
      id: true, slug: true, title: true,
      _count: { select: { chapters: true, modules: true } },
    },
  });

  t(
    "the course publishes one subject per supplied manual",
    published.length === SUBJECTS.length,
    `${published.length} published: ${published.map((s) => s.slug).join(", ")}`,
  );
  t(
    "and they are the three that have material",
    published.map((s) => s.slug).sort().join(",") === [...SUBJECTS].sort().join(","),
    published.map((s) => s.slug).join(", "),
  );

  for (const subject of published) {
    t(
      `${subject.slug}: has chapters of its own`,
      subject._count.modules > 0,
      "no imported chapters",
    );
    t(
      `${subject.slug}: carries no seeded placeholder chapters`,
      subject._count.chapters === 0,
      `${subject._count.chapters} placeholder chapters`,
    );
  }

  /* ============ 2. no empty topics, no invented names ==================== */

  const lessons = await db.lesson.findMany({
    where: { status: "PUBLISHED", module: { subject: { courseId: course.id } } },
    select: {
      id: true, slug: true, title: true,
      module: { select: { title: true, subject: { select: { slug: true } } } },
      content: { select: { blocks: true } },
    },
  });

  t("every subject's material is in the course", lessons.length > 250, `${lessons.length} topics`);

  const empty = lessons.filter((l) => (l.content?.blocks ?? []).length === 0);
  t("no topic is empty", empty.length === 0, `${empty.length}, e.g. ${empty[0]?.title}`);

  // A topic named after the file it came from is the pipeline's name, not a
  // heading anyone wrote. This is what produced "IFRNavigation2020_Branding_Removed".
  const fileNamed = lessons.filter((l) => /_|\.pdf|\.pptx|Branding/i.test(l.title));
  t(
    "no topic is named after its source file",
    fileNamed.length === 0,
    fileNamed.slice(0, 3).map((l) => l.title).join(" | "),
  );

  const modules = await db.courseModule.findMany({
    where: { status: "PUBLISHED", subject: { courseId: course.id } },
    select: { title: true, subjectId: true, origin: true, summary: true,
      _count: { select: { lessons: true } } },
  });

  // The course is a curriculum, not an import. A DECK-origin chapter here would
  // mean the manual's own running order had come back alongside it.
  const imported = modules.filter((m) => m.origin !== "AUTHORED");
  t(
    "every chapter is authored, not lifted from the manual's running order",
    imported.length === 0,
    `${imported.length}, e.g. ${imported[0]?.title}`,
  );
  t(
    "every chapter says what it is for",
    modules.every((m) => (m.summary ?? "").length > 20),
    `${modules.filter((m) => !(m.summary ?? "").length).length} with no summary`,
  );
  const emptyChapters = modules.filter((m) => m._count.lessons === 0);
  t(
    "no chapter is empty",
    emptyChapters.length === 0,
    emptyChapters.map((m) => m.title).join(", "),
  );

  // Within one subject, two chapters of the same name are two the reader
  // cannot tell apart in the index.
  const dupes = [];
  for (const subject of published) {
    const names = modules.filter((m) => m.subjectId === subject.id).map((m) => m.title);
    const seen = new Set();
    for (const name of names) {
      if (seen.has(name)) dupes.push(`${subject.slug}/${name}`);
      seen.add(name);
    }
  }
  t("no two chapters of a subject share a name", dupes.length === 0, dupes.join(", "));

  /* ============ 3. the stored blocks carry no pipeline markers =========== */

  const leaking = [];
  for (const lesson of lessons) {
    const serialised = JSON.stringify(lesson.content?.blocks ?? []);
    if (PIPELINE_LEAKS.some((pattern) => pattern.test(serialised))) {
      leaking.push(lesson.title);
    }
  }
  t(
    "no stored block carries a migration marker",
    leaking.length === 0,
    `${leaking.length}, e.g. ${leaking.slice(0, 3).join(" | ")}`,
  );

  /* ---- the teaching apparatus, and the line between the two origins ---- */

  // A topic made only of extracted paragraphs is a page of the manual with a
  // better name on it. Every topic has to say something of its own.
  const bare = lessons.filter(
    (l) => !(l.content?.blocks ?? []).some((b) => b?.origin === "authored"),
  );
  t(
    "every topic carries teaching written for the course",
    bare.length === 0,
    `${bare.length}, e.g. ${bare.slice(0, 3).map((l) => l.title).join(" | ")}`,
  );

  // The distinction has to survive in the record, not only in whoever built it.
  const untagged = [];
  for (const lesson of lessons) {
    for (const block of lesson.content?.blocks ?? []) {
      if (block?.origin !== "source" && block?.origin !== "authored") {
        untagged.push(`${lesson.title}: ${block?.type}`);
      }
    }
  }
  t(
    "every block records whether it is source or authored",
    untagged.length === 0,
    `${untagged.length}, e.g. ${untagged.slice(0, 3).join(" | ")}`,
  );

  // The material a student came for is the manual's. Enrichment explains it; it
  // must not become the bulk of what is on the page.
  let sourceChars = 0;
  let authoredChars = 0;
  for (const lesson of lessons) {
    for (const block of lesson.content?.blocks ?? []) {
      const text = JSON.stringify(block ?? {}).length;
      if (block?.origin === "authored") authoredChars += text;
      else sourceChars += text;
    }
  }
  const authoredShare = authoredChars / (authoredChars + sourceChars);
  t(
    "source material still leads the course",
    authoredShare < 0.5,
    `authored is ${Math.round(authoredShare * 100)}% of the stored content`,
  );

  /* ---- names that read like a syllabus rather than like extraction ---- */

  // The failures the last version of this course actually had.
  const HOLLOW = new Set([
    "operational", "general", "based", "continued", "introduction", "overview",
    "information", "datum", "sector", "standard", "aviation", "precision",
    "magnetic", "control", "error", "static", "drift",
  ]);
  const names = [...modules.map((m) => m.title), ...lessons.map((l) => l.title)];

  const hollow = names.filter((n) => HOLLOW.has(n.trim().toLowerCase()));
  t(
    "no chapter or topic is named after a word that means nothing",
    hollow.length === 0,
    hollow.slice(0, 5).join(", "),
  );

  const prose = names.filter(
    (n) =>
      n.trim().split(/\s+/).length > 9 ||
      /[.!?]$/.test(n.trim()) ||
      /^(we|you|it|this|there|now|so|let's|lets)\b/i.test(n.trim()),
  );
  t(
    "no chapter or topic is named after a sentence from the body text",
    prose.length === 0,
    prose.slice(0, 3).join(" | "),
  );

  // "Maps and Charts" and "Maps And Charts" are one topic entered twice.
  //
  // Checked within a subject, not across the course. Two of the three manuals
  // genuinely teach the VOR and DME — they are separate subjects with separate
  // exams — so a topic of the same name in two of them is the source material
  // overlapping, not the pipeline duplicating.
  const nearDupes = [];
  for (const subject of published) {
    const subjectNames = [
      ...modules.filter((m) => m.subjectId === subject.id).map((m) => m.title),
      ...lessons.filter((l) => l.module.subject.slug === subject.slug).map((l) => l.title),
    ];
    const byShape = new Map();
    for (const name of subjectNames) {
      const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
      if (byShape.has(key)) nearDupes.push(`${subject.slug}: ${byShape.get(key)} / ${name}`);
      byShape.set(key, name);
    }
  }
  t(
    "within a subject, no two chapters or topics differ only in punctuation or case",
    nearDupes.length === 0,
    nearDupes.slice(0, 3).join(" | "),
  );

  /* ---- the content cleanup, asserted rather than assumed --------------- */

  const reviewerText = [];
  const drawnRules = [];
  const emptyBlocks = [];
  for (const lesson of lessons) {
    for (const block of lesson.content?.blocks ?? []) {
      const text =
        block?.type === "keypoints" || block?.type === "list"
          ? (block.items ?? []).join(" ")
          : [block?.text, block?.term, block?.title].filter(Boolean).join(" ");

      if (REVIEWER_TEXT.some((pattern) => pattern.test(text))) {
        reviewerText.push(`${lesson.title}: ${text.slice(0, 80)}`);
      }
      // A rule the author drew with underscores under a subtraction. Carries
      // nothing once the page layout is gone.
      if (/^[_\-\u2013\u2014\s]{4,}$/.test(text.trim())) drawnRules.push(lesson.title);
      if (!text && block?.type !== "table" && block?.type !== "figure") {
        emptyBlocks.push(`${lesson.title}: ${block?.type}`);
      }
    }
  }
  t(
    "no topic carries a note the author wrote to themselves",
    reviewerText.length === 0,
    reviewerText.slice(0, 3).join(" | "),
  );
  t(
    "no topic carries a rule drawn with underscores",
    drawnRules.length === 0,
    `${drawnRules.length}, e.g. ${drawnRules[0]}`,
  );
  t(
    "no block is empty",
    emptyBlocks.length === 0,
    emptyBlocks.slice(0, 3).join(" | "),
  );

  // The same passage twice inside one topic. The manuals repeat themselves
  // across the pages a topic gathers, and the reader should see it once.
  const repeatedInTopic = [];
  for (const lesson of lessons) {
    const seenPassages = new Set();
    for (const block of lesson.content?.blocks ?? []) {
      if (block?.type !== "paragraph" && block?.type !== "subitem") continue;
      const key = `${block.title ?? ""}${block.text ?? ""}`.toLowerCase().replace(/[^a-z0-9]+/g, "");
      if (key.length < 60) continue;
      if (seenPassages.has(key)) repeatedInTopic.push(lesson.title);
      seenPassages.add(key);
    }
  }
  t(
    "no topic says the same thing twice",
    repeatedInTopic.length === 0,
    `${repeatedInTopic.length}, e.g. ${repeatedInTopic[0]}`,
  );

  // Authored teaching that reads identically on two topics is a template.
  const authoredPassages = new Map();
  for (const lesson of lessons) {
    for (const block of lesson.content?.blocks ?? []) {
      if (block?.origin !== "authored") continue;
      const text =
        block.type === "keypoints"
          ? (block.items ?? []).join(" ")
          : [block.text, block.term].filter(Boolean).join(" ");
      if (text.length < 60) continue;
      const key = text.toLowerCase().replace(/[^a-z0-9]+/g, "");
      authoredPassages.set(key, [...(authoredPassages.get(key) ?? []), lesson.title]);
    }
  }
  const templated = [...authoredPassages.values()].filter((where) => where.length > 1);
  t(
    "no authored passage is reused on another topic",
    templated.length === 0,
    templated.slice(0, 2).map((w) => w.join(" / ")).join(" | "),
  );

  // A diagram shown twice in one topic is the deck repeating a slide.
  const repeated = [];
  for (const lesson of lessons) {
    const ids = (lesson.content?.blocks ?? [])
      .filter((b) => b?.type === "figure")
      .map((b) => b.assetId);
    if (new Set(ids).size !== ids.length) repeated.push(lesson.title);
  }
  t(
    "no topic shows the same diagram twice",
    repeated.length === 0,
    `${repeated.length}, e.g. ${repeated.slice(0, 3).join(" | ")}`,
  );

  /* ============ 4. the student's walk through the course ================= */

  const student = new User();
  const row = await student.signup("IR Tester", EMAIL);
  await db.entitlement.create({
    data: {
      userId: row.id,
      scopeKey: `course:${course.id}`,
      courseId: course.id,
      source: "ADMIN",
      status: "ACTIVE",
      note: "ir test fixture",
    },
  });

  const coursePage = await student.visit(`/courses/${COURSE}`);
  t("the course page opens", coursePage.status === 200, `status ${coursePage.status}`);
  t(
    "the course is presented as KiwiPilotPrep's own",
    coursePage.text.includes("KiwiPilotPrep \u2014 IR Theory"),
    "the course name does not carry the brand",
  );
  for (const pattern of BORROWED_IDENTITY) {
    t(
      `the course page does not describe itself with ${pattern.source.slice(0, 26)}`,
      !pattern.test(coursePage.text),
      "borrowed course identity",
    );
  }

  for (const subject of published) {
    t(
      `the course page offers ${subject.title}`,
      coursePage.text.includes(subject.title),
      "subject card missing",
    );
  }
  t(
    "the course page does not offer a subject with no material",
    !/Instrument Flight (Operations|Meteorology)/i.test(coursePage.text),
    "an archived subject is still on the page",
  );

  // The count on the card is the number of chapters that exist, not the four
  // the seed attaches to every subject.
  const navigation = published.find((s) => s.slug === "ifr-navigation");
  const navChapters = modules.filter((m) => m.subjectId === navigation.id).length;
  t(
    "the subject card counts the chapters that exist",
    coursePage.text.includes(`${navChapters} chapters`),
    `expected "${navChapters} chapters" on the card`,
  );

  /* ---- into a subject ---- */

  const subjectPage = await student.visit(`/courses/${COURSE}/subjects/ifr-navaids`);
  t("a subject opens", subjectPage.status === 200, `status ${subjectPage.status}`);
  t(
    "and lands on its course material",
    subjectPage.landedOn.includes("/lessons"),
    subjectPage.landedOn,
  );
  t(
    "the index counts chapters and topics, not slides",
    /Chapters/.test(subjectPage.text) && /Topics/.test(subjectPage.text),
    "the index still talks in slides",
  );

  /* ---- into a topic, in the order it is taught ---- */

  const first = await db.courseModule.findFirst({
    where: { status: "PUBLISHED", subject: { slug: "ifr-navaids" } },
    orderBy: { displayOrder: "asc" },
    select: {
      title: true,
      lessons: {
        where: { status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" },
        select: { id: true, slug: true, title: true, content: { select: { blocks: true } } },
      },
    },
  });

  // A topic with a diagram, so the figure path is exercised for real.
  const withFigure = await db.lesson.findFirst({
    where: {
      status: "PUBLISHED",
      module: { subject: { slug: "ifr-navaids" } },
      content: { is: {} },
    },
    orderBy: { displayOrder: "asc" },
    select: {
      slug: true, title: true,
      content: { select: { blocks: true } },
      module: { select: { title: true } },
    },
  });

  const base = `/study/${COURSE}/ifr-navaids/lessons`;
  const topic = await student.visit(`${base}/${first.lessons[0].slug}`);
  t("a topic opens", topic.status === 200, `status ${topic.status}`);
  t("the topic shows its own heading", topic.text.includes(first.lessons[0].title));
  t("the topic names the chapter it belongs to", topic.text.includes(first.title));
  t(
    "the topic is numbered by where it sits in the course",
    /reader-code[^>]*>\s*1\.1\s*</.test(topic.body),
    "no 1.1 on the first topic of the first chapter",
  );
  for (const pattern of PIPELINE_LEAKS) {
    t(`the topic page says nothing about ${pattern.source.slice(0, 24)}`, !pattern.test(topic.text));
  }
  for (const pattern of REVIEWER_TEXT) {
    t(
      `the topic page carries no note matching ${pattern.source.slice(0, 22)}`,
      !pattern.test(topic.text),
    );
  }
  for (const pattern of BORROWED_IDENTITY) {
    t(
      `the topic page does not borrow an identity matching ${pattern.source.slice(0, 20)}`,
      !pattern.test(topic.text),
      "borrowed course identity",
    );
  }
  t(
    "the topic offers the next one",
    /pager-next/.test(topic.body),
    "no next link",
  );

  /* ---- the diagram itself ---- */

  const figureLesson = await db.lesson.findFirst({
    where: { status: "PUBLISHED", module: { subject: { slug: "ifr-navaids" } } },
    orderBy: { displayOrder: "asc" },
    select: { slug: true, content: { select: { blocks: true } } },
  });
  const anyFigure = lessons
    .flatMap((l) => (l.content?.blocks ?? []).map((b) => ({ lesson: l, block: b })))
    .find((x) => x.block?.type === "figure");
  t("the course carries diagrams", Boolean(anyFigure), "no figure block anywhere");

  if (anyFigure) {
    const bytes = await student.request(`/api/study-figures/${anyFigure.block.assetId}`);
    t("a diagram is served to the entitled student", bytes.status === 200, `status ${bytes.status}`);
    const type = bytes.headers.get("content-type") ?? "";
    t(
      "and it is served as an image a browser will draw",
      /^image\/(png|jpeg|gif|webp)$/.test(type),
      type,
    );
    const outsider = await new User().request(`/api/study-figures/${anyFigure.block.assetId}`);
    t(
      "and not to a signed-out visitor",
      outsider.status !== 200,
      `status ${outsider.status}`,
    );
  }

  /* ---- progress moves ---- */

  const before = await db.lessonProgress.count({
    where: { userId: row.id, completedAt: { not: null } },
  });
  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: row.id, lessonId: first.lessons[0].id } },
    create: { userId: row.id, lessonId: first.lessons[0].id, completedAt: new Date() },
    update: { completedAt: new Date() },
  });
  const after = await db.lessonProgress.count({
    where: { userId: row.id, completedAt: { not: null } },
  });
  t("completing a topic is recorded", after === before + 1, `${before} -> ${after}`);

  const withProgress = await student.visit(`/courses/${COURSE}`);
  t(
    "and the course page counts it",
    /1 of \d+ topics complete/.test(withProgress.text),
    "the course header still reads 0 complete",
  );
  t(
    "the course page measures progress in topics, not placeholder chapters",
    !/of 0 (chapters|topics) complete/.test(withProgress.text),
    "progress has nothing to measure against",
  );

  /* ============ 5. every chapter and topic actually resolves ============= */

  // Sampled rather than exhaustive: the point is that the routes are real, and
  // 789 page loads would make this suite take minutes.
  const sample = [];
  for (const subject of published) {
    const subjectLessons = lessons.filter((l) => l.module.subject.slug === subject.slug);
    for (let i = 0; i < subjectLessons.length; i += Math.ceil(subjectLessons.length / 8)) {
      sample.push({ subject: subject.slug, lesson: subjectLessons[i] });
    }
  }
  const broken = [];
  for (const entry of sample) {
    const page = await student.visit(
      `/study/${COURSE}/${entry.subject}/lessons/${entry.lesson.slug}`,
    );
    if (page.status !== 200) broken.push(`${entry.lesson.slug} (${page.status})`);
  }
  t(
    `every sampled topic loads (${sample.length} across three subjects)`,
    broken.length === 0,
    broken.slice(0, 5).join(", "),
  );

  /* ============ 6. access is still enforced ============================= */

  const stranger = new User();
  await stranger.signup("IR Outsider", `ir-out-${stamp}@example.com`);
  const denied = await stranger.visit(`/study/${COURSE}/ifr-navaids/lessons`);
  t(
    "a student without the course cannot open its material",
    denied.status !== 200 || !denied.text.includes(first.lessons[0].title),
    `status ${denied.status}`,
  );

  await cleanup();

  console.log(checks.join("\n"));
  const failed = checks.filter((c) => c.startsWith("FAIL")).length;
  const passed = checks.filter((c) => c.startsWith("PASS")).length;
  console.log(`\n${passed}/${passed + failed} passed`);
  await db.$disconnect();
  process.exit(failed ? 1 : 0);
}

main().catch(async (error) => {
  console.error(error);
  await cleanup().catch(() => {});
  await db.$disconnect();
  process.exit(1);
});
