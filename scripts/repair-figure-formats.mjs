/**
 * Converts study diagrams that a browser cannot display.
 *
 * A PDF may embed an image in any format its producer liked, and pypdf hands
 * those bytes back unchanged. Two of the formats found in the supplied decks —
 * JPEG 2000 and Windows Metafile — are perfectly valid images that no
 * mainstream browser will render, so the diagram reaches the page as a broken
 * image while every other check says it is fine: the file is there, the row is
 * there, the request returns 200.
 *
 * The fix is to re-encode the bytes, not to re-map anything. `MediaAsset.id` is
 * what a content block points at, and it is left alone; only the stored file,
 * its extension, and the recorded type change. Every diagram stays attached to
 * exactly the topic it was attached to before.
 *
 * Safe to re-run: an asset already in a web format is skipped, and the original
 * file is removed only once its replacement is on disk and the row committed.
 *
 *   node scripts/repair-figure-formats.mjs [--apply]
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const MEDIA_DIR = process.env.MEDIA_DIR ?? "./.dev/media";

/**
 * What a browser will actually paint.
 *
 * Deliberately a list of what works rather than a list of what does not: a new
 * source format should be converted by default, not rendered broken until
 * somebody notices and adds it here.
 */
const WEB_SAFE = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg"]);

const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml" };

/** Re-encodes one file as PNG. Returns the new size, or throws. */
function toPng(source, target) {
  const script = [
    "import sys",
    "from PIL import Image",
    "src, dst = sys.argv[1], sys.argv[2]",
    "im = Image.open(src)",
    // A palette or CMYK image has to be brought into a mode PNG can hold.
    "if im.mode not in ('RGB', 'RGBA', 'L', 'LA', 'P'):",
    "    im = im.convert('RGBA')",
    "im.save(dst, format='PNG', optimize=True)",
    "print(dst)",
  ].join("\n");
  execFileSync("python", ["-c", script, source, target], { encoding: "utf8" });
  return fs.statSync(target).size;
}

async function main() {
  const apply = process.argv.includes("--apply");

  const assets = await db.mediaAsset.findMany({
    where: { storageKey: { startsWith: "study/" } },
    select: { id: true, storageKey: true, mimeType: true, filename: true },
  });

  const broken = assets.filter((a) => {
    const ext = a.storageKey.split(".").pop().toLowerCase();
    return !WEB_SAFE.has(ext);
  });

  if (!broken.length) {
    console.log(`all ${assets.length} study diagrams are already in a web format`);
    await db.$disconnect();
    return;
  }

  const byExt = {};
  for (const a of broken) {
    const ext = a.storageKey.split(".").pop().toLowerCase();
    byExt[ext] = (byExt[ext] ?? 0) + 1;
  }
  console.log(`${broken.length} of ${assets.length} diagrams are in a format no browser renders:`);
  for (const [ext, n] of Object.entries(byExt)) console.log(`   .${ext}  ${n}`);

  if (!apply) {
    console.log("\ndry run — pass --apply to convert them");
    await db.$disconnect();
    return;
  }

  let converted = 0;
  let failed = 0;
  const failures = [];

  for (const asset of broken) {
    const source = path.join(MEDIA_DIR, asset.storageKey);
    if (!fs.existsSync(source)) {
      failed += 1;
      failures.push([asset.storageKey, "file not on disk"]);
      continue;
    }

    // The name keeps the original content hash. It identifies which diagram
    // this is, and re-importing the same deck must land on the same key.
    const base = path.basename(asset.storageKey).replace(/\.[^.]+$/, "");
    const newKey = `study/${base}.png`;
    const target = path.join(MEDIA_DIR, newKey);

    try {
      const size = toPng(source, target);
      await db.mediaAsset.update({
        where: { id: asset.id },
        data: {
          storageKey: newKey,
          mimeType: MIME.png,
          sizeBytes: size,
          filename: `${base}.png`,
        },
      });
      // Only now: the replacement is on disk and the row points at it.
      if (source !== target) fs.unlinkSync(source);
      converted += 1;
    } catch (error) {
      failed += 1;
      failures.push([asset.storageKey, (error.message ?? "").split("\n").pop().slice(0, 90)]);
    }
  }

  console.log(`\nconverted ${converted}, failed ${failed}`);
  for (const [key, why] of failures.slice(0, 10)) console.log(`   ${key}: ${why}`);

  const left = await db.mediaAsset.count({
    where: { storageKey: { startsWith: "study/" }, mimeType: { notIn: Object.values(MIME) } },
  });
  console.log(`diagrams still in a type a browser cannot render: ${left}`);

  await db.$disconnect();
  process.exit(failed ? 1 : 0);
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
