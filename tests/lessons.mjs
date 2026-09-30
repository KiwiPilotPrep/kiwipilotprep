/**
 * Lesson CMS — the imported lecture material.
 *
 * These five subjects were a deck-ordered import — one module per PowerPoint
 * section, one lesson per slide — and this suite used to check that the
 * database mirrored the deck: same module count, same lesson count, same
 * order, same block totals. They are a written curriculum now, built by
 * scripts/build-ppl-course.mjs, so mirroring the deck is exactly what they no
 * longer do, and asserting it would be asserting the thing that was removed.
 *
 * What has to stay true is conservation, which is a different claim: every
 * slide of every deck is either taught by exactly one lesson or skipped with
 * a written reason, no lesson is empty, every source block cites a slide
 * inside the deck, and the words of a source block are the words on the slide
 * it cites. That is checked against the extracted manifests on disk and
 * against the curriculum modules, because a test that only compared the
 * database against itself would pass just as happily on a build that had
 * silently dropped half the deck.
 *
 *   node tests/lessons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

import { buildIndex, coveredSlides, loadManifest } from "../scripts/deck-index.mjs";
import { SUBJECTS } from "../content/ppl/index.mjs";

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const DECKS_DIR = ".cache/decks";
const db = new PrismaClient();

const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

/**
 * A check that cannot run, recorded rather than silently dropped.
 *
 * Counted apart from passes, because a skip is not a pass: a suite that
 * quietly turned one into the other would report full marks for coverage it no
 * longer has.
 */
const skips = [];
const skip = (name, why) => skips.push(`SKIP  ${name}  — ${why}`);

let ipCounter = 0;
// Its own slice of the documentation range. Every suite used to start at
// the first address in its range, and the signup form allows twenty accounts
// an hour from one address -- so running the suite twice in an hour failed on
// a rate limit rather than on anything under test.
const IP_BASE = 61;
const nextIp = () => `198.51.100.${IP_BASE + (ipCounter++ % 25)}`;

const DECKS = [
  { deck: "meteorology", subject: "meteorology" },
  { deck: "navigation", subject: "navigation" },
  { deck: "air-law", subject: "air-law" },
  { deck: "human-factors", subject: "human-factors" },
  { deck: "flight-radio", subject: "flight-radiotelephony" },
];

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
    const res = await this.request("/signup", { method: "POST", body: fd });
    await db.user.update({
      where: { email },
      data: { emailVerifiedAt: new Date(), verifyTokenHash: null },
    });
    return res;
  }
}

const stamp = Date.now().toString(36).slice(-6);
const ENTITLED = `lesson-yes-${stamp}@example.com`;
const OUTSIDER = `lesson-no-${stamp}@example.com`;

/** The previous academy's branding must never reach the student experience. */
const FOREIGN_BRANDING = /\b(academy|flight school|flying school|aeroclub|aero club)\b/i;

