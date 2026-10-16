/**
 * Do the repaired lessons actually render as what they now are?
 *
 * The repair changed stored block types: runs of paragraphs became lists,
 * cautions became callouts, three slide titles became headings. The reader
 * already had a case for every one of those, so the claim is that the pages
 * now show a list where a list was meant — and the only way to know is to open
 * them.
 *
 * Reads the change manifest, opens the lessons it names, and checks the markup
 * at a desktop and a phone width. Also checks what must never appear: the
 * internal provenance on those blocks — where a line came from, whether it was
 * lifted or written — is for the audit trail, not for students.
 *
 *   node tests/study-semantics.mjs
 */
import fs from "node:fs";
import { chromium } from "playwright";
import { SignJWT } from "jose";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const MANIFEST = process.env.CHANGES ?? "docs/audit/changes.json";

const db = new PrismaClient();
const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

const AUTH_SECRET = fs
  .readFileSync(".env", "utf8")
  .match(/^AUTH_SECRET=(.*)$/m)?.[1]
  ?.trim()
  .replace(/^["']|["']$/g, "");

/** Words that belong in the audit trail and never on the page. */
const LEAKS = [
  "sourcePage",
  "sourceDoc",
  "origin:",
  '"authored"',
  "authored-origin",
  "CAA validation",
  "bullets-as-prose",
  "table-suspected",
  "fragment-run-unresolved",
];

async function main() {
  if (!fs.existsSync(MANIFEST)) {
    console.log(`SKIP  no change manifest at ${MANIFEST}`);
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

  // The flagged pass wrote its repairs to a second manifest, and the
  // categories only it produces — restored definitions, a heading that had
  // picked up a stray colon — have to be opened too.
  const second = fs.existsSync("docs/audit/review-queue.json")
    ? JSON.parse(fs.readFileSync("docs/audit/review-queue.json", "utf8"))
    : null;
  manifest.entries = [
    ...(manifest.entries ?? []),
    ...(second?.repairs ?? []).map((r) => ({ ...r, kind: "lesson", id: r.lessonId, title: r.lesson })),
  ];

  const user = await db.user.findUnique({ where: { email: "qa@example.com" }, select: { id: true } });
  if (!user) {
    console.log("SKIP  no qa@example.com on this database");
    return;
  }
  const token = await new SignJWT({ sub: user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1800s")
    .sign(new TextEncoder().encode(AUTH_SECRET));

  /** One repaired lesson per change category, with its route. */
  const wanted = new Map();
  for (const entry of manifest.entries ?? []) {
    if (entry.kind !== "lesson") continue;
    for (const change of entry.changes) {
      if (wanted.has(change.category)) continue;
      const lesson = await db.lesson.findUnique({
        where: { id: entry.id },
        select: {
          slug: true,
          module: { select: { subject: { select: { slug: true, course: { select: { slug: true } } } } } },
        },
      });
      if (!lesson) continue;
      wanted.set(change.category, {
        category: change.category,
        course: entry.course,
        subject: entry.subject,
        title: entry.title,
        url: `${BASE}/study/${lesson.module.subject.course.slug}/${lesson.module.subject.slug}/lessons/${lesson.slug}`,
      });
    }
  }

  // One repaired lesson from each course as well as one per category, so the
  // four reading experiences are all actually opened rather than represented by
  // whichever course happened to carry a given defect.
  const COURSES = ["ir-theory", "cpl-theory", "ppl-theory", "ppl-flight-test"];
  for (const course of COURSES) {
    const entry = (manifest.entries ?? []).find((e) => e.course === course && e.kind === "lesson");
    if (!entry) continue;
    const lesson = await db.lesson.findUnique({
      where: { id: entry.id },
      select: {
        slug: true,
        module: { select: { subject: { select: { slug: true, course: { select: { slug: true } } } } } },
      },
    });
    if (!lesson) continue;
    wanted.set(`course:${course}`, {
      category: `course:${course}`,
      course: entry.course,
      subject: entry.subject,
      title: entry.title,
      url: `${BASE}/study/${lesson.module.subject.course.slug}/${lesson.module.subject.slug}/lessons/${lesson.slug}`,
    });
  }

  t(
    "a repaired lesson was found for every course in scope",
    COURSES.every((c) => wanted.has(`course:${c}`)),
    COURSES.filter((c) => !wanted.has(`course:${c}`)).join(", ") + " had none",
  );

  t("the manifest names repaired lessons to open", wanted.size > 0, "nothing to check");
  if (wanted.size === 0) return;

  const browser = await chromium.launch();

  for (const [label, vp] of [
    ["desktop 1440", { width: 1440, height: 900 }],
    ["mobile 390", { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({ viewport: vp });
    await context.addCookies([{ name: "kpp_session", value: token, domain: "localhost", path: "/" }]);
    const page = await context.newPage();

    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    for (const target of wanted.values()) {
      const res = await page.goto(target.url, { waitUntil: "networkidle" });
      await page.waitForTimeout(250);

      const ok = res?.status() === 200;
      t(`${label}: ${target.category} — the lesson opens`, ok, `status ${res?.status()} ${target.url}`);
      if (!ok) continue;

      const seen = await page.evaluate(() => {
        const prose = document.querySelector(".prose");
        return {
          lists: document.querySelectorAll(".prose ul:not(.keypoints ul)").length,
          ordered: document.querySelectorAll(".prose ol").length,
          callouts: document.querySelectorAll(".prose .callout").length,
          warnings: document.querySelectorAll(".prose .callout.warning").length,
          headings: document.querySelectorAll(".prose h2").length,
          tables: document.querySelectorAll(".prose table").length,
          paragraphs: document.querySelectorAll(".prose p").length,
          definitions: document.querySelectorAll(".prose .definition").length,
          subheadings: document.querySelectorAll(".prose h3").length,
          text: prose ? prose.innerText : "",
          overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
      });

      // What this category was repaired into must be on the page.
      const expectation = {
        "bullets-as-prose": () => seen.lists > 0,
        "procedure-unordered": () => seen.ordered > 0,
        "warning-lost": () => seen.callouts > 0,
        "heading-as-paragraph": () => seen.headings > 0,
        "title-echo": () => seen.paragraphs > 0,
        "duplicate-adjacent": () => seen.paragraphs > 0,
        "slide-furniture": () => seen.paragraphs > 0,
        "definition-restored": () => seen.definitions > 0,
        "heading-stray-colon": () => seen.headings + seen.subheadings > 0,
      }[target.category];

      if (expectation) {
        t(`${label}: ${target.category} — renders as it was repaired to`, expectation(),
          `lists ${seen.lists}, ol ${seen.ordered}, callouts ${seen.callouts}, h2 ${seen.headings}`);
      }

      t(`${label}: ${target.category} — the page does not scroll sideways`, !seen.overflow, target.url);

      const leaked = LEAKS.filter((w) => seen.text.includes(w));
      t(`${label}: ${target.category} — no provenance reaches the reader`, leaked.length === 0,
        leaked.join(", "));
    }

    t(`${label}: no console errors across the repaired lessons`, errors.length === 0,
      errors.slice(0, 2).join(" | "));

    await context.close();
  }

  await browser.close();
}

try {
  await main();
} finally {
  await db.$disconnect();
}

for (const line of checks) console.log(line);
const failed = checks.filter((c) => c.startsWith("FAIL")).length;
console.log(`${checks.length - failed}/${checks.length} passed`);
process.exit(failed ? 1 : 0);
