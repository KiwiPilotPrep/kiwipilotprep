/**
 * Puts an extracted image into storage and returns the row that addresses it.
 *
 * Shared by the deck importer and the IR course builder so both reach storage
 * the same way. The storage key is the image's own content hash, so the same
 * diagram used on three pages is stored once and the three blocks point at one
 * row — and a re-import lands on the same key rather than duplicating it.
 */
import fs from "node:fs";
import path from "node:path";

export const DECKS_ROOT = ".cache/decks";
export const MEDIA_DIR = process.env.MEDIA_DIR ?? "./.dev/media";

/** The formats a browser will paint, and what to serve them as. */
export const MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
};

/**
 * @param {object} [options]
 * @param {string} [options.sourcePath] Read the bytes from here instead of from
 *   the deck's extracted assets directory, while still storing them under
 *   `asset`. A build may need to correct an image before a student sees it —
 *   the PPL technical knowledge PDF stores twelve of its figures upside down —
 *   and the corrected copy must not be written back into the extractor's own
 *   output, which is verified file-for-file against the manifest.
 */
export async function ensureAsset(db, deckSlug, asset, cache, options = {}) {
  if (cache.has(asset)) return cache.get(asset);

  const source = options.sourcePath ?? path.join(DECKS_ROOT, deckSlug, "assets", asset);
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
      mimeType: MIME[ext],
      kind: "IMAGE",
      sizeBytes: fs.statSync(source).size,
      isPublic: false,
    },
    select: { id: true },
  });

  cache.set(asset, row.id);
  return row.id;
}
