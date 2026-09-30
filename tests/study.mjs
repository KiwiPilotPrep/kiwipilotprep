/**
 * Study Reader — the course material a student actually opens.
 *
 * This suite used to walk the syllabus-indexed reader: subject index of CAA
 * topics, then one page per requirement code. That architecture is gone on
 * purpose. Every subject that has a course of its own now has its syllabus
 * archived, so the regulator's checklist is no longer what a student is handed
 * — `scripts/ppl-visibility.mjs` did the four PPL subjects that had lessons,
 * and Aircraft Technical Knowledge joined them the day its rebuild gave it 38
 * chapters and 268 lessons.
 *
 * The old fixture — "find a subject with a published syllabus" — therefore
 * matches nothing, and a suite that skipped on that would report full marks
 * for coverage it no longer has. So the checks are re-pointed rather than
 * dropped: the same questions asked of the reader that replaced it. Does the
 * course open without a published syllabus behind it? Is the archived syllabus
 * invisible to a student while its mappings survive internally? Does a lesson
 * read as a page of a manual — its source text verbatim, its diagrams in the
 * flow, its tables intact? And do the things that were never about the
 * syllabus at all — entitlement, IDOR, no PDF, no other academy's branding —
 * still hold?
 *
 * Runs against real HTTP and real Postgres.
 *
 *   node tests/study.mjs
 */
import { PrismaClient } from "@prisma/client";

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const db = new PrismaClient();

/** The subject this suite reads. The rebuild that prompted it. */
const COURSE = "ppl-theory";
const SUBJECT = "aircraft-technical-knowledge";

const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

let ipCounter = 0;
// Its own slice of the documentation range: the signup form allows twenty
// accounts an hour from one address, and several suites sign up.
const IP_BASE = 101;
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
  async postForm(path, fields = {}) {
    const html = await (await this.request(path)).text();
    const decode = (v) => v.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'");
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);

    const ref = html.match(/name="\$ACTION_REF_(\d+)"/);
    if (ref) {
      const n = ref[1];
      fd.set(`$ACTION_REF_${n}`, "");
      fd.set(`$ACTION_${n}:0`, decode(html.match(new RegExp(`name="\\$ACTION_${n}:0" value="([^"]*)"`))?.[1] ?? ""));
      fd.set(`$ACTION_${n}:1`, decode(html.match(new RegExp(`name="\\$ACTION_${n}:1" value="([^"]*)"`))?.[1] ?? "[]"));
    } else {
      const id = html.match(/ACTION_ID_([a-f0-9]+)/)?.[1];
      if (!id) throw new Error(`no server action on ${path}`);
      fd.set(`$ACTION_ID_${id}`, "");
    }
    return this.request(path, { method: "POST", body: fd });
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
    await db.user.update({
      where: { email },
      data: { emailVerifiedAt: new Date(), verifyTokenHash: null },
    });
    return res;
  }
}

const stamp = Date.now().toString(36).slice(-6);
const ENTITLED = `study-yes-${stamp}@example.com`;
const OUTSIDER = `study-no-${stamp}@example.com`;

