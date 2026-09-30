/**
 * Builds the CPL course from a curriculum, not from the shape of the decks.
 *
 * This is the sibling of scripts/build-ir-course.mjs and works the same way,
 * for the same reason. The deck importer that produced the current CPL course
 * followed the slides: a run of slides became a chapter, and the chapter took
 * its name from whichever slide happened to fall first in the run. Where a deck
 * carried section dividers that worked out; where it did not, it produced
 * chapters called "THE OIL SYSTEM" containing the propeller material.
 *
 * Here `content/cpl/<subject>.mjs` declares the chapters and topics a student
 * should meet, in teaching order, and each topic names the source slides it is
 * built from. The builder then:
 *
 *   - pulls those slides' text and diagrams out of the extracted manifest,
 *     verbatim and in order, so no source knowledge is rewritten or lost;
 *   - wraps them in the authored teaching apparatus — what this topic is for,
 *     what to hold on to, where people go wrong;
 *   - tags every block with where it came from, so source and enrichment stay
 *     distinguishable for the life of the record;
 *   - refuses to finish if any source slide is unclaimed or claimed twice.
 *
 * That last check is what makes the reorganisation safe. A curriculum is a
 * promise that every slide of the deck landed somewhere deliberate, and the
 * build fails rather than quietly dropping a slide nobody thought to place.
 *
 * Production identity is never touched: the course row, the subject rows and
 * their ids and slugs are looked up, never created and never renamed, so
 * entitlements keyed by `course:<id>` and `subject:<id>` keep working and every
 * existing route keeps resolving.
 *
 *   node scripts/build-cpl-course.mjs [--dry] [--subject <slug>]
 */
import path from "node:path";
import { PrismaClient } from "@prisma/client";

import { loadManifest } from "./deck-index.mjs";
import { ensureAsset } from "./media-assets.mjs";
import { isRejectedImage } from "../content/cpl/diagram-decisions.mjs";
import { repairPage } from "../content/cpl/source-repairs.mjs";
import { SUBJECTS } from "../content/cpl/index.mjs";

const db = new PrismaClient();
const COURSE = "cpl-theory";

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
 * The source blocks for one slide, in the order the slide presented them.
 *
 * Text and pictures interleave exactly as they did in the deck, which is what
 * puts a diagram beside the paragraph that explains it without anyone having to
 * decide where it goes.
 */
async function slideBlocks(deck, slide, cache, counts, topicTitle) {
  const out = [];

  const { blocks: repaired, counts: repairs } = repairPage(slide.blocks, {
    pageTitle: slide.title,
    topicTitle,
    deck,
    page: slide.n,
  });
  for (const [kind, n] of Object.entries(repairs)) counts.repairs[kind] += n;

  for (const block of repaired) {
    if (block.kind === "term") {
      // A labelled definition, which is what the slide showed.
      out.push({
        type: "subitem",
        label: "•",
        title: block.label,
        text: block.text,
        origin: "source",
        sourcePage: slide.n,
      });
      counts.source += 1;
    } else if (block.kind === "grid") {
      out.push({
        type: "table",
        headers: block.headers,
        rows: block.rows,
        origin: "source",
        sourcePage: slide.n,
      });
      counts.source += 1;
    } else if (block.kind === "table") {
      const [headers, ...rows] = block.rows;
      if (rows.length === 0) {
        // A one-row table is not a table. Air Law has three, each a single rule
        // laid out in a grid for spacing; rendered as a table they arrive with a
        // header and nothing under it. The cells carry the text, so they are
        // emitted as paragraphs and the empty grid is dropped.
        for (const cell of headers ?? []) {
          const text = String(cell ?? "").trim();
          if (!text) continue;
          out.push({ type: "paragraph", text, origin: "source", sourcePage: slide.n });
          counts.source += 1;
        }
      } else {
        out.push({
          type: "table",
          headers: headers ?? [],
          rows,
          origin: "source",
          sourcePage: slide.n,
        });
        counts.source += 1;
      }
    } else if (block.kind === "text") {
      // "(a) something" and "1. something" are list items the deck wrote as
      // paragraphs; giving them their label back restores the list.
      const lettered = block.text.match(/^\(([a-z0-9]{1,3})\)\s+(.+)$/is);
      const numbered = block.text.match(/^(\d{1,2})\.\s+(.+)$/s);
      if (lettered) {
        out.push({
          type: "subitem",
          label: `(${lettered[1]})`,
          text: lettered[2].trim(),
          origin: "source",
          sourcePage: slide.n,
        });
      } else if (numbered) {
        out.push({
          type: "subitem",
          label: `${numbered[1]}.`,
          text: numbered[2].trim(),
          origin: "source",
          sourcePage: slide.n,
        });
      } else if ((block.level ?? 0) > 0) {
        out.push({
          type: "subitem",
          label: (block.level ?? 0) > 1 ? "◦" : "•",
          text: block.text,
          origin: "source",
          sourcePage: slide.n,
        });
      } else {
        out.push({ type: "paragraph", text: block.text, origin: "source", sourcePage: slide.n });
      }
      counts.source += 1;
    } else if (block.kind === "picture") {
      if (block.sha1 && isRejectedImage(block.sha1)) {
        counts.imageRejected += 1;
        continue;
      }
      const picture = slide.pictures.find((p) => p.sha1 === block.sha1);
      const assetId = picture ? await ensureAsset(db, deck, picture.asset, cache) : null;
      if (!assetId) {
        counts.imageMissing += 1;
        continue;
      }
      out.push({ type: "figure", assetId, origin: "source", sourcePage: slide.n });
      counts.image += 1;
    }
  }
  return out;
}

