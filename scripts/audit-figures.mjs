/**
 * Looks at every diagram in a course and reports the ones that teach nothing.
 *
 * A PDF extractor cannot tell a wing-section drawing from the academy's logo:
 * both are just images on a page. So the course carries whatever the manual
 * carried — including the crest printed in the corner of forty pages, the grey
 * rectangle left behind by a cropped photo, and the same chart pasted three
 * times because the author repeated a slide.
 *
 * This reports them by evidence rather than deleting anything:
 *
 *   BRANDING   the same image on many pages of a manual — a logo or a border
 *   DUPLICATE  the same image more than once inside one topic
 *   BLANK      almost no ink on it: a solid block or an extraction artefact
 *   TINY       too few pixels to carry a readable label
 *
 * Nothing here is a judgement about a diagram's subject. An image that appears
 * on forty pages of an aviation manual is furniture whatever it depicts, and
 * one that is 30×30 pixels cannot be read whatever it depicts.
 *
 *   node scripts/audit-figures.mjs --course ir-theory [--json out.json]
 */
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/** Assets live outside the web root; `storageKey` is relative to this. */
const MEDIA_DIR = process.env.MEDIA_DIR ?? "./.dev/media";
const fileOf = (asset) => path.join(MEDIA_DIR, asset.storageKey);

/** On this many distinct topics, an image is page furniture. */
const BRANDING_TOPICS = 8;
/** Below this, no label on a technical diagram is legible. */
const TINY_PIXELS = 120 * 120;
/**
 * Below this share of pixels carrying ink, there is nothing on the image.
 *
 * Measured against the image's own background rather than against white: these
 * come off scanned pages, and a page is mostly background by area. An early
 * version of this check asked how many pixels shared the commonest colour,
 * which called every diagram on white paper blank.
 */
const MIN_INK = 0.005;
/** How far a pixel must sit from the background before it counts as ink. */
const INK_DISTANCE = 24;

const arg = (name) => {
  const at = process.argv.indexOf(name);
  return at > -1 ? process.argv[at + 1] : null;
};

/** Width and height from the file's own header, without decoding it. */
function dimensions(file) {
  const fd = fs.openSync(file, "r");
  const head = Buffer.alloc(32);
  fs.readSync(fd, head, 0, 32, 0);

  try {
    if (head[0] === 0x89 && head.subarray(1, 4).toString() === "PNG") {
      return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
    }
    if (head[0] === 0xff && head[1] === 0xd8) {
      // Walk the JPEG segments to the frame header.
      const size = fs.fstatSync(fd).size;
      const buf = Buffer.alloc(Math.min(size, 512 * 1024));
      fs.readSync(fd, buf, 0, buf.length, 0);
      let at = 2;
      while (at < buf.length - 9) {
        if (buf[at] !== 0xff) { at += 1; continue; }
        const marker = buf[at + 1];
        const length = buf.readUInt16BE(at + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buf.readUInt16BE(at + 5), width: buf.readUInt16BE(at + 7) };
        }
        at += 2 + length;
      }
    }
    if (head.subarray(0, 3).toString() === "GIF") {
      return { width: head.readUInt16LE(6), height: head.readUInt16LE(8) };
    }
  } catch {
    /* falls through to unknown */
  } finally {
    fs.closeSync(fd);
  }
  return null;
}

/**
 * The share of the image that carries ink — anything not the background.
 *
 * Needs a decode, so it runs only on images that are otherwise suspicious or
 * small; a course carries a couple of thousand of these.
 */
async function inkShare(file) {
  try {
    const { default: sharp } = await import("sharp");
    const { data, info } = await sharp(file)
      .resize(96, 96, { fit: "inside" })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // The background is the commonest tone, whatever it is — these pages are
    // usually white, but a diagram on a coloured panel is not blank.
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += info.channels) histogram[data[i]] += 1;
    let background = 0;
    for (let tone = 1; tone < 256; tone += 1) {
      if (histogram[tone] > histogram[background]) background = tone;
    }

    let ink = 0;
    let total = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      total += 1;
      if (Math.abs(data[i] - background) > INK_DISTANCE) ink += 1;
    }
    return total === 0 ? null : ink / total;
  } catch {
    return null;
  }
}

