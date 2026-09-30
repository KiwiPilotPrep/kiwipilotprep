/**
 * Builds a PPL subject from a curriculum, not from the shape of the source.
 *
 * The sibling of scripts/build-cpl-course.mjs and scripts/build-ir-course.mjs,
 * and it works the same way for the same reason. What is different here is the
 * subject it was written for.
 *
 * Aircraft Technical Knowledge never had a course. The other five PPL subjects
 * arrived as lecture decks, were extracted and imported, and came out the far
 * end as chapters and lessons. ATK's material was attached to the CAA syllabus
 * rows themselves, so the subject had forty-two published syllabus topics, two
 * hundred and ten items, fourteen fragments of study content, no chapters and
 * no lessons. A student who had paid for PPL theory opened Aircraft Technical
 * Knowledge and was handed the regulator's checklist. That is what this
 * replaces.
 *
 * `content/ppl/aircraft-technical-knowledge.mjs` declares the chapters and
 * topics a student should meet, in teaching order, and each topic names the
 * source pages it is built from. The builder then:
 *
 *   - pulls those pages' text and diagrams out of the extracted manifest,
 *     verbatim and in order, so no source knowledge is rewritten or lost;
 *   - repairs what the PDF broke — see content/ppl/source-repairs.mjs — which
 *     removes, rejoins and re-assembles, and never rewrites;
 *   - turns the twelve figures the PDF stores upside down the right way up;
 *   - drops the images a person has looked at and rejected, by SHA-1, with the
 *     reason recorded in content/ppl/diagram-decisions.mjs;
 *   - wraps it all in the authored teaching apparatus — what this topic is for,
 *     what to hold on to, where people go wrong;
 *   - tags every block with where it came from, so source and enrichment stay
 *     distinguishable for the life of the record;
 *   - refuses to finish if any source page is unclaimed or claimed twice.
 *
 * Production identity is never touched: the course row, the subject rows and
 * their ids and slugs are looked up, never created and never renamed, so
 * entitlements keyed by `course:<id>` and `subject:<id>` keep working and every
 * existing route keeps resolving.
 *
 *   node scripts/build-ppl-course.mjs [--dry] [--subject <slug>]
 *   node scripts/build-ppl-course.mjs --content-only
 *
 * `--content-only` is the polish pass: it recomputes every block and writes it
 * into the lessons that already exist, matched by slug, after checking that the
 * course structure has not drifted. No chapter, lesson, mapping or progress row
 * is created or deleted, and no id changes — which is what makes it safe to run
 * against a course students may already be reading.
 */
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

import { loadManifest } from "./deck-index.mjs";
import { ensureAsset, DECKS_ROOT } from "./media-assets.mjs";
import {
  isRejectedImage as atkRejectsImage,
  isUpsideDown as atkUpsideDown,
} from "../content/ppl/diagram-decisions.mjs";
import { repairPage as atkRepairPage } from "../content/ppl/source-repairs.mjs";
import { SUBJECTS } from "../content/ppl/index.mjs";

/**
 * The repair set and the diagram decisions belong to the subject, not to the
 * builder. Aircraft Technical Knowledge was finished before the other five
 * were started and its modules are left exactly as they were; every subject
 * written since carries its own on the curriculum object.
 */
function toolingFor(subject) {
  if (subject.slug === "aircraft-technical-knowledge") {
    return {
      repair: (blocks, context) => atkRepairPage(blocks, context),
      rejects: atkRejectsImage,
      rotated: atkUpsideDown,
    };
  }
  if (!subject.repairSlide) throw new Error(`${subject.slug}: no repair set declared`);
  return {
    repair: (blocks, context) => subject.repairSlide(blocks, context),
    rejects: subject.isRejectedImage ?? (() => false),
    rotated: subject.isUpsideDown ?? (() => false),
  };
}

