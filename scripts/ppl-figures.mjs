/**
 * The five decks' figures, inventoried and measured but not judged.
 *
 * The order the ATK rebuild established: measure first, look second, decide
 * third, and never let a measurement stand in for a verdict. That order was
 * not academic — on ATK the measurement flagged 205 images as mirrored heading
 * reflections and thirteen of them turned out to be real diagrams, including
 * the angle of attack sequence and the control column drawing. So this writes
 * measurements and contact sheets, and the verdicts are written by hand
 * afterwards in content/ppl/<subject>-diagrams.mjs.
 *
 * Read-only. Writes .cache/tmp/ppl-<deck>-figures.json and, with --sheets, a
 * contact sheet set per deck for the visual pass.
 *
 *   node scripts/ppl-figures.mjs [--deck <slug>] [--sheets]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

import { DECKS_ROOT } from "./media-assets.mjs";
import { DECKS } from "./ppl-coverage.mjs";

const wantSheets = process.argv.includes("--sheets");
const only = process.argv.includes("--deck")
  ? process.argv[process.argv.indexOf("--deck") + 1]
  : null;

async function inventory(entry) {
  const dir = path.join(DECKS_ROOT, entry.deck);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
  const assetDir = path.join(dir, "assets");
  const files = new Map(
    fs.readdirSync(assetDir).map((f) => [f.replace(/\.[^.]+$/, ""), path.join(assetDir, f)]),
  );

  /** sha1 -> every slide it appears on, in slide order. */
  const uses = new Map();
  for (const slide of manifest.slides) {
    for (const [i, pic] of (slide.pictures ?? []).entries()) {
      if (!uses.has(pic.sha1)) uses.set(pic.sha1, { sha: pic.sha1, bytes: pic.bytes, placements: [] });
      uses.get(pic.sha1).placements.push({ slide: slide.n, indexOnSlide: i, top: pic.top, left: pic.left });
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
      firstSlide: rec.placements[0].slide,
      slideCount: new Set(rec.placements.map((p) => p.slide)).size,
      repeated: rec.placements.length > 1,
    };
    if (file) {
      try {
        const meta = await sharp(file).metadata();
        fig.width = meta.width;
        fig.height = meta.height;
        fig.format = meta.format;
        fig.hasAlpha = Boolean(meta.hasAlpha);
        // Flattened onto white: these are often transparent PNGs, and a
        // composite onto black reads pale line art as solid ink.
        const { data } = await sharp(file)
          .flatten({ background: "#ffffff" })
          .resize(96, 96, { fit: "fill" })
          .greyscale()
          .raw()
          .toBuffer({ resolveWithObject: true });
        let sum = 0;
        let dark = 0;
        let mid = 0;
        for (const v of data) {
          sum += v;
          if (v < 120) dark += 1;
          else if (v < 235) mid += 1;
        }
        fig.meanLuma = Math.round(sum / data.length);
        fig.darkFraction = +(dark / data.length).toFixed(3);
        fig.midFraction = +(mid / data.length).toFixed(3);
      } catch (e) {
        fig.error = String(e).slice(0, 80);
      }
    }
    figures.push(fig);
  }
  figures.sort((a, b) => a.firstSlide - b.firstSlide || a.placements[0].indexOnSlide - b.placements[0].indexOnSlide);
  figures.forEach((f, i) => {
    f.i = i;
  });

  /** Measurements only. Never a decision — see the file comment. */
  const ar = (f) => (f.width && f.height ? f.width / f.height : 0);
  for (const f of figures) {
    if (f.error || !f.width) f.looksLike = "unreadable";
    else if (f.darkFraction < 0.005 && f.midFraction < 0.02) f.looksLike = "near-blank";
    else if (f.width < 120 || f.height < 60) f.looksLike = "tiny";
    else if (ar(f) > 6 && f.darkFraction < 0.05) f.looksLike = "banner";
    else if (f.darkFraction < 0.02 && f.midFraction < 0.08) f.looksLike = "low-ink";
    else f.looksLike = "diagram";
  }

  const counts = {};
  for (const f of figures) counts[f.looksLike] = (counts[f.looksLike] ?? 0) + 1;

  const out = `.cache/tmp/ppl-${entry.deck}-figures.json`;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(
    out,
    JSON.stringify(
      {
        deck: entry.deck,
        subject: entry.subject,
        source: manifest.source_file,
        assetDir,
        distinct: figures.length,
        placements: figures.reduce((n, f) => n + f.placements.length, 0),
        furnitureDroppedAtExtraction: manifest.furniture_images,
        counts,
        figures,
      },
      null,
      1,
    ),
  );

  console.log(
    `${entry.deck.padEnd(15)} ${String(figures.length).padStart(4)} distinct · ` +
      `${String(figures.reduce((n, f) => n + f.placements.length, 0)).padStart(4)} placements · ` +
      `furniture dropped ${manifest.furniture_images} · ` +
      Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" · "),
  );

  if (wantSheets) {
    const sheetDir = `.cache/tmp/ppl-sheets/${entry.deck}`;
    fs.mkdirSync(sheetDir, { recursive: true });
    const COLS = 5;
    const W = 300;
    const H = 200;
    const BAR = 18;
    const PER = 25;
    let sheet = 0;
    for (let s = 0; s < figures.length; s += PER) {
      const page = figures.slice(s, s + PER);
      const comp = [];
      for (const [i, f] of page.entries()) {
        if (!f.file) continue;
        const x = (i % COLS) * W;
        const y = Math.floor(i / COLS) * (H + BAR);
        try {
          comp.push({
            input: await sharp(f.file)
              .flatten({ background: "#ffffff" })
              .resize(W - 4, H - 4, { fit: "contain", background: "#fff" })
              .png()
              .toBuffer(),
            left: x + 2,
            top: y + 2,
          });
        } catch {
          continue;
        }
        const label = `${f.i} s${f.firstSlide} ${f.width}x${f.height}${f.repeated ? ` x${f.placements.length}` : ""}`;
        comp.push({
          input: Buffer.from(
            `<svg width="${W}" height="${BAR}"><rect width="${W}" height="${BAR}" fill="#111"/>` +
              `<text x="3" y="13" font-family="monospace" font-size="11" fill="#fff">${label}</text></svg>`,
          ),
          left: x,
          top: y + H,
        });
      }
      await sharp({
        create: {
          width: COLS * W,
          height: Math.ceil(page.length / COLS) * (H + BAR),
          channels: 3,
          background: "#cccccc",
        },
      })
        .composite(comp)
        .png()
        .toFile(path.join(sheetDir, `${entry.deck}-${String(sheet).padStart(2, "0")}.png`));
      sheet += 1;
    }
    console.log(`${" ".repeat(16)}${sheet} contact sheets in ${sheetDir}`);
  }
}

const chosen = only ? DECKS.filter((d) => d.deck === only) : DECKS;
for (const entry of chosen) await inventory(entry);
