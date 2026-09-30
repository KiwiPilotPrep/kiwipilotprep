/**
 * Every slide of the five remaining PPL decks, classified.
 *
 * The rule this exists to serve is the one the ATK and CPL rebuilds ran on: no
 * source slide may be silently ignored. Before a curriculum is written, every
 * slide has to be accounted for as something — teaching, a divider, a revision
 * page, a video cue, a duplicate, a blank — so that when a curriculum later
 * claims 300 slides and skips 40, the 40 are a list somebody wrote down rather
 * than a shortfall nobody noticed.
 *
 * These five are PowerPoint decks rather than the PDF book ATK came from, and
 * that changes what the classifier can rely on. A PowerPoint slide knows
 * whether it is a section divider — the deck says so — and it knows its layout
 * name. Four of the five carry their own section structure that way, which is
 * the skeleton the curricula are built on. Human Factors carries almost none
 * and has to have its structure recovered from the material, exactly as ATK's
 * did.
 *
 * Read-only. Writes docs/cms/PPL-SOURCE-COVERAGE.md and a JSON inventory per
 * deck under .cache/tmp. Touches no database.
 *
 *   node scripts/ppl-coverage.mjs [--deck <slug>]
 */
import fs from "node:fs";
import path from "node:path";

import { DECKS_ROOT } from "./media-assets.mjs";

const OUT_MD = "docs/cms/PPL-SOURCE-COVERAGE.md";

/** The five decks, with the subject each one becomes. */
export const DECKS = [
  { deck: "air-law", subject: "air-law", title: "Air Law" },
  { deck: "navigation", subject: "navigation", title: "Air Navigation and Flight Planning" },
  { deck: "meteorology", subject: "meteorology", title: "Meteorology" },
  { deck: "human-factors", subject: "human-factors", title: "Human Factors" },
  { deck: "flight-radio", subject: "flight-radiotelephony", title: "Flight Radiotelephony" },
];

/**
 * What each class means, written out because a class name on its own is not a
 * reason. These strings are the written reason a skipped slide carries.
 */
export const REASONS = {
  teaching: "Carries teaching. Belongs in a lesson.",
  divider:
    "A section divider: the deck's own structural furniture, announcing what " +
    "comes next and teaching none of it. The name is worth keeping as course " +
    "structure; the slide is not worth printing to a student.",
  cover:
    "The deck's cover, or the exam format it opens with. Neither is teaching, " +
    "and the course page states the format already.",
  review:
    "A revision slide closing a run: recall questions or a list of what was " +
    "covered, not exposition. Real content, but it belongs in the question " +
    "bank rather than in a lesson.",
  "video-cue":
    "A classroom cue to play a video, addressed to the room rather than to a " +
    "reader. Nothing behind it can be shown on a page.",
  "picture-only":
    "No text at all, one or more figures. The figure may be worth keeping; the " +
    "slide cannot stand as a lesson on its own and needs to be folded into the " +
    "slide that explains it.",
  "title-only":
    "Four words or fewer and no figure — a heading with its body on the next " +
    "slide. Nothing to teach from in isolation.",
  blank: "No text and no figure. Nothing to carry.",
  duplicate:
    "Word-for-word repeat of an earlier slide. Keep the first occurrence; the " +
    "repeat is the deck saying the same thing twice.",
};

const flat = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

/** A slide's words, title included, because the title is often half a sentence. */
const textOf = (slide) =>
  flat([slide.title ?? "", ...(slide.blocks ?? []).map((b) => b.text ?? "")].join(" "));

const REVIEW = /\b(review|revision|summary of|questions?)\b/i;
const VIDEO = /\b(video|animation|watch this|play the)\b/i;
const COVER = /\b(\d{1,3}\s*(minutes|questions)|exam format)\b/i;

