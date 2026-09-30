/**
 * Imports the extracted lecture decks into the CMS.
 *
 *   Subject -> CourseModule -> Lesson -> StudyContent.blocks -> MediaAsset
 *
 * The contract this script holds to is that the database ends up carrying
 * every block the manifest carries, in the same order, attributed to the same
 * slide. It therefore counts what it wrote and compares that against what it
 * read, and refuses to finish if the two disagree. A silent shortfall here
 * would be indistinguishable from a successful import.
 *
 * Re-running is safe: a subject's modules are replaced wholesale, which drops
 * the lessons and content beneath them by cascade. Media assets are keyed by
 * content hash and upserted, so re-running does not duplicate images.
 *
 *   node scripts/import-decks.mjs [--subject <slug>] [--publish]
 */
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

import { buildIndex, loadManifest } from "./deck-index.mjs";
import { isRejectedImage } from "../content/ir/diagram-decisions.mjs";

const db = new PrismaClient();

const MEDIA_DIR = process.env.MEDIA_DIR ?? "./.dev/media";
const ROOT = ".cache/decks";

/**
 * Which extracted deck belongs to which subject of which course.
 *
 * One table for both licence levels. The CPL decks go through exactly the same
 * import as the PPL ones — a second importer would be a second set of rules to
 * keep honest, and the guarantee that matters here (every block that was read
 * is written) has to hold identically for both.
 */
const DECKS = [
  { course: "ppl-theory", deck: "meteorology", subject: "meteorology", label: "PPL Meteorology" },
  { course: "ppl-theory", deck: "navigation", subject: "navigation", label: "PPL Air Navigation and Flight Planning" },
  { course: "ppl-theory", deck: "air-law", subject: "air-law", label: "PPL Air Law" },
  { course: "ppl-theory", deck: "human-factors", subject: "human-factors", label: "PPL Human Factors in Aviation" },
  { course: "ppl-theory", deck: "flight-radio", subject: "flight-radiotelephony", label: "Flight Radio Telephony" },

  { course: "cpl-theory", deck: "cpl-air-law", subject: "air-law", label: "16 CPL Air Law" },
  { course: "cpl-theory", deck: "cpl-navigation", subject: "navigation", label: "18 Flight Navigation General" },
  { course: "cpl-theory", deck: "cpl-meteorology", subject: "meteorology", label: "20 CPL Meteorology" },
  { course: "cpl-theory", deck: "cpl-principles-of-flight", subject: "principles-of-flight", label: "22 Principles of Flight and Performance" },
  { course: "cpl-theory", deck: "cpl-gatk", subject: "aircraft-technical-knowledge", label: "26 General Aircraft Technical Knowledge" },
  { course: "cpl-theory", deck: "cpl-human-factors", subject: "human-factors", label: "34 Human Factors" },

  // The IR course has no external syllabus: these three decks are the course,
  // and its index is built from them rather than mapped onto anything.
  // The IR subjects are not imported here. Their manuals are the source for a
  // curriculum that reorganises them into chapters a student can learn from,
  // built by scripts/build-ir-course.mjs. Importing them page-by-page as well
  // would put the manual's own running order back beside it.
];

/**
 * Diagram types a browser will actually paint.
 *
 * Deliberately only these. A PDF can embed JPEG 2000, a Windows Metafile or a
 * TIFF, and each of those arrives as a valid file with a valid row that renders
 * as a broken image — the request returns 200, the bytes are real, and nothing
 * in the system notices. So an unrecognised type is refused at the import
 * rather than stored: the extractor re-encodes what it can, and anything that
 * still reaches here is a bug worth stopping for.
 */
const MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

function slugify(text, fallback) {
  const slug = String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return slug || fallback;
}

/**
 * Registers a diagram as a MediaAsset and returns its id.
 *
 * The storage key is the content hash, so the same diagram used on three
 * slides is stored once and the three blocks point at one row.
 */