const db = new PrismaClient();
const COURSE = "ppl-theory";

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
 * The file to store for one picture, turning it the right way up if it is one
 * of the figures the PDF holds upside down.
 *
 * The corrected copy goes in `derived/`, never in `assets/`. The extractor's
 * output is checked file-for-file against the manifest by tests/ppl-phase1.mjs
 * — every file present must be a figure the manifest names — so a build that
 * wrote a corrected copy in there would look exactly like an extraction that
 * had produced a file from nowhere. The name is derived from the same content
 * hash, so it is produced once and is stable across runs.
 *
 * Returns the name to store it under and the file to read the bytes from.
 */
async function fileFor(deck, picture, isRotated) {
  if (!isRotated(picture.sha1)) return { asset: picture.asset, sourcePath: undefined };

  const assets = path.join(DECKS_ROOT, deck, "assets");
  const derived = path.join(DECKS_ROOT, deck, "derived");
  const ext = picture.asset.split(".").pop().toLowerCase();
  const rotated = `${picture.sha1}-r180.${ext}`;
  const target = path.join(derived, rotated);
  if (!fs.existsSync(target)) {
    const source = path.join(assets, picture.asset);
    if (!fs.existsSync(source)) return { asset: picture.asset, sourcePath: undefined };
    fs.mkdirSync(derived, { recursive: true });
    await sharp(source).rotate(180).toFile(target);
  }
  return { asset: rotated, sourcePath: target };
}

/**
 * The source blocks for one page, in the order the page presented them.
 *
 * Text and pictures interleave exactly as they did in the book, which is what
 * puts a diagram beside the paragraph that explains it without anyone having to
 * decide where it goes.
 */
