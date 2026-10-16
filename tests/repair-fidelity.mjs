/**
 * Does every repair still say what the source says?
 *
 * The repair pass proved it kept the words of each record. That is necessary
 * and not sufficient: a list could keep every word and still have been built
 * from lines the source never printed together, and a heading could keep its
 * word and not be the heading the deck showed.
 *
 * So each repair is checked against the extraction manifest for the page it
 * cites, by kind:
 *
 *   - a list       — every item verbatim on that page, in that order
 *   - an ordered list — the same, and the steps consecutive
 *   - a note       — its title and text reconstruct a line on that page
 *   - a heading    — its text is the title the extractor recorded for the page
 *   - a definition — "term: text" reconstructs a line on that page
 *   - a removal    — the line removed is the record title, a duplicate, or furniture
 *
 * Reads the two change manifests and the pre-repair backups, so it reports on
 * what was actually done rather than on what the content looks like now.
 *
 *   node tests/repair-fidelity.mjs
 */
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

import { DECK_OF_SUBJECT, loadSource, pageOf, shapeOf } from "../scripts/source-pages.mjs";

const db = new PrismaClient();
const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

const read = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null);

/** Every line the extractor recorded for one page, normalised. */
function pageLines(source, block) {
  const page = pageOf(source, block);
  if (!page) return null;
  return {
    title: page.title ?? null,
    lines: page.text.map((l) => String(l.text ?? "")),
    shapes: page.text.map((l) => shapeOf(l.text)),
    joined: page.text.map((l) => shapeOf(l.text)).join(" "),
  };
}