/** Everything the author wrote, wrapped around everything the deck said. */
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

  const seenImages = new Set();
  // A topic gathers slides the deck spread out, and the deck repeats itself
  // across them — slide 33 of Navigation is slide 31 again, word for word.
  // Said once is teaching; said twice on one page is a defect.
  const seenText = new Set();
  // A slide can carry more than one figure, so a note may be a single string or
  // one string per figure on that slide, in order.
  const noteFor = (page, index) => {
    const note = topic.diagramNotes?.[page];
    if (Array.isArray(note)) return note[index] ?? null;
    return index === 0 ? note ?? null : null;
  };

  for (const n of topic.pages) {
    let figureOnSlide = 0;
    const slide = manifest.slides[n - 1];
    if (!slide) throw new Error(`${subject.slug}: slide ${n} is not in the manifest`);
    for (const block of await slideBlocks(subject.deck, slide, cache, counts, topic.title)) {
      if (block.type === "figure") {
        // One diagram, once. A deck repeats a picture across the run of slides
        // that discuss it; a topic that gathers those slides would otherwise
        // print it four times down one page.
        if (seenImages.has(block.assetId)) {
          counts.imageRepeat += 1;
          continue;
        }
        seenImages.add(block.assetId);
        const note = noteFor(n, figureOnSlide);
        figureOnSlide += 1;
        blocks.push(note ? { ...block, caption: note } : block);
        continue;
      }
      if (block.type === "paragraph" || block.type === "subitem") {
        // Keyed on the words alone. The same sentence can arrive as a
        // paragraph on one slide and as a numbered subitem on another — the
        // Meteorology deck poses a question and then repeats it above the
        // answer — and a key including the block type would miss that.
        const key = `${block.title ?? ""}${block.text ?? ""}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "");
        if (key.length > 40) {
          if (seenText.has(key)) {
            counts.textRepeat += 1;
            continue;
          }
          // The deck also repeats itself inexactly: the same paragraph with a
          // sentence added the second time. Keep whichever version says more,
          // so the extra sentence is never the one that is dropped.
          let superseded = false;
          for (const seen of seenText) {
            if (seen.startsWith(key)) { superseded = true; break; }
            if (key.startsWith(seen)) {
              const at = blocks.findIndex(
                (b) =>
                  b.origin === "source" &&
                  `${b.title ?? ""}${b.text ?? ""}`
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
 * Proves the curriculum accounts for the whole deck.
 *
 * A slide may be claimed by exactly one topic, or listed in `skip` with a
 * reason. Anything else stops the build: an unclaimed slide is source material
 * that silently did not make it into the course, and a slide claimed twice is
 * a student reading the same thing in two places without being told why.
 */
function auditCoverage(subject, manifest) {
  const owner = new Map();
  const problems = [];

  for (const chapter of subject.chapters) {
    for (const topic of chapter.topics) {
      for (const n of topic.pages) {
        if (owner.has(n)) {
          problems.push(`slide ${n} is claimed by "${owner.get(n)}" and by "${topic.title}"`);
        }
        owner.set(n, topic.title);
      }
    }
  }

  for (const [n, reason] of Object.entries(subject.skip ?? {})) {
    if (owner.has(Number(n))) {
      problems.push(`slide ${n} is both claimed by "${owner.get(Number(n))}" and skipped`);
    }
    if (!reason || String(reason).trim().length < 12) {
      problems.push(`slide ${n} is skipped without a usable reason`);
    }
    owner.set(Number(n), "(skipped)");
  }

  for (const chapter of subject.chapters) {
    if (!chapter.syllabus?.length) {
      problems.push(`chapter "${chapter.title}" declares no syllabus coverage`);
    }
  }

  const missing = [];
  for (let n = 1; n <= manifest.total_slides; n += 1) if (!owner.has(n)) missing.push(n);
  if (missing.length) {
    problems.push(`${missing.length} source slide(s) claimed by no topic: ${missing.join(", ")}`);
  }

  const overrun = [...owner.keys()].filter((n) => n < 1 || n > manifest.total_slides);
  if (overrun.length) problems.push(`slide(s) outside the deck: ${overrun.join(", ")}`);

  return problems;
}

async function main() {
  const dry = process.argv.includes("--dry");
  const only = process.argv.includes("--subject")
    ? process.argv[process.argv.indexOf("--subject") + 1]
    : null;

  const course = await db.course.findUnique({ where: { slug: COURSE }, select: { id: true } });
  if (!course) throw new Error(`no ${COURSE} course — run the seed first`);

  const summary = [];
  const chosen = only ? SUBJECTS.filter((s) => s.slug === only) : SUBJECTS;
  if (only && chosen.length === 0) throw new Error(`no curriculum for subject "${only}"`);

  for (const subject of chosen) {
    const manifest = loadManifest(path.join(".cache/decks", subject.deck));
    const problems = auditCoverage(subject, manifest);
    if (problems.length) {
      throw new Error(`${subject.slug}: the curriculum does not account for the deck\n  - ${problems.join("\n  - ")}`);
    }

    // Looked up, never created: the subject row already exists in production
    // and its id is what entitlements and progress point at.
    const row = await db.subject.findFirst({
      where: { slug: subject.slug, course: { slug: COURSE } },
      select: { id: true },
    });
    if (!row) throw new Error(`no subject ${subject.slug} in ${COURSE}`);

    const counts = {
      source: 0, authored: 0, textRepeat: 0,
      image: 0, imageRepeat: 0, imageRejected: 0, imageMissing: 0,
      repairs: { asides: 0, joined: 0, callouts: 0, echoes: 0, strays: 0, tables: 0, urls: 0, labelled: 0, footers: 0 },
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
    if (dupes.length) {
      throw new Error(`${subject.slug}: duplicate topic slugs — ${[...new Set(dupes)].join(", ")}`);
    }

    // Resolve each chapter's declared syllabus codes to the item ids beneath
    // them. The items themselves carry codes but no titles, so a lesson is
    // mapped to the area it teaches rather than guessed against item text.
    let mappings = 0;
    const codes = [...new Set(subject.chapters.flatMap((c) => c.syllabus ?? []))];
    const syllabusTopics = await db.syllabusTopic.findMany({
      where: { subjectId: row.id, code: { in: codes } },
      select: { code: true, items: { select: { id: true } } },
    });
    const itemsByCode = new Map(syllabusTopics.map((t) => [t.code, t.items.map((i) => i.id)]));
    const unknown = codes.filter((c) => !itemsByCode.has(c));
    if (unknown.length) {
      throw new Error(`${subject.slug}: syllabus code(s) not in this subject — ${unknown.join(", ")}`);
    }
    for (const [i, chapter] of subject.chapters.entries()) {
      built[i].itemIds = (chapter.syllabus ?? []).flatMap((c) => itemsByCode.get(c) ?? []);
    }

    const empty = built.filter((c) => c.lessons.length === 0).map((c) => c.title);
    if (empty.length) throw new Error(`${subject.slug}: empty chapter(s) — ${empty.join(", ")}`);
    const hollow = built.flatMap((c) => c.lessons.filter((l) => l.blocks.length === 0).map((l) => l.title));
    if (hollow.length) throw new Error(`${subject.slug}: topic(s) with no content — ${hollow.join(", ")}`);

    if (!dry) {
      // The whole subject is rebuilt in one transaction: a half-written course
      // is worse than the old one. Only this subject's chapters and topics are
      // replaced — the subject row, the course row, products and entitlements
      // are not touched.
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
              const created = await tx.lesson.create({
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
                select: { id: true },
              });
              // Rebuilding a subject deletes its lessons, and the syllabus
              // mappings go with them. They are rewritten here from the
              // curriculum's own declaration so the index never spends time
              // pointing at nothing.
              const items = chapter.itemIds ?? [];
              if (items.length) {
                await tx.lessonSyllabusItem.createMany({
                  data: items.map((syllabusItemId) => ({
                    lessonId: created.id,
                    syllabusItemId,
                    status: "CONFIRMED",
                  })),
                  skipDuplicates: true,
                });
                mappings += items.length;
              }
            }
          }
        },
        { timeout: 180_000 },
      );
    }

    summary.push({
      subject: subject.title,
      slides: manifest.total_slides,
      claimed: manifest.total_slides - Object.keys(subject.skip ?? {}).length,
      skipped: Object.keys(subject.skip ?? {}).length,
      chapters: built.length,
      topics: built.reduce((n, c) => n + c.lessons.length, 0),
      sourceBlocks: counts.source,
      authoredBlocks: counts.authored,
      diagrams: counts.image,
      diagramsRejected: counts.imageRejected,
      diagramRepeats: counts.imageRepeat,
      repeatedText: counts.textRepeat,
      calloutsRemoved: counts.repairs.callouts,
      asidesRemoved: counts.repairs.asides,
      linesJoined: counts.repairs.joined,
      headingEchoes: counts.repairs.echoes,
      strayLabels: counts.repairs.strays,
      tablesRebuilt: counts.repairs.tables,
      syllabusMappings: mappings,
      termsLabelled: counts.repairs.labelled,
      footersStripped: counts.repairs.footers,
    });
  }

  console.table(summary);
  if (dry) console.log("\ndry run — nothing written");
  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