async function ensureAsset(deckSlug, asset, cache) {
  if (cache.has(asset)) return cache.get(asset);

  const source = path.join(ROOT, deckSlug, "assets", asset);
  if (!fs.existsSync(source)) {
    cache.set(asset, null);
    return null;
  }

  const storageKey = `study/${asset}`;
  const target = path.join(MEDIA_DIR, storageKey);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (!fs.existsSync(target)) fs.copyFileSync(source, target);

  const ext = asset.split(".").pop().toLowerCase();
  if (!MIME[ext]) {
    throw new Error(
      `${asset} is a .${ext}, which no browser renders. The extractor should ` +
        `have re-encoded it — run scripts/repair-figure-formats.mjs, or check ` +
        `that Pillow is installed where the extractor runs.`,
    );
  }

  const row = await db.mediaAsset.upsert({
    where: { storageKey },
    update: {},
    create: {
      storageKey,
      filename: asset,
      mimeType: MIME[ext] ?? "application/octet-stream",
      kind: "IMAGE",
      sizeBytes: fs.statSync(source).size,
      isPublic: false,
    },
    select: { id: true },
  });

  cache.set(asset, row.id);
  return row.id;
}

/**
 * Turns one lesson's ordered CMS content into the block shape the study
 * reader already renders. Every entry in produces one entry out — except a
 * diagram already shown in this topic, which produces none — and the slide it
 * came from travels with it.
 */
async function toBlocks(deckSlug, lesson, cache, counts) {
  const blocks = [];

  // A slide deck repeats a diagram across the slides that discuss it: the same
  // VOR picture on four consecutive slides, with a different sentence under it
  // each time. Those slides become one topic, and the reader then shows the
  // same picture four times down one page. Once is the diagram; the rest is
  // the page turning.
  const shown = new Set();

  for (const entry of lesson.content) {
    if (entry.type === "text") {
      // Indentation in the deck is meaning, not decoration: a level-1 bullet
      // sits under the level-0 point above it. It is carried through as a
      // sub-item so the reader shows the same nesting instead of flattening
      // every level into one run of paragraphs.
      const lettered = entry.content.match(/^\(([a-z0-9]{1,3})\)\s+(.+)$/is);
      if (lettered) {
        blocks.push({
          type: "subitem",
          label: `(${lettered[1]})`,
          text: lettered[2].trim(),
          sourceSlide: entry.source_slide,
        });
      } else if (entry.level > 0) {
        blocks.push({
          type: "subitem",
          label: entry.level > 1 ? "◦" : "•",
          text: entry.content,
          sourceSlide: entry.source_slide,
        });
      } else {
        blocks.push({
          type: "paragraph",
          text: entry.content,
          sourceSlide: entry.source_slide,
        });
      }
      counts.text += 1;
    } else if (entry.type === "diagram") {
      // Images a person looked at and found were not teaching material: the
      // academy's own logo, a stock photograph of a road, an advertisement, a
      // video thumbnail. No measurement separates those from a diagram — they
      // are sharp, visible and deliberate — so the judgement is recorded per
      // image in content/ir/diagram-decisions.mjs and applied here.
      if (entry.sha1 && isRejectedImage(entry.sha1)) {
        counts.diagramRejected += 1;
        continue;
      }
      const assetId = entry.asset ? await ensureAsset(deckSlug, entry.asset, cache) : null;
      if (assetId && shown.has(assetId)) {
        counts.diagramRepeat += 1;
      } else if (assetId) {
        shown.add(assetId);
        blocks.push({
          type: "figure",
          assetId,
          alt: `Diagram from ${lesson.title}`,
          sourceSlide: entry.source_slide,
        });
        counts.diagram += 1;
      } else {
        // The diagram existed on the slide but its bytes could not be read.
        // Say so in place rather than leaving a hole the student cannot see —
        // in words that mean something to a reader. Which slide it was is
        // still on the block, for whoever has to go and find it.
        blocks.push({
          type: "note",
          variant: "warning",
          title: "Diagram unavailable",
          text: "A diagram belongs at this point in the topic. It could not be reproduced from the source material.",
          sourceSlide: entry.source_slide,
        });
        counts.diagramUnreadable += 1;
      }
    } else if (entry.type === "table") {
      const [headers, ...rest] = entry.rows;
      blocks.push({
        type: "table",
        headers: headers ?? [],
        rows: rest,
        sourceSlide: entry.source_slide,
      });
      counts.table += 1;
    } else if (entry.type === "media") {
      blocks.push({
        type: "note",
        variant: "info",
        title: "Video in the source material",
        text: "The course notes play a video at this point. It is not part of the written material.",
        sourceSlide: entry.source_slide,
      });
      counts.media += 1;
    } else if (entry.type === "note") {
      blocks.push({
        type: "note",
        variant: "info",
        title: "Presenter note",
        text: entry.content,
        sourceSlide: entry.source_slide,
      });
      counts.note += 1;
    }
  }

  return blocks;
}

