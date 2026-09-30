/**
 * Scans everything a student can see of Aircraft Technical Knowledge for what
 * must not be there.
 *
 * Three things leak into a rebuilt course if nobody looks: the regulator's
 * presentation (objective blocks, requirement codes, a syllabus index), the
 * previous owner's branding (another academy's wordmark, a stock library's
 * watermark), and the source's own furniture (slide numbers, classroom cues,
 * Wingdings bullets that render as nothing).
 *
 * The scan runs at two levels because each catches what the other misses. The
 * database level reads every block of every lesson, so nothing is missed for
 * not having been sampled. The HTTP level fetches every lesson page as an
 * entitled student, so what is caught is what a student would actually have
 * seen — including anything the page adds around the content.
 *
 * Read-only.
 *
 *   node scripts/ppl-atk-leak-scan.mjs [--http] [--limit N]
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const COURSE = "ppl-theory";
const SUBJECT = "aircraft-technical-knowledge";
const QA = { email: "qa@example.com", password: "KiwiQA@2026" };

/**
 * What must never appear, and why each is here.
 *
 * The tests are written against readable text, not raw HTML: this subject's
 * chapters are numbered 12.1, 12.2, 12.3 because it is the twelfth chapter of
 * the course, and the navigation payload is full of them. A pattern hunting
 * "12.2" in the markup finds the course's own numbering and calls it a leak.
 */
const RULES = [
  ["regulator", "an objective block", /What you need to know/i],
  ["regulator", "a syllabus objective section", /Syllabus objective/i],
  ["regulator", "a link to the syllabus index", /Syllabus index/i],
  ["regulator", "checklist wording lifted verbatim", /\b(State|Describe|Explain|Define) the (following|purpose|function)\b/],
  ["branding", "another academy", /\b(academy|flight school|flying school|aeroclub|aero club)\b/i],
  ["branding", "a named third party", /\b(nzicpa|fly8ma|alamy|kotwicki|ontheflightline|shutterstock|getty)\b/i],
  ["source furniture", "a slide number", /Slide No\.?\s*\d/i],
  ["source furniture", "a chapter review card", /Chapter Review\s*\d/i],
  ["source furniture", "a classroom video cue", /\b(video|instructor (will|to) demonstrate|student to demonstrate)\b/i],
  ["source furniture", "the book's own page numbering", /^\s*\d{1,2}\s*-\s*\d{1,2}\s*$/],
  ["rendering", "an unrendered object", /\[object Object\]/],
  ["rendering", "NaN", /(^|[^A-Za-z])NaN([^A-Za-z]|$)/],
  ["rendering", "undefined as text", /(^|\s)undefined(\s|$)/],
  ["rendering", "a Wingdings bullet", /[-]/],
  ["rendering", "a doubled space inside a sentence", /[a-z]{2}\s{3,}[a-z]/],
];

const visible = (html) =>
  html
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

class Session {
  constructor() {
    this.cookie = "";
  }
  async go(path, init = {}) {
    const res = await fetch(BASE + path, {
      ...init,
      redirect: "manual",
      headers: { ...(init.headers ?? {}), cookie: this.cookie, "x-forwarded-for": "198.51.100.199" },
    });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(";");
      const [k] = pair.split("=");
      const rest = this.cookie.split("; ").filter((x) => x && !x.startsWith(`${k}=`));
      this.cookie = [...rest, pair].join("; ");
    }
    return res;
  }
  async html(path) {
    let res = await this.go(path);
    let hops = 0;
    while (res.status >= 300 && res.status < 400 && hops++ < 5) {
      const loc = res.headers.get("location");
      res = await this.go(loc.startsWith("http") ? new URL(loc).pathname : loc);
    }
    return { status: res.status, body: await res.text() };
  }
  async login() {
    const body = await (await this.go("/login")).text();
    const id = body.match(/ACTION_ID_([a-f0-9]+)/)?.[1];
    if (!id) throw new Error("no login action on /login");
    const fd = new FormData();
    fd.set("email", QA.email);
    fd.set("password", QA.password);
    fd.set(`$ACTION_ID_${id}`, "");
    await this.go("/login", { method: "POST", body: fd });
  }
}

