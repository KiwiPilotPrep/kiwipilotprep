/**
 * Builds the master index and the CMS-ready JSON for every deck, and proves
 * that the tree accounts for every slide in the source.
 *
 * Writes, per course:
 *   .cache/decks/<slug>/index.txt   the readable index (STEP 1 of the brief)
 *   .cache/decks/<slug>/cms.json    the CMS structure (STEP 5)
 *
 * Prints a coverage line per course. A slide that the tree does not account
 * for is a hard failure, not a warning: the whole point is that nothing is
 * lost between the deck and the CMS.
 */
import fs from "node:fs";
import path from "node:path";

import { buildIndex, coveredSlides, renderIndex, loadManifest } from "./deck-index.mjs";

export const COURSES = [
  { slug: "meteorology", name: "PPL Meteorology", subjectNo: 8 },
  { slug: "navigation", name: "PPL Air Navigation and Flight Planning", subjectNo: 6 },
  { slug: "air-law", name: "PPL Air Law", subjectNo: 4 },
  { slug: "human-factors", name: "PPL Human Factors in Aviation", subjectNo: null },
  { slug: "flight-radio", name: "Flight Radio Telephony", subjectNo: 2 },
];

const ROOT = ".cache/decks";

function main() {
  const summary = [];

  for (const course of COURSES) {
    const dir = path.join(ROOT, course.slug);
    const manifest = loadManifest(dir);
    const modules = buildIndex(manifest);

    const covered = coveredSlides(modules);
    const missing = [];
    for (let n = 1; n <= manifest.total_slides; n += 1) {
      if (!covered.has(n)) missing.push(n);
    }
    if (missing.length) {
      throw new Error(
        `${course.name}: ${missing.length} slides are not represented in the tree: ${missing.slice(0, 20).join(", ")}`,
      );
    }

    fs.writeFileSync(
      path.join(dir, "index.txt"),
      renderIndex(course.name, manifest, modules),
      "utf8",
    );
    fs.writeFileSync(
      path.join(dir, "cms.json"),
      JSON.stringify(
        {
          course: {
            title: course.name,
            source_file: manifest.source_file,
            total_slides: manifest.total_slides,
            index: modules,
          },
        },
        null,
        1,
      ),
      "utf8",
    );

    const lessons = modules.reduce((n, m) => n + m.lessons.length, 0);
    const blocks = modules.reduce(
      (n, m) => n + m.lessons.reduce((k, l) => k + l.content.length, 0),
      0,
    );
    const diagrams = modules.reduce(
      (n, m) => n + m.lessons.reduce((k, l) => k + l.diagrams.length, 0),
      0,
    );
    const tables = modules.reduce(
      (n, m) => n + m.lessons.reduce((k, l) => k + l.tables.length, 0),
      0,
    );
    const media = modules.reduce(
      (n, m) => n + m.lessons.reduce((k, l) => k + l.media.length, 0),
      0,
    );

    summary.push({
      course: course.name,
      slides: manifest.total_slides,
      modules: modules.length,
      lessons,
      blocks,
      diagrams,
      tables,
      media,
      slidesCovered: covered.size,
      missing: missing.length,
    });
  }

  console.table(summary);
}

main();
