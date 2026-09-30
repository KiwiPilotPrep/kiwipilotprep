/**
 * Runs the deck extractor over every CPL course-material file.
 *
 * Same extractor as the PPL migration, deliberately: the CPL decks come from
 * the same authors in the same shapes, and a second extractor would be a
 * second set of rules to keep honest. Three of the six arrive as PDF exports
 * rather than PowerPoint, which the extractor already handles.
 *
 *   node scripts/extract-cpl.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { CPL_SUBJECTS, DECKS_ROOT } from "./cpl-sources.mjs";

const summaries = [];

for (const subject of CPL_SUBJECTS) {
  if (!fs.existsSync(subject.source)) {
    console.error(`missing source: ${subject.source}`);
    process.exit(1);
  }
  const dir = path.join(DECKS_ROOT, subject.deck);
  process.stdout.write(`extracting ${subject.number} ${subject.name} ... `);

  const out = execFileSync("python", ["scripts/extract-deck.py", subject.source, dir], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  fs.writeFileSync(path.join(dir, "extract.json"), out, "utf8");

  const summary = JSON.parse(out);
  process.stdout.write(`${summary.slides} slides, ${summary.pictures_kept} diagrams\n`);
  summaries.push({
    subject: `${subject.number} ${subject.name}`.slice(0, 42),
    slides: summary.slides,
    textBlocks: summary.text_blocks,
    chars: summary.chars,
    diagrams: summary.pictures_kept,
    furnitureDropped: summary.furniture_images_dropped,
    tables: summary.tables,
    media: summary.media_slides,
    blank: summary.slides_with_nothing.length,
  });
}

console.table(summaries);
