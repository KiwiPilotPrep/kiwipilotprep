/**
 * What the five remaining PPL subjects actually are today.
 *
 * Phase 0 of the rebuild, and deliberately read-only. The point is not to
 * describe the courses flatteringly but to find the specific faults the
 * deck-ordered importer left behind, because those are what the rebuild has to
 * fix: chapters named after whichever slide fell first in a run, lessons with
 * nothing in them, the same slide imported twice, and the CAA's checklist
 * leaking into the teaching.
 *
 * Nothing is decided here. The output is the evidence the curricula are then
 * written against.
 *
 *   node scripts/ppl-audit.mjs [--subject <slug>] [--verbose]
 */
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

import { loadManifest } from "./deck-index.mjs";
import { DECKS_ROOT } from "./media-assets.mjs";

const db = new PrismaClient();
const COURSE = "ppl-theory";

/** The five, and the deck each was imported from. */
const SUBJECTS = [
  { slug: "air-law", deck: "air-law" },
  { slug: "navigation", deck: "navigation" },
  { slug: "meteorology", deck: "meteorology" },
  { slug: "human-factors", deck: "human-factors" },
  { slug: "flight-radiotelephony", deck: "flight-radio" },
];

const flat = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const key = (s) => flat(s).toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * A chapter title that came off a slide rather than out of a curriculum.
 *
 * The importer named each run of slides after the first slide in it, so a
 * chapter can be called "AND THE PILOT" or "12.4 PRIVILEGES" or simply be the
 * deck's own divider. These are the signatures of that, not a judgement about
 * the material underneath.
 */
const RAW_TITLE = [
  ["a CAA code", /^\s*\d{1,2}\.\d{1,3}/],
  ["shouted source wording", /^[A-Z0-9 ,'&()\-/.]{12,}$/],
  ["a sentence fragment", /^(and|or|the|a|an|of|to|in|for|with|when|where|if)\b/i],
  ["slide furniture", /slide\s*no|^untitled|^section\s*\d+$|^chapter\s*\d+$/i],
  ["ends mid-thought", /[,;:]$/],
];

async function auditSubject(entry, verbose) {
  const subject = await db.subject.findFirst({
    where: { slug: entry.slug, course: { slug: COURSE } },
    select: { id: true, title: true, status: true, order: true },
  });
  if (!subject) throw new Error(`no subject ${entry.slug} in ${COURSE}`);

  const modules = await db.courseModule.findMany({
    where: { subjectId: subject.id },
    orderBy: { displayOrder: "asc" },
    select: {
      id: true, title: true, summary: true, status: true, origin: true,
      lessons: {
        orderBy: { displayOrder: "asc" },
        select: {
          id: true, slug: true, title: true, status: true, sourceFrom: true, sourceTo: true,
          content: { select: { blocks: true } },
          _count: { select: { mappings: true, progress: true } },
        },
      },
    },
  });

  const lessons = modules.flatMap((m) => m.lessons.map((l) => ({ ...l, chapter: m.title })));
  const blocksOf = (l) => l.content?.blocks ?? [];

  /* ---- what the deck actually holds ---- */
  const manifest = loadManifest(path.join(DECKS_ROOT, entry.deck));
  const covered = new Set();
  const claimedTwice = [];
  for (const l of lessons) {
    if (!Number.isInteger(l.sourceFrom) || !Number.isInteger(l.sourceTo)) continue;
    for (let n = l.sourceFrom; n <= l.sourceTo; n += 1) {
      if (covered.has(n)) claimedTwice.push({ page: n, lesson: l.slug });
      covered.add(n);
    }
  }
  const unclaimed = [];
  for (let n = 1; n <= manifest.total_slides; n += 1) if (!covered.has(n)) unclaimed.push(n);

  /* ---- the faults ---- */
  const hollow = lessons.filter((l) => blocksOf(l).length === 0);
  const thin = lessons.filter((l) => {
    const words = blocksOf(l)
      .filter((b) => ["paragraph", "subitem"].includes(b.type))
      .reduce((n, b) => n + flat(b.text).split(/\s+/).filter(Boolean).length, 0);
    return words > 0 && words < 25;
  });
  const figureOnly = lessons.filter(
    (l) => blocksOf(l).length > 0 && blocksOf(l).every((b) => b.type === "figure"),
  );

  const slugs = lessons.map((l) => l.slug);
  const dupeSlugs = [...new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i))];
  const titleCounts = new Map();
  for (const l of lessons) titleCounts.set(key(l.title), (titleCounts.get(key(l.title)) ?? 0) + 1);
  const dupeTitles = [...titleCounts].filter(([, n]) => n > 1);

  // The same words in two lessons: the importer split a slide run in the
  // middle of a topic and the material was carried into both halves.
  const seen = new Map();
  const dupeText = [];
  for (const l of lessons) {
    for (const b of blocksOf(l)) {
      if (!["paragraph", "subitem"].includes(b.type)) continue;
      const k = key(b.text);
      if (k.length < 60) continue;
      if (seen.has(k) && seen.get(k) !== l.slug) dupeText.push({ a: seen.get(k), b: l.slug });
      else seen.set(k, l.slug);
    }
  }

  const rawChapters = [];
  for (const m of modules) {
    const why = RAW_TITLE.filter(([, re]) => re.test(flat(m.title))).map(([what]) => what);
    if (why.length) rawChapters.push({ title: m.title, why, lessons: m.lessons.length });
  }
  const noSummary = modules.filter((m) => !flat(m.summary)).length;

  /* ---- what a student can see of the regulator ---- */
  const codes = (
    await db.syllabusItem.findMany({
      where: { topic: { subjectId: subject.id } },
      select: { code: true },
    })
  ).map((i) => i.code);
  const leaks = [];
  for (const l of lessons) {
    const text = blocksOf(l)
      .map((b) => [b.text, b.title, ...(b.items ?? [])].filter(Boolean).join(" "))
      .join("\n");
    for (const code of codes) if (text.includes(code)) leaks.push({ lesson: l.slug, code });
    const objective = /What you need to know|^\s*(State|Describe|Explain|Define|Name|List)\s+the\b/m.exec(text);
    if (objective) leaks.push({ lesson: l.slug, wording: objective[0].slice(0, 40) });
    const branding = /\b(academy|flight school|flying school|aeroclub)\b/i.exec(text);
    if (branding) leaks.push({ lesson: l.slug, branding: branding[0] });
    const furniture = /Slide No\.?\s*\d/i.exec(text);
    if (furniture) leaks.push({ lesson: l.slug, furniture: furniture[0] });
  }

  /* ---- what is worth keeping ---- */
  const blocks = lessons.reduce((n, l) => n + blocksOf(l).length, 0);
  const figures = lessons.reduce((n, l) => n + blocksOf(l).filter((b) => b.type === "figure").length, 0);
  const authored = lessons.reduce(
    (n, l) => n + blocksOf(l).filter((b) => b.origin === "authored").length,
    0,
  );
  const withProgress = lessons.filter((l) => l._count.progress > 0).length;
  const mappings = lessons.reduce((n, l) => n + l._count.mappings, 0);

  const inventory = fs.existsSync(`.cache/tmp/${entry.deck}-figures.json`);

  return {
    subject, entry, manifest, modules, lessons,
    counts: {
      chapters: modules.length,
      lessons: lessons.length,
      blocks, figures, authored,
      slides: manifest.total_slides,
      figuresInDeck: manifest.slides.reduce((n, s) => n + (s.pictures ?? []).length, 0),
      mappings, withProgress,
    },
    faults: {
      unclaimed, claimedTwice, hollow, thin, figureOnly,
      dupeSlugs, dupeTitles, dupeText, rawChapters, noSummary, leaks,
    },
    inventory,
    verbose,
  };
}