async function cleanup() {
  const users = await db.user.findMany({
    where: { email: { startsWith: "study-" } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (ids.length) {
    await db.lessonProgress.deleteMany({ where: { userId: { in: ids } } });
    await db.syllabusItemProgress.deleteMany({ where: { userId: { in: ids } } });
    await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
    await db.emailLog.deleteMany({ where: { userId: { in: ids } } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }
}

/** Names the previous academy must never appear. Checked as a class, not a guess. */
const FOREIGN_BRANDING = /\b(academy|flight school|flying school|aeroclub|aero club)\b/i;

/**
 * The regulator's own presentation, which must not reach a student.
 *
 * Not the word "syllabus" on its own: a course may legitimately say what exam
 * it prepares for. What must not appear is the checklist — an objective block,
 * a requirement code used as the identity of a page, an index of "state the…"
 * items to be ticked off.
 */
const CHECKLIST_WORDING = [
  ["an objective block", /What you need to know/i],
  ["a syllabus objective section", /aria-label="Syllabus objective"/i],
  ["a link to the syllabus index", />\s*Syllabus index\s*</i],
  ["the deck's slide furniture", /Slide No\.?\s*\d/i],
  ["a classroom instruction", /\b(instructor (will|to) demonstrate|play (the )?video)\b/i],
];

/**
 * What a student can actually read on the page.
 *
 * Tags stripped, and the RSC payload with them. The distinction matters here:
 * this subject's chapters are numbered 12.1, 12.2, 12.3 because it is the
 * twelfth chapter of the course, and its CAA topics are numbered 12.2, 12.4,
 * 12.6 because it is Subject 12 of the syllabus. Searching the raw HTML for
 * "12.2" finds the course's own numbering in the navigation payload and calls
 * it a regulator leak. CAA *item* codes have three parts — 12.2.4 — and the
 * course's numbering never does, so the check below is made against the real
 * codes from the database rather than against a pattern.
 */
function visible(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Things that mean the page rendered something it should not have. */
const RENDER_FAULTS = [
  ["[object Object]", /\[object Object\]/],
  ["NaN", /(^|[^A-Za-z])NaN([^A-Za-z]|$)/],
  ["undefined printed as text", />\s*undefined\s*</],
  ["an empty image source", /<img[^>]+src=["']\s*["']/i],
];

async function main() {
  await cleanup();

  /* ================= fixtures: the course, not the syllabus ============== */

  const subject = await db.subject.findFirst({
    where: { slug: SUBJECT, status: "PUBLISHED", course: { slug: COURSE } },
    include: { course: { select: { slug: true, title: true } } },
  });
  if (!subject) throw new Error(`no ${SUBJECT} in ${COURSE}`);

  const base = `/study/${COURSE}/${SUBJECT}`;
  const contentsPath = `${base}/lessons`;

  const modules = await db.courseModule.findMany({
    where: { subjectId: subject.id, status: "PUBLISHED" },
    orderBy: { displayOrder: "asc" },
    include: {
      lessons: {
        where: { status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" },
        include: { content: { select: { blocks: true } } },
      },
    },
  });
  const lessons = modules.flatMap((m) => m.lessons);
  if (!lessons.length) throw new Error(`${SUBJECT} has no published lessons — run scripts/build-ppl-course.mjs`);

  const blocksOf = (lesson) => lesson.content?.blocks ?? [];
  const has = (lesson, type) => blocksOf(lesson).some((b) => b.type === type);
  const pick = (type) => lessons.find((l) => has(l, type));

  const lessonWithFigure = pick("figure");
  const lessonWithTable = pick("table");
  const lessonWithSubitems = lessons.find(
    (l) => blocksOf(l).filter((b) => b.type === "subitem").length >= 2,
  );
  const lessonWithAuthored = lessons.find((l) =>
    blocksOf(l).some((b) => b.origin === "authored" && b.type !== "paragraph"),
  );
  const readingLesson = lessonWithFigure ?? lessons[0];
  const lessonPath = `${contentsPath}/${readingLesson.slug}`;

  const student = new User();
  await student.signup("Study Tester", ENTITLED);
  const studentRow = await db.user.findUnique({ where: { email: ENTITLED } });
  await db.entitlement.create({
    data: {
      userId: studentRow.id,
      scopeKey: `subject:${subject.id}`,
      subjectId: subject.id,
      source: "ADMIN",
      status: "ACTIVE",
      note: "study test fixture",
    },
  });

  /* ========== 1. the reader does not need a published syllabus ========== */

  const publishedTopics = await db.syllabusTopic.count({
    where: { subjectId: subject.id, status: "PUBLISHED" },
  });
  const archivedTopics = await db.syllabusTopic.count({
    where: { subjectId: subject.id, status: "ARCHIVED" },
  });
  t("the subject publishes no CAA syllabus at all", publishedTopics === 0, `${publishedTopics} published`);
  t("its syllabus is archived, not deleted", archivedTopics > 0, "no archived topics — were they removed?");

  const contents = await student.visit(contentsPath);
  t("the course contents page opens without one", contents.status === 200, `status ${contents.status}`);
  t(
    "and it is the course that opens, not a checklist",
    contents.text.includes("Browse course material"),
    "the contents navigation did not render",
  );

  /* ================= 2. the contents page is the course ================= */

  t(
    "every chapter in the database is listed",
    modules.every((m) => contents.text.includes(m.title)),
    `${modules.filter((m) => !contents.text.includes(m.title)).length} chapters missing from the page`,
  );
  t(
    "the chapter count is the database's own",
    new RegExp(`<b>\\s*${modules.length}\\s*</b>`).test(contents.body),
    `expected ${modules.length} chapters on the page`,
  );
  t(
    "the topic count is the database's own",
    new RegExp(`<b>\\s*${lessons.length}\\s*</b>`).test(contents.body),
    `expected ${lessons.length} topics on the page`,
  );
  t("the contents page offers a way in", /Start the course|Continue course/.test(contents.text));

  const query = readingLesson.title.split(/\s+/).find((w) => w.length > 5) ?? readingLesson.title;
  const found = await student.visit(`${contentsPath}?q=${encodeURIComponent(query)}`);
  t(
    "searching the course material finds a topic",
    found.status === 200 && found.text.includes(readingLesson.title),
    `searching "${query}" did not surface ${readingLesson.title}`,
  );

  /* ================= 3. a lesson reads as a lesson ================= */

  const page = await student.visit(lessonPath);
  t("a lesson opens", page.status === 200, `status ${page.status} landed ${page.landedOn}`);
  t("the lesson shows its own title", page.text.includes(readingLesson.title));
  t("the lesson names the subject", page.text.includes(subject.title));
  t("the lesson names the chapter it belongs to", page.text.includes(readingLesson.module?.title ?? modules[0].title));

  // Verbatim: the reader must print the source text, not a summary of it. The
  // longest source paragraph is used because a short one could coincide with
  // page furniture.
  const sourceParagraphs = blocksOf(readingLesson)
    .filter((b) => b.origin === "source" && b.type === "paragraph" && typeof b.text === "string")
    .sort((a, b) => b.text.length - a.text.length);
  if (sourceParagraphs.length) {
    const wanted = sourceParagraphs[0].text;
    const escaped = wanted
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/'/g, "&#x27;")
      .replace(/"/g, "&quot;");
    t(
      "the source text is reproduced verbatim, not summarised",
      page.body.includes(wanted) || page.body.includes(escaped),
      `not found: ${wanted.slice(0, 60)}…`,
    );
  }

  t("every source block records the page it came from",
    blocksOf(readingLesson).filter((b) => b.origin === "source").every((b) => Number.isInteger(b.sourcePage)),
    "a source block has no page provenance");

  const authoredHere = blocksOf(readingLesson).filter((b) => b.origin === "authored").length;
  t("the lesson carries authored teaching of its own", authoredHere > 0, "no authored blocks");

  const reread = await student.visit(lessonPath);
  t("refreshing preserves the route and content",
    reread.status === 200 && reread.text.includes(readingLesson.title), "refresh changed the page");

  t("the reader has its own layout, not the dashboard's", page.body.includes("study-shell"),
    "study shell not rendered");
  t("progress is shown in the reader", page.body.includes("reader-progress"));
  t("the chapter navigation is present", page.body.includes("lesson-nav") || page.text.includes("Browse course material"));

  /* ---- previous / next through the course, not through the syllabus ---- */

  const order = lessons.map((l) => l.slug);
  const at = order.indexOf(readingLesson.slug);
  if (at < order.length - 1) {
    t("a Next link points at the following topic",
      page.body.includes(`${contentsPath}/${order[at + 1]}`),
      `expected a link to ${order[at + 1]}`);
  }
  if (at > 0) {
    t("a Previous link points at the preceding topic",
      page.body.includes(`${contentsPath}/${order[at - 1]}`),
      `expected a link to ${order[at - 1]}`);
  }

  /* ================= 4. presentation of the material ================= */

  if (lessonWithSubitems) {
    const p = await student.visit(`${contentsPath}/${lessonWithSubitems.slug}`);
    const count = (p.body.match(/class="subitem"/g) ?? []).length;
    t("list items render on their own lines", count >= 2,
      `${count} sub-item blocks rendered on ${lessonWithSubitems.slug}`);
    t("each list item keeps its label", p.body.includes("subitem-label"), "no sub-item labels rendered");
  }

  if (lessonWithTable) {
    const p = await student.visit(`${contentsPath}/${lessonWithTable.slug}`);
    t("a rebuilt table renders as a table", (p.body.match(/<table\b/g) ?? []).length > 0,
      `no table on ${lessonWithTable.slug}`);
    const rows = blocksOf(lessonWithTable).find((b) => b.type === "table")?.rows?.length ?? 0;
    t("the table keeps all of its rows", (p.body.match(/<tr\b/g) ?? []).length >= rows,
      `expected at least ${rows} rows`);
  }

  if (lessonWithAuthored) {
    const p = await student.visit(`${contentsPath}/${lessonWithAuthored.slug}`);
    const kinds = new Set(blocksOf(lessonWithAuthored).filter((b) => b.origin === "authored").map((b) => b.type));
    const labels = {
      keypoints: "Key points",
      context: "In the aircraft",
      misconception: "Where this goes wrong",
      takeaway: "Remember",
      example: "Worked example",
    };
    for (const [type, label] of Object.entries(labels)) {
      if (!kinds.has(type)) continue;
      t(`authored ${type} renders with its own heading`, p.text.includes(label), `no "${label}" on the page`);
    }
  }

  /* ---- figures ---- */

  let figureSrc = null;
  if (lessonWithFigure) {
    const p = await student.visit(`${contentsPath}/${lessonWithFigure.slug}`);
    const rendered = (p.body.match(/\/api\/study-figures\//g) ?? []).length;
    const expected = blocksOf(lessonWithFigure).filter((b) => b.type === "figure").length;
    t("diagrams render inside the lesson", rendered >= expected,
      `${rendered} rendered, ${expected} in the record`);
    t("diagrams offer click-to-enlarge", p.text.includes("Click to enlarge"));
    figureSrc = p.body.match(/\/api\/study-figures\/[a-z0-9]+/)?.[0] ?? null;
    if (figureSrc) {
      const img = await student.request(figureSrc);
      t("a figure is actually served to an entitled student", img.status === 200, `status ${img.status}`);
      t("and it is served as an image", /^image\//.test(img.headers.get("content-type") ?? ""),
        img.headers.get("content-type") ?? "no content type");
    }
  }

  /* ========== 5. the archived syllabus is invisible, not lost ========== */

  const mappings = await db.lessonSyllabusItem.count({
    where: { lesson: { module: { subjectId: subject.id } } },
  });
  const confirmed = await db.lessonSyllabusItem.count({
    where: { lesson: { module: { subjectId: subject.id } }, status: "CONFIRMED" },
  });
  t("the lesson → syllabus item mappings survive internally", mappings > 0, `${mappings} mappings`);
  t("and they are confirmed links, not guesses", confirmed === mappings, `${confirmed}/${mappings} confirmed`);

  const items = await db.syllabusItem.count({ where: { topic: { subjectId: subject.id } } });
  t("every syllabus item row survives", items === 210, `${items} items`);

  t(
    "the syllabus index is not offered as the way into the subject",
    !contents.body.includes(">Syllabus index<"),
    "the contents page still links to the regulator's index",
  );

  // Asking for the syllabus index by its own URL must land on the course, not
  // on a page reporting nought of everything.
  const direct = await student.visit(base);
  t(
    "its URL leads to the course material instead",
    direct.landedOn === contentsPath || direct.status === 404,
    `landed ${direct.landedOn} with ${direct.status}`,
  );

  const codes = (
    await db.syllabusItem.findMany({
      where: { topic: { subjectId: subject.id } },
      select: { code: true },
    })
  ).map((i) => i.code);
  for (const [where, res] of [["contents", contents], ["lesson", page], ["the subject URL", direct]]) {
    const seen = visible(res.body);
    const leaked = codes.filter((c) => seen.includes(c));
    t(`no CAA requirement code is readable on the ${where} page`, leaked.length === 0,
      `found ${leaked.slice(0, 3).join(", ")}`);
  }

  for (const [what, pattern] of CHECKLIST_WORDING) {
    for (const [where, res] of [["contents", contents], ["lesson", page]]) {
      const match = pattern.exec(res.text);
      t(`no ${what} on the ${where} page`, match === null, `found "${String(match?.[0]).slice(0, 40)}"`);
    }
  }

  /* ================= 6. progress through the course ================= */

  const before = await db.lessonProgress.count({
    where: { userId: studentRow.id, completedAt: { not: null } },
  });
  await student.postForm(lessonPath);
  const after = await db.lessonProgress.count({
    where: { userId: studentRow.id, completedAt: { not: null } },
  });
  t("Mark Complete persists to the database", after === before + 1, `${before} → ${after}`);

  const marked = await student.visit(lessonPath);
  t("the page reflects the completion after a reload",
    marked.body.includes("tool-btn is-done") || marked.text.includes("Completed"),
    "the completed state is not reflected in the tool rail");

  const contentsAfter = await student.visit(contentsPath);
  t("course progress updates on the contents page",
    visible(contentsAfter.body).includes(`1 / ${lessons.length}`),
    "the completed count did not appear on the contents page");

  await student.postForm(lessonPath);
  await student.postForm(lessonPath);
  const rows = await db.lessonProgress.count({
    where: { userId: studentRow.id, lessonId: readingLesson.id },
  });
  t("marking complete repeatedly keeps one progress row", rows === 1, `${rows} rows`);

  /* ================= 7. entitlement and disclosure ================= */

  const outsider = new User();
  await outsider.signup("Study Outsider", OUTSIDER);

  const blockedContents = await outsider.visit(contentsPath);
  t("an unentitled student cannot open the course contents",
    blockedContents.status === 404 || !blockedContents.text.includes("Browse course material"),
    `status ${blockedContents.status}`);

  const blockedLesson = await outsider.visit(lessonPath);
  t("an unentitled student cannot open a lesson by URL",
    blockedLesson.status === 404 || !blockedLesson.text.includes(readingLesson.title),
    `status ${blockedLesson.status}`);
  if (sourceParagraphs.length) {
    t("no lesson content leaks to an unentitled student",
      !blockedLesson.body.includes(sourceParagraphs[0].text), "the source text was served anyway");
  }
  if (figureSrc) {
    const denied = await outsider.request(figureSrc);
    t("a figure is NOT served to an unentitled student", denied.status === 404, `status ${denied.status}`);
  }

  const anon = await new User().visit(lessonPath);
  t("a signed-out visitor is sent to log in", anon.landedOn.startsWith("/login"), `landed ${anon.landedOn}`);

  // The refusal must look the same as a genuinely missing lesson, so the URL
  // cannot be used to discover what exists behind the paywall.
  const missing = await outsider.visit(`${contentsPath}/no-such-lesson-at-all`);
  t("a non-existent lesson and an unentitled one look the same",
    missing.status === blockedLesson.status, `${missing.status} vs ${blockedLesson.status}`);

  /* ================= 8. depth, branding, and no PDF ================= */

  const totalBlocks = lessons.reduce((n, l) => n + blocksOf(l).length, 0);
  const totalFigures = lessons.reduce(
    (n, l) => n + blocksOf(l).filter((b) => b.type === "figure").length,
    0,
  );
  t("the material has real depth", totalBlocks > 500, `only ${totalBlocks} content blocks`);
  t("source diagrams were preserved", totalFigures > 100, `${totalFigures} figures`);
  t("no lesson is hollow", lessons.every((l) => blocksOf(l).length > 0),
    `${lessons.filter((l) => blocksOf(l).length === 0).length} empty lessons`);

  const forbidden = /download\s*pdf|save\s*pdf|export\s*pdf|<a[^>]+download[\s>]|\.pdf["'\s>]/i;
  for (const [label, res] of [["contents", contents], ["lesson", page]]) {
    t(`the ${label} page offers no PDF download`, !forbidden.test(res.body),
      `something matching a PDF download appears on the ${label} page`);
  }

  for (const [label, res] of [["contents", contents], ["lesson", page]]) {
    const match = FOREIGN_BRANDING.exec(res.text);
    t(`no other academy's branding on the ${label} page`, match === null, `found "${match?.[0]}"`);
    for (const [what, pattern] of RENDER_FAULTS) {
      t(`no ${what} on the ${label} page`, !pattern.test(res.text), `found ${what}`);
    }
  }
  t("the KiwiPilotPrep watermark is present",
    page.body.includes("study-watermark"), "no watermark rendered");
  t("KiwiPilotPrep branding appears", page.text.includes("KiwiPilotPrep"));

  /* ================= 9. nothing else broke ================= */

  const dash = await student.visit("/dashboard");
  t("the student dashboard still works", dash.status === 200, `status ${dash.status}`);
  const pricing = await new User().visit("/pricing");
  t("the pricing page still works", pricing.status === 200);
  const mocks = await student.visit("/mocks");
  t("the mock exam list still works", mocks.status === 200);
  const admin = await new User().visit("/admin/syllabus");
  t("the admin syllabus console is not public",
    !admin.text.includes("Syllabus &amp; Study Material") || admin.landedOn.startsWith("/login"),
    `landed ${admin.landedOn}`);

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
