/**
 * Extracts text and figures from a source study PDF.
 *
 * Two things this does that the first-pass importer did not:
 *
 *   1. **Keeps the depth.** The earlier pass only wrote content for the dozen
 *      items whose syllabus code happened to survive in the text layer, which
 *      published 0.2% of a 506-page book. This keeps every page's text and
 *      attaches it to the finest unit the evidence supports.
 *
 *   2. **Keeps the diagrams.** The source carries ~650 distinct figures, and
 *      they are the point of a technical manual. They are extracted per page
 *      so they can sit beside the text that explains them.
 *
 * What it deliberately excludes: images that repeat across many pages at a
 * small file size. Those are page furniture — in this source, a logo reading
 * "New Zealand International Commercial Pilot Academy" appears on 84 pages,
 * and carrying another academy's branding into the student experience is
 * exactly what must not happen.
 *
 *   node scripts/extract-source.mjs <input.pdf> <out-dir>
 */
import fs from "node:fs";
import path from "node:path";

const [, , pdfPath, outDir] = process.argv;
if (!pdfPath || !outDir) {
  console.error("usage: node scripts/extract-source.mjs <input.pdf> <out-dir>");
  process.exit(1);
}

/**
 * An image is treated as furniture — a logo, watermark or header rule — when
 * it repeats across this many pages *and* is small enough that it cannot be a
 * detailed technical diagram. Large images that repeat are usually a figure
 * genuinely reused across a chapter, so size is what separates the two.
 */
const FURNITURE_MIN_PAGES = 5;
const FURNITURE_MAX_BYTES = 60_000;

/** Below this, an image is a bullet glyph or a rule, never a diagram. */
const MIN_DIAGRAM_BYTES = 4_000;

async function main() {
  // pypdf does the PDF work; this script drives it and owns the policy.
  const { execFileSync } = await import("node:child_process");
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(path.join(outDir, "figures"), { recursive: true });

  const helper = path.join(outDir, "_extract.py");
  fs.writeFileSync(
    helper,
    `
import sys, json, hashlib, io
from pypdf import PdfReader

pdf_path, out_dir = sys.argv[1], sys.argv[2]
reader = PdfReader(pdf_path)

pages = []
counts = {}
raw = []

for i, page in enumerate(reader.pages):
    try:
        text = page.extract_text() or ""
    except Exception:
        text = ""
    imgs = []
    try:
        for im in page.images:
            digest = hashlib.sha256(im.data).hexdigest()
            counts[digest] = counts.get(digest, 0) + 1
            imgs.append({"hash": digest, "name": im.name, "bytes": len(im.data)})
            raw.append((digest, im.data))
    except Exception:
        pass
    pages.append({"page": i + 1, "text": text, "images": imgs})

seen = set()
written = {}
for digest, data in raw:
    if digest in seen:
        continue
    seen.add(digest)
    written[digest] = len(data)
    with open(out_dir + "/figures/" + digest[:16] + ".bin", "wb") as fh:
        fh.write(data)

json.dump({"pages": pages, "counts": counts, "written": written},
          open(out_dir + "/source.json", "w"))
print(json.dumps({"pages": len(pages), "distinct_images": len(seen)}))
`,
  );

  console.log("extracting (this takes a minute on a large PDF)…");
  const out = execFileSync("python", [helper, pdfPath, outDir], { encoding: "utf8" });
  const summary = JSON.parse(out.trim().split("\n").pop());
  fs.unlinkSync(helper);

  const data = JSON.parse(fs.readFileSync(path.join(outDir, "source.json"), "utf8"));

  /* ------------------------------------------------- classify the images */

  const furniture = new Set();
  const tooSmall = new Set();
  for (const [digest, count] of Object.entries(data.counts)) {
    const size = data.written[digest] ?? 0;
    if (count >= FURNITURE_MIN_PAGES && size <= FURNITURE_MAX_BYTES) furniture.add(digest);
    else if (size < MIN_DIAGRAM_BYTES) tooSmall.add(digest);
  }

  // Rename kept figures to a stable, content-addressed name and drop the rest.
  const kept = new Map();
  for (const digest of Object.keys(data.written)) {
    const from = path.join(outDir, "figures", `${digest.slice(0, 16)}.bin`);
    if (!fs.existsSync(from)) continue;
    if (furniture.has(digest) || tooSmall.has(digest)) {
      fs.unlinkSync(from);
      continue;
    }
    const head = fs.readFileSync(from).subarray(0, 12);
    const ext = sniff(head);
    const to = path.join(outDir, "figures", `${digest.slice(0, 16)}.${ext}`);
    fs.renameSync(from, to);
    kept.set(digest, { file: `${digest.slice(0, 16)}.${ext}`, bytes: data.written[digest] });
  }

  /* ------------------------------------------------------ write manifest */

  const manifest = {
    source: path.basename(pdfPath),
    pageCount: data.pages.length,
    pages: data.pages.map((p) => ({
      page: p.page,
      text: p.text,
      figures: p.images
        .filter((im) => kept.has(im.hash))
        .map((im) => ({ ...kept.get(im.hash), hash: im.hash })),
    })),
    excluded: {
      furniture: [...furniture],
      tooSmall: [...tooSmall],
    },
  };

  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest));
  fs.unlinkSync(path.join(outDir, "source.json"));

  const totalChars = manifest.pages.reduce((n, p) => n + p.text.length, 0);
  const pagesWithFigures = manifest.pages.filter((p) => p.figures.length).length;

  console.log("");
  console.log(`pages              : ${summary.pages}`);
  console.log(`text extracted     : ${totalChars.toLocaleString()} characters`);
  console.log(`distinct images    : ${summary.distinct_images}`);
  console.log(`  kept as figures  : ${kept.size}`);
  console.log(`  excluded (furniture, repeated + small): ${furniture.size}`);
  console.log(`  excluded (too small to be a diagram)  : ${tooSmall.size}`);
  console.log(`pages with a figure: ${pagesWithFigures}`);
  console.log("");
  console.log(`manifest: ${path.join(outDir, "manifest.json")}`);
}

/** Identifies the image format from its magic bytes. */
function sniff(head) {
  if (head[0] === 0xff && head[1] === 0xd8) return "jpg";
  if (head.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") return "png";
  if (head.subarray(0, 4).toString("ascii") === "GIF8") return "gif";
  // JPEG 2000, in either of its two container shapes.
  if (head.subarray(4, 8).toString("ascii") === "jP  ") return "jp2";
  if (head.subarray(0, 4).toString("hex") === "ff4fff51") return "jp2";
  return "bin";
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
