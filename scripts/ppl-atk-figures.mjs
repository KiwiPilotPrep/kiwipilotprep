/**
 * The ATK deck's figures, inventoried but not judged.
 *
 * Phase 1 deliberately rejects nothing. The CPL work established the order
 * these decisions have to be made in: measure first, look second, decide
 * third, and never let a measurement stand in for a verdict. This writes the
 * measurements and leaves the verdicts to the rebuild, where a
 * diagram-decisions map will carry a written reason per image.
 *
 * What it does record is the shape of the problem — how many figures are
 * mirrored WordArt headings rather than diagrams, how many are blank once
 * flattened, how many repeat — so the rebuild knows what it is walking into.
 *
 * Read-only. Writes .cache/tmp/ppl-atk-figures.json and a contact sheet set
 * under .cache/tmp/atk-sheets for the visual pass. Touches no database.
 *
 *   node scripts/ppl-atk-figures.mjs [--sheets]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DECK = ".cache/decks/ppl-atk";
const OUT = ".cache/tmp/ppl-atk-figures.json";
const SHEETS = ".cache/tmp/atk-sheets";
const wantSheets = process.argv.includes("--sheets");

const manifest = JSON.parse(fs.readFileSync(path.join(DECK, "manifest.json"), "utf8"));
const assetDir = path.join(DECK, "assets");
const files = new Map(
  fs.readdirSync(assetDir).map((f) => [f.replace(/\.[^.]+$/, ""), path.join(assetDir, f)]),
);

/** sha1 -> every page it appears on, in page order. */
const uses = new Map();
for (const slide of manifest.slides) {
  for (const [i, pic] of (slide.pictures ?? []).entries()) {
    const sha = pic.sha1;
    if (!uses.has(sha)) uses.set(sha, { sha, bytes: pic.bytes, placements: [] });
    uses.get(sha).placements.push({ page: slide.n, indexOnPage: i, top: pic.top, left: pic.left });
  }
}

const figures = [];
for (const [sha, rec] of uses) {
  const file = files.get(sha) ?? null;
  const fig = {
    sha1: sha,
    file,
    bytes: rec.bytes,
    placements: rec.placements,
    firstPage: rec.placements[0].page,
    pageCount: new Set(rec.placements.map((p) => p.page)).size,
    repeated: rec.placements.length > 1,
  };
  if (file) {
    try {
      const meta = await sharp(file).metadata();
      fig.width = meta.width;
      fig.height = meta.height;
      fig.format = meta.format;
      fig.hasAlpha = Boolean(meta.hasAlpha);
      // Flattened onto white, because these PNGs are transparent and a
      // composite onto black reads a pale WordArt reflection as solid ink.
      const { data } = await sharp(file)
        .flatten({ background: "#ffffff" })
        .resize(96, 96, { fit: "fill" })
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });
      let sum = 0, dark = 0, mid = 0;
      for (const v of data) { sum += v; if (v < 120) dark++; else if (v < 235) mid++; }
      fig.meanLuma = Math.round(sum / data.length);
      fig.darkFraction = +(dark / data.length).toFixed(3);
      fig.midFraction = +(mid / data.length).toFixed(3);
    } catch (e) {
      fig.error = String(e).slice(0, 80);
    }
  }
  figures.push(fig);
}
figures.sort((a, b) => a.firstPage - b.firstPage || a.placements[0].indexOnPage - b.placements[0].indexOnPage);
figures.forEach((f, i) => { f.i = i; });

/**
 * The one measurement worth making now: a mirrored WordArt chapter heading.
 *
 * They are wide, transparent, and carry no true black — the reflection is a
 * grey gradient under pale letters. Calibrated against pages the audit read by
 * eye. Recorded as `looksLike`, never as a decision.
 */
const ar = (f) => (f.width && f.height ? f.width / f.height : 0);
for (const f of figures) {
  if (f.error || !f.width) { f.looksLike = "unreadable"; continue; }
  if (ar(f) > 3 && f.darkFraction < 0.04 && f.midFraction > 0.02 && f.meanLuma > 195) f.looksLike = "heading-reflection";
  else if (f.darkFraction < 0.005 && f.midFraction < 0.02) f.looksLike = "near-blank";
  else if (f.width < 120 || f.height < 60) f.looksLike = "tiny";
  else if (f.darkFraction < 0.02 && f.midFraction < 0.08) f.looksLike = "low-ink";
  else f.looksLike = "diagram";
}

const counts = {};
for (const f of figures) counts[f.looksLike] = (counts[f.looksLike] ?? 0) + 1;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({
  source: manifest.source_file,
  deck: DECK,
  assetDir,
  distinct: figures.length,
  placements: figures.reduce((n, f) => n + f.placements.length, 0),
  furnitureDroppedAtExtraction: manifest.furniture_images,
  counts,
  figures,
}, null, 1));

console.log(`distinct figures ${figures.length}, placements ${figures.reduce((n, f) => n + f.placements.length, 0)}`);
console.log(`furniture dropped during extraction: ${manifest.furniture_images}`);
console.table(Object.entries(counts).map(([looksLike, n]) => ({ looksLike, figures: n })));
const repeated = figures.filter((f) => f.repeated);
console.log(`figures placed more than once: ${repeated.length} (most reused: ${Math.max(0, ...repeated.map((f) => f.placements.length))} placements)`);
console.log(`figures with no asset file: ${figures.filter((f) => !f.file).length}`);
console.log(`wrote ${OUT}`);

if (wantSheets) {
  fs.mkdirSync(SHEETS, { recursive: true });
  const COLS = 6, W = 240, H = 178, BAR = 16, PER = 30;
  let sheet = 0;
  for (let s = 0; s < figures.length; s += PER) {
    const page = figures.slice(s, s + PER);
    const comp = [];
    for (let i = 0; i < page.length; i++) {
      const f = page[i];
      if (!f.file) continue;
      const x = (i % COLS) * W, y = Math.floor(i / COLS) * (H + BAR);
      try {
        comp.push({ input: await sharp(f.file).flatten({ background: "#ffffff" }).resize(W - 2, H - 2, { fit: "contain", background: "#fff" }).png().toBuffer(), left: x + 1, top: y + 1 });
      } catch { continue; }
      const label = `${f.i} p${f.firstPage}${f.repeated ? ` x${f.placements.length}` : ""}`;
      comp.push({ input: Buffer.from(`<svg width="${W}" height="${BAR}"><rect width="${W}" height="${BAR}" fill="#000"/><text x="3" y="12" font-family="monospace" font-size="11" fill="#fff">${label}</text></svg>`), left: x, top: y + H });
    }
    await sharp({ create: { width: COLS * W, height: Math.ceil(page.length / COLS) * (H + BAR), channels: 3, background: "#ddd" } })
      .composite(comp).png().toFile(path.join(SHEETS, `atk-${String(sheet).padStart(2, "0")}.png`));
    sheet++;
  }
  console.log(`wrote ${sheet} contact sheets to ${SHEETS}`);
}