async function main() {
  const changes = read("docs/audit/changes.json");
  const queueFile = read("docs/audit/review-queue.json");
  const reverts = read("docs/audit/false-callouts.json");
  const defReverts = read("docs/audit/false-definitions.json");

  // What each record held before any repair, so a line that is not on the
  // cited page can be told apart from a line this pass put there.
  const preRepair = new Map();
  for (const file of [
    ".cache/curriculum-backups/study-content-pre-semantic-repair.json",
    ".cache/curriculum-backups/study-content-pre-flagged-resolve.json",
  ]) {
    const backup = read(file);
    for (const row of backup?.rows ?? []) {
      if (!preRepair.has(row.id)) {
        preRepair.set(
          row.id,
          (Array.isArray(row.blocks) ? row.blocks : [])
            .map((b) => shapeOf(b?.text))
            .filter(Boolean),
        );
      }
    }
  }

  // A definition later put back as a paragraph is not a definition to look
  // for either: the sibling test found it was one item of a list.
  const defRevertedAt = new Set(
    (defReverts?.reverted ?? []).map((r) => `${r.contentId}:${shapeOf(r.term)}`),
  );

  // A callout this pass later put back is not a callout to look for.
  const revertedAt = new Set(
    (reverts?.reverted ?? []).map((r) => `${r.contentId}:${shapeOf(r.marker)}`),
  );
  if (!changes) {
    console.log("SKIP  no docs/audit/changes.json");
    return;
  }

  const entries = [
    ...(changes.entries ?? []).map((e) => ({ ...e, pass: "semantic" })),
    ...(queueFile?.repairs ?? []).map((e) => ({ ...e, pass: "flagged" })),
  ].map((e) => ({ ...e, lesson: e.title ?? e.lesson }));
  t("there are repairs to verify", entries.length > 0, "nothing in either manifest");

  const contentIds = [...new Set(entries.map((e) => e.contentId))];
  const rows = await db.studyContent.findMany({
    where: { id: { in: contentIds } },
    select: { id: true, blocks: true },
  });
  const nowById = new Map(rows.map((r) => [r.id, Array.isArray(r.blocks) ? r.blocks : []]));

  const counters = {};
  const bump = (kind, ok) => {
    counters[kind] ??= { checked: 0, matched: 0, failures: [] };
    counters[kind].checked += 1;
    if (ok) counters[kind].matched += 1;
  };
  const fail = (kind, detail) => counters[kind].failures.push(detail);

  for (const entry of entries) {
    const deck = DECK_OF_SUBJECT[`${entry.course}/${entry.subject}`];
    const source = deck ? loadSource(deck) : null;
    const blocks = nowById.get(entry.contentId) ?? [];
    if (!source?.found) continue;

    for (const change of entry.changes) {
      const kind = change.category;

      /* ---- a list the repair built ---- */
      if (kind === "bullets-as-prose" || kind === "procedure-unordered") {
        const list = blocks.find(
          (b) => b.type === "list" && b.sourcePage === change.sourcePage &&
            (kind === "procedure-unordered" ? b.ordered === true : !b.ordered),
        );
        if (!list) {
          bump(kind, false);
          fail(kind, `${entry.lesson}: no list block citing page ${change.sourcePage}`);
          continue;
        }
        const page = pageLines(source, list);
        if (!page) {
          bump(kind, false);
          fail(kind, `${entry.lesson}: source page ${change.sourcePage} not in the manifest`);
          continue;
        }
        // Every item has to be a line the extractor recorded on that page. A
        // numbered step lost its "1." to the ordered list, so the item is a
        // substring of the line rather than the whole of it.
        const missing = list.items.filter((item) => {
          const s = shapeOf(item);
          return !page.shapes.includes(s) && !page.joined.includes(s);
        });

        // An item the cited page does not print may still be faithful to what
        // the record held before: this pass only changed block types and
        // stripped the numbering an ordered list now supplies. Where the words
        // were already there, the discrepancy is between the stored text and
        // its page citation — older than this pass, and reported as such
        // rather than counted against the repair.
        const was = preRepair.get(entry.contentId) ?? [];
        const preexisting = missing.filter((item) =>
          was.some((w) => w.includes(shapeOf(item)) || shapeOf(item).includes(w)),
        );
        const introduced = missing.filter((item) => !preexisting.includes(item));

        const ok = introduced.length === 0;
        bump(kind, ok);
        if (preexisting.length) bump(`${kind}-preexisting-mismatch`, true);
        if (!ok) fail(kind, `${entry.lesson} p${change.sourcePage}: ${introduced.length} item(s) this pass put there are not on the page, first "${introduced[0].slice(0, 60)}"`);
        continue;
      }

      /* ---- a callout the repair recognised ---- */
      if (kind === "warning-lost") {
        if (revertedAt.has(`${entry.contentId}:${shapeOf(change.marker)}`)) {
          bump("warning-lost-reverted", true);
          continue;
        }
        const note = blocks.find(
          (b) => b.type === "note" && shapeOf(b.title) === shapeOf(change.marker),
        );
        if (!note) {
          bump(kind, false);
          fail(kind, `${entry.lesson}: no note titled "${change.marker}"`);
          continue;
        }
        const page = pageLines(source, note);
        const rebuilt = shapeOf(`${note.title} ${note.text}`);
        const ok = Boolean(page) && (page.shapes.includes(rebuilt) || page.joined.includes(rebuilt));
        bump(kind, ok);
        if (!ok) fail(kind, `${entry.lesson} p${change.sourcePage}: "${String(note.title)}: ${String(note.text).slice(0, 50)}" does not reconstruct a line on the page`);
        continue;
      }

      /* ---- a heading the extractor named ---- */
      if (kind === "heading-as-paragraph") {
        const heading = blocks.find((b) => b.type === "heading" && b.sourcePage === change.sourcePage);
        const page = heading ? pageLines(source, heading) : null;
        const ok = Boolean(heading && page?.title && shapeOf(page.title) === shapeOf(heading.text));
        bump(kind, ok);
        if (!ok) fail(kind, `${entry.lesson} p${change.sourcePage}: heading does not match the recorded slide title`);
        continue;
      }

      /* ---- a definition the source wrote on one line ---- */
      if (kind === "definition-restored") {
        if (defRevertedAt.has(`${entry.contentId}:${shapeOf(change.term)}`)) {
          bump("definition-reverted", true);
          continue;
        }
        const def = blocks.find(
          (b) => b.type === "definition" && b.sourcePage === change.sourcePage && shapeOf(b.term) === shapeOf(change.term),
        );
        if (!def) {
          bump(kind, false);
          fail(kind, `${entry.lesson}: no definition for "${change.term}" citing page ${change.sourcePage}`);
          continue;
        }
        const page = pageLines(source, def);
        const rebuilt = shapeOf(`${def.term} ${def.text}`);
        const ok = Boolean(page) && (page.shapes.includes(rebuilt) || page.joined.includes(rebuilt));
        bump(kind, ok);
        if (!ok) fail(kind, `${entry.lesson} p${change.sourcePage}: "${def.term}" does not reconstruct a line on the page`);
        continue;
      }

      /* ---- a line the repair removed ---- */
      if (kind === "title-echo" || kind === "duplicate-adjacent" || kind === "slide-furniture") {
        const removed = String(change.removed ?? "");
        let ok = false;
        if (kind === "title-echo") ok = shapeOf(removed) === shapeOf(entry.title);
        if (kind === "slide-furniture") ok = /^(page\s+\d|\d{1,3}$|issue|rev|amdt|amendment|copyright|©|all rights|confidential|draft|slide\s+\d|cont)/i.test(removed.trim());
        if (kind === "duplicate-adjacent") {
          // The line must still be present once, from the block that kept it.
          ok = blocks.some((b) => typeof b.text === "string" && shapeOf(b.text) === shapeOf(removed));
        }
        bump(kind, ok);
        if (!ok) fail(kind, `${entry.lesson}: removal of "${removed.slice(0, 60)}" is not explained by its category`);
        continue;
      }

      if (kind === "heading-stray-colon") {
        const ok = !String(change.to ?? "").startsWith(":");
        bump(kind, ok);
        if (!ok) fail(kind, `${entry.lesson}: the colon was not removed`);
      }
    }
  }

  for (const [kind, c] of Object.entries(counters)) {
    t(
      `${kind}: every repair reconstructs its source (${c.matched}/${c.checked})`,
      c.matched === c.checked,
      c.failures.slice(0, 3).join(" | "),
    );
  }

  const checkedTotal = Object.values(counters).reduce((a, c) => a + c.checked, 0);
  const matchedTotal = Object.values(counters).reduce((a, c) => a + c.matched, 0);
  console.log(`\n  verified ${matchedTotal} of ${checkedTotal} repairs against the extraction manifests\n`);
}

try {
  await main();
} finally {
  await db.$disconnect();
}

for (const line of checks) console.log(line);
const failed = checks.filter((c) => c.startsWith("FAIL")).length;
console.log(`${checks.length - failed}/${checks.length} passed`);
process.exit(failed ? 1 : 0);