export function classify(manifest) {
  const seen = new Map();
  const pages = [];

  for (const slide of manifest.slides) {
    const text = textOf(slide);
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const pics = (slide.pictures ?? []).length;
    const key = text.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const title = flat(slide.title);

    let kind;
    let note = "";

    if (slide.n === 1 || (COVER.test(text) && words <= 20)) {
      kind = "cover";
      note = text.slice(0, 60);
    } else if (slide.is_section && words <= 30) {
      // The deck's own divider. Its title is the name of what follows, and
      // that name is worth more than the slide is.
      kind = "divider";
      note = title || text.slice(0, 60);
    } else if (VIDEO.test(title) && words <= 14) {
      kind = "video-cue";
      note = title;
    } else if (REVIEW.test(title) && words <= 40) {
      kind = "review";
      note = title;
    } else if (key.length > 40 && seen.has(key)) {
      kind = "duplicate";
      note = `same words as slide ${seen.get(key)}`;
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

    if (key.length > 40 && !seen.has(key)) seen.set(key, slide.n);

    pages.push({
      n: slide.n,
      kind,
      words,
      pictures: pics,
      title,
      note,
      text: text.slice(0, 300),
    });
  }

  // Section membership, carried forward from the last divider, so the
  // inventory can be read a section at a time.
  let section = null;
  let sectionTitle = "";
  let index = 0;
  for (const p of pages) {
    if (p.kind === "divider") {
      index += 1;
      section = index;
      sectionTitle = p.title || p.note;
    }
    p.section = section;
    p.sectionTitle = sectionTitle;
  }

  const counts = {};
  for (const p of pages) counts[p.kind] = (counts[p.kind] ?? 0) + 1;
  return { pages, counts };
}

function main() {
  const only = process.argv.includes("--deck")
    ? process.argv[process.argv.indexOf("--deck") + 1]
    : null;
  const chosen = only ? DECKS.filter((d) => d.deck === only) : DECKS;

  const out = [];
  const w = (s = "") => out.push(s);
  w("# PPL — source slide coverage for the five remaining subjects");
  w();
  w("Generated by `scripts/ppl-coverage.mjs`. Internal preparation for the rebuild;");
  w("nothing here is student-facing. Every slide of every deck is classified, so that a");
  w("curriculum which claims some and skips others can be checked against a list rather");
  w("than trusted.");
  w();
  w("| Subject | Source | Slides | Teaching | Dividers | Other |");
  w("| --- | --- | ---: | ---: | ---: | ---: |");

  const all = [];
  for (const entry of chosen) {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(DECKS_ROOT, entry.deck, "manifest.json"), "utf8"),
    );
    const { pages, counts } = classify(manifest);
    const outJson = `.cache/tmp/ppl-${entry.deck}-pages.json`;
    fs.mkdirSync(path.dirname(outJson), { recursive: true });
    fs.writeFileSync(
      outJson,
      JSON.stringify(
        { deck: entry.deck, subject: entry.subject, source: manifest.source_file, total: manifest.total_slides, counts, pages },
        null,
        1,
      ),
    );
    all.push({ entry, manifest, pages, counts });
    const other = manifest.total_slides - (counts.teaching ?? 0) - (counts.divider ?? 0);
    w(
      `| ${entry.title} | \`${manifest.source_file}\` | ${manifest.total_slides} | ` +
        `${counts.teaching ?? 0} | ${counts.divider ?? 0} | ${other} |`,
    );
    console.log(
      `${entry.deck.padEnd(15)} ${String(manifest.total_slides).padStart(4)} slides · ` +
        Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => `${k} ${v}`)
          .join(" · "),
    );
  }

  for (const { entry, manifest, pages, counts } of all) {
    w();
    w(`## ${entry.title}`);
    w();
    w(`\`${manifest.source_file}\` — **${manifest.total_slides} slides, every one classified.**`);
    w();
    w("| Class | Slides | Why a curriculum would or would not use it |");
    w("| --- | ---: | --- |");
    for (const [kind, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
      w(`| \`${kind}\` | ${n} | ${REASONS[kind] ?? ""} |`);
    }
    w();
    const sections = [...new Set(pages.map((p) => p.section).filter(Boolean))];
    if (sections.length) {
      w("### The deck's own sections");
      w();
      w("| # | Section | Slides | Teaching |");
      w("| ---: | --- | --- | ---: |");
      for (const s of sections) {
        const mine = pages.filter((p) => p.section === s);
        w(
          `| ${s} | ${mine[0].sectionTitle} | ${mine[0].n}–${mine[mine.length - 1].n} | ` +
            `${mine.filter((p) => p.kind === "teaching").length} |`,
        );
      }
      w();
    }
  }

  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
  fs.writeFileSync(OUT_MD, out.join("\n") + "\n");
  console.log(`\nwrote ${OUT_MD}`);
}

main();