async function importDeck(entry, publish) {
  const status = publish ? "PUBLISHED" : "DRAFT";
  const manifest = loadManifest(path.join(ROOT, entry.deck));
  const modules = buildIndex(manifest);

  const subject = await db.subject.findFirst({
    where: { slug: entry.subject, course: { slug: entry.course } },
    select: { id: true, title: true },
  });
  if (!subject) throw new Error(`Subject not found: ${entry.course}/${entry.subject}`);

  // A review is expensive and a re-import is cheap, so the review has to
  // survive the re-import. Confirmed and rejected links are keyed on database
  // ids that this delete is about to destroy, so they are first written down
  // by (lesson slug, syllabus code) -- the pair that survives a re-import --
  // and put back afterwards.
  const rulings = await db.lessonSyllabusItem.findMany({
    where: {
      status: { not: "PROPOSED" },
      lesson: { module: { subjectId: subject.id, origin: "DECK" } },
    },
    select: {
      status: true,
      method: true,
      confidence: true,
      evidence: true,
      reviewedById: true,
      reviewedAt: true,
      lesson: { select: { slug: true } },
      item: { select: { code: true } },
    },
  });

  // Replace rather than merge. A partial overwrite would leave lessons from a
  // previous run interleaved with this one, and the order is the whole point.
  //
  // Only the deck's own modules, though. Sections written by hand to fill a
  // syllabus gap are not in the deck and would never be recreated by this
  // import, so sweeping them away here would delete the one kind of content
  // that cannot be regenerated.
  await db.courseModule.deleteMany({
    where: { subjectId: subject.id, origin: "DECK" },
  });

  const cache = new Map();
  const counts = { text: 0, diagram: 0, diagramRepeat: 0, diagramRejected: 0, diagramUnreadable: 0, table: 0, media: 0, note: 0 };
  let lessonCount = 0;

  for (const [moduleIndex, module] of modules.entries()) {
    const created = await db.courseModule.create({
      data: {
        subjectId: subject.id,
        title: module.module,
        sourceSlide: module.source_slide ?? null,
        // Deck modules are numbered in tens, leaving room for an authored
        // module to be placed immediately after the one it belongs with
        // rather than exiled to an appendix at the end.
        displayOrder: moduleIndex * 10,
        origin: "DECK",
        status,
      },
      select: { id: true },
    });

    const usedSlugs = new Set();
    for (const [lessonIndex, lesson] of module.lessons.entries()) {
      let slug = slugify(lesson.title, `lesson-${lessonIndex + 1}`);
      // Two lessons in one module can legitimately share a title where the
      // deck repeats a heading. Keep both; disambiguate the address.
      if (usedSlugs.has(slug)) slug = `${slug}-${lessonIndex + 1}`.slice(0, 80);
      usedSlugs.add(slug);

      const slides = lesson.source_slides;
      const blocks = await toBlocks(entry.deck, lesson, cache, counts);

      await db.lesson.create({
        data: {
          moduleId: created.id,
          slug,
          title: lesson.title,
          sourceFrom: Math.min(...slides),
          sourceTo: Math.max(...slides),
          displayOrder: lessonIndex,
          status,
          content: {
            create: {
              blocks,
              references: `${manifest.source_file}, slides ${Math.min(...slides)}-${Math.max(...slides)}`,
              status,
            },
          },
        },
      });
      lessonCount += 1;
    }
  }

  // ---- put the human decisions back -------------------------------------
  //
  // A ruling is dropped only if the lesson it referred to no longer exists,
  // which means the source itself changed -- and in that case the decision was
  // about material that is gone.
  let restored = 0;
  let orphaned = 0;
  for (const ruling of rulings) {
    const lesson = await db.lesson.findFirst({
      where: { slug: ruling.lesson.slug, module: { subjectId: subject.id, origin: "DECK" } },
      select: { id: true },
    });
    const item = await db.syllabusItem.findUnique({
      where: { code: ruling.item.code },
      select: { id: true },
    });
    if (!lesson || !item) {
      orphaned += 1;
      continue;
    }
    await db.lessonSyllabusItem.upsert({
      where: { lessonId_syllabusItemId: { lessonId: lesson.id, syllabusItemId: item.id } },
      update: {
        status: ruling.status,
        reviewedById: ruling.reviewedById,
        reviewedAt: ruling.reviewedAt,
      },
      create: {
        lessonId: lesson.id,
        syllabusItemId: item.id,
        status: ruling.status,
        method: ruling.method,
        confidence: ruling.confidence,
        evidence: ruling.evidence,
        reviewedById: ruling.reviewedById,
        reviewedAt: ruling.reviewedAt,
      },
    });
    restored += 1;
  }

  // ---- reconcile against the manifest -----------------------------------
  const expected = { text: 0, diagram: 0, table: 0, media: 0 };
  for (const section of modules) {
    for (const lesson of section.lessons) {
      for (const block of lesson.content) {
        if (block.type === "text") expected.text += 1;
        else if (block.type === "diagram") expected.diagram += 1;
        else if (block.type === "table") expected.table += 1;
        else if (block.type === "media") expected.media += 1;
      }
    }
  }

  // Every diagram the tree carried is accounted for: written, unreadable, or
  // recognised as the same picture already shown in that topic. The repeats
  // are counted rather than quietly dropped, so this still fails if a diagram
  // goes missing for any other reason.
  const wroteDiagrams =
    counts.diagram + counts.diagramUnreadable + counts.diagramRepeat + counts.diagramRejected;
  const mismatch =
    counts.text !== expected.text ||
    wroteDiagrams !== expected.diagram ||
    counts.table !== expected.table ||
    counts.media !== expected.media;
  if (mismatch) {
    throw new Error(
      `${entry.label}: block counts do not reconcile. ` +
        `text ${expected.text}->${counts.text}, diagrams ${expected.diagram}->${wroteDiagrams} ` +
        `(${counts.diagram} shown, ${counts.diagramRepeat} repeats, ` +
        `${counts.diagramRejected} rejected on review, ${counts.diagramUnreadable} unreadable), ` +
        `tables ${expected.table}->${counts.table}, media ${expected.media}->${counts.media}`,
    );
  }

  return {
    course: entry.course,
    reviewsKept: restored,
    reviewsOrphaned: orphaned,
    subject: subject.title,
    source: manifest.source_file,
    slides: manifest.total_slides,
    modules: modules.length,
    lessons: lessonCount,
    textBlocks: counts.text,
    diagrams: counts.diagram,
    diagramsRepeated: counts.diagramRepeat,
    diagramsRejected: counts.diagramRejected,
    diagramsUnreadable: counts.diagramUnreadable,
    tables: counts.table,
    media: counts.media,
    notes: counts.note,
    status,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const only = args.includes("--subject") ? args[args.indexOf("--subject") + 1] : null;
  const course = args.includes("--course") ? args[args.indexOf("--course") + 1] : null;
  const publish = args.includes("--publish");

  const results = [];
  for (const entry of DECKS) {
    if (course && entry.course !== course) continue;
    if (only && entry.subject !== only && entry.deck !== only) continue;
    process.stdout.write(`importing ${entry.label} ... `);
    const result = await importDeck(entry, publish);
    process.stdout.write(`${result.lessons} lessons, ${result.diagrams} diagrams\n`);
    results.push(result);
  }

  console.table(results);
  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error.message);
  await db.$disconnect();
  process.exit(1);
});
