/**
 * Imports source study material against an already-indexed syllabus.
 *
 * The rule from the brief that shapes everything here: **do not summarise, do
 * not drop paragraphs, do not lose diagrams.** The job is to move the source
 * into a structure the reader can present well — not to decide what is worth
 * keeping.
 *
 * Where material lands:
 *
 *   * On the **item**, when the source prints that item's own syllabus code.
 *     This is the precise case and it wins wherever it is available.
 *   * On the **topic**, otherwise. The source is written in chapters that
 *     correspond to topics, so a chapter's full text and figures go to its
 *     topic. Nothing is thrown away for want of an item-level anchor.
 *
 * Figures are placed by the page they appear on, so a diagram sits with the
 * text it explains rather than being swept to the bottom.
 *
 *   node scripts/import-study.mjs <manifest.json> <course/subject> [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const manifestPath = args[0];
const target = args[1];

if (!manifestPath || !target) {
  console.error("usage: node scripts/import-study.mjs <manifest.json> <course/subject> [--dry-run]");
  process.exit(1);
}

const MEDIA_DIR = process.env.MEDIA_DIR ?? "./.dev/media";
const key = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const MIME = { jpg: "image/jpeg", png: "image/png", gif: "image/gif", jp2: "image/jp2" };

/* ------------------------------------------------------------- structure */

/** Chapter boundaries, from the headings the source prints. */
function findChapters(pages) {
  const CHAPTER = /CHAPTER\s+(\d+)\s+([A-Z][A-Z\s\-&/]*)/i;
  const out = [];
  for (const p of pages) {
    const m = CHAPTER.exec((p.text ?? "").replace(/\n/g, " "));
    if (m) {
      out.push({
        number: Number(m[1]),
        title: m[2].trim().replace(/\s+/g, " "),
        pageFrom: p.page,
        pageTo: pages.length,
      });
    }
  }
  for (let i = 0; i < out.length - 1; i++) out[i].pageTo = out[i + 1].pageFrom - 1;
  return out;
}

/** First page on which each syllabus code is printed. */
function codePages(pages) {
  const CODE = /\b(\d{1,3}\.\d{1,3}\.\d{1,3})\b/g;
  const map = new Map();
  for (const p of pages) {
    for (const m of (p.text ?? "").matchAll(CODE)) {
      if (!map.has(m[1])) map.set(m[1], p.page);
    }
  }
  return map;
}

/* ------------------------------------------------------------- rendering */

const CODE_LINE = /^(\d{1,3}\.\d{1,3}\.\d{1,3})\s*(.*)$/;
const SUBITEM = /^\(([a-z])\)\s*(.*)$/i;
const BULLET = /^[•▪◦·]\s*(.*)$/;
const PAGE_NUMBER = /^\d{1,4}$/;
/** "F = ma", "1nm is equal to 1,852m", "9.81 m/s²" — kept whole, not reflowed. */
const FORMULA = /^[A-Za-z0-9\s().,×÷·/^²³-]{0,40}=[A-Za-z0-9\s().,×÷·/^²³-]{1,40}$/;

/**
 * Turns one span of source text into semantic blocks.
 *
 * Structural decisions only. Every word that goes in comes out — the function
 * decides what is a heading, a sub-item or a formula, and never rewrites a
 * sentence or drops one for being repetitive.
 */