async function pageBlocks(deck, slide, cache, counts, topicTitle, tooling, previousTitle, chapterTitle) {
  const out = [];

  const { blocks: repaired, counts: repairs } = tooling.repair(slide.blocks, {
    // The two vocabularies the repair sets use: the book calls them pages, the
    // decks call them slides. Both are passed so neither module has to know
    // which kind of source it is being run against.
    pageTitle: slide.title,
    slideTitle: slide.title,
    topicTitle,
    chapterTitle,
    previousTitle,
    page: slide.n,
    slide: slide.n,
    deck,
  });
  for (const [kind, n] of Object.entries(repairs)) {
    counts.repairs[kind] = (counts.repairs[kind] ?? 0) + n;
  }

  for (const block of repaired) {
    if (block.kind === "heading") {
      out.push({ type: "subheading", text: block.text, origin: "source", sourcePage: slide.n });
      counts.source += 1;
    } else if (block.kind === "formula") {
      out.push({ type: "formula", text: block.text, origin: "source", sourcePage: slide.n });
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
    } else if (block.kind === "term") {
      out.push({
        type: "subitem",
        label: "•",
        title: block.label,
        text: block.text,
        origin: "source",
        sourcePage: slide.n,
      });
      counts.source += 1;
    } else if (block.kind === "table") {
      const [headers, ...rows] = block.rows;
      if (rows.length === 0) {
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
      // "(a) something", "1. something" and the book's own "➢ something" are
      // list items it wrote as paragraphs; giving them their label back
      // restores the list.
      const text = block.text.replace(/^\s*[➢]\s*/, "");
      const bulleted = /^\s*[➢]/.test(block.text);
      const lettered = text.match(/^\(([a-z0-9]{1,3})\)\s+(.+)$/is);
      const numbered = text.match(/^(\d{1,2})\.\s+(.+)$/s);
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
      } else if (bulleted || (block.level ?? 0) > 0) {
        out.push({
          type: "subitem",
          label: (block.level ?? 0) > 1 ? "◦" : "•",
          text: text.trim(),
          origin: "source",
          sourcePage: slide.n,
        });
      } else {
        out.push({ type: "paragraph", text: text.trim(), origin: "source", sourcePage: slide.n });
      }
      counts.source += 1;
    } else if (block.kind === "picture") {
      if (block.sha1 && tooling.rejects(block.sha1)) {
        counts.imageRejected += 1;
        continue;
      }
      const picture = slide.pictures.find((p) => p.sha1 === block.sha1);
      if (!picture) {
        counts.imageMissing += 1;
        continue;
      }
      const { asset, sourcePath } = await fileFor(deck, picture, tooling.rotated);
      if (asset !== picture.asset) counts.imageRotated += 1;
      const assetId = await ensureAsset(db, deck, asset, cache, { sourcePath });
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

/** Everything the author wrote, wrapped around everything the book said. */
async function topicBlocks(subject, topic, manifest, cache, counts, tooling, chapterTitle) {
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
  const seenText = new Set();
  // A page can carry more than one figure, so a note may be a single string or
  // one string per figure on that page, in order.
  const noteFor = (page, index) => {
    const note = topic.diagramNotes?.[page];
    if (Array.isArray(note)) return note[index] ?? null;
    return index === 0 ? note ?? null : null;
  };

  // A run of pages under one heading — "OPERATIONAL ASPECTS" carries three of
  // them in the carburettor icing chapter — would otherwise print that heading
  // once per page down a single topic.
  let lastHeading = null;
  // The title of the slide before this one, so a run of slides sharing one
  // heading prints it once.
  let previousTitle = "";

  for (const n of topic.pages) {
    let figureOnPage = 0;
    const slide = manifest.slides[n - 1];
    if (!slide) throw new Error(`${subject.slug}: page ${n} is not in the manifest`);
    const titleHere = String(slide.title ?? "").trim();
    for (const block of await pageBlocks(
      subject.deck, slide, cache, counts, topic.title, tooling, previousTitle, chapterTitle,
    )) {
      if (block.type === "subheading") {
        const key = block.text.toLowerCase().replace(/[^a-z0-9]+/g, "");
        if (key === lastHeading) {
          counts.repairs.headings -= 1;
          continue;
        }
        lastHeading = key;
      }
      if (block.type === "figure") {
        // One diagram, once. The book repeats a picture across the run of pages
        // that discuss it; a topic that gathers those pages would otherwise
        // print it four times down one page.
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
        const key = `${block.title ?? ""}${block.text ?? ""}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "");
        if (key.length > 40) {
          if (seenText.has(key)) {
            counts.textRepeat += 1;
            continue;
          }
          // The book also repeats itself inexactly: the same paragraph with a
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
    previousTitle = titleHere;
  }

  if (topic.keyPoints?.length) add({ type: "keypoints", items: topic.keyPoints });
  if (topic.example) add({ type: "example", title: topic.exampleTitle ?? "Worked example", text: topic.example });
  if (topic.context) add({ type: "context", text: topic.context });
  if (topic.misconception) add({ type: "misconception", text: topic.misconception });
  if (topic.takeaway) add({ type: "takeaway", text: topic.takeaway });

  return blocks;
}

/**
 * Proves the curriculum accounts for the whole source.
 *
 * A page may be claimed by exactly one topic, or listed in `skip` with a
 * reason. Anything else stops the build: an unclaimed page is source material
 * that silently did not make it into the course, and a page claimed twice is a
 * student reading the same thing in two places without being told why.
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

  for (const [n, reason] of Object.entries(subject.skip ?? {})) {
    if (owner.has(Number(n))) {
      problems.push(`page ${n} is both claimed by "${owner.get(Number(n))}" and skipped`);
    }
    if (!reason || String(reason).trim().length < 12) {
      problems.push(`page ${n} is skipped without a usable reason`);
    }
    owner.set(Number(n), "(skipped)");
  }

  // Every chapter names the syllabus areas it teaches, so a lesson is mapped to
  // an area rather than guessed at. There was an escape hatch here for a
  // subject with no syllabus to map to, which Human Factors used while Subject
  // No. 10 was missing from the supplied AC61-3 pages. It has been imported
  // from the CAA's own copy of that document, every PPL subject has a syllabus
  // again, and the exemption is gone with the reason for it.
  for (const chapter of subject.chapters) {
    if (!chapter.syllabus?.length) {
      problems.push(`chapter "${chapter.title}" declares no syllabus coverage`);
    }
  }

  const missing = [];
  for (let n = 1; n <= manifest.total_slides; n += 1) if (!owner.has(n)) missing.push(n);
  if (missing.length) {
    problems.push(`${missing.length} source page(s) claimed by no topic: ${missing.join(", ")}`);
  }

  const overrun = [...owner.keys()].filter((n) => n < 1 || n > manifest.total_slides);
  if (overrun.length) problems.push(`page(s) outside the source: ${overrun.join(", ")}`);

  return problems;
}

async function main() {
  const dry = process.argv.includes("--dry");
  // Rewrites the content of the existing lessons and nothing else. See below.
  const contentOnly = process.argv.includes("--content-only");
  const only = process.argv.includes("--subject")
    ? process.argv[process.argv.indexOf("--subject") + 1]
    : null;

  const course = await db.course.findUnique({ where: { slug: COURSE }, select: { id: true } });
  if (!course) throw new Error(`no ${COURSE} course — run the seed first`);

  const summary = [];
  const chosen = only ? SUBJECTS.filter((s) => s.slug === only) : SUBJECTS;
  if (only && chosen.length === 0) throw new Error(`no curriculum for subject "${only}"`);

  for (const subject of chosen) {
    const manifest = loadManifest(path.join(DECKS_ROOT, subject.deck));
    const problems = auditCoverage(subject, manifest);
    if (problems.length) {
      throw new Error(
        `${subject.slug}: the curriculum does not account for the source\n  - ${problems.join("\n  - ")}`,
      );
    }

    // Looked up, never created: the subject row already exists in production
    // and its id is what entitlements and progress point at.
    const row = await db.subject.findFirst({
      where: { slug: subject.slug, course: { slug: COURSE } },
      select: { id: true },
    });
    if (!row) throw new Error(`no subject ${subject.slug} in ${COURSE}`);

    const tooling = toolingFor(subject);
    const counts = {
      source: 0, authored: 0, textRepeat: 0,
      image: 0, imageRepeat: 0, imageRejected: 0, imageMissing: 0, imageRotated: 0,
      repairs: {},
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
          // A topic with no pages is one the book does not teach — airframe
          // materials, reduction gearing — written here because the syllabus
          // examines it and the source is silent. It has no source range to
          // record, and `null` is the honest value: a range of 0–0 would
          // claim a provenance it does not have.
          sourceFrom: topic.pages.length ? Math.min(...topic.pages) : null,
          sourceTo: topic.pages.length ? Math.max(...topic.pages) : null,
          blocks: await topicBlocks(subject, topic, manifest, cache, counts, tooling, chapter.title),
        });
      }
      built.push({
        title: chapter.title,
        summary: chapter.intro ?? null,
        displayOrder: chapterIndex * 10,
        syllabus: chapter.syllabus ?? [],
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
    // them, so a lesson is mapped to the area it teaches rather than guessed
    // against item text.
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

    if (contentOnly) {
      // A polish pass. The course structure is already right and its rows are
      // what progress, mappings and every URL point at, so nothing is deleted
      // and no id moves: only the blocks inside each lesson are rewritten. The
      // structure is compared first and the run refuses if it has drifted,
      // because rewriting content into a course whose shape has changed would
      // put the wrong words under the wrong title.
      const existing = await db.courseModule.findMany({
        where: { subjectId: row.id },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true, title: true,
          lessons: { orderBy: { displayOrder: "asc" }, select: { id: true, slug: true, title: true } },
        },
      });
      const drift = [];
      if (existing.length !== built.length) {
        drift.push(`${existing.length} chapters in the database, ${built.length} in the curriculum`);
      }
      for (const [i, chapter] of built.entries()) {
        const there = existing[i];
        if (!there) break;
        if (there.title !== chapter.title) drift.push(`chapter ${i + 1}: "${there.title}" vs "${chapter.title}"`);
        if (there.lessons.length !== chapter.lessons.length) {
          drift.push(`chapter ${i + 1} has ${there.lessons.length} topics, the curriculum has ${chapter.lessons.length}`);
          continue;
        }
        for (const [j, lesson] of chapter.lessons.entries()) {
          if (there.lessons[j].slug !== lesson.slug) {
            drift.push(`chapter ${i + 1} topic ${j + 1}: "${there.lessons[j].slug}" vs "${lesson.slug}"`);
          }
        }
      }
      if (drift.length) {
        throw new Error(
          `${subject.slug}: --content-only cannot run, the structure has changed\n  - ${drift.join("\n  - ")}\n` +
            "Run the build without --content-only to rebuild the course.",
        );
      }

      let updated = 0;
      await db.$transaction(
        async (tx) => {
          for (const [i, chapter] of built.entries()) {
            for (const [j, lesson] of chapter.lessons.entries()) {
              const target = existing[i].lessons[j];
              await tx.studyContent.upsert({
                where: { lessonId: target.id },
                update: { blocks: lesson.blocks },
                create: { lessonId: target.id, blocks: lesson.blocks },
              });
              updated += 1;
            }
          }
        },
        { timeout: 180_000 },
      );
      console.log(`content-only: rewrote the blocks of ${updated} lessons; no row was created or deleted`);
    } else if (!dry) {
      // The whole subject is written in one transaction: a half-written course
      // is worse than no course. Only this subject's chapters and topics are
      // replaced — the subject row, the course row, products and entitlements
      // are not touched.
      await db.$transaction(
        async (tx) => {
          await tx.courseModule.deleteMany({ where: { subjectId: row.id } });
          for (const chapter of built) {
            const chapterRow = await tx.courseModule.create({
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
                  moduleId: chapterRow.id,
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
              //
              // Each link records what it was made on. That is not a guess a
              // matcher made about the words in a lesson — it is the chapter
              // saying, in the curriculum module, which syllabus areas it
              // teaches — and the evidence string says so, so that a reviewer
              // reading the admin console can tell the two apart.
              const items = chapter.itemIds ?? [];
              if (items.length) {
                const why =
                  `Declared in content/ppl/${subject.slug}.mjs: the chapter ` +
                  `"${chapter.title}" teaches syllabus ${chapter.syllabus.length === 1 ? "area" : "areas"} ` +
                  `${chapter.syllabus.join(", ")}, and this lesson is one of its topics.`;
                await tx.lessonSyllabusItem.createMany({
                  data: items.map((syllabusItemId) => ({
                    lessonId: created.id,
                    syllabusItemId,
                    status: "CONFIRMED",
                    method: "authored",
                    confidence: 1,
                    evidence: why,
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
      pages: manifest.total_slides,
      claimed: manifest.total_slides - Object.keys(subject.skip ?? {}).length,
      skipped: Object.keys(subject.skip ?? {}).length,
      chapters: built.length,
      topics: built.reduce((n, c) => n + c.lessons.length, 0),
      sourceBlocks: counts.source,
      authoredBlocks: counts.authored,
      diagrams: counts.image,
      diagramsRejected: counts.imageRejected,
      diagramsRotated: counts.imageRotated,
      diagramRepeats: counts.imageRepeat,
      diagramsMissing: counts.imageMissing,
      repeatedText: counts.textRepeat,
      headingsKept: counts.repairs.headings,
      headingEchoes: counts.repairs.echoes,
      linesJoined: counts.repairs.joined,
      calloutsRemoved: counts.repairs.callouts,
      footersStripped: counts.repairs.footers,
      tablesRebuilt: counts.repairs.tables,
      bulletsRestored: counts.repairs.bullets,
      objectivesStripped: counts.repairs.objectives,
      formulasRebuilt: counts.repairs.formulas,
      syllabusMappings: mappings,
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
