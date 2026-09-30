/**
 * Builds the IR course from a curriculum, not from the shape of the PDFs.
 *
 * The deck importer turns a study manual into a course by following it: a
 * heading becomes a topic, a run of headings becomes a chapter. That preserves
 * everything and teaches badly, because the order a manual was written in is
 * not the order a subject is learned in. It gave the IR course chapters called
 * "The climb continued the altitude column" and topics called "Operational",
 * and split altimetry across four places because the author came back to it.
 *
 * This builds the course the other way round. `content/ir/<subject>.mjs`
 * declares the chapters and topics a student should meet, in teaching order,
 * and each topic names the source pages it is built from. The builder then:
 *
 *   - pulls those pages' text and diagrams out of the extracted manifest,
 *     verbatim and in order, so no source knowledge is rewritten or lost;
 *   - wraps them in the authored teaching apparatus — what this topic is for,
 *     what to hold on to, where people go wrong;
 *   - tags every block with where it came from, so source and enrichment stay
 *     distinguishable for the life of the record;
 *   - refuses to finish if any source page is unclaimed or claimed twice.
 *
 * That last check is what makes the reorganisation safe. A curriculum is a
 * promise that every page of the manual landed somewhere deliberate, and the
 * build fails rather than quietly dropping a page nobody thought to place.
 *
 *   node scripts/build-ir-course.mjs [--dry]
 */
import path from "node:path";
import { PrismaClient } from "@prisma/client";

import { loadManifest } from "./deck-index.mjs";
import { ensureAsset } from "./media-assets.mjs";
import { isRejectedImage } from "../content/ir/diagram-decisions.mjs";
import { repairPage } from "../content/ir/source-repairs.mjs";
import { SUBJECTS } from "../content/ir/index.mjs";

const db = new PrismaClient();
const COURSE = "ir-theory";

/** Turns a title into the slug it is addressed by. */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * The source blocks for one page, in the order the page presented them.
 *
 * Text and pictures interleave exactly as they did in the manual, which is
 * what puts a diagram beside the paragraph that explains it without anyone
 * having to decide where it goes.
 */
async function pageBlocks(deck, page, cache, counts, topicTitle) {
  const out = [];

  // A PDF text layer has no structure, so a term and its definition arrive as
  // two paragraphs and a sentence set across three lines arrives as three
  // fragments. This puts the shape back without changing a word.
  const { blocks: repaired, counts: repairs } = repairPage(page.blocks, {
    pageTitle: page.title,
    topicTitle,
    deck,
    page: page.n,
  });
  for (const [kind, n] of Object.entries(repairs)) counts.repairs[kind] += n;

  for (const block of repaired) {
    if (block.kind === "term") {
      // A labelled definition, which is what the slide showed.
      out.push({
        type: "subitem",
        label: "\u2022",
        title: block.label,
        text: block.text,
        origin: "source",
        sourcePage: page.n,
      });
      counts.source += 1;
    } else if (block.kind === "grid") {
      out.push({
        type: "table",
        headers: block.headers,
        rows: block.rows,
        origin: "source",
        sourcePage: page.n,
      });
      counts.source += 1;
    } else if (block.kind === "abbrevs") {
      out.push({
        type: "list",
        items: block.items,
        origin: "source",
        sourcePage: page.n,
      });
      counts.source += 1;
    } else if (block.kind === "text") {
      const lettered = block.text.match(/^\(([a-z0-9]{1,3})\)\s+(.+)$/is);
      if (lettered) {
        out.push({
          type: "subitem",
          label: `(${lettered[1]})`,
          text: lettered[2].trim(),
          origin: "source",
          sourcePage: page.n,
        });
      } else if ((block.level ?? 0) > 0) {
        out.push({
          type: "subitem",
          label: (block.level ?? 0) > 1 ? "◦" : "•",
          text: block.text,
          origin: "source",
          sourcePage: page.n,
        });
      } else {
        out.push({ type: "paragraph", text: block.text, origin: "source", sourcePage: page.n });
      }
      counts.source += 1;
    } else if (block.kind === "picture") {
      if (block.sha1 && isRejectedImage(block.sha1)) {
        counts.imageRejected += 1;
        continue;
      }
      const picture = page.pictures.find((p) => p.sha1 === block.sha1);
      const assetId = picture ? await ensureAsset(db, deck, picture.asset, cache) : null;
      if (!assetId) {
        counts.imageMissing += 1;
        continue;
      }
      out.push({ type: "figure", assetId, origin: "source", sourcePage: page.n });
      counts.image += 1;
    } else if (block.kind === "table") {
      const [headers, ...rows] = block.rows;
      out.push({
        type: "table",
        headers: headers ?? [],
        rows,
        origin: "source",
        sourcePage: page.n,
      });
      counts.source += 1;
    }
  }
  return out;
}

