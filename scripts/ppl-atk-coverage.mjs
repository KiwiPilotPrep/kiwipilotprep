/**
 * Every page of the PPL Aircraft Technical Knowledge deck, classified.
 *
 * The rule this exists to serve is the one the CPL rebuild ran on: no source
 * page may be silently ignored. Before a curriculum is written, every page has
 * to be accounted for as something — teaching, a chapter opener, a revision
 * page, a video cue, a duplicate, a blank — so that when the curriculum later
 * claims 400 pages and skips 100, the 100 are a list somebody wrote down
 * rather than a shortfall nobody noticed.
 *
 * Read-only. Writes docs/cms/PPL-ATK-COVERAGE.md and a JSON inventory under
 * .cache/tmp for the rebuild to consume. Touches no database.
 *
 *   node scripts/ppl-atk-coverage.mjs
 */
import fs from "node:fs";
import path from "node:path";

const DECK = ".cache/decks/ppl-atk";
const OUT_MD = "docs/cms/PPL-ATK-COVERAGE.md";
const OUT_JSON = ".cache/tmp/ppl-atk-pages.json";

const manifest = JSON.parse(fs.readFileSync(path.join(DECK, "manifest.json"), "utf8"));

/** A page's words, title included, because the title is often half a sentence. */
function wordsOf(slide) {
  const parts = [slide.title ?? "", ...(slide.blocks ?? []).map((b) => b.text ?? "")];
  return parts.join(" ").trim().split(/\s+/).filter(Boolean).length;
}

/** The page's text with the title folded in — the deck wraps titles into blocks. */
function textOf(slide) {
  return [slide.title ?? "", ...(slide.blocks ?? []).map((b) => b.text ?? "")]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

const CHAPTER = /\bCHAPTER\s+(\d{1,2})\b/i;
const REVIEW = /\bCHAPTER\s+REVIEW\b/i;
const SECTION = /\bSECTION\s+(\d)\b/i;
const VIDEO = /\bVIDEO\b/i;

/**
 * What each class means, written out because a class name on its own is not a
 * reason. These strings are the "written reason" the brief asks for: every
 * page that a curriculum later skips will carry one of them.
 */
const REASONS = {
  teaching: "Carries teaching. Belongs in a lesson.",
  "chapter-opener":
    "Announces a chapter and carries no teaching of its own — the deck's own " +
    "structural furniture. The chapter name is worth keeping as structure; the " +
    "page is not worth printing to a student.",
  "chapter-review":
    "A revision page closing a chapter: recall questions, not exposition. Real " +
    "content, but it belongs in the question bank rather than in a lesson.",
  "section-opener":
    "Announces one of the deck's two halves. Structural furniture, same as a " +
    "chapter opener.",
  "video-cue":
    "A classroom cue to play a video, addressed to the room rather than to a " +
    "reader. Nothing behind it can be shown on a page.",
  "picture-only":
    "No text at all, one or more figures. The figure may be worth keeping; the " +
    "page cannot stand as a lesson on its own and needs to be folded into the " +
    "page that explains it.",
  "title-only":
    "Four words or fewer and no figure — a heading with its body on the next " +
    "page. Nothing to teach from in isolation.",
  blank: "No text and no figure. Nothing to carry.",
  duplicate:
    "Word-for-word repeat of an earlier page. Keep the first occurrence; the " +
    "repeat is the deck saying the same thing twice.",
};

const seen = new Map(); // normalised text -> first page that said it
const pages = [];

for (const slide of manifest.slides) {
  const n = slide.n;
  const text = textOf(slide);
  const words = wordsOf(slide);
  const pics = (slide.pictures ?? []).length;
  const key = text.toLowerCase().replace(/[^a-z0-9]+/g, "");

  let kind;
  let note = "";

  const chapterMatch = text.match(CHAPTER);
  const sectionMatch = text.match(SECTION);

  if (REVIEW.test(text)) {
    kind = "chapter-review";
    note = `closes chapter ${chapterMatch?.[1] ?? "?"}`;
  } else if (VIDEO.test(slide.title ?? "") && words <= 12) {
    kind = "video-cue";
    note = (slide.title ?? "").trim();
  } else if (sectionMatch && words <= 25) {
    // Page 295 announces both: "SECTION 2 AEROPLANE TECHNICAL KNOWLEDGE" and
    // "CHAPTER 20 ANCILLARY SYSTEMS". Classed as the section opener it is, but
    // the chapter number on it still has to count — without this the pages
    // after it are attributed to chapter 19 and a whole chapter goes missing
    // from the inventory it exists to make complete.
    kind = "section-opener";
    note = chapterMatch ? `section ${sectionMatch[1]}, and opens chapter ${chapterMatch[1]}` : `section ${sectionMatch[1]}`;
  } else if (chapterMatch && words <= 25) {
    kind = "chapter-opener";
    note = `opens chapter ${chapterMatch[1]}`;
  } else if (key.length > 40 && seen.has(key)) {
    kind = "duplicate";
    note = `same words as page ${seen.get(key)}`;
  } else if (words === 0 && pics === 0) {
    kind = "blank";
  } else if (words === 0) {
    kind = "picture-only";
  } else if (words <= 4 && pics === 0) {
    kind = "title-only";
    note = text.slice(0, 60);
  } else {
    kind = "teaching";
  }

  if (key.length > 40 && !seen.has(key)) seen.set(key, n);

  // Which chapter this page sits in, carried forward from the last opener.
  pages.push({ n, kind, words, pictures: pics, title: (slide.title ?? "").trim(), note, text: text.slice(0, 300) });
}

// Chapter membership, so the inventory can be read a chapter at a time.
let chapter = null;
let chapterTitle = "";
for (const p of pages) {
  const m = p.text.match(CHAPTER);
  if (m && (p.kind === "chapter-opener" || p.kind === "section-opener" || p.kind === "chapter-review" || /^\s*chapter/i.test(p.title))) {
    if (p.kind !== "chapter-review") {
      chapter = Number(m[1]);
      chapterTitle = p.text.replace(/\s*CHAPTER\s+\d{1,2}\s*/i, " ").replace(/\s+/g, " ").trim().slice(0, 60);
    }
  }
  p.chapter = chapter;
  p.chapterTitle = chapterTitle;
}

const counts = {};
for (const p of pages) counts[p.kind] = (counts[p.kind] ?? 0) + 1;

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify({ source: manifest.source_file, total: manifest.total_slides, counts, pages }, null, 1));

