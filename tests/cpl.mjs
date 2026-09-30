/**
 * The CPL course, walked the way a student walks it.
 *
 * The CPL material arrived as six PowerPoint decks and was first turned into a
 * course by following them: a run of slides became a chapter and took its name
 * from whichever slide happened to fall first in the run. Every page returned
 * 200 throughout, so none of the failures that mattered showed up in a status
 * code — a chapter called "THE OIL SYSTEM" holding the propeller material, a
 * topic called "I", eighteen topics named "Slide No. 44PPL Air Technical
 * Knowledge", and another provider's logo printed inside the lessons.
 *
 * Navigation is now built from a curriculum rather than from the running order
 * of the deck, so the checks below are mostly about that: that the structure is
 * authored, that every topic carries teaching of its own and not only extracted
 * text, that source and authored material stay distinguishable, and that
 * nothing on the page came off a slide's furniture.
 *
 * The five subjects that have not been rebuilt yet are deliberately not
 * asserted against — they are still the old import, and pretending otherwise
 * would make this suite lie.
 *
 * Runs against real HTTP and real Postgres, as an entitled student.
 *
 *   node tests/cpl.mjs
 */
import { PrismaClient } from "@prisma/client";

import { BRANDED } from "../content/cpl/diagram-decisions.mjs";

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const COURSE = "cpl-theory";

/** The subjects rebuilt to the IR standard. All six, now. */
const REBUILT = [
  "navigation", "air-law", "meteorology",
  "principles-of-flight", "aircraft-technical-knowledge", "human-factors",
];

/** The six subjects the finished course must have, and no seventh. */
const SIX = [
  "air-law", "navigation", "meteorology",
  "principles-of-flight", "aircraft-technical-knowledge", "human-factors",
];

const db = new PrismaClient();

const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

// Its own slice of the range, so a run does not spend another suite's signup
// allowance: the signup form allows twenty accounts an hour per address.
let ipCounter = 0;
const IP_BASE = 121;
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
const EMAIL = `cpl-${stamp}@example.com`;