async function cleanup() {
  const users = await db.user.findMany({
    where: { email: { startsWith: "lesson-" } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (ids.length) {
    await db.lessonProgress.deleteMany({ where: { userId: { in: ids } } });
    await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
    await db.emailLog.deleteMany({ where: { userId: { in: ids } } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }
}

function manifestFor(deck) {
  const dir = path.join(DECKS_DIR, deck);
  if (!fs.existsSync(path.join(dir, "manifest.json"))) return null;
  return loadManifest(dir);
}

async function main() {
  await cleanup();

  /* ============ 1. every slide is represented in the tree ============ */

  for (const entry of DECKS) {
    const manifest = manifestFor(entry.deck);
    if (!manifest) {
      t(`${entry.deck}: extracted manifest exists`, false, "run scripts/extract-deck.py first");
      continue;
    }

    const modules = buildIndex(manifest);
    const covered = coveredSlides(modules);
    const missing = [];
    for (let n = 1; n <= manifest.total_slides; n += 1) {
      if (!covered.has(n)) missing.push(n);
    }
    t(
      `${entry.deck}: all ${manifest.total_slides} source slides are in the CMS tree`,
      missing.length === 0,
      `missing ${missing.slice(0, 10).join(", ")}`,
    );

    /* ---- 2. the database holds what the manifest holds ---- */

    const subject = await db.subject.findFirst({
      where: { slug: entry.subject, course: { slug: "ppl-theory" } },
      select: { id: true },
    });
    if (!subject) {
      t(`${entry.deck}: subject exists`, false, `no subject ${entry.subject}`);
      continue;
    }

    const stored = await db.courseModule.findMany({
      where: { subjectId: subject.id },
      orderBy: { displayOrder: "asc" },
      select: {
        title: true,
        lessons: {
          orderBy: { displayOrder: "asc" },
          select: {
            title: true,
            sourceFrom: true,
            sourceTo: true,
            content: { select: { blocks: true } },
          },
        },
      },
    });

    /* ---- 2. every slide is taught once, or skipped in writing ---- */

    const curriculum = SUBJECTS.find((x) => x.slug === entry.subject);
    if (!curriculum) {
      t(`${entry.deck}: the subject has a curriculum module`, false, `no ${entry.subject} in content/ppl`);
      continue;
    }

    const claimedBy = new Map();
    const doubleClaimed = [];
    for (const chapter of curriculum.chapters) {
      for (const topic of chapter.topics) {
        for (const n of topic.pages) {
          if (claimedBy.has(n)) doubleClaimed.push(n);
          claimedBy.set(n, topic.title);
        }
      }
    }
    const skipped = new Set(Object.keys(curriculum.skip ?? {}).map(Number));
    const unaccounted = [];
    for (let n = 1; n <= manifest.total_slides; n += 1) {
      if (!claimedBy.has(n) && !skipped.has(n)) unaccounted.push(n);
    }
    const bothWays = [...skipped].filter((n) => claimedBy.has(n));
    const outOfRange = [...claimedBy.keys()].filter((n) => n < 1 || n > manifest.total_slides);

    t(
      `${entry.deck}: every slide is taught or skipped`,
      unaccounted.length === 0,
      `unaccounted: ${unaccounted.slice(0, 10).join(", ")}`,
    );
    t(
      `${entry.deck}: no slide is claimed twice`,
      doubleClaimed.length === 0,
      `claimed twice: ${doubleClaimed.slice(0, 10).join(", ")}`,
    );
    t(
      `${entry.deck}: no slide is both taught and skipped`,
      bothWays.length === 0,
      `both: ${bothWays.slice(0, 10).join(", ")}`,
    );
    t(
      `${entry.deck}: no topic claims a slide outside the deck`,
      outOfRange.length === 0,
      `out of range: ${outOfRange.slice(0, 10).join(", ")}`,
    );
    t(
      `${entry.deck}: every skipped slide has a written reason`,
      Object.values(curriculum.skip ?? {}).every((why) => String(why ?? "").trim().length >= 12),
      "a skip has no usable reason",
    );

    /* ---- 3. the database holds a lesson for every topic, none of them empty ---- */

    const topicCount = curriculum.chapters.reduce((n, c) => n + c.topics.length, 0);
    const dbLessons = stored.reduce((n, m) => n + m.lessons.length, 0);
    t(
      `${entry.deck}: a chapter in the database for every chapter in the curriculum`,
      stored.length === curriculum.chapters.length,
      `curriculum ${curriculum.chapters.length}, database ${stored.length}`,
    );
    t(
      `${entry.deck}: a lesson in the database for every topic in the curriculum`,
      dbLessons === topicCount,
      `curriculum ${topicCount}, database ${dbLessons}`,
    );

    const empty = [];
    const badPage = [];
    const uncited = [];
    for (const section of stored) {
      for (const lesson of section.lessons) {
        const blocks = lesson.content?.blocks ?? [];
        if (blocks.length === 0) empty.push(lesson.title);
        for (const block of blocks) {
          if (block.origin === "authored") {
            if (block.sourcePage) uncited.push(lesson.title);
            continue;
          }
          const n = block.sourcePage;
          if (!Number.isInteger(n) || n < 1 || n > manifest.total_slides) badPage.push(lesson.title);
        }
      }
    }
    t(`${entry.deck}: no lesson is empty`, empty.length === 0, empty.slice(0, 5).join(", "));
    t(
      `${entry.deck}: every source block cites a slide inside the deck`,
      badPage.length === 0,
      `${badPage.length} block(s), first in ${badPage[0] ?? ""}`,
    );
    t(
      `${entry.deck}: no authored block carries a source citation`,
      uncited.length === 0,
      `${uncited.length} block(s), first in ${uncited[0] ?? ""}`,
    );

    // Source pages run forward through a lesson. A topic may gather slides
    // from two places in the deck — the lost procedure is taught in one place
    // rather than the two the Navigation deck split it across — so the check
    // is per lesson rather than per module, and it is the citation on the
    // blocks that has to be ordered, not the topics.
    const backwards = [];
    for (const section of stored) {
      for (const lesson of section.lessons) {
        const pages = (lesson.content?.blocks ?? [])
          .filter((b) => b.origin !== "authored" && Number.isInteger(b.sourcePage))
          .map((b) => b.sourcePage);
        const declared = curriculum.chapters
          .flatMap((c) => c.topics)
          .find((tp) => tp.title === lesson.title)?.pages ?? [];
        const order = new Map(declared.map((n, i) => [n, i]));
        for (let i = 1; i < pages.length; i += 1) {
          if ((order.get(pages[i]) ?? 0) < (order.get(pages[i - 1]) ?? 0)) backwards.push(lesson.title);
        }
      }
    }
    t(
      `${entry.deck}: blocks follow the order their topic declared`,
      backwards.length === 0,
      backwards.slice(0, 3).join(", "),
    );

    /* ---- 4. diagrams point at real, private bytes ---- */

    const assetIds = new Set();
    for (const section of stored) {
      for (const lesson of section.lessons) {
        for (const block of lesson.content?.blocks ?? []) {
          if (block.type === "figure" && block.assetId) assetIds.add(block.assetId);
        }
      }
    }
    if (assetIds.size) {
      const found = await db.mediaAsset.findMany({
        where: { id: { in: [...assetIds] } },
        select: { id: true, isPublic: true, storageKey: true },
      });
      t(
        `${entry.deck}: every figure block resolves to a stored asset`,
        found.length === assetIds.size,
        `${assetIds.size} referenced, ${found.length} found`,
      );
      t(
        `${entry.deck}: no study figure is world-readable`,
        found.every((a) => !a.isPublic && a.storageKey.startsWith("study/")),
      );
    }

    /* ---- 5. a source block's words are the words on the slide it cites ---- */

    // The check runs the other way round from the one it replaces. The old
    // suite took a slide and looked for its text somewhere in the database,
    // which only works while a lesson and a slide are the same thing. This one
    // takes a stored block, reads the slide it says it came from, and asks
    // whether those words are on it -- which is the claim `origin: "source"`
    // actually makes, and holds however the material is arranged.
    //
    // Comparison is on letters and digits only. The repairs restore typography
    // a slide cannot express, rejoin sentences the text box cut in half and
    // strip a bullet a slide author typed as a hyphen, so an exact string
    // match would report every repair as a rewrite.
    const bare = (x) => String(x ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    const slideWords = new Map();
    const wordsOnSlide = (n) => {
      if (!slideWords.has(n)) {
        const slide = manifest.slides[n - 1];
        let text = (slide?.blocks ?? [])
          .filter((b) => b.kind === "text")
          .map((b) => b.text)
          .join(" ");
        // Hand-checked corrections, applied to the slide before the comparison
        // so that a correction the subject module wrote down is not reported as
        // a rewrite. Anything the module has not written down still is.
        for (const [from, to] of curriculum.repairs?.substitutions?.[n] ?? []) {
          text = text.replace(from, to);
        }
        slideWords.set(n, bare(`${text} ${slide?.title ?? ""}`));
      }
      return slideWords.get(n);
    };

    const sample = [];
    for (const section of stored) {
      for (const lesson of section.lessons) {
        for (const block of lesson.content?.blocks ?? []) {
          if (block.origin === "authored") continue;
          if (!["paragraph", "subitem"].includes(block.type)) continue;
          if (typeof block.text !== "string" || block.text.length < 40) continue;
          sample.push({ lesson: lesson.title, page: block.sourcePage, text: block.text });
        }
      }
    }
    const step = Math.max(1, Math.floor(sample.length / 40));
    const checked = sample.filter((_, i) => i % step === 0).slice(0, 40);
    const rewritten = checked.filter((b) => !wordsOnSlide(b.page).includes(bare(b.text)));
    t(
      `${entry.deck}: source wording is the wording on the slide it cites`,
      checked.length > 0 && rewritten.length === 0,
      `${checked.length - rewritten.length}/${checked.length} matched -- first miss: ` +
        `${rewritten[0]?.lesson ?? ""} s${rewritten[0]?.page ?? ""}`,
    );
  }

  /* ============ 6. the material is reachable by an entitled student ============ */

  const subject = await db.subject.findFirst({
    where: {
      slug: "meteorology",
      course: { slug: "ppl-theory" },
      modules: { some: { status: "PUBLISHED" } },
    },
    include: { course: { select: { slug: true } } },
  });
  if (!subject) throw new Error("No subject has imported lessons — run scripts/import-decks.mjs.");

  const base = `/study/${subject.course.slug}/${subject.slug}`;

  const firstLesson = await db.lesson.findFirst({
    where: { status: "PUBLISHED", module: { subjectId: subject.id, status: "PUBLISHED" } },
    orderBy: [{ module: { displayOrder: "asc" } }, { displayOrder: "asc" }],
    select: { slug: true, title: true, content: { select: { blocks: true } } },
  });

  const student = new User();
  await student.signup("Lesson Tester", ENTITLED);
  const studentRow = await db.user.findUnique({ where: { email: ENTITLED } });
  await db.entitlement.create({
    data: {
      userId: studentRow.id,
      scopeKey: `subject:${subject.id}`,
      subjectId: subject.id,
      source: "ADMIN",
      status: "ACTIVE",
      note: "lesson test fixture",
    },
  });

  const subjectPage = await student.visit(base);
  t("the subject page opens", subjectPage.status === 200, `status ${subjectPage.status}`);
  t(
    "the subject page links to the course material",
    subjectPage.text.includes(`${base}/lessons`),
    "no link to the lessons — the material would be unreachable",
  );

  const index = await student.visit(`${base}/lessons`);
  t("the course-material index opens", index.status === 200, `status ${index.status}`);
  // "Chapters" and "Topics", not "Modules" and "Lessons": the reader speaks the
  // vocabulary of a textbook, and the internal name for a module is not the
  // student's word for it.
  t(
    "the index names its chapters and topics",
    index.text.includes("Chapters") && index.text.includes("Topics"),
    "no chapter/topic summary",
  );
  t(
    "the index lists the first lesson",
    index.text.includes(firstLesson.title.slice(0, 40)),
    `expected "${firstLesson.title}"`,
  );

  const lesson = await student.visit(`${base}/lessons/${firstLesson.slug}`);
  t("a lesson opens", lesson.status === 200, `status ${lesson.status}`);

  const firstParagraph = (firstLesson.content?.blocks ?? []).find(
    (b) => b.type === "paragraph" && b.text.length > 30,
  );
  if (firstParagraph) {
    const needle = firstParagraph.text.slice(0, 40).replace(/[&<>]/g, "");
    t(
      "the lesson renders its source text",
      lesson.text.includes(needle),
      `expected "${needle}"`,
    );
  }

  t("the lesson offers previous/next navigation", lesson.text.includes("Next →"));
  t("the lesson offers Mark complete", lesson.text.includes("Mark complete"));

  /* ============ 7. the rules the brief set ============ */

  t(
    "no PDF download is offered in the lesson reader",
    !/download[^<]{0,30}pdf/i.test(lesson.text) && !/\.pdf["']/i.test(lesson.text),
    "a PDF download link is present",
  );
  t(
    "the previous academy's branding appears nowhere in the reader",
    !FOREIGN_BRANDING.test(lesson.text),
    (lesson.text.match(FOREIGN_BRANDING) ?? [])[0],
  );
  t("the reader carries the KiwiPilotPrep watermark", lesson.text.includes("KiwiPilotPrep"));
  t(
    "the reader states it is not affiliated with Aspeq or CAANZ",
    /not affiliated with aspeq/i.test(lesson.text),
  );

  /* ============ 8. an unentitled student is refused ============ */

  const outsider = new User();
  await outsider.signup("Lesson Outsider", OUTSIDER);
  const outIndex = await outsider.request(`${base}/lessons`);
  const outLesson = await outsider.request(`${base}/lessons/${firstLesson.slug}`);
  t(
    "an unentitled student cannot open the course index",
    outIndex.status === 404,
    `status ${outIndex.status}`,
  );
  t(
    "an unentitled student cannot open a lesson by guessing its URL",
    outLesson.status === 404,
    `status ${outLesson.status}`,
  );

  const anonymous = await new User().visit(`${base}/lessons/${firstLesson.slug}`);
  t(
    "a signed-out visitor is sent to sign in",
    anonymous.landedOn.startsWith("/login"),
    `landed ${anonymous.landedOn}`,
  );

  /* ============ 9. figures stay behind the entitlement check ============ */

  const figure = (firstLesson.content?.blocks ?? []).find((b) => b.type === "figure");
  if (figure) {
    const asAnon = await new User().request(`/api/study-figures/${figure.assetId}`);
    t("a diagram is not served to a signed-out visitor", asAnon.status === 401,
      `status ${asAnon.status}`);
    const asOutsider = await outsider.request(`/api/study-figures/${figure.assetId}`);
    t("a diagram is not served to an unentitled student", asOutsider.status === 404,
      `status ${asOutsider.status}`);
    const asStudent = await student.request(`/api/study-figures/${figure.assetId}`);
    t("a diagram is served to the student who bought the subject", asStudent.status === 200,
      `status ${asStudent.status}`);
  }

  /* ============ 10. every syllabus item resolves to something ============ */

  // There is no review queue any more: the course material arrives already
  // reviewed, so the pipeline establishes the links and the admin console
  // reports them rather than gating them. What has to hold instead is that no
  // student can reach a dead end -- every examinable item either names the
  // lesson that teaches it, or names the section of the course that covers its
  // topic, or carries notes of its own.
  const allItems = await db.syllabusItem.findMany({
    where: { topic: { subjectId: subject.id } },
    select: {
      code: true,
      content: { select: { id: true } },
      mappings: { where: { status: "CONFIRMED" }, select: { id: true } },
      topic: { select: { moduleId: true, content: { select: { id: true } } } },
    },
  });
  const stranded = allItems.filter(
    (i) => !i.mappings.length && !i.content && !i.topic.moduleId && !i.topic.content,
  );
  t(
    "every syllabus item in this subject leads somewhere",
    stranded.length === 0,
    `${stranded.length} dead ends, e.g. ${stranded.slice(0, 5).map((i) => i.code).join(", ")}`,
  );

  const precise = allItems.filter((i) => i.mappings.length > 0).length;
  t(
    "most of them lead to a specific lesson, not just to a section",
    precise >= allItems.length * 0.5,
    `${precise} of ${allItems.length} are lesson-level`,
  );

  // Every link says what it was made on. This is the only record of why a
  // student is being sent where they are sent, and it is what the coverage
  // report in the admin console reads.
  const unexplained = await db.lessonSyllabusItem.count({
    where: {
      status: "CONFIRMED",
      item: { topic: { subjectId: subject.id } },
      OR: [{ evidence: null }, { evidence: "" }],
    },
  });
  t("every mapping records what it was made on", unexplained === 0, `${unexplained} without evidence`);

  const methods = await db.lessonSyllabusItem.groupBy({
    by: ["method"],
    where: { status: "CONFIRMED", item: { topic: { subjectId: subject.id } } },
    _count: true,
  });
  t(
    "and how it was arrived at",
    methods.every((m) => ["auto", "auto-verified", "authored"].includes(m.method)),
    methods.map((m) => `${m.method}=${m._count}`).join(" "),
  );

  /* ============ 11. a confirmed link actually goes live ============ */

  // This section, and section 14 below, describe what a subject looks like
  // when its CAA syllabus is published to students. That is no longer what any
  // rebuilt subject does. IR never had syllabus rows; CPL's were archived when
  // it was rebuilt; and PPL Phase 1 archived the 86 topics belonging to Air
  // Law, Navigation, Meteorology and Flight Radiotelephony, because a
  // regulator's examination checklist is not a curriculum and should not be
  // the thing a student opens.
  //
  // The feature itself still has to work — an archived syllabus is a decision
  // per subject, not a removal — so these checks now run against whichever
  // subject still publishes one, instead of naming Meteorology and failing the
  // day Meteorology stopped. Aircraft Technical Knowledge is the only such
  // subject at the time of writing and it has no lessons yet, so the lesson
  // half of the pair has nowhere to run and says so rather than passing
  // quietly.
  const syllabusSubject = await db.subject.findFirst({
    where: {
      course: { slug: "ppl-theory" },
      syllabusTopics: { some: { status: "PUBLISHED" } },
      modules: { some: { status: "PUBLISHED", lessons: { some: { status: "PUBLISHED" } } } },
    },
    select: { id: true, slug: true, course: { select: { slug: true } } },
  });
  if (!syllabusSubject) {
    const holders = await db.subject.findMany({
      where: { course: { slug: "ppl-theory" }, syllabusTopics: { some: { status: "PUBLISHED" } } },
      select: { slug: true },
    });
    skip(
      "the confirmed-link reader path",
      holders.length
        ? `only ${holders.map((s) => s.slug).join(", ")} still publishes a syllabus, and it has no lessons yet`
        : "no PPL subject publishes a syllabus any more",
    );
    skip("the syllabus index beside the course", "same reason");
  }

  // Proved by confirming one link for the duration of the test and putting it
  // back afterwards, rather than by reading the code and hoping.
  // An item with a proposal and no confirmed link of its own. The second
  // condition matters: an item that already has a confirmed lesson shows it,
  // correctly, and testing "shows nothing" against that item would fail for
  // the right reason at the wrong moment.
  // An item mapped to exactly one lesson, so that taking that link away leaves
  // the item with nothing of its own and the effect is unambiguous. Driven
  // from a live link rather than a pending one because there are no pending
  // ones: the mapping is established by the pipeline, not queued for approval.
  const candidates = await db.lessonSyllabusItem.findMany({
    where: {
      status: "CONFIRMED",
      lesson: { module: { subjectId: syllabusSubject?.id ?? "none" } },
      method: { not: "authored" },
    },
    orderBy: { confidence: "desc" },
    take: 60,
    select: {
      id: true,
      lesson: { select: { slug: true } },
      item: {
        select: {
          code: true,
          requirement: true,
          content: { select: { id: true } },
          mappings: { where: { status: "CONFIRMED" }, select: { id: true } },
        },
      },
    },
  });
  const trial = candidates.find((c) => c.item.mappings.length === 1 && !c.item.content) ?? null;

  // Put it back to PROPOSED for the duration, so "before" is a real before.
  if (trial) {
    await db.lessonSyllabusItem.update({
      where: { id: trial.id },
      data: { status: "PROPOSED", reviewedAt: null },
    });
  }

  if (trial) {
    const codeSlug = trial.item.code.replace(/\./g, "-");
    const synBase = `/study/${syllabusSubject.course.slug}/${syllabusSubject.slug}`;
    const lessonPath = `${synBase}/lessons/${trial.lesson.slug}`;
    const itemPath = `${synBase}/${codeSlug}`;

    const beforeLesson = await student.visit(lessonPath);
    const beforeItem = await student.visit(itemPath);
    // Asserted about this code, not about objectives in general. Most lessons
    // now legitimately carry confirmed objectives, so "shows none at all"
    // stopped being the property worth checking; "does not yet claim to answer
    // this particular code" is.
    t(
      "before confirming, the lesson does not claim this code",
      !beforeLesson.text.includes(trial.item.code),
      `${trial.item.code} was shown before it was confirmed`,
    );
    t(
      "before confirming, no lesson is offered as this item's own answer",
      !beforeItem.text.includes("This is taught in") &&
        !beforeItem.text.includes("This is taught across"),
      "an unconfirmed lesson was presented as the answer",
    );
    // The page may still name the section of the course that covers the topic
    // -- that is a topic-level statement and is true whether or not any
    // item-level link has been confirmed. What it must not do is put the
    // unconfirmed lesson forward as the answer to this code.
    t(
      "and the unconfirmed lesson is not named as the answer",
      !new RegExp(`This is taught[^<]*${trial.lesson.slug}`).test(beforeItem.text),
      `${trial.lesson.slug} was offered for ${trial.item.code}`,
    );

    await db.lessonSyllabusItem.update({
      where: { id: trial.id },
      data: { status: "CONFIRMED", reviewedAt: new Date() },
    });

    const afterLesson = await student.visit(lessonPath);
    const afterItem = await student.visit(itemPath);

    t(
      "a confirmed link puts the official requirement on the lesson",
      afterLesson.text.includes("What you need to know") &&
        afterLesson.text.includes(trial.item.code),
      `expected ${trial.item.code} on ${lessonPath}`,
    );
    t(
      "the requirement is quoted exactly, not rewritten",
      afterLesson.text.includes(
        trial.item.requirement
          .split("\n")[0]
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .slice(0, 45),
      ),
      "the wording on the page does not match the syllabus",
    );
    t(
      "a confirmed link routes the syllabus item to the lesson that teaches it",
      afterItem.text.includes("This is taught in") ||
        afterItem.text.includes("This is taught across"),
      `no lesson offered on ${itemPath}`,
    );
    // And renders it. A syllabus code is what a student is handed after an
    // exam; landing on a page that only names where the material lives is a
    // signpost, not a lesson.
    t(
      "and renders that lesson's material on the page itself",
      afterItem.text.includes('class="prose"'),
      `${itemPath} linked the lesson but showed none of it`,
    );
    t(
      "so the empty-notes message is not shown alongside it",
      !afterItem.text.includes("No notes written against this code"),
      "the page claimed to have no notes while showing them",
    );
    t(
      "the item links to the lesson itself, not just names it",
      afterItem.text.includes(`/lessons/${trial.lesson.slug}`),
      "the lesson was named but not linked",
    );

    // Take it away again, to prove the page follows the link rather than
    // having cached it, then leave it as it was found.
    await db.lessonSyllabusItem.update({
      where: { id: trial.id },
      data: { status: "PROPOSED", reviewedAt: null },
    });

    const restored = await student.visit(lessonPath);
    t(
      "unmapping it takes that code off the page again",
      !restored.text.includes(trial.item.code),
      `${trial.item.code} survived being unmapped`,
    );

    await db.lessonSyllabusItem.update({
      where: { id: trial.id },
      data: { status: "CONFIRMED", reviewedAt: new Date() },
    });
  }

  /* ============ 12. a re-import does not destroy the review ============ */

  // Importing a deck replaces its modules, and the lessons and mappings under
  // them go with it. That once wiped every confirmed link in a subject: an
  // hour of review lost to a content update, silently. The importer now writes
  // the human decisions down by (lesson slug, syllabus code) and puts them
  // back, and this proves it on the smallest deck rather than trusting it.
  const smallest = await db.subject.findFirst({
    where: { slug: "flight-radiotelephony", course: { slug: "ppl-theory" } },
    select: { id: true },
  });
  const victim = smallest
    ? await db.lessonSyllabusItem.findFirst({
        where: { status: "PROPOSED", lesson: { module: { subjectId: smallest.id } } },
        select: { id: true, lesson: { select: { slug: true } }, item: { select: { code: true } } },
      })
    : null;

  if (victim) {
    await db.lessonSyllabusItem.update({
      where: { id: victim.id },
      data: { status: "CONFIRMED", reviewedAt: new Date() },
    });

    execFileSync(
      "node",
      ["scripts/import-decks.mjs", "--subject", "flight-radiotelephony", "--publish"],
      { stdio: "ignore" },
    );

    const survived = await db.lessonSyllabusItem.findFirst({
      where: {
        status: "CONFIRMED",
        lesson: { slug: victim.lesson.slug, module: { subjectId: smallest.id } },
        item: { code: victim.item.code },
      },
      select: { id: true, reviewedAt: true },
    });

    t(
      "a confirmed link survives a re-import of its deck",
      Boolean(survived),
      `${victim.item.code} → ${victim.lesson.slug} was lost`,
    );
    t(
      "and keeps the record of when it was reviewed",
      Boolean(survived?.reviewedAt),
      "the review timestamp was dropped",
    );

    // Put it back the way it was found: mapped and live.
    if (survived) {
      await db.lessonSyllabusItem.update({
        where: { id: survived.id },
        data: { status: "CONFIRMED", reviewedAt: new Date() },
      });
    }

    // The re-import above deleted this subject's modules, and its proposals
    // went with them -- that is the very behaviour being tested. Proposals are
    // regenerable and rulings are not, which is why only rulings are restored
    // by the importer; but leaving the subject with none would degrade the
    // reader for everyone using this database afterwards. So they are rebuilt.
    execFileSync("node", ["scripts/map-syllabus.mjs", "--course", "ppl-theory"], {
      stdio: "ignore",
    });
    const rebuilt = await db.lessonSyllabusItem.count({
      where: { lesson: { module: { subjectId: smallest.id } } },
    });
    t(
      "proposals are rebuilt after the re-import, so the reader is not left bare",
      rebuilt > 0,
      "no proposals in the subject afterwards",
    );
  }

  /* ============ 13. the review console is admin-only ============ */

  // The mapping coverage console was removed: syllabus mapping is
  // developer-controlled and is not edited by hand. The route must be gone
  // for a student and must still send a signed-out visitor to log in, so an
  // old URL leaks nothing about what used to be there.
  const adminPath = "/admin/syllabus-map";
  const asStudent = await student.visit(adminPath);
  t(
    "a student cannot open the mapping coverage console",
    !asStudent.text.includes("Mapped to a lesson"),
    `landed ${asStudent.landedOn}`,
  );
  const asAnon = await new User().visit(adminPath);
  t(
    "a signed-out visitor cannot open the mapping coverage console",
    asAnon.landedOn.startsWith("/login"),
    `landed ${asAnon.landedOn}`,
  );

  /* ============ 14. the syllabus index still works beside it ============ */

  if (syllabusSubject) {
    const topics = await db.syllabusTopic.count({
      where: { subjectId: syllabusSubject.id, status: "PUBLISHED" },
    });
    t(`${syllabusSubject.slug}: the official syllabus is still indexed`, topics > 0, `${topics} topics`);
    const synPage = await student.visit(`/study/${syllabusSubject.course.slug}/${syllabusSubject.slug}`);
    t(
      `${syllabusSubject.slug}: the subject page shows the syllabus index`,
      synPage.text.includes("Syllabus index") || synPage.text.includes("syllabus"),
    );
  }

  // The other side of the same decision: a subject whose syllabus was archived
  // must now read as a course, exactly as IR does. This is the assertion that
  // would have caught the original leak, so it stays whichever way the
  // subjects happen to be configured.
  const archivedSubjects = await db.subject.findMany({
    where: { course: { slug: "ppl-theory" }, syllabusTopics: { some: { status: "ARCHIVED" } } },
    orderBy: { order: "asc" },
    select: { slug: true, id: true },
  });
  for (const archivedSubject of archivedSubjects) {
    const published = await db.syllabusTopic.count({
      where: { subjectId: archivedSubject.id, status: "PUBLISHED" },
    });
    t(
      `${archivedSubject.slug}: no CAA syllabus is published to students`,
      published === 0,
      `${published} still published`,
    );
    const leaking = await db.lesson.count({
      where: {
        module: { subjectId: archivedSubject.id },
        mappings: { some: { status: "CONFIRMED", item: { status: "PUBLISHED" } } },
      },
    });
    t(
      `${archivedSubject.slug}: no lesson page prints a CAA objective block`,
      leaking === 0,
      `${leaking} lessons still would`,
    );
    const kept = await db.lessonSyllabusItem.count({
      where: { item: { topic: { subjectId: archivedSubject.id } } },
    });
    t(`${archivedSubject.slug}: the mapping record survives the archiving`, kept > 0, `${kept} mappings`);
  }

  await cleanup();

  console.log(checks.join("\n"));
  if (skips.length) console.log("\n" + skips.join("\n"));
  const failed = checks.filter((c) => c.startsWith("FAIL")).length;
  const passed = checks.filter((c) => c.startsWith("PASS")).length;
  console.log(`\n${passed}/${passed + failed} passed${skips.length ? `, ${skips.length} skipped` : ""}`);
  await db.$disconnect();
  process.exit(failed ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await cleanup().catch(() => {});
  await db.$disconnect();
  process.exit(1);
});