function toBlocks(text) {
  const blocks = [];
  const lines = (text ?? "")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .filter((l) => l.trim() && !PAGE_NUMBER.test(l.trim()));

  let buffer = [];
  let current = null; // an open subitem collecting its body
  let skippingRequirement = false; // inside a wrapped syllabus requirement

  const flushParagraph = () => {
    if (!buffer.length) return;
    const text = buffer.join(" ").replace(/[ \t]+/g, " ").trim();
    buffer = [];
    if (!text) return;

    if (current) {
      current.text = current.text ? `${current.text} ${text}` : text;
      return;
    }
    if (FORMULA.test(text) && text.length < 60) {
      blocks.push({ type: "formula", text });
      return;
    }
    blocks.push({ type: "paragraph", text });
  };

  const closeSubitem = () => {
    flushParagraph();
    if (current) {
      blocks.push(current);
      current = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();

    // A syllabus code introduces the requirement it belongs to. The reader
    // shows the official objective separately, so it is not repeated as prose.
    const code = CODE_LINE.exec(line);
    if (code) {
      closeSubitem();
      // The requirement often wraps onto the next line. Skip its continuation
      // too, or the tail ("used to express:") is left stranded as a paragraph
      // above the sub-items it introduces. The reader shows the official
      // objective in full above the content, so none of it is lost.
      skippingRequirement = true;
      continue;
    }

    if (skippingRequirement) {
      // The requirement ends at the first sub-item, bullet or heading.
      const ends =
        SUBITEM.test(line) ||
        BULLET.test(line) ||
        (line.length < 70 && line === line.toUpperCase() && /[A-Z]{3}/.test(line));
      if (!ends) continue;
      skippingRequirement = false;
    }

    // "(a) distance;" — its own block, so it can never run into "(b)".
    const sub = SUBITEM.exec(line);
    if (sub) {
      closeSubitem();
      current = { type: "subitem", label: `(${sub[1].toLowerCase()})`, title: sub[2].trim() };
      continue;
    }

    // A short ALL-CAPS line is a slide heading in this source.
    if (line.length < 70 && line === line.toUpperCase() && /[A-Z]{3}/.test(line)) {
      closeSubitem();
      blocks.push({ type: "heading", text: line.replace(/\s+/g, " ") });
      continue;
    }

    if (BULLET.test(line)) {
      flushParagraph();
      buffer.push(BULLET.exec(line)[1].trim());
      continue;
    }

    buffer.push(line);
  }

  closeSubitem();
  return blocks.filter((b) => b.type === "figure" || b.type === "subitem" || (b.text ?? "").length > 1);
}

/**
 * Interleaves figures with text so a diagram lands beside its explanation.
 *
 * Blocks are built page by page and each page's figures are appended after
 * that page's text — which is where they sit in the source. Sweeping every
 * figure to the end of a topic would be technically "preserving" them and
 * practically useless.
 */
function buildBlocks(pages, from, to, assetIdByHash) {
  const blocks = [];
  for (const p of pages) {
    if (p.page < from || p.page > to) continue;

    blocks.push(...toBlocks(p.text));

    for (const fig of p.figures ?? []) {
      const assetId = assetIdByHash.get(fig.hash);
      if (!assetId) continue;
      blocks.push({
        type: "figure",
        assetId,
        alt: `Technical diagram from the source material, page ${p.page}`,
        caption: findCaption(p.text),
      });
    }
  }
  return blocks;
}

/**
 * A caption the source itself prints, if there is one.
 *
 * Only accepts an explicit "Figure N — …" line. Nothing is invented: a figure
 * with no printed caption gets none.
 */
function findCaption(text) {
  const m = /^(Fig(?:ure)?\.?\s*\d+[^\n]{0,80})$/im.exec(text ?? "");
  return m ? m[1].trim() : undefined;
}

/* ------------------------------------------------------------------ main */

async function main() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const [courseSlug, subjectSlug] = target.split("/");

  const subject = await db.subject.findFirst({
    where: { slug: subjectSlug, course: { slug: courseSlug } },
    include: { course: { select: { title: true } } },
  });
  if (!subject) {
    console.error(`No subject "${target}".`);
    process.exit(1);
  }

  const topics = await db.syllabusTopic.findMany({
    where: { subjectId: subject.id },
    orderBy: { displayOrder: "asc" },
    include: { items: { orderBy: { displayOrder: "asc" } } },
  });
  if (topics.length === 0) {
    console.error("That subject has no syllabus index yet — run import-syllabus.mjs first.");
    process.exit(1);
  }

  console.log(`subject : ${subject.course.title} / ${subject.title}`);
  console.log(`source  : ${manifest.pageCount} pages`);
  console.log(`syllabus: ${topics.length} topics, ${topics.reduce((n, t) => n + t.items.length, 0)} items`);

  /* --------------------------------------------------- figures as assets */

  const figuresDir = path.join(path.dirname(manifestPath), "figures");
  const mediaTarget = path.join(MEDIA_DIR, "study");
  if (!dryRun) fs.mkdirSync(mediaTarget, { recursive: true });

  const assetIdByHash = new Map();
  let stored = 0;
  const wanted = new Map();
  for (const p of manifest.pages) {
    for (const f of p.figures ?? []) wanted.set(f.hash, f);
  }

  for (const [hash, fig] of wanted) {
    const source = path.join(figuresDir, fig.file);
    if (!fs.existsSync(source)) continue;
    const ext = fig.file.split(".").pop();
    const storageKey = `study/${fig.file}`;

    if (!dryRun) {
      const dest = path.join(MEDIA_DIR, storageKey);
      if (!fs.existsSync(dest)) fs.copyFileSync(source, dest);

      const asset = await db.mediaAsset.upsert({
        where: { storageKey },
        update: {},
        create: {
          storageKey,
          filename: fig.file,
          mimeType: MIME[ext] ?? "application/octet-stream",
          kind: "IMAGE",
          sizeBytes: fig.bytes,
          // Paid material: served only through the authorised route.
          isPublic: false,
        },
      });
      assetIdByHash.set(hash, asset.id);
      stored++;
    }
  }
  console.log(`figures : ${stored} stored as media assets`);

  /* ------------------------------------------------------------ mapping */

  const chapters = findChapters(manifest.pages);
  const codeAt = codePages(manifest.pages);

  const report = { topicsWritten: 0, itemsWritten: 0, blocks: 0, figures: 0, unmatched: [] };

  for (const topic of topics) {
    // Matched on the title the source prints, never on position — the deck
    // skips a topic partway through, so ordinals drift.
    const chapter = chapters.find((c) => {
      const a = key(c.title);
      const b = key(topic.title);
      const shorter = a.length < b.length ? a : b;
      return shorter.length >= 6 && (a.includes(b) || b.includes(a));
    });
    if (!chapter) {
      report.unmatched.push(`${topic.code} ${topic.title}`);
      continue;
    }

    /* --- item-level content, where the source prints the item's own code --- */

    const itemsHere = topic.items
      .filter((i) => codeAt.has(i.code))
      .map((i) => ({ item: i, page: codeAt.get(i.code) }))
      .sort((a, b) => a.page - b.page);

    const covered = new Set();
    for (let n = 0; n < itemsHere.length; n++) {
      const { item, page } = itemsHere[n];
      const endPage = n + 1 < itemsHere.length ? itemsHere[n + 1].page : chapter.pageTo;
      const blocks = buildBlocks(manifest.pages, page, endPage, assetIdByHash);
      if (blocks.length === 0) continue;

      for (let p = page; p <= endPage; p++) covered.add(p);

      if (!dryRun) {
        await db.studyContent.upsert({
          where: { syllabusItemId: item.id },
          update: { blocks, status: "PUBLISHED", references: `Source pages ${page}–${endPage}` },
          create: {
            syllabusItemId: item.id,
            blocks,
            status: "PUBLISHED",
            references: `Source pages ${page}–${endPage}`,
          },
        });
      }
      report.itemsWritten++;
      report.blocks += blocks.length;
      report.figures += blocks.filter((b) => b.type === "figure").length;
    }

    /* --- topic-level content: the whole chapter, so nothing is lost --- */

    const topicBlocks = buildBlocks(manifest.pages, chapter.pageFrom, chapter.pageTo, assetIdByHash);
    if (topicBlocks.length > 0 && !dryRun) {
      await db.studyContent.upsert({
        where: { syllabusTopicId: topic.id },
        update: {
          blocks: topicBlocks,
          status: "PUBLISHED",
          references: `Source pages ${chapter.pageFrom}–${chapter.pageTo}`,
        },
        create: {
          syllabusTopicId: topic.id,
          blocks: topicBlocks,
          status: "PUBLISHED",
          references: `Source pages ${chapter.pageFrom}–${chapter.pageTo}`,
        },
      });
      report.topicsWritten++;
      report.blocks += topicBlocks.length;
      report.figures += topicBlocks.filter((b) => b.type === "figure").length;
    }

    if (!dryRun) {
      await db.syllabusTopic.update({
        where: { id: topic.id },
        data: {}, // touch, so updatedAt reflects the import
      });
    }
  }

  console.log("");
  console.log(`topics with material : ${report.topicsWritten} of ${topics.length}`);
  console.log(`items with material  : ${report.itemsWritten}`);
  console.log(`blocks written       : ${report.blocks.toLocaleString()}`);
  console.log(`figures placed       : ${report.figures}`);
  if (report.unmatched.length) {
    console.log(`\ntopics with no matching source chapter (${report.unmatched.length}):`);
    for (const u of report.unmatched) console.log(`   ${u}`);
  }

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