async function main() {
  const wantHttp = process.argv.includes("--http");
  const limit = process.argv.includes("--limit")
    ? Number(process.argv[process.argv.indexOf("--limit") + 1])
    : Infinity;

  const subject = await db.subject.findFirst({
    where: { slug: SUBJECT, course: { slug: COURSE } },
    select: { id: true },
  });
  if (!subject) throw new Error(`no ${SUBJECT}`);

  const codes = (
    await db.syllabusItem.findMany({
      where: { topic: { subjectId: subject.id } },
      select: { code: true },
    })
  ).map((i) => i.code);

  const modules = await db.courseModule.findMany({
    where: { subjectId: subject.id },
    orderBy: { displayOrder: "asc" },
    select: {
      title: true,
      summary: true,
      lessons: {
        where: { status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" },
        select: { title: true, slug: true, content: { select: { blocks: true } } },
      },
    },
  });

  const findings = [];
  const note = (level, where, kind, what, sample) =>
    findings.push({ level, where, kind, what, sample: String(sample).slice(0, 90) });

  /* ------------------------------------------------------- the database */
  let blocks = 0;
  for (const m of modules) {
    const chapterText = [m.title, m.summary ?? ""].join(" ");
    for (const [kind, what, pattern] of RULES) {
      const hit = pattern.exec(chapterText);
      if (hit) note("content", `chapter "${m.title}"`, kind, what, hit[0]);
    }
    for (const l of m.lessons) {
      // Each string is tested on its own. Joining them first and testing the
      // join reports the seam between two blocks as a fault inside one of them
      // — which is how "a doubled space inside a sentence" fired on a paragraph
      // ending "kg" followed by one starting "v".
      const strings = [
        l.title,
        ...(l.content?.blocks ?? []).flatMap((b) => [
          b.text ?? "", b.title ?? "", b.term ?? "", b.caption ?? "",
          ...(b.items ?? []), ...(b.headers ?? []), ...((b.rows ?? []).flat()),
        ]),
      ].filter((x) => typeof x === "string" && x.length > 0);
      const text = strings.join("\n");
      blocks += (l.content?.blocks ?? []).length;

      for (const [kind, what, pattern] of RULES) {
        for (const one of strings) {
          const hit = pattern.exec(one);
          if (hit) {
            note("content", `${m.title} → ${l.title}`, kind, what, hit[0]);
            break;
          }
        }
      }
      for (const code of codes) {
        if (text.includes(code)) note("content", `${m.title} → ${l.title}`, "regulator", "a CAA requirement code", code);
      }
      // A figure block that points at nothing renders as a broken image.
      for (const b of l.content?.blocks ?? []) {
        if (b.type === "figure" && !b.assetId) note("content", `${m.title} → ${l.title}`, "rendering", "a figure with no asset", "");
        if (b.type === "paragraph" && !String(b.text ?? "").trim()) {
          note("content", `${m.title} → ${l.title}`, "rendering", "an empty paragraph", "");
        }
      }
    }
  }

  const lessons = modules.flatMap((m) => m.lessons.map((l) => ({ ...l, chapter: m.title })));
  console.log(`content: ${modules.length} chapters, ${lessons.length} lessons, ${blocks} blocks`);

  /* ------------------------------------------------------------- the pages */
  let fetched = 0;
  if (wantHttp) {
    const session = new Session();
    await session.login();
    const contentsPath = `/study/${COURSE}/${SUBJECT}/lessons`;

    const pages = [contentsPath, ...lessons.slice(0, limit).map((l) => `${contentsPath}/${l.slug}`)];
    for (const path of pages) {
      const res = await session.html(path);
      fetched += 1;
      if (res.status !== 200) {
        note("page", path, "rendering", `status ${res.status}`, "");
        continue;
      }
      const seen = visible(res.body);
      for (const [kind, what, pattern] of RULES) {
        const hit = pattern.exec(seen);
        if (hit) note("page", path, kind, what, hit[0]);
      }
      for (const code of codes) {
        if (seen.includes(code)) note("page", path, "regulator", "a CAA requirement code", code);
      }
      const broken = res.body.match(/<img[^>]+src=["']\s*["']/i);
      if (broken) note("page", path, "rendering", "an empty image source", broken[0]);
      const figures = [...res.body.matchAll(/\/api\/study-figures\/([a-z0-9]+)/g)].map((m) => m[1]);
      for (const id of new Set(figures)) {
        const img = await session.go(`/api/study-figures/${id}`);
        if (img.status !== 200) note("page", path, "rendering", `a figure returned ${img.status}`, id);
      }
    }
    console.log(`pages: ${fetched} fetched as an entitled student, every figure on them requested`);
  }

  /* ----------------------------------------------------------------- report */
  if (!findings.length) {
    console.log("\nno leakage found");
    await db.$disconnect();
    return;
  }

  console.log(`\n${findings.length} finding(s):\n`);
  const byKind = new Map();
  for (const f of findings) byKind.set(f.kind, [...(byKind.get(f.kind) ?? []), f]);
  for (const [kind, list] of byKind) {
    console.log(`${kind} — ${list.length}`);
    for (const f of list.slice(0, 25)) {
      console.log(`   ${f.level.padEnd(7)} ${f.what}: "${f.sample}"  (${f.where})`);
    }
    if (list.length > 25) console.log(`   … and ${list.length - 25} more`);
    console.log();
  }
  await db.$disconnect();
  process.exitCode = 1;
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