/** Everything the author wrote, wrapped around everything the manual said. */
async function topicBlocks(subject, topic, manifest, cache, counts) {
  const blocks = [];
  const add = (block) => {
    blocks.push({ ...block, origin: "authored" });
    counts.authored += 1;
  };

  if (topic.intro) add({ type: "paragraph", text: topic.intro, lead: true });
  if (topic.definition) {
    add({ type: "definition", term: topic.term ?? topic.title, text: topic.definition });
  }

  // The manual's own words, in its own order.
  const seenImages = new Set();
  // A topic gathers pages the manual spread out, and the manual repeats itself
  // across them — the same paragraph on charts appears on page 19 and again on
  // page 44. Said once is teaching; said twice on one page is a defect.
  const seenText = new Set();
  // A page can carry more than one figure, so a note may be a single string or
  // one string per figure on that page, in order.
  const noteFor = (page, index) => {
    const note = topic.diagramNotes?.[page];
    if (Array.isArray(note)) return note[index] ?? null;
    return index === 0 ? note ?? null : null;
  };
  for (const n of topic.pages) {
    let figureOnPage = 0;
    const page = manifest.slides[n - 1];
    if (!page) throw new Error(`${subject.slug}: page ${n} is not in the manifest`);
    for (const block of await pageBlocks(subject.deck, page, cache, counts, topic.title)) {
      if (block.type === "figure") {
        // One diagram, once. A manual repeats a picture across the run of
        // pages that discuss it; a topic that gathers those pages would
        // otherwise print it four times down one page.
        if (seenImages.has(block.assetId)) {
          counts.imageRepeat += 1;
          continue;
        }
        seenImages.add(block.assetId);
        const note = noteFor(n, figureOnPage);
        figureOnPage += 1;
        blocks.push(note ? { ...block, caption: note } : block);
        continue;
      }
      if (block.type === "paragraph" || block.type === "subitem") {
        const key = `${block.type}:${(block.title ?? "")}:${(block.text ?? "")}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "");
        if (key.length > 40) {
          if (seenText.has(key)) {
            counts.textRepeat += 1;
            continue;
          }
          // The manual also repeats itself inexactly: the same paragraph with a
          // sentence added the second time. Keep whichever version says more,
          // so the extra sentence is never the one that is dropped.
          let superseded = false;
          for (const seen of seenText) {
            if (seen.startsWith(key)) { superseded = true; break; }
            if (key.startsWith(seen)) {
              const at = blocks.findIndex(
                (b) =>
                  b.origin === "source" &&
                  `${b.type}:${b.title ?? ""}:${b.text ?? ""}`
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "") === seen,
              );
              if (at > -1) blocks.splice(at, 1);
              seenText.delete(seen);
              counts.textRepeat += 1;
              break;
            }
          }
          if (superseded) {
            counts.textRepeat += 1;
            continue;
          }
          seenText.add(key);
        }
      }
      blocks.push(block);
    }
  }

  if (topic.keyPoints?.length) add({ type: "keypoints", items: topic.keyPoints });
  if (topic.example) add({ type: "example", title: topic.exampleTitle ?? "Worked example", text: topic.example });
  if (topic.context) add({ type: "context", text: topic.context });
  if (topic.misconception) add({ type: "misconception", text: topic.misconception });
  if (topic.takeaway) add({ type: "takeaway", text: topic.takeaway });

  return blocks;
}

/**
 * Proves the curriculum accounts for the whole manual.
 *
 * A page may be claimed by exactly one topic, or listed in `skip` with a
 * reason. Anything else stops the build: an unclaimed page is source material
 * that silently did not make it into the course, and a page claimed twice is
 * the same material taught in two places.
 */
function auditCoverage(subject, manifest) {
  const owner = new Map();
  const problems = [];

  for (const chapter of subject.chapters) {
    for (const topic of chapter.topics) {
      for (const n of topic.pages) {
        if (owner.has(n)) {
          problems.push(`page ${n} is claimed by "${owner.get(n)}" and by "${topic.title}"`);
        }
        owner.set(n, topic.title);
      }
    }
  }

  for (const [n] of Object.entries(subject.skip ?? {})) owner.set(Number(n), "(skipped)");

  const missing = [];
  for (let n = 1; n <= manifest.total_slides; n += 1) if (!owner.has(n)) missing.push(n);
  if (missing.length) {
    problems.push(`${missing.length} source page(s) claimed by no topic: ${missing.join(", ")}`);
  }

  const overrun = [...owner.keys()].filter((n) => n < 1 || n > manifest.total_slides);
  if (overrun.length) problems.push(`page(s) outside the manual: ${overrun.join(", ")}`);

  return problems;
}

async function main() {
  const dry = process.argv.includes("--dry");
  const course = await db.course.findUnique({ where: { slug: COURSE }, select: { id: true } });
  if (!course) throw new Error(`no ${COURSE} course — run the seed first`);

  const summary = [];

  for (const subject of SUBJECTS) {
    const manifest = loadManifest(path.join(".cache/decks", subject.deck));
    const problems = auditCoverage(subject, manifest);
    if (problems.length) {
      throw new Error(`${subject.slug}: the curriculum does not account for the manual\n  - ${problems.join("\n  - ")}`);
    }

    const row = await db.subject.findFirst({
      where: { slug: subject.slug, course: { slug: COURSE } },
      select: { id: true },
    });
    if (!row) throw new Error(`no subject ${subject.slug}`);

    const counts = {
      source: 0, authored: 0, textRepeat: 0,
      image: 0, imageRepeat: 0, imageRejected: 0, imageMissing: 0,
      repairs: { asides: 0, joined: 0, labelled: 0, listed: 0, echoes: 0, orphans: 0, tables: 0 },
    };
    const cache = new Map();
    const built = [];

    for (const [chapterIndex, chapter] of subject.chapters.entries()) {
      const lessons = [];
      for (const [topicIndex, topic] of chapter.topics.entries()) {
        lessons.push({
          slug: slugify(topic.title),
          title: topic.title,
          displayOrder: topicIndex * 10,
          sourceFrom: Math.min(...topic.pages),
          sourceTo: Math.max(...topic.pages),
          blocks: await topicBlocks(subject, topic, manifest, cache, counts),
        });
      }
      built.push({
        title: chapter.title,
        summary: chapter.intro ?? null,
        displayOrder: chapterIndex * 10,
        lessons,
      });
    }

    // Slugs address a topic in a URL, so a collision would make one of them
    // unreachable.
    const slugs = built.flatMap((c) => c.lessons.map((l) => l.slug));
    const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    if (dupes.length) throw new Error(`${subject.slug}: duplicate topic slugs — ${[...new Set(dupes)].join(", ")}`);

    if (!dry) {
      // The whole subject is rebuilt in one transaction: a half-written course
      // is worse than the old one.
      await db.$transaction(
        async (tx) => {
          await tx.courseModule.deleteMany({ where: { subjectId: row.id } });
          for (const chapter of built) {
            const module = await tx.courseModule.create({
              data: {
                subjectId: row.id,
                title: chapter.title,
                summary: chapter.summary,
                displayOrder: chapter.displayOrder,
                origin: "AUTHORED",
                status: "PUBLISHED",
              },
              select: { id: true },
            });
            for (const lesson of chapter.lessons) {
              await tx.lesson.create({
                data: {
                  moduleId: module.id,
                  slug: lesson.slug,
                  title: lesson.title,
                  displayOrder: lesson.displayOrder,
                  sourceFrom: lesson.sourceFrom,
                  sourceTo: lesson.sourceTo,
                  status: "PUBLISHED",
                  content: { create: { blocks: lesson.blocks } },
                },
              });
            }
          }
        },
        { timeout: 120_000 },
      );
    }

    summary.push({
      subject: subject.title,
      pages: manifest.total_slides,
      chapters: built.length,
      topics: built.reduce((n, c) => n + c.lessons.length, 0),
      sourceBlocks: counts.source,
      authoredBlocks: counts.authored,
      diagrams: counts.image,
      repeatsDropped: counts.imageRepeat,
      rejectedOnReview: counts.imageRejected,
      notesRemoved: counts.repairs.asides,
      linesJoined: counts.repairs.joined,
      termsLabelled: counts.repairs.labelled,
      listsRebuilt: counts.repairs.listed,
      headingEchoes: counts.repairs.echoes,
      strayLabels: counts.repairs.orphans,
      tablesRebuilt: counts.repairs.tables,
      repeatedText: counts.textRepeat,
    });
  }

  console.table(summary);
  if (dry) console.log("\ndry run — nothing written");
  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error.message ?? error);
  await db.$disconnect();
  process.exit(1);
});
