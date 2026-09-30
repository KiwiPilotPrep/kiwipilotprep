/**
 * Runs the deck extractor over the three IR study manuals.
 *
 * Same extractor as the PPL and CPL migrations. The IR sources are all PDF
 * exports of slide decks, which is the shape the extractor's PDF path already
 * handles; giving them their own reader would be a third set of rules to keep
 * honest for no gain.
 *
 * The subject each deck belongs to is declared in `scripts/import-decks.mjs`.
 * This file only says where the sources are, so re-extracting is one command
 * rather than three invocations that can drift apart.
 *
 *   node scripts/extract-ir.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DECKS_ROOT = ".cache/decks";

export const IR_DECKS = [
  { deck: "ir-navigation", name: "IFR Navigation", source: "ir course material/IFRNavigation2020_Branding_Removed.pdf" },
  { deck: "ir-navaids", name: "IFR Navaids", source: "ir course material/IFRNavaidsPowerpointCurrent.pdf" },
  { deck: "ir-law", name: "IR Air Law", source: "ir course material/IRAirLawPowerPoint.pdf" },
];

// A Windows path does not survive being pasted into a file: URL by hand.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summaries = [];

  for (const entry of IR_DECKS) {
    if (!fs.existsSync(entry.source)) {
      console.error(`missing source: ${entry.source}`);
      process.exit(1);
    }
    const dir = path.join(DECKS_ROOT, entry.deck);
    process.stdout.write(`extracting ${entry.name} ... `);

    const out = execFileSync("python", ["scripts/extract-deck.py", entry.source, dir], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    });
    fs.writeFileSync(path.join(dir, "extract.json"), out, "utf8");

    const summary = JSON.parse(out);
    process.stdout.write(`${summary.slides} pages, ${summary.pictures_kept} diagrams\n`);
    summaries.push({
      subject: entry.name,
      pages: summary.slides,
      textBlocks: summary.text_blocks,
      chars: summary.chars,
      diagrams: summary.pictures_kept,
      furnitureDropped: summary.furniture_images_dropped,
      tables: summary.tables,
      blank: summary.slides_with_nothing.length,
    });
  }

  console.table(summaries);
}