async function main() {
  const only = process.argv.includes("--subject")
    ? process.argv[process.argv.indexOf("--subject") + 1]
    : null;
  const verbose = process.argv.includes("--verbose");
  const chosen = only ? SUBJECTS.filter((s) => s.slug === only) : SUBJECTS;

  const summary = [];
  for (const entry of chosen) {
    const a = await auditSubject(entry, verbose);
    const f = a.faults;
    console.log(`\n${"=".repeat(76)}\n${a.subject.title}  (${entry.slug})\n${"=".repeat(76)}`);
    console.log(
      `deck ${a.counts.slides} slides, ${a.counts.figuresInDeck} figure placements · ` +
        `course ${a.counts.chapters} chapters, ${a.counts.lessons} lessons, ` +
        `${a.counts.blocks} blocks (${a.counts.authored} authored), ${a.counts.figures} figures`,
    );
    console.log(
      `${a.counts.mappings} syllabus mappings · ${a.counts.withProgress} lessons have student progress`,
    );

    console.log("\nsource accounting as imported");
    console.log(`   unclaimed slides       ${f.unclaimed.length}${f.unclaimed.length ? `  (${f.unclaimed.slice(0, 12).join(", ")}${f.unclaimed.length > 12 ? " …" : ""})` : ""}`);
    console.log(`   slides claimed twice   ${f.claimedTwice.length}`);

    console.log("\nstructure");
    console.log(`   chapters with a raw source title   ${f.rawChapters.length}/${a.counts.chapters}`);
    for (const c of f.rawChapters.slice(0, verbose ? 99 : 6)) {
      console.log(`      "${flat(c.title).slice(0, 58)}" — ${c.why.join(", ")} (${c.lessons} lessons)`);
    }
    if (!verbose && f.rawChapters.length > 6) console.log(`      … and ${f.rawChapters.length - 6} more`);
    console.log(`   chapters with no summary           ${f.noSummary}`);
    console.log(`   hollow lessons (no blocks)         ${f.hollow.length}`);
    console.log(`   thin lessons (<25 words)           ${f.thin.length}`);
    console.log(`   lessons that are figures only      ${f.figureOnly.length}`);
    console.log(`   duplicate slugs                    ${f.dupeSlugs.length}`);
    console.log(`   duplicate lesson titles            ${f.dupeTitles.length}`);
    console.log(`   paragraphs repeated across lessons ${f.dupeText.length}`);

    console.log("\nwhat a student can see that they should not");
    const codeLeaks = f.leaks.filter((x) => x.code).length;
    const wordingLeaks = f.leaks.filter((x) => x.wording).length;
    const brandLeaks = f.leaks.filter((x) => x.branding).length;
    const furnitureLeaks = f.leaks.filter((x) => x.furniture).length;
    console.log(`   CAA requirement codes   ${codeLeaks}`);
    console.log(`   objective wording       ${wordingLeaks}`);
    console.log(`   another academy's name  ${brandLeaks}`);
    console.log(`   slide furniture         ${furnitureLeaks}`);
    if (verbose) {
      for (const l of f.leaks.slice(0, 20)) console.log(`      ${JSON.stringify(l)}`);
    }

    summary.push({
      subject: entry.slug,
      slides: a.counts.slides,
      chapters: a.counts.chapters,
      lessons: a.counts.lessons,
      blocks: a.counts.blocks,
      figures: a.counts.figures,
      rawChapters: f.rawChapters.length,
      hollow: f.hollow.length,
      thin: f.thin.length,
      dupeText: f.dupeText.length,
      unclaimed: f.unclaimed.length,
      leaks: f.leaks.length,
      progress: a.counts.withProgress,
    });
  }

  console.log("\n");
  console.table(summary);
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