async function main() {
  const courseSlug = arg("--course") ?? "ir-theory";
  const jsonOut = arg("--json");

  const lessons = await db.lesson.findMany({
    where: { status: "PUBLISHED", module: { subject: { course: { slug: courseSlug } } } },
    select: {
      id: true,
      title: true,
      module: { select: { title: true, subject: { select: { slug: true } } } },
      content: { select: { blocks: true } },
    },
  });

  // assetId -> where it is used
  const uses = new Map();
  for (const lesson of lessons) {
    const blocks = Array.isArray(lesson.content?.blocks) ? lesson.content.blocks : [];
    blocks.forEach((block, index) => {
      if (block?.type !== "figure" || !block.assetId) return;
      const row = uses.get(block.assetId) ?? { lessons: new Set(), places: [] };
      row.lessons.add(lesson.id);
      row.places.push({
        lessonId: lesson.id,
        lesson: lesson.title,
        module: lesson.module.title,
        subject: lesson.module.subject.slug,
        index,
      });
      uses.set(block.assetId, row);
    });
  }

  const assets = await db.mediaAsset.findMany({
    where: { id: { in: [...uses.keys()] } },
    select: { id: true, storageKey: true, sizeBytes: true, mimeType: true },
  });
  const byId = new Map(assets.map((a) => [a.id, a]));

  const findings = [];
  for (const [assetId, use] of uses) {
    const asset = byId.get(assetId);
    const reasons = [];

    if (use.lessons.size >= BRANDING_TOPICS) {
      reasons.push({ kind: "BRANDING", detail: `on ${use.lessons.size} topics` });
    }

    // The same image twice inside one topic is the author repeating a slide.
    const perLesson = new Map();
    for (const place of use.places) {
      perLesson.set(place.lessonId, (perLesson.get(place.lessonId) ?? 0) + 1);
    }
    const repeated = [...perLesson.values()].filter((n) => n > 1).length;
    if (repeated > 0) {
      reasons.push({ kind: "DUPLICATE", detail: `repeated within ${repeated} topic(s)` });
    }

    let size = null;
    const file = asset ? fileOf(asset) : null;
    if (file && fs.existsSync(file)) {
      size = dimensions(file);
      if (size && size.width * size.height < TINY_PIXELS) {
        reasons.push({ kind: "TINY", detail: `${size.width}×${size.height}` });
      }
      // Uniformity is the expensive check, so it runs on small or already
      // suspicious images and on anything under 20 KB, where a real technical
      // diagram is unlikely to live.
      if (reasons.length > 0 || asset.sizeBytes < 20_000) {
        const ink = await inkShare(file);
        if (ink !== null && ink < MIN_INK) {
          reasons.push({ kind: "BLANK", detail: `${(ink * 100).toFixed(2)}% ink` });
        }
      }
    } else if (asset) {
      reasons.push({ kind: "MISSING", detail: "file not on disk" });
    }

    if (reasons.length) {
      findings.push({
        assetId,
        bytes: asset?.sizeBytes ?? null,
        size,
        topics: use.lessons.size,
        uses: use.places.length,
        reasons,
        where: use.places.slice(0, 4),
      });
    }
  }

  findings.sort((a, b) => b.uses - a.uses);

  const totalFigures = [...uses.values()].reduce((n, u) => n + u.places.length, 0);
  console.log(`${courseSlug}: ${uses.size} distinct images in ${totalFigures} placements`);
  console.log(`${findings.length} flagged\n`);

  const tally = {};
  for (const f of findings) {
    for (const r of f.reasons) tally[r.kind] = (tally[r.kind] ?? 0) + f.uses;
  }
  console.log("placements by reason:", tally, "\n");

  for (const f of findings.slice(0, 40)) {
    const why = f.reasons.map((r) => `${r.kind} (${r.detail})`).join(", ");
    const dim = f.size ? `${f.size.width}×${f.size.height}` : "?";
    console.log(
      `${f.assetId.slice(0, 8)}  ${String(f.uses).padStart(4)} uses  ${dim.padEnd(11)} ${String(f.bytes ?? 0).padStart(8)}B  ${why}`,
    );
    console.log(`          e.g. ${f.where[0].subject} / ${f.where[0].module} / ${f.where[0].lesson}`);
  }
  if (findings.length > 40) console.log(`... and ${findings.length - 40} more`);

  if (jsonOut) {
    fs.mkdirSync(path.dirname(jsonOut), { recursive: true });
    fs.writeFileSync(jsonOut, JSON.stringify({ course: courseSlug, findings }, null, 2));
    console.log(`\nwritten to ${jsonOut}`);
  }

  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