async function cleanup() {
  const users = await db.user.findMany({
    where: { email: { startsWith: "cpl-" } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (!ids.length) return;
  await db.lessonProgress.deleteMany({ where: { userId: { in: ids } } });
  await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
  await db.emailLog.deleteMany({ where: { userId: { in: ids } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
}

/** Wording that means the reader is showing its workings. */
const PIPELINE_LEAKS = [
  /NO CONTENT IN SOURCE/i,
  /PRESERVE FROM SOURCE/i,
  /Slide No\.?\s*\d/i,
  /\.pptx?\b/i,
  /\bslides? \d+\s*[–-]\s*\d+/i,
];

/**
 * Another provider's course, showing through this one.
 *
 * The decks were made by a named academy to be presented in its classrooms, so
 * they carry its wordmark, its instructions to its own instructors, and notes
 * about videos it played in the room. None of that is addressed to a student
 * reading this.
 */
const BORROWED = [
  /commercial pilot academy/i,
  /\bNZICPA\b/i,
  /instructor to demonstrate/i,
  /instructor will demonstrate/i,
  /student to demonstrate/i,
  /course notes play a video/i,
];

/** Words that name nothing on their own. */
const HOLLOW = new Set([
  "cpl", "ppl", "introduction", "summary", "definitions", "example", "general",
  "operational", "notes", "overview", "continued", "section", "part",
]);

async function main() {
  await cleanup();

  /* ============ 1. six subjects, and no seventh in the finished course ==== */

  const course = await db.course.findUnique({
    where: { slug: COURSE },
    select: { id: true, title: true, description: true },
  });
  if (!course) throw new Error(`no ${COURSE} course — run the seed first`);

  const subjects = await db.subject.findMany({
    where: { courseId: course.id, status: "PUBLISHED" },
    orderBy: { order: "asc" },
    select: { id: true, slug: true, title: true, _count: { select: { modules: true } } },
  });

  for (const slug of SIX) {
    t(
      `the course carries the subject ${slug}`,
      subjects.some((s) => s.slug === slug),
      "missing",
    );
  }
  // The seventh subject corresponds to no CAA examination. It is archived
  // rather than deleted: the row and its id survive for the deliberate
  // retirement step, but a student never meets it.
  t(
    "the course shows exactly the six theory subjects",
    subjects.length === SIX.length,
    `${subjects.length} published: ${subjects.map((s) => s.slug).join(", ")}`,
  );
  const seventh = subjects.find((s) => s.slug === "flight-planning");
  t("flight-planning is not one of them", !seventh, "it is still published");
  const archived = await db.subject.findFirst({
    where: { courseId: course.id, slug: "flight-planning" },
    select: { id: true, status: true },
  });
  t(
    "but its row is preserved, not deleted",
    Boolean(archived) && archived.status === "ARCHIVED",
    archived ? `status ${archived.status}` : "the row is gone",
  );
  const fpProduct = await db.product.findFirst({
    where: { slug: "subject-cpl-theory-flight-planning" },
    select: { id: true, status: true },
  });
  t(
    "and its product is out of the catalogue rather than removed",
    Boolean(fpProduct) && fpProduct.status !== "PUBLISHED",
    fpProduct ? `status ${fpProduct.status}` : "the product row is gone",
  );

  t(
    "the course is named the way IR is",
    course.title.startsWith("KiwiPilotPrep"),
    `course title is "${course.title}"`,
  );

  /* ============ 2. the rebuilt subjects are authored, not imported ======== */

  for (const slug of REBUILT) {
    const subject = subjects.find((s) => s.slug === slug);
    t(`${slug}: is published`, Boolean(subject), "not found");
    if (!subject) continue;

    const modules = await db.courseModule.findMany({
      where: { subjectId: subject.id },
      orderBy: { displayOrder: "asc" },
      select: {
        title: true, summary: true, origin: true, status: true,
        lessons: {
          orderBy: { displayOrder: "asc" },
          select: { title: true, slug: true, status: true, content: { select: { blocks: true } } },
        },
      },
    });

    t(`${slug}: has chapters`, modules.length > 0, "none");
    t(
      `${slug}: every chapter is authored rather than imported`,
      modules.every((m) => m.origin === "AUTHORED"),
      modules.filter((m) => m.origin !== "AUTHORED").map((m) => m.title).join(", "),
    );
    t(
      `${slug}: every chapter says what it is for`,
      modules.every((m) => (m.summary ?? "").trim().length > 20),
      modules.filter((m) => !(m.summary ?? "").trim()).map((m) => m.title).join(", "),
    );
    t(
      `${slug}: no chapter is empty`,
      modules.every((m) => m.lessons.length > 0),
      modules.filter((m) => !m.lessons.length).map((m) => m.title).join(", "),
    );

    const lessons = modules.flatMap((m) => m.lessons);
    t(
      `${slug}: no topic is empty`,
      lessons.every((l) => (l.content?.blocks ?? []).length > 0),
      lessons.filter((l) => !(l.content?.blocks ?? []).length).map((l) => l.title).join(", "),
    );

    /* ---- titles ------------------------------------------------------- */
    const names = [...modules.map((m) => m.title), ...lessons.map((l) => l.title)];
    const furniture = names.filter((n) => PIPELINE_LEAKS.some((p) => p.test(n)));
    t(`${slug}: no title is slide furniture`, furniture.length === 0, furniture.slice(0, 3).join(" | "));
    const hollow = names.filter((n) => HOLLOW.has(n.trim().toLowerCase()));
    t(`${slug}: no title names nothing`, hollow.length === 0, hollow.join(", "));
    const stub = names.filter((n) => n.trim().length <= 2);
    t(`${slug}: no title is a stray letter`, stub.length === 0, stub.join(", "));
    const prose = names.filter((n) => /[.!?]$/.test(n.trim()) || n.trim().split(/\s+/).length >= 11);
    t(`${slug}: no title is a sentence`, prose.length === 0, prose.slice(0, 2).join(" | "));
    const seen = new Map();
    for (const n of names) {
      const k = n.toLowerCase().replace(/[^a-z0-9]+/g, "");
      seen.set(k, (seen.get(k) ?? 0) + 1);
    }
    const dupes = [...seen.entries()].filter(([, c]) => c > 1);
    t(`${slug}: no two chapters or topics share a name`, dupes.length === 0, `${dupes.length} repeated`);

    /* ---- blocks ------------------------------------------------------- */
    const blocks = lessons.flatMap((l) => l.content?.blocks ?? []);
    const textOf = (b) =>
      b.type === "keypoints" || b.type === "list"
        ? (b.items ?? []).join(" ")
        : [b.text, b.term, b.title, b.caption].filter(Boolean).join(" ");

    t(
      `${slug}: every block records where it came from`,
      blocks.every((b) => b.origin === "source" || b.origin === "authored"),
      `${blocks.filter((b) => !b.origin).length} untagged`,
    );
    t(
      `${slug}: every source block cites the slide it came from`,
      blocks.filter((b) => b.origin === "source").every((b) => typeof b.sourcePage === "number"),
      "a source block has no slide number",
    );
    t(
      `${slug}: no authored block claims a source slide`,
      blocks.filter((b) => b.origin === "authored").every((b) => b.sourcePage === undefined),
      "an authored block carries a slide citation it did not come from",
    );
    t(
      `${slug}: the source still leads the teaching`,
      blocks.filter((b) => b.origin === "source").length > blocks.filter((b) => b.origin === "authored").length,
      "authored material outweighs the deck",
    );
    t(
      `${slug}: every topic carries teaching of its own`,
      lessons.every((l) => (l.content?.blocks ?? []).some((b) => b.origin === "authored")),
      lessons.filter((l) => !(l.content?.blocks ?? []).some((b) => b.origin === "authored"))
        .map((l) => l.title).slice(0, 3).join(", "),
    );
    const borrowed = blocks.filter((b) => BORROWED.some((p) => p.test(textOf(b))));
    t(
      `${slug}: no block carries another provider's wording`,
      borrowed.length === 0,
      borrowed.slice(0, 2).map((b) => textOf(b).slice(0, 60)).join(" | "),
    );
    const leaks = blocks.filter((b) => PIPELINE_LEAKS.some((p) => p.test(textOf(b))));
    t(
      `${slug}: no block shows the pipeline's workings`,
      leaks.length === 0,
      leaks.slice(0, 2).map((b) => textOf(b).slice(0, 60)).join(" | "),
    );
    const empties = blocks.filter(
      (b) => b.type !== "figure" && b.type !== "table" && !textOf(b).trim(),
    );
    t(`${slug}: no block is empty`, empties.length === 0, `${empties.length} empty`);

    // The same passage twice inside one topic is the deck repeating a slide.
    const repeated = [];
    for (const l of lessons) {
      const seenText = new Set();
      for (const b of l.content?.blocks ?? []) {
        if (b.type !== "paragraph" && b.type !== "subitem") continue;
        const k = `${b.title ?? ""}${b.text ?? ""}`.toLowerCase().replace(/[^a-z0-9]+/g, "");
        if (k.length < 60) continue;
        if (seenText.has(k)) repeated.push(l.title);
        seenText.add(k);
      }
    }
    t(`${slug}: no topic says the same thing twice`, repeated.length === 0, repeated.slice(0, 3).join(", "));

    // Authored teaching that reads identically on two topics is a template.
    const authoredText = new Map();
    for (const l of lessons) {
      for (const b of l.content?.blocks ?? []) {
        if (b.origin !== "authored") continue;
        const text = textOf(b);
        if (text.length < 60) continue;
        const k = text.toLowerCase().replace(/[^a-z0-9]+/g, "");
        authoredText.set(k, [...(authoredText.get(k) ?? []), l.title]);
      }
    }
    const templated = [...authoredText.values()].filter((w) => w.length > 1);
    t(
      `${slug}: no authored passage is reused on another topic`,
      templated.length === 0,
      templated.slice(0, 2).map((w) => w.join(" / ")).join(" | "),
    );

    // A diagram shown twice in one topic is the deck repeating a slide.
    const doubled = lessons.filter((l) => {
      const ids = (l.content?.blocks ?? []).filter((b) => b.type === "figure").map((b) => b.assetId);
      return new Set(ids).size !== ids.length;
    });
    t(`${slug}: no diagram is shown twice in one topic`, doubled.length === 0, doubled.map((l) => l.title).join(", "));

    // A table that lost its columns is worse than the lines it replaced.
    const badTables = blocks.filter(
      (b) => b.type === "table" && (!Array.isArray(b.rows) || b.rows.length === 0),
    );
    t(`${slug}: every table has rows`, badTables.length === 0, `${badTables.length} empty tables`);

    /* ---- the CAA syllabus is a checklist, not the curriculum ----------- */
    // IR carries no CAA syllabus rows, which is why its subject page shows the
    // course and its lessons carry no requirement blocks. A published syllabus
    // makes the reader print "18.2.2 What you need to know" above the teaching
    // and describe the syllabus instead of the chapters, so what is asserted is
    // that the reader cannot reach that state.
    const publishedSyllabus = await db.syllabusTopic.count({
      where: { subjectId: subject.id, status: "PUBLISHED", items: { some: { status: "PUBLISHED" } } },
    });
    t(
      `${slug}: no CAA syllabus is published at a student`,
      publishedSyllabus === 0,
      `${publishedSyllabus} published syllabus topics — the reader will show the syllabus, not the course`,
    );
    const retained = await db.lessonSyllabusItem.count({
      where: { item: { topic: { subjectId: subject.id } } },
    });
    t(
      `${slug}: the internal requirement mapping is retained`,
      retained > 0,
      "coverage can no longer be validated",
    );
    const codeInTeaching = blocks.filter((b) => /\d{2}\.\d{1,2}\.\d{1,2}/.test(textOf(b)));
    t(
      `${slug}: no CAA code appears inside the teaching`,
      codeInTeaching.length === 0,
      codeInTeaching.slice(0, 2).map((b) => textOf(b).slice(0, 60)).join(" | "),
    );

    /* ---- syllabus coverage -------------------------------------------- */
    // Read without a status filter: the rows are archived on purpose, and the
    // question here is whether every requirement has teaching behind it.
    // "Reserved" areas hold a number and no requirement, and 16.38 applies to
    // helicopter candidates only. Neither can be taught by an aeroplane course
    // and counting them as uncovered would make this assertion permanently red.
    const topics = await db.syllabusTopic.findMany({
      where: {
        subjectId: subject.id,
        NOT: [
          { title: { equals: "Reserved", mode: "insensitive" } },
          { title: { contains: "Helicopter candidates only" } },
        ],
      },
      select: { items: { select: { id: true } } },
    });
    const itemIds = topics.flatMap((x) => x.items.map((i) => i.id));
    const maps = await db.lessonSyllabusItem.findMany({
      where: { syllabusItemId: { in: itemIds } },
      select: { syllabusItemId: true },
    });
    const covered = new Set(maps.map((m) => m.syllabusItemId));
    t(
      `${slug}: every syllabus item has material behind it`,
      itemIds.length > 0 && covered.size === itemIds.length,
      `${covered.size} of ${itemIds.length} covered`,
    );
  }

  /* ============ 3. the pages a student actually opens ===================== */

  const student = new User();
  const row = await student.signup("CPL Test", EMAIL);
  await db.entitlement.create({
    data: {
      userId: row.id,
      scopeKey: `course:${course.id}`,
      courseId: course.id,
      source: "ADMIN",
      status: "ACTIVE",
      note: "cpl test fixture",
    },
  });

  const coursePage = await student.visit(`/courses/${COURSE}`);
  t("the course page opens", coursePage.status === 200, `status ${coursePage.status}`);

  // IR's subject index redirects to the contents, because IR has no CAA
  // syllabus. Navigation must now do the same.
  const index = await student.visit(`/study/${COURSE}/navigation`);
  t(
    "the subject index leads to the course contents, as IR's does",
    index.status === 200 && index.landedOn === `/study/${COURSE}/navigation/lessons`,
    `landed on ${index.landedOn}`,
  );
  t(
    "and does not offer the CAA syllabus indexed by code",
    !index.text.includes("indexed by code"),
    "the syllabus index is still being shown",
  );

  const subjectPage = await student.visit(`/courses/${COURSE}/subjects/navigation`);
  t("the navigation subject page opens", subjectPage.status === 200, `status ${subjectPage.status}`);
  t(
    "the subject slug the routes depend on still resolves",
    subjectPage.status === 200 && !subjectPage.landedOn.includes("/404"),
    `landed on ${subjectPage.landedOn}`,
  );

  const lessonsPage = await student.visit(`/study/${COURSE}/navigation/lessons`);
  t("the navigation reading list opens", lessonsPage.status === 200, `status ${lessonsPage.status}`);

  const first = await db.courseModule.findFirst({
    where: { subject: { slug: "navigation", course: { slug: COURSE } } },
    orderBy: { displayOrder: "asc" },
    select: { title: true, lessons: { orderBy: { displayOrder: "asc" }, select: { slug: true, title: true } } },
  });
  const base = `/study/${COURSE}/navigation/lessons`;

  // Every topic of the first chapter, then a sample from across the subject:
  // a route that 404s is a dead link whatever the database says.
  const sample = await db.lesson.findMany({
    where: { module: { subject: { slug: "navigation", course: { slug: COURSE } } } },
    select: { slug: true, title: true },
  });
  const toVisit = [
    ...first.lessons.map((l) => l.slug),
    ...sample.filter((_, i) => i % 11 === 0).map((l) => l.slug),
  ];
  const seenSlugs = new Set();
  let opened = 0;
  const dead = [];
  for (const slug of toVisit) {
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    const page = await student.visit(`${base}/${slug}`);
    if (page.status === 200) opened += 1;
    else dead.push(`${slug} → ${page.status}`);
  }
  t(`every sampled topic route opens (${opened}/${seenSlugs.size})`, dead.length === 0, dead.slice(0, 4).join(", "));

  const topic = await student.visit(`${base}/${first.lessons[0].slug}`);
  t("a topic page opens", topic.status === 200, `status ${topic.status}`);
  for (const pattern of PIPELINE_LEAKS) {
    t(
      `the topic page says nothing about ${pattern.source.slice(0, 22)}`,
      !pattern.test(topic.text),
      "pipeline leak on the page",
    );
  }
  for (const pattern of BORROWED) {
    t(
      `the topic page carries no wording matching ${pattern.source.slice(0, 22)}`,
      !pattern.test(topic.text),
      "borrowed wording on the page",
    );
  }
  t(
    "the topic page shows the chapter it belongs to",
    topic.text.includes(first.title),
    "no chapter context",
  );
  t(
    "the topic page prints no syllabus objective block",
    !topic.text.includes("What you need to know") && !topic.body.includes('class="objective"'),
    "a CAA requirement is being shown above the teaching",
  );
  t(
    "no CAA code is rendered on the topic page",
    !/18\.\d{1,2}\.\d{1,2}/.test(topic.text),
    "a syllabus code reached the page",
  );
  for (const junk of ["[object Object]", "NaN", 'src=""', "undefined ·"]) {
    t(`the topic page carries no ${junk}`, !topic.text.includes(junk), "malformed render");
  }

  /* ---- nobody else's branding is on the page ---------------------------- */

  // The reason this section exists: a logo belonging to another academy was
  // being printed inside the lessons, and the passes that found the rest of
  // the junk could not have found it. They measured ink and size, and the
  // offending images were normal diagrams with a wordmark in one corner —
  // indistinguishable from a good figure by any measurement. Every one of them
  // was found by looking. What can be automated is that they stay gone.
  const brandedAssets = await db.mediaAsset.findMany({
    where: { OR: Object.keys(BRANDED).map((sha) => ({ storageKey: { contains: sha } })) },
    select: { id: true, storageKey: true },
  });
  const brandedIds = new Set(brandedAssets.map((a) => a.id));

  const cplContent = await db.studyContent.findMany({
    where: { lesson: { module: { subject: { course: { slug: COURSE } } } } },
    select: {
      blocks: true,
      lesson: { select: { slug: true, module: { select: { subject: { select: { slug: true } } } } } },
    },
  });
  const stillBranded = cplContent.filter((c) =>
    (c.blocks ?? []).some((b) => b.type === "figure" && brandedIds.has(b.assetId)),
  );
  t(
    `no branded image is in any CPL lesson (${brandedIds.size} watched)`,
    stillBranded.length === 0,
    stillBranded.map((c) => c.lesson.slug).slice(0, 4).join(", "),
  );

  // And that removing them left tidy pages rather than holes: a figure taken
  // out is a block taken out, so nothing should be rendering an empty frame.
  const edited = [
    ["air-law", "papi-t-vasis-and-vasis"],
    ["air-law", "emergency-equipment"],
    ["human-factors", "composition-of-the-atmosphere-and-dalton-s-law"],
    ["human-factors", "vision-defects-lenses-and-sunglasses"],
    ["human-factors", "decibel-levels"],
    ["meteorology", "subsidence-and-the-movement-of-pressure-systems"],
    ["meteorology", "the-f-hn-effect"],
    ["aircraft-technical-knowledge", "blockages-and-system-failures"],
    ["aircraft-technical-knowledge", "hydraulic-fluid-and-system-components"],
  ];
  const brandedShas = Object.keys(BRANDED);
  const hollow = [];
  const leaked = [];
  let cleaned = 0;
  for (const [subject, slug] of edited) {
    const page = await student.visit(`/study/${COURSE}/${subject}/lessons/${slug}`);
    if (page.status !== 200) { hollow.push(`${slug} → ${page.status}`); continue; }
    if (/<figure[^>]*>\s*<\/figure>/.test(page.body) || page.body.includes('src=""')) hollow.push(slug);
    else if (brandedShas.some((sha) => page.body.includes(sha))) leaked.push(slug);
    else cleaned += 1;
  }
  t(`every edited page renders whole (${cleaned}/${edited.length})`, hollow.length === 0, hollow.join(", "));
  t("no edited page still requests a branded image", leaked.length === 0, leaked.join(", "));

  // The two places where taking the picture out took teaching with it. The
  // words that replaced them are the course's own, and they are on the page.
  const papi = await student.visit(`/study/${COURSE}/air-law/lessons/papi-t-vasis-and-vasis`);
  t(
    "the PAPI page states the light patterns the removed figure carried",
    /two white and two red is on slope/i.test(papi.text),
    "the authored replacement is missing",
  );
  const air = await student.visit(
    `/study/${COURSE}/human-factors/lessons/composition-of-the-atmosphere-and-dalton-s-law`,
  );
  t(
    "the atmosphere page still gives the composition figures",
    /78% nitrogen/.test(air.text) && /21% oxygen/.test(air.text),
    "the authored replacement is missing",
  );

  /* ---- access control still holds --------------------------------------- */
  const stranger = new User();
  await stranger.signup("CPL Stranger", `cpl-x-${stamp}@example.com`);
  const denied = await stranger.visit(`/study/${COURSE}/navigation/lessons`);
  t(
    "a student without an entitlement cannot read the material",
    denied.status !== 200 || denied.landedOn !== `/study/${COURSE}/navigation/lessons`,
    `status ${denied.status} at ${denied.landedOn}`,
  );

  /* ============ 4. nothing else moved ==================================== */

  const irLessons = await db.lesson.count({
    where: { module: { subject: { course: { slug: "ir-theory" } } } },
  });
  t("the IR course still has its topics", irLessons === 298, `${irLessons} lessons`);

  // Every subject in the course is now authored; nothing is left from the deck
  // importer that produced the original CPL course.
  const deckModules = await db.courseModule.count({
    where: { subject: { course: { slug: COURSE } }, origin: "DECK" },
  });
  t(
    "no chapter is left over from the deck importer",
    deckModules === 0,
    `${deckModules} DECK chapters remain`,
  );

  const products = await db.product.count({ where: { slug: { startsWith: "cpl" } } });
  t("the CPL products are intact", products >= 2, `${products} found`);

  await cleanup();

  /* ---- report ----------------------------------------------------------- */
  console.log(checks.join("\n"));
  const failed = checks.filter((c) => c.startsWith("FAIL")).length;
  console.log(`\n${checks.length - failed}/${checks.length} passed`);
  await db.$disconnect();
  if (failed) process.exit(1);
}

main().catch(async (error) => {
  console.error(error);
  console.log(checks.join("\n"));
  await db.$disconnect();
  process.exit(1);
});