const out = [];
const line = (s = "") => out.push(s);

line("# PPL Aircraft Technical Knowledge — source page coverage");
line();
line(`Generated by \`scripts/ppl-atk-coverage.mjs\` from \`${manifest.source_file}\`.`);
line("Internal preparation for the Phase 2 rebuild. Nothing here is student-facing.");
line();
line(`**${manifest.total_slides} pages, every one classified.** No page is unaccounted for.`);
line();
line("| Class | Pages | Why a curriculum would or would not use it |");
line("| --- | ---: | --- |");
for (const [kind, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  line(`| \`${kind}\` | ${n} | ${REASONS[kind]} |`);
}
line();
line(`Teaching pages: **${counts.teaching ?? 0}**. Everything else totals ${manifest.total_slides - (counts.teaching ?? 0)}.`);
line();

line("## By chapter");
line();
line("| Ch | Title | Pages | Teaching | Review | Other |");
line("| ---: | --- | --- | ---: | ---: | ---: |");
const byChapter = new Map();
for (const p of pages) {
  const k = p.chapter ?? 0;
  if (!byChapter.has(k)) byChapter.set(k, { title: p.chapterTitle, list: [] });
  byChapter.get(k).list.push(p);
}
for (const [ch, v] of [...byChapter.entries()].sort((a, b) => a[0] - b[0])) {
  const t = v.list.filter((p) => p.kind === "teaching").length;
  const r = v.list.filter((p) => p.kind === "chapter-review").length;
  const first = v.list[0].n;
  const last = v.list.at(-1).n;
  line(`| ${ch || "—"} | ${v.title || "(front matter)"} | ${first}–${last} | ${t} | ${r} | ${v.list.length - t - r} |`);
}
line();

line("## Every page");
line();
line("| Page | Class | Ch | Words | Figs | Title / reason |");
line("| ---: | --- | ---: | ---: | ---: | --- |");
for (const p of pages) {
  const label = p.kind === "teaching" ? p.title || "—" : p.note || p.title || REASONS[p.kind].split(".")[0];
  line(`| ${p.n} | \`${p.kind}\` | ${p.chapter ?? "—"} | ${p.words} | ${p.pictures} | ${label.replace(/\|/g, "\\|").slice(0, 90)} |`);
}
line();

fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
fs.writeFileSync(OUT_MD, out.join("\n"));

console.log(`${manifest.total_slides} pages classified`);
console.table(Object.entries(counts).map(([kind, pages]) => ({ kind, pages })));
const unclassified = pages.filter((p) => !p.kind);
console.log(unclassified.length === 0 ? "every page carries a class" : `${unclassified.length} UNCLASSIFIED`);
console.log(`wrote ${OUT_MD} and ${OUT_JSON}`);
