/**
 * Runs the deck extractor over every supplied source file.
 *
 * Kept as one command because the six sources have to be extracted with the
 * same rules — a per-file invocation invites one of them being run with a
 * stale script or a different flag, and the resulting shortfall would look
 * exactly like a source that simply had less in it.
 *
 * Aircraft Technical Knowledge was missing from this list until the PPL audit
 * went looking for its manifest and found none. It is the sixth PPL subject
 * and its deck is the largest of the six; the reason it never reached a course
 * the way the others did is that it was never extracted here.
 *
 *   node scripts/extract-all.mjs               # all six
 *   node scripts/extract-all.mjs ppl-atk       # one, by slug
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SOURCES = [
  { slug: "meteorology", file: "PPL CONTENT/PPLMeteorology2024_Professional.pptx" },
  { slug: "navigation", file: "PPL CONTENT/PPLNavigation-Updated_Professional.pptx" },
  { slug: "air-law", file: "PPL CONTENT/PPLLawPowerPointNew_Professional.pptx" },
  { slug: "human-factors", file: "PPL CONTENT/PPLHFUpdated-Complete_Professional.pptx" },
  { slug: "flight-radio", file: "PPL CONTENT/FRTOLectureSlides_Professional.pdf" },
  { slug: "ppl-atk", file: "PPLAircraftTechnicalKnowledge.pdf" },
];

const OUT = ".cache/decks";
const summaries = [];

// Naming one slug re-extracts only that deck. The five that are already in the
// cache feed a live course, and re-running them to add a sixth would rewrite
// five manifests for no reason — a diff nobody asked for is a diff nobody
// reviews.
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const chosen = only.length ? SOURCES.filter((s) => only.includes(s.slug)) : SOURCES;
if (only.length && chosen.length !== only.length) {
  console.error(`unknown slug(s): ${only.filter((s) => !SOURCES.some((x) => x.slug === s)).join(", ")}`);
  console.error(`known: ${SOURCES.map((s) => s.slug).join(", ")}`);
  process.exit(1);
}

for (const source of chosen) {
  if (!fs.existsSync(source.file)) {
    console.error(`missing source: ${source.file}`);
    process.exit(1);
  }
  const dir = path.join(OUT, source.slug);
  process.stdout.write(`extracting ${source.slug} ... `);
  const out = execFileSync("python", ["scripts/extract-deck.py", source.file, dir], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  fs.writeFileSync(path.join(dir, "extract.json"), out, "utf8");
  const summary = JSON.parse(out);
  process.stdout.write(`${summary.slides} slides, ${summary.pictures_kept} diagrams\n`);
  summaries.push({
    course: source.slug,
    slides: summary.slides,
    textBlocks: summary.text_blocks,
    chars: summary.chars,
    diagrams: summary.pictures_kept,
    furnitureDropped: summary.furniture_images_dropped,
    tables: summary.tables,
    media: summary.media_slides,
    unreadable: summary.unreadable_shapes,
  });
}

console.table(summaries);
