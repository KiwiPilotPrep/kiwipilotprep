import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Every study diagram must be in a format a browser will paint.
 *
 * This is checked because the failure is invisible to every other check. A PDF
 * can embed JPEG 2000 or a Windows Metafile, and pypdf hands those bytes back
 * unchanged: the file exists, the database row exists, the request returns 200,
 * the bytes are a valid image — and the student sees a broken image icon. Two
 * hundred and eighty-four diagrams were in that state, across the CPL and IR
 * courses, while every other signal said the pipeline was healthy.
 *
 * Read from the extracted assets on disk rather than from the database, so it
 * fails at the point the problem is introduced — the extraction — rather than
 * after an import has already carried it into the course.
 */

const DECKS = ".cache/decks";

/** The formats every browser renders. Anything else is a broken image. */
const WEB_SAFE = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg"]);

/** What a file actually is, from its own first bytes. */
function sniff(file: string): string {
  const fd = fs.openSync(file, "r");
  const head = Buffer.alloc(12);
  fs.readSync(fd, head, 0, 12, 0);
  fs.closeSync(fd);

  if (head[0] === 0x89 && head.subarray(1, 4).toString() === "PNG") return "png";
  if (head[0] === 0xff && head[1] === 0xd8) return "jpg";
  if (head.subarray(0, 3).toString() === "GIF") return "gif";
  if (head.subarray(0, 4).toString() === "RIFF" && head.subarray(8, 12).toString() === "WEBP") return "webp";
  if (head.subarray(4, 8).toString() === "jP  ") return "jp2";
  if (head.subarray(0, 4).toString("hex") === "0000000c") return "jp2";
  if (head.subarray(0, 4).toString("hex") === "d7cdc69a") return "wmf";
  return "unknown";
}

function assetFiles(): string[] {
  if (!fs.existsSync(DECKS)) return [];
  const out: string[] = [];
  for (const deck of fs.readdirSync(DECKS)) {
    const dir = path.join(DECKS, deck, "assets");
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) out.push(path.join(dir, file));
  }
  return out;
}

const files = assetFiles();

describe("extracted diagrams", () => {
  it("there are some to check", () => {
    // Guards against this whole file passing vacuously on a machine where the
    // decks have not been extracted.
    expect(files.length).toBeGreaterThan(0);
  });

  it("every one is named with a format browsers render", () => {
    const wrong = files
      .filter((f) => !WEB_SAFE.has(path.extname(f).slice(1).toLowerCase()))
      .map((f) => path.basename(f));
    expect(wrong.slice(0, 10), `${wrong.length} in a format no browser renders`).toEqual([]);
  });

  it("every one holds the format its name claims", () => {
    // A JPEG stored under a .png name is served with the wrong content type,
    // and the reader sends `nosniff` — which turns a cosmetic mislabel into a
    // diagram the browser refuses to draw.
    const mismatched: string[] = [];
    for (const file of files) {
      const claimed = path.extname(file).slice(1).toLowerCase();
      const actual = sniff(file);
      const same = actual === claimed || (actual === "jpg" && claimed === "jpeg");
      if (!same) mismatched.push(`${path.basename(file)} is ${actual}`);
    }
    expect(mismatched.slice(0, 10), `${mismatched.length} mislabelled`).toEqual([]);
  });

  it("none is empty", () => {
    const empty = files.filter((f) => fs.statSync(f).size === 0).map((f) => path.basename(f));
    expect(empty.slice(0, 10)).toEqual([]);
  });

  it("every diagram a manifest references is on disk", () => {
    // The other direction: a manifest that points at a file the extractor
    // never wrote produces a lesson with a hole in it.
    const missing: string[] = [];
    for (const deck of fs.readdirSync(DECKS)) {
      const manifestPath = path.join(DECKS, deck, "manifest.json");
      if (!fs.existsSync(manifestPath)) continue;
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
        slides: Array<{ pictures: Array<{ asset: string }> }>;
      };
      const dir = path.join(DECKS, deck, "assets");
      for (const slide of manifest.slides) {
        for (const picture of slide.pictures) {
          if (!fs.existsSync(path.join(dir, picture.asset))) {
            missing.push(`${deck}/${picture.asset}`);
          }
        }
      }
    }
    expect(missing.slice(0, 10), `${missing.length} referenced but absent`).toEqual([]);
  });
});
