/**
 * Builds a Flight Test Groundwork course from the client's supplied material.
 *
 * A sibling of `build-ppl-course.mjs`, and deliberately the same shape: a
 * curriculum module declares which part of the source each lesson is built
 * from, this script refuses to finish if any of the source is unaccounted for,
 * and it writes the result in one transaction.
 *
 * Two things make it different from the theory builder.
 *
 * The PRD prescribes the structure. Both PPL and CPL Flight Test Groundwork
 * are the same eight modules, named as the PRD names them, and that list is
 * checked here rather than trusted — a curriculum that renames or reorders a
 * module is rejected. The eight become `CourseModule` rows under the existing
 * `flight-test-groundwork` subject, so the subject id, the course id, the
 * products that grant them and the entitlements that reference them are all
 * untouched by a rebuild.
 *
 * And the source is claimed by section rather than by page. The supplied study
 * document is written with numbered headings — 4.3.1, 8.2.2 — and a heading
 * with everything under it is exactly one lesson's worth of material, where a
 * page is an arbitrary slice through two of them. The supporting documents,
 * which have no such numbering, are claimed by page as the decks are.
 *
 *   node scripts/build-groundwork-course.mjs [--course ppl-flight-test] [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PrismaClient } from "@prisma/client";

import { ensureAsset } from "./media-assets.mjs";

const db = new PrismaClient();
const MANIFEST = ".cache/groundwork/manifest.json";
const ASSETS = ".cache/groundwork/assets";

/**
 * The eight modules, exactly as the PRD names them.
 *
 * PPL and CPL Groundwork must both use this list, so it lives here rather than
 * in either curriculum, and both are checked against it. Renaming a module is
 * a decision about the product, not about content, and it should not be
 * possible to make one by editing a content file.
 */
export const PRESCRIBED_MODULES = [
  "Personal Preparation",
  "Aircraft Documents",
  "Weather, AIP NZ, and Supplements",
  "Performance and Operating Requirements",
  "Fuel Management",
  "Loading",
  "Pre-Flight Inspection",
  "Emergency Equipment",
];

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* ============================================================ the source */

/**
 * The supplied material, flattened into one addressable list per document.
 *
 * Every block gets an index, the page it came from, and — for the study
 * document — the numbered section it belongs to. Those three are what a
 * curriculum claims against and what the coverage gate counts.
 */
function loadSource(wanted, furniture = [], splits = {}, joins = []) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const docs = new Map();
  const removed = [];
  const joined = new Set();
  const available = new Set(manifest.docs.map((d) => d.key));
  for (const key of wanted) {
    if (!available.has(key)) throw new Error(`no supplied document "${key}" — run scripts/extract-groundwork.mjs`);
  }

  for (const doc of manifest.docs.filter((d) => wanted.includes(d.key))) {
    const blocks = [];
    let section = null;
    let moduleNo = null;

    for (const page of doc.pages) {
      for (const raw of page.blocks) {
        const block = { ...raw, doc: doc.key, page: page.n, index: blocks.length };
        if (raw.heading && /^Module\s+\d+$/.test(raw.code ?? "")) {
          moduleNo = raw.code;
          section = raw.code;
        } else if (raw.heading && /^\d+(\.\d+){1,2}$/.test(raw.code ?? "")) {
          section = raw.code;
        }
        block.section = section;
        block.module = moduleNo;

        const verdict = repairFurniture(block, furniture, splits);
        if (verdict.drop) {
          removed.push({ kind: "dropped", doc: doc.key, page: page.n, text: block.text ?? "", reason: verdict.reason });
          continue;
        }
        if (verdict.text !== undefined) {
          // A split changes the text without taking anything out of the
          // document, so it is not counted as furniture removed.
          if (verdict.cut) removed.push({ kind: "trimmed", doc: doc.key, page: page.n, text: verdict.cut, reason: verdict.reason });
          block.text = verdict.text;
        }

        blocks.push(block);
      }
    }

    joinAcrossPages(doc.key, blocks, joins, joined);
    // The document's own section codes, so a block that opens with one can
    // have it taken off without a rule number like 91.605 being mistaken for
    // it. Only a number this document actually uses as a section is stripped.
    const codes = new Set(blocks.map((b) => b.code).filter((c) => c && /^\d/.test(c)));
    docs.set(doc.key, { ...doc, blocks, codes });
  }
  loadSource.removed = removed;

  for (const [i, join] of joins.entries()) {
    if (!joined.has(i)) {
      throw new Error(`joinPages[${i}] "${join.endsWith.slice(0, 30)}" + "${join.startsWith.slice(0, 30)}" matched nothing`);
    }
    if (!String(join.reason ?? "").trim()) throw new Error(`joinPages[${i}] has no reason`);
  }

  const unused = [];
  for (const [where, fix] of Object.entries(splits)) {
    for (const [from] of fix.pairs) {
      if (!repairFurniture.used?.has(`${where}::${from}`)) unused.push(`${where} "${from.slice(0, 40)}"`);
    }
    if (!String(fix.reason ?? "").trim()) throw new Error(`splitLines ${where} has no reason`);
  }
  if (unused.length) throw new Error(`splitLines that matched nothing:\n   ${unused.join("\n   ")}`);

  return docs;
}

/**
 * Sentences the page break cut in half, put back together.
 *
 * A PDF has no idea that a sentence continues overleaf, so the extractor gets
 * "…technical standards and operational capability of installed" at the foot
 * of one page and "avionics." at the head of the next. Neither half is worth
 * reading on its own and the second looks like a stray fragment on the page.
 *
 * Each join names the tail it ends with and the head it starts with, so it can
 * only ever apply to the one pair it was written for, and a join that matches
 * nothing fails the build.
 */
function joinAcrossPages(docKey, blocks, joins, joined) {
  for (const [i, join] of joins.entries()) {
    if (join.doc !== docKey) continue;
    for (let k = 0; k < blocks.length - 1; k += 1) {
      const a = blocks[k];
      const b = blocks[k + 1];
      if (a.sha1 || b.sha1 || !a.text || !b.text) continue;
      if (!a.text.trimEnd().endsWith(join.endsWith)) continue;
      if (!b.text.trimStart().startsWith(join.startsWith)) continue;
      a.text = `${a.text.trimEnd()} ${b.text.trim()}`;
      blocks.splice(k + 1, 1);
      for (let j = k + 1; j < blocks.length; j += 1) blocks[j].index = j;
      joined.add(i);
      break;
    }
  }
}

/**
 * A document's own furniture, taken off before anything can be claimed.
 *
 * A printed booklet carries things that are not its content: the page number
 * at the foot, the title repeated in the running head, the arrow that points
 * from a caption to the photograph beside it. None of that is teaching, and a
 * caption in particular is worse than useless once the photograph it describes
 * has been dropped — it tells a student to look at something that is not
 * there.
 *
 * Each rule names the document it applies to, what it matches and why, so the
 * removals are a written decision rather than a silent filter, and the build
 * prints what each one took.
 *
 * `cut` rules run first and trim the tail off a block, because the booklet
 * glues a caption onto the end of a real paragraph; `drop` rules then remove
 * whole blocks. A block that is left with almost nothing after a cut was a
 * caption in its entirety and goes too.
 */
function repairFurniture(block, rules, splits = {}) {
  if (block.sha1 || !block.text) return {};
  let text = block.text;

  // Two of the supplied lines arrive with a heading welded onto the sentence
  // before it, because the PDF put them on one line with no space. The pair is
  // separated here, keyed by document and page so the repair cannot drift onto
  // some other block, and each carries the reason it exists.
  for (const [where, fix] of Object.entries(splits)) {
    if (where !== `${block.doc}:p${block.page}`) continue;
    for (const [from, to] of fix.pairs) {
      if (!text.includes(from)) continue;
      text = text.split(from).join(to);
      // Recorded so the build can refuse a repair that no longer matches
      // anything — a stale one would otherwise sit in the curriculum looking
      // like it was doing something.
      (repairFurniture.used ??= new Set()).add(`${where}::${from}`);
    }
  }

  let reason = null;
  let cut = "";

  // An arrow at the very start means the block *is* a caption. Some of those
  // captions are substantive prose that happens to have been laid out beside a
  // photograph, so the marker comes off and the words stay; the ones that are
  // only a photo credit are caught by a drop rule below.
  for (const rule of rules.filter((r) => r.doc === block.doc && r.strip)) {
    const stripped = text.replace(rule.strip, "").trim();
    if (stripped !== text) {
      text = stripped;
      reason = rule.reason;
    }
  }

  // The booklet prints its page number at the foot of the page, and where the
  // last line of text runs close to it the two come out as one block, leaving
  // a bare number on the end of a sentence. Only the number of the page the
  // block is actually on is removed, so a figure that genuinely ends in a
  // number keeps it.
  for (const rule of rules.filter((r) => r.doc === block.doc && r.trailingPageNumber)) {
    const trimmed = text.replace(new RegExp(`\\s+${block.page}$`), "");
    if (trimmed !== text) {
      cut = String(block.page);
      text = trimmed;
      reason = rule.reason;
    }
  }

  for (const rule of rules.filter((r) => r.doc === block.doc && r.cut)) {
    const m = text.match(rule.cut);
    if (!m || m.index === 0) continue;
    cut = text.slice(m.index).trim();
    text = text.slice(0, m.index).trim();
    reason = rule.reason;
  }

  const trimmed = text !== block.text;
  if (cut && text.split(/\s+/).filter(Boolean).length < 4) {
    return { drop: true, reason };
  }

  for (const rule of rules.filter((r) => r.doc === block.doc && r.drop)) {
    if (rule.drop.test(text)) return { drop: true, reason: rule.reason };
  }

  return trimmed ? { text, cut, reason } : {};
}

/**
 * Blocks a topic claims by name rather than by where the document put them.
 *
 * The PDF does not always keep a table with its own heading: the NOTAM series
 * table is printed after the heading of the section that follows it, so
 * claiming by section files it under airspace classification and leaves the
 * NOTAM topic with a heading and nothing beneath it. A `pull` claim takes
 * named blocks wherever they sit, and they are removed from every other claim
 * so nothing is taught twice.
 */
/**
 * Blocks skipped one at a time rather than a page at a time.
 *
 * A page usually skips whole: a cover, a contents page, an abbreviation list.
 * Occasionally one block on an otherwise good page has to go — a table the PDF
 * flattened past the point where its cells can be told apart, when the same
 * material is taught properly elsewhere. Naming the block by how it starts
 * keeps the decision visible and reviewable, and a rule that matches nothing
 * fails the build.
 */
function skippedBlocks(curriculum, docs) {
  const out = new Map();
  for (const rule of curriculum.skipBlocks ?? []) {
    if (!String(rule.reason ?? "").trim()) throw new Error(`skipBlocks "${rule.startsWith}" has no reason`);
    const doc = docs.get(rule.doc);
    if (!doc) continue;
    const hits = doc.blocks.filter((b) => String(b.text ?? "").startsWith(rule.startsWith));
    if (!hits.length) throw new Error(`skipBlocks "${rule.startsWith.slice(0, 40)}" matches nothing in ${rule.doc}`);
    for (const b of hits) out.set(`${rule.doc}:${b.index}`, rule.reason);
  }
  return out;
}

function pulledBlocks(curriculum, docs) {
  const owned = new Map(); // "doc:index" -> the topic that pulled it
  for (const m of curriculum.modules) {
    for (const topic of m.topics) {
      for (const claim of topic.claims ?? []) {
        if (!claim.pull) continue;
        const doc = docs.get(claim.doc);
        if (!doc) throw new Error(`no supplied document "${claim.doc}"`);
        for (const b of pullSelect(doc, claim.pull)) owned.set(`${claim.doc}:${b.index}`, topic.title);
      }
    }
  }
  return owned;
}

/**
 * The blocks a pull names: either a list of openings, or a contiguous run
 * between two of them. A run is the safer form where the blocks in the middle
 * are short and would be ambiguous to name one by one.
 */
function pullSelect(doc, pull) {
  const startsWith = (b, needle) => String(b.text ?? "").startsWith(needle);

  if (Array.isArray(pull)) {
    const out = [];
    for (const needle of pull) {
      const hits = doc.blocks.filter((b) => startsWith(b, needle));
      if (!hits.length) throw new Error(`pull "${needle.slice(0, 40)}" matches nothing in ${doc.key}`);
      out.push(...hits);
    }
    return [...new Set(out)].sort((a, b) => a.index - b.index);
  }

  const from = doc.blocks.findIndex((b) => startsWith(b, pull.from));
  if (from === -1) throw new Error(`pull from "${pull.from.slice(0, 40)}" matches nothing in ${doc.key}`);
  const to = doc.blocks.findIndex((b, i) => i >= from && startsWith(b, pull.to));
  if (to === -1) throw new Error(`pull to "${pull.to.slice(0, 40)}" matches nothing after it in ${doc.key}`);
  return doc.blocks.slice(from, to + 1);
}

/** Every block a claim selects, in source order. */
function resolveClaim(docs, claim, pulled = new Map(), skipped = new Map()) {
  const doc = docs.get(claim.doc);
  if (!doc) throw new Error(`no supplied document "${claim.doc}"`);

  if (claim.pull) return pullSelect(doc, claim.pull);

  const notPulled = (b) => !pulled.has(`${claim.doc}:${b.index}`) && !skipped.has(`${claim.doc}:${b.index}`);

  if (claim.pages) {
    const wanted = new Set(claim.pages);
    for (const n of claim.pages) {
      if (n < 1 || n > doc.total_pages) {
        throw new Error(`${claim.doc}: page ${n} is outside the document (1–${doc.total_pages})`);
      }
    }
    return doc.blocks.filter((b) => wanted.has(b.page) && notPulled(b));
  }

  if (claim.sections) {
    const wanted = new Set(claim.sections);
    const known = new Set(doc.blocks.map((b) => b.section));
    for (const s of claim.sections) {
      if (!known.has(s)) throw new Error(`${claim.doc}: no section "${s}" in the document`);
    }
    return doc.blocks.filter((b) => wanted.has(b.section) && notPulled(b));
  }

  throw new Error(`a claim must name pages, sections or blocks to pull (${JSON.stringify(claim)})`);
}

/* ============================================================ reshaping */

/**
 * Some of the supplied material arrives in a shape the page cannot show well.
 *
 * A table laid out in the PDF comes out as a run of paragraphs with the header
 * row welded to the first body row; a callout box comes out as a paragraph
 * beginning with an emoji and a label; a two-item list set with dashes comes
 * out as one long sentence. None of that is a content problem — the words are
 * right — but a student meets a wall of text where the client drew a table.
 *
 * A reshape rule puts the shape back. It names the page, the source text it
 * applies to and the reason it exists, and every word it produces must already
 * be in the text it consumed: `assertFromSource` fails the build otherwise, so
 * a reshape can rearrange the client's words and can never add any.
 */
function assertFromSource(produced, consumed, where) {
  const plain = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();
  const haystack = plain(consumed);
  for (const piece of produced) {
    if (!piece) continue;
    if (!haystack.includes(plain(piece))) {
      throw new Error(`reshape ${where} invents text that is not in the source: "${String(piece).slice(0, 60)}"`);
    }
  }
}

/**
 * Applies the reshape rules for one page to the blocks claimed from it.
 *
 * Returns the blocks a student reads. A rule consumes one or more source
 * blocks, matched by the opening of their text, and replaces the first with
 * what it produces; the rest are removed. A rule that matches nothing fails
 * the build rather than sitting in the curriculum doing nothing.
 */
function applyReshapes(blocks, rules, used) {
  if (!rules.length) return blocks;

  const out = [...blocks];
  for (const rule of rules) {
    const at = out.findIndex((b) => b && b.__text?.startsWith(rule.match));
    if (at === -1) continue;

    const first = out[at];
    const taken = [first];
    for (let n = 1; n <= (rule.absorb ?? 0); n += 1) {
      let k = at + n;
      while (k < out.length && !out[k]) k += 1;
      if (k >= out.length) throw new Error(`reshape "${rule.match.slice(0, 40)}" has nothing to absorb`);
      taken.push(out[k]);
      out[k] = null;
    }
    const source = taken.map((b) => b.__text).join("\n");
    const body = rule.strip ? source.replace(rule.strip, "").trim() : source;
    const made = [];

    if (rule.table) {
      assertFromSource([...rule.table.headers, ...rule.table.rows.flat()], source, rule.match.slice(0, 40));
      made.push({ type: "table", headers: rule.table.headers, rows: rule.table.rows });
    } else if (rule.bullets) {
      // `each` takes the layout off an individual item — the brackets the
      // client drew around each box of a flow diagram, for instance.
      const parts = body
        .split(rule.bullets)
        .map((t) => (rule.each ? t.replace(rule.each, "") : t).trim())
        .filter(Boolean);
      if (parts.length < 2) throw new Error(`reshape "${rule.match.slice(0, 40)}" split into ${parts.length} item(s)`);
      const [lead, ...items] = rule.lead ? parts : [null, ...parts];
      if (lead) made.push({ type: "paragraph", text: lead });
      // Level 0 means these are not list items at all — the PDF ran two
      // paragraphs together and both should read as prose.
      for (const t of items) {
        made.push(rule.level === 0 ? { type: "paragraph", text: t } : { type: "subitem", text: t, level: rule.level ?? 1 });
      }
    } else if (rule.as) {
      // `join` decides how absorbed blocks are put together: a blank line by
      // default, or a space where the client's heading is the subject of the
      // sentence that follows it and the two are really one line.
      const lines = body.split("\n").map((t) => t.trim()).filter(Boolean);
      made.push({ ...rule.as, text: lines.join(rule.join ?? "\n") });
    } else {
      throw new Error(`reshape "${rule.match.slice(0, 40)}" says nothing to do`);
    }

    // Whatever a rule produces has to be the client's own words rearranged.
    assertFromSource(
      made.flatMap((b) => [b.text, b.title, ...(b.items ?? [])]),
      source,
      rule.match.slice(0, 40),
    );

    // Reshaped blocks are still the client's words, so they keep the source
    // provenance and the citation of the block they came from.
    out[at] = made.map((b) => ({
      ...b,
      origin: "source",
      sourceDoc: first.sourceDoc,
      sourcePage: first.sourcePage,
    }));
    used.add(rule.__key);
  }
  return out.filter(Boolean).flat();
}

/* ============================================================ the blocks */

/**
 * Takes the client's section number off the front of a line.
 *
 * The document numbers its own sections, and where one of those numbers opens
 * a line the extractor did not read as a heading it turns up in the middle of
 * the page — "3.3.1 A standard plain-text Notice to Airmen…", "6.1.4 Moment:".
 * The reader has its own numbering down the side, so the client's is internal
 * addressing rather than something a student needs.
 *
 * Only a number the document actually uses as a section code is removed, so a
 * line that opens with a rule number — 91.605, 91.515 — keeps it.
 */
export function stripSectionCode(text, codes = new Set()) {
  // At least one dot is required. A bare leading integer is a quantity — "10
  // hours cross-country flight time" — and stripping it silently deletes the
  // number the sentence is about.
  const m = text.match(/^(\d{1,2}(?:\.\d{1,2}){1,2})[.:]?\s+(\S.*)$/s);
  if (!m) return text;
  if (codes.has(m[1])) return m[2];
  // The document has eight modules, so its own section numbers all begin 1. to
  // 8. and never carry a three-digit part. Every rule number a page cites
  // begins with its Part — 91, 61, 67, 43 — so bounding the first number keeps
  // "91.515)" and "61.21" intact while removing "6.2.1" and "3.3.1".
  const [head, ...rest] = m[1].split(".");
  const looksLikeSection = Number(head) >= 1 && Number(head) <= 12 && rest.every((n) => n.length <= 2);
  return looksLikeSection ? m[2] : text;
}

/**
 * One supplied block into one block a student reads.
 *
 * A heading becomes a subheading, a bullet keeps its depth, and a picture
 * becomes a figure. Nothing is reworded. The section number is dropped from a
 * heading — "4.3.1. Group Rating System" reads as "Group Rating System" on a
 * page whose own numbering is the course's, and the client's numbering is
 * internal addressing rather than something a student needs.
 */
function renderBlock(block, deck, cache, counts, notes, rejects, demoted, codes) {
  if (block.kind === "picture") {
    if (rejects(block.sha1)) {
      counts.figuresRejected += 1;
      return null;
    }
    const file = path.join(ASSETS, `${block.sha1}.png`);
    if (!fs.existsSync(file)) throw new Error(`missing asset ${block.sha1}`);
    counts.figures += 1;
    return {
      type: "figure",
      __asset: { sha1: block.sha1, file },
      caption: notes(block.sha1) ?? null,
      sourceDoc: block.doc,
      sourcePage: block.page,
    };
  }

  const text = String(block.text ?? "").trim();
  if (!text) return null;

  // A page where a run of "1." "2." "3." is a numbered list rather than a run
  // of headings. The two are genuinely ambiguous in a document that uses both,
  // so the curriculum names the page and the reason rather than a rule here
  // guessing at it.
  const heading = block.heading && !demoted.has(`${block.doc}:p${block.page}`);

  if (heading) {
    // "4.3.1. Group Rating System" reads as "Group Rating System" on a page
    // whose own numbering is the course's. A question keeps its number,
    // because that number is how the client ties it back to the section it
    // came from and a student following both benefits from the link.
    const bare = /^Question\s/i.test(text)
      ? text
      : text.replace(/^(?:Module\s+\d+|\d+(?:\.\d+){0,2})\s*[.:]?\s*/, "").trim();
    if (!bare) return null;
    counts.headings += 1;
    return { type: "subheading", text: bare, sourceDoc: block.doc, sourcePage: block.page };
  }

  if ((block.level ?? 0) > 0 || block.label || (block.heading && !heading)) {
    return {
      type: "subitem",
      text: stripSectionCode(text, codes),
      level: block.level ?? 1,
      ...(block.label ? { label: block.label } : {}),
      sourceDoc: block.doc,
      sourcePage: block.page,
    };
  }

  return { type: "paragraph", text: stripSectionCode(text, codes), sourceDoc: block.doc, sourcePage: block.page };
}

/* ================================================= list assembly */

/**
 * Bullets into lists, the way the theory courses present them.
 *
 * The supplied document is written almost entirely in bullets — 943 of its
 * 1571 text blocks sit at level 1 or deeper. Rendering each of those as a
 * `subitem` gave every one its own pale card with a blue rule down the side,
 * and a page of six IMSAFE letters became six cards stacked on top of each
 * other. That component exists for lettered legal enumerations, where "(a)
 * distance; (b) time" must not collapse onto one line; it was never meant to
 * carry ordinary prose, and the theory courses use it for about one block in
 * ten. Groundwork was using it for one in two.
 *
 * So a run of bullets at the same depth becomes one list, which is what the
 * theory courses do and what `.prose ul` already styles. Three shapes fall out
 * of that:
 *
 *   - a run of two or more becomes a list, ordered when the source numbered
 *     the items and unordered when it bulleted them;
 *   - a lone bullet is not a list at all and becomes a paragraph;
 *   - a short bullet ending in a colon that introduces the ones beneath it
 *     becomes the lead-in paragraph above the list, which is how the same
 *     shape reads in PPL and IR.
 *
 * Nothing here changes a word of the client's text: the items are the blocks,
 * in their order, with the source's own numbering removed only where an
 * ordered list is about to renumber them identically.
 */
const LEAD_IN = /:$/;
const NUMBERED_LABEL = /^\d{1,2}[.)]$/;

/** A warning the client set as its own labelled line. */
const WARNING_LABEL = /^(The Danger|The Hazard|Danger|Hazard|Warning|Caution)\s*:\s*/i;

function isBullet(b) {
  return b.type === "subitem";
}

function groupRuns(blocks, counts) {
  const out = [];
  let i = 0;

  const flush = (run) => {
    if (!run.length) return;
    if (run.length === 1) {
      // A lone bullet is a sentence, not a list.
      out.push({ ...strip(run[0]), type: "paragraph" });
      return;
    }
    const ordered = run.every((b) => NUMBERED_LABEL.test(String(b.label ?? "")));
    counts.lists += 1;
    out.push({
      type: "list",
      ...(ordered ? { ordered: true } : {}),
      items: run.map((b) => b.text),
      origin: run[0].origin,
      sourceDoc: run[0].sourceDoc,
      sourcePage: run[0].sourcePage,
    });
  };

  const strip = (b) => {
    const { level, label, ...rest } = b;
    void level;
    void label;
    return rest;
  };

  while (i < blocks.length) {
    const b = blocks[i];
    if (!isBullet(b)) {
      out.push(b);
      i += 1;
      continue;
    }

    // A line the client labelled as a danger or a hazard is a warning, and the
    // product already has a component for one. The label becomes its title.
    const warning = WARNING_LABEL.exec(String(b.text));
    if (warning) {
      counts.callouts += 1;
      const { level, label, text, ...rest } = b;
      void level;
      void label;
      out.push({
        ...rest,
        type: "note",
        title: warning[1].replace(/^The\s+/i, ""),
        text: text.slice(warning[0].length).trim(),
      });
      i += 1;
      continue;
    }

    // A short bullet ending in a colon introduces what follows it.
    const words = String(b.text).trim().split(/\s+/).length;
    const next = blocks[i + 1];
    if (LEAD_IN.test(String(b.text).trim()) && words <= 14 && next && isBullet(next)) {
      out.push({ ...strip(b), type: "paragraph" });
      i += 1;
      continue;
    }

    // A run never crosses a page, let alone a document: the blocks arrive
    // grouped by page, and joining across a seam would build a list whose
    // items came from two different places and cite only the first.
    const run = [];
    const level = b.level ?? 1;
    const sameOrigin = (x) => x.sourceDoc === b.sourceDoc && x.sourcePage === b.sourcePage;
    while (i < blocks.length && isBullet(blocks[i]) && (blocks[i].level ?? 1) === level && sameOrigin(blocks[i])) {
      const cur = blocks[i];
      const curWords = String(cur.text).trim().split(/\s+/).length;
      const after = blocks[i + 1];
      // Stop before the next lead-in so it heads its own list.
      if (run.length && WARNING_LABEL.test(String(cur.text))) break;
      if (run.length && LEAD_IN.test(String(cur.text).trim()) && curWords <= 14 && after && isBullet(after)) break;
      run.push(cur);
      i += 1;
    }
    flush(run);
  }

  return out;
}

/** Everything the author wrote, wrapped around everything the client supplied. */
async function topicBlocks(topic, docs, deck, cache, counts, tooling) {
  const blocks = [];
  const add = (b) => {
    blocks.push({ ...b, origin: "authored" });
    counts.authored += 1;
  };

  if (topic.intro) add({ type: "paragraph", text: topic.intro, lead: true });
  if (topic.definition) add({ type: "definition", term: topic.term ?? topic.title, text: topic.definition });

  const notes = (sha) => topic.diagramNotes?.[sha] ?? null;
  const seenText = new Set();
  const seenFigure = new Set();
  const sourceBlocks = [];

  for (const claim of topic.claims) {
    for (const block of resolveClaim(docs, claim, tooling.pulled, tooling.skippedBlocks)) {
      const rendered = renderBlock(
        block, deck, cache, counts, notes, tooling.isRejectedImage, tooling.demoted,
        docs.get(claim.doc)?.codes ?? new Set(),
      );
      if (!rendered) continue;

      if (rendered.type === "figure") {
        if (seenFigure.has(rendered.__asset.sha1)) {
          counts.figureRepeats += 1;
          continue;
        }
        seenFigure.add(rendered.__asset.sha1);
      } else {
        // Only substantial prose is de-duplicated. The questions document
        // labels every one of its forty-six answers "The Model Answer:", and a
        // structural label that is meant to repeat is not a duplicate — it is
        // the shape of the page. A genuinely duplicated paragraph is long.
        const key = String(rendered.text).toLowerCase().replace(/[^a-z0-9]+/g, "");
        const long = String(rendered.text).trim().split(/\s+/).length >= 12;
        if (long && key && seenText.has(key)) {
          counts.textRepeats += 1;
          continue;
        }
        if (long && key) seenText.add(key);
      }

      // The original text is carried alongside so a reshape rule can find the
      // block it applies to; it comes off again below.
      sourceBlocks.push({ ...rendered, origin: "source", __text: String(block.text ?? "").trim() });
    }
  }

  // A line that is nothing but a label — "The Model Answer:" — introduces the
  // lines indented beneath it. Left as a list item it gets a box of its own
  // with no content in it, which reads as a stray fragment; as a heading it
  // does the job the client gave it.
  for (const [i, b] of sourceBlocks.entries()) {
    if (b.type !== "subitem" || !/^[A-Z][A-Za-z' ]{2,28}:$/.test(String(b.text ?? ""))) continue;
    const next = sourceBlocks[i + 1];
    if (!next || next.type !== "subitem" || (next.level ?? 1) <= (b.level ?? 1)) continue;
    sourceBlocks[i] = { ...b, type: "subheading", text: String(b.text).replace(/:$/, "") };
    counts.headings += 1;
  }

  // Reshaping is per page, because that is the unit the client laid out — a
  // table, a callout box, a dashed list all live on one page.
  const byPage = new Map();
  for (const b of sourceBlocks) {
    const k = `${b.sourceDoc}:p${b.sourcePage}`;
    if (!byPage.has(k)) byPage.set(k, []);
    byPage.get(k).push(b);
  }
  const assembled = [];
  for (const [k, group] of byPage) {
    const rules = tooling.reshape[k] ?? [];
    for (const b of applyReshapes(group, rules, tooling.reshapeUsed)) {
      delete b.__text;
      assembled.push(b);
    }
  }
  for (const b of groupRuns(assembled, counts)) {
    blocks.push(b);
    counts.source += 1;
    if (b.type === "table") counts.tables += 1;
  }

  if (topic.keyPoints?.length) add({ type: "keypoints", items: topic.keyPoints });
  if (topic.example) add({ type: "example", title: topic.exampleTitle ?? "Worked example", text: topic.example });
  if (topic.context) add({ type: "context", text: topic.context });
  if (topic.misconception) add({ type: "misconception", text: topic.misconception });
  if (topic.takeaway) add({ type: "takeaway", text: topic.takeaway });

  return blocks;
}

/* ============================================================ the checks */

function audit(curriculum, docs) {
  const problems = [];

  const names = curriculum.modules.map((m) => m.title);
  if (names.length !== PRESCRIBED_MODULES.length || names.some((n, i) => n !== PRESCRIBED_MODULES[i])) {
    problems.push(
      "the modules do not match the PRD list.\n" +
        `  prescribed: ${PRESCRIBED_MODULES.join(" | ")}\n` +
        `  declared:   ${names.join(" | ")}`,
    );
  }

  // Every block of every supplied document is claimed exactly once, or skipped
  // with a reason written next to it.
  const owner = new Map();
  const twice = [];
  const pulled = pulledBlocks(curriculum, docs);
  const skippedOne = skippedBlocks(curriculum, docs);
  for (const m of curriculum.modules) {
    for (const topic of m.topics) {
      for (const claim of topic.claims) {
        for (const block of resolveClaim(docs, claim, pulled, skippedOne)) {
          const key = `${claim.doc}:${block.index}`;
          if (owner.has(key)) twice.push(`${key} (${owner.get(key)} and ${topic.title})`);
          owner.set(key, topic.title);
        }
      }
    }
  }
  if (twice.length) problems.push(`${twice.length} block(s) claimed twice: ${twice.slice(0, 6).join(", ")}`);

  for (const [key, reason] of Object.entries(curriculum.skip ?? {})) {
    if (!reason || String(reason).trim().length < 12) {
      problems.push(`skip "${key}" has no usable reason`);
    }
  }

  const skipped = new Set(skippedOne.keys());
  for (const key of Object.keys(curriculum.skip ?? {})) {
    const [docKey, what] = key.split(":");
    const doc = docs.get(docKey);
    if (!doc) {
      problems.push(`skip "${key}" names a document that was not supplied`);
      continue;
    }
    const isPage = /^p\d+$/.test(what);
    const hit = doc.blocks.filter((b) => (isPage ? `p${b.page}` === what : b.section === what));
    if (!hit.length) problems.push(`skip "${key}" matches nothing in the source`);
    for (const b of hit) skipped.add(`${docKey}:${b.index}`);
  }

  const both = [...skipped].filter((k) => owner.has(k));
  if (both.length) problems.push(`${both.length} block(s) both claimed and skipped, e.g. ${both.slice(0, 4).join(", ")}`);

  const missing = [];
  for (const [docKey, doc] of docs) {
    for (const b of doc.blocks) {
      const key = `${docKey}:${b.index}`;
      if (!owner.has(key) && !skipped.has(key)) missing.push(`${docKey} p${b.page} ${b.section ?? ""}`);
    }
  }
  if (missing.length) {
    const seen = [...new Set(missing)];
    problems.push(`${missing.length} supplied block(s) neither taught nor skipped, in: ${seen.slice(0, 10).join(", ")}`);
  }

  const slugs = curriculum.modules.flatMap((m) => m.topics.map((t) => t.slug ?? slugify(t.title)));
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupes.length) problems.push(`duplicate lesson slugs: ${[...new Set(dupes)].join(", ")}`);

  return { problems, claimed: owner.size, skipped: skipped.size };
}

/* ============================================================== the build */

async function main() {
  const dry = process.argv.includes("--dry");
  const flag = process.argv.indexOf("--course");
  const courseSlug = flag === -1 ? "ppl-flight-test" : process.argv[flag + 1];

  const { curriculum } = await import(
    courseSlug === "ppl-flight-test"
      ? "../content/groundwork/ppl-flight-test.mjs"
      : "../content/groundwork/cpl-flight-test.mjs"
  );

  // A curriculum names the supplied documents it is built from, and the
  // coverage gate then covers those and only those. CPL names none, because
  // none has been supplied, and its gate is correspondingly empty rather than
  // measuring it against somebody else's material.
  const docs = loadSource(
    curriculum.documents ?? [],
    curriculum.furniture ?? [],
    curriculum.splitLines ?? {},
    curriculum.joinPages ?? [],
  );
  const { problems, claimed, skipped } = audit(curriculum, docs);
  if (problems.length) {
    throw new Error(`${courseSlug}: the curriculum does not account for the source\n  - ${problems.join("\n  - ")}`);
  }

  // Each reshape rule is given a key so the build can tell afterwards which
  // ones never matched. A rule that matches nothing is a rule that was written
  // against text the document no longer contains, and leaving it in place
  // would make the curriculum look like it is handling something it is not.
  const reshape = {};
  for (const [where, rules] of Object.entries(curriculum.reshape ?? {})) {
    reshape[where] = rules.map((r, i) => {
      if (!String(r.reason ?? "").trim()) throw new Error(`${courseSlug}: reshape ${where}[${i}] has no reason`);
      return { ...r, __key: `${where}[${i}]` };
    });
  }
  const reshapeUsed = new Set();

  const tooling = {
    isRejectedImage: curriculum.isRejectedImage ?? (() => false),
    demoted: new Set(Object.keys(curriculum.demoteHeadings ?? {})),
    reshape,
    reshapeUsed,
    pulled: pulledBlocks(curriculum, docs),
    skippedBlocks: skippedBlocks(curriculum, docs),
  };
  for (const [key, reason] of Object.entries(curriculum.demoteHeadings ?? {})) {
    if (!reason || String(reason).trim().length < 12) {
      throw new Error(`${courseSlug}: demoteHeadings "${key}" has no usable reason`);
    }
  }

  const counts = {
    source: 0, authored: 0, figures: 0, figuresRejected: 0,
    figureRepeats: 0, textRepeats: 0, headings: 0, tables: 0, lists: 0, callouts: 0, headingRepeats: 0,
  };
  const cache = new Map();
  const built = [];

  for (const [i, module] of curriculum.modules.entries()) {
    const lessons = [];
    for (const [j, topic] of module.topics.entries()) {
      const raw = await topicBlocks(topic, docs, curriculum.deck, cache, counts, tooling);

      // A heading that says exactly what the page is already called adds
      // nothing: the lesson title is the h1 and the module name is in the
      // breadcrumb above it, so the source heading arrives as a third copy of
      // the same words. Dropping it removes a repetition, not information.
      const same = (a, b) => slugify(String(a)) === slugify(String(b));
      const blocks = raw.filter((b) => {
        if (b.type !== "subheading") return true;
        if (!same(b.text, topic.title) && !same(b.text, module.title)) return true;
        counts.headingRepeats += 1;
        counts.source -= 1;
        return false;
      });
      const pages = blocks.map((b) => b.sourcePage).filter(Boolean);
      lessons.push({
        // A topic may name its own slug where the title is better kept short.
        // The nav prints the module name directly above the lesson, so a lesson
        // does not have to repeat it — but the URL should still say which one.
        slug: topic.slug ?? slugify(topic.title),
        title: topic.title,
        displayOrder: j * 10,
        sourceFrom: pages.length ? Math.min(...pages) : null,
        sourceTo: pages.length ? Math.max(...pages) : null,
        blocks,
      });
    }
    built.push({ title: module.title, summary: module.intro ?? null, displayOrder: i * 10, lessons });
  }

  const hollow = built.flatMap((m) => m.lessons.filter((l) => l.blocks.length === 0).map((l) => l.title));
  if (hollow.length) throw new Error(`${courseSlug}: lesson(s) with no content — ${hollow.join(", ")}`);
  const empty = built.filter((m) => m.lessons.length === 0).map((m) => m.title);
  if (empty.length && !curriculum.shellsOnly) {
    throw new Error(`${courseSlug}: module(s) with no lessons — ${empty.join(", ")}`);
  }

  const unusedReshapes = Object.values(reshape)
    .flat()
    .filter((r) => !reshapeUsed.has(r.__key))
    .map((r) => `${r.__key} "${(r.from?.[0] ?? r.match ?? "").slice(0, 46)}"`);
  if (unusedReshapes.length) {
    throw new Error(`reshape rules that matched nothing:\n   ${unusedReshapes.join("\n   ")}`);
  }

  const summary = {
    course: courseSlug,
    modules: built.length,
    lessons: built.reduce((n, m) => n + m.lessons.length, 0),
    claimed,
    skipped,
    // Two different things, kept apart: a block taken out of the document
    // altogether, and a caption trimmed off the tail of a block that stays.
    // Only the first changes how many blocks there are to account for.
    furnitureDropped: (loadSource.removed ?? []).filter((r) => r.kind === "dropped").length,
    furnitureTrimmed: (loadSource.removed ?? []).filter((r) => r.kind === "trimmed").length,
    ...counts,
  };

  if (dry) {
    console.table([summary]);
    console.log("\ndry run — nothing written");
    await db.$disconnect();
    return;
  }

  // Looked up, never created. The course, the subject, the products that grant
  // them and the entitlements that reference them all exist already.
  const subject = await db.subject.findFirst({
    where: { slug: curriculum.subject, course: { slug: courseSlug } },
    select: { id: true, title: true },
  });
  if (!subject) throw new Error(`no subject "${curriculum.subject}" in ${courseSlug}`);

  // Resolve the media before the transaction: writing files and rows inside it
  // would hold the transaction open for the length of the disk work.
  for (const m of built) {
    for (const lesson of m.lessons) {
      for (const block of lesson.blocks) {
        if (!block.__asset) continue;
        const assetId = await ensureAsset(db, curriculum.deck, `${block.__asset.sha1}.png`, cache, {
          sourcePath: block.__asset.file,
        });
        if (!assetId) throw new Error(`could not store ${block.__asset.sha1}`);
        block.assetId = assetId;
        block.asset = `study/${block.__asset.sha1}.png`;
        delete block.__asset;
      }
    }
  }

  const unmatchedChapters = [];

  await db.$transaction(
    async (tx) => {
      // Replacing the modules of this subject replaces this course's
      // groundwork and nothing else. Progress rows hang off lessons and are
      // counted before and after so a rebuild that would discard a student's
      // progress is visible rather than silent.
      await tx.courseModule.deleteMany({ where: { subjectId: subject.id } });

      for (const m of built) {
        const row = await tx.courseModule.create({
          data: {
            subjectId: subject.id,
            title: m.title,
            summary: m.summary,
            displayOrder: m.displayOrder,
            origin: "AUTHORED",
            status: "PUBLISHED",
          },
          select: { id: true },
        });
        for (const lesson of m.lessons) {
          await tx.lesson.create({
            data: {
              moduleId: row.id,
              slug: lesson.slug,
              title: lesson.title,
              displayOrder: lesson.displayOrder,
              sourceFrom: lesson.sourceFrom,
              sourceTo: lesson.sourceTo,
              status: "PUBLISHED",
              content: { create: { blocks: lesson.blocks } },
            },
          });
        }
      }

      // The chapter rows are the course's other front door: the dashboard
      // resumes into one, and the course page lists them. They were seeded
      // with placeholder text that told a student the real material "is
      // uploaded through the admin console", which is both untrue as far as a
      // student is concerned and internal vocabulary they should never read.
      //
      // The rows themselves are left alone — the ids, the slugs and the
      // progress that hangs off them all survive — and only their content is
      // rewritten, as the module's front door rather than a second copy of the
      // teaching: what the module covers, and the list of topics inside it.
      const chapters = await tx.chapter.findMany({
        where: { subjectId: subject.id },
        select: { id: true, slug: true, title: true },
      });
      for (const chapter of chapters) {
        const m = built.find((x) => slugify(x.title) === chapter.slug);
        if (!m) {
          unmatchedChapters.push(chapter.slug);
          continue;
        }
        // No heading block: the page prints the chapter title above the body
        // already, and a second copy of it reads like a mistake.
        const blocks = [];
        if (m.summary) blocks.push({ type: "paragraph", text: m.summary });
        if (m.lessons.length) {
          blocks.push({ type: "subheading", text: "What this module covers" });
          blocks.push({ type: "list", items: m.lessons.map((l) => l.title) });
        } else {
          blocks.push({
            type: "note",
            variant: "info",
            title: "In preparation",
            // The summary above already says the material is coming; this adds
            // the part a student actually wants to know, which is whether the
            // course is going to change shape under them.
            text:
              "These eight modules are the ones the flight test itself is " +
              "organised around, so the structure of the course will not " +
              "change when the material lands.",
          });
        }
        await tx.chapterContent.upsert({
          where: { chapterId: chapter.id },
          create: { chapterId: chapter.id, blocks },
          update: { blocks },
        });
      }
    },
    { timeout: 180_000 },
  );

  if (unmatchedChapters.length) {
    console.log(`
chapters with no matching module, left untouched: ${unmatchedChapters.join(", ")}`);
  }

  console.table([summary]);
  await db.$disconnect();
}

// Only when this file is what was run. `groundwork-validate.mjs` and
// `groundwork-report.mjs` import PRESCRIBED_MODULES from here, and without
// this guard the import alone would rebuild the course — a read-only check
// that quietly writes to the database is not a check.
const invoked = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (invoked) main().catch(async (error) => {
  console.error(String(error.message ?? error));
  await db.$disconnect();
  process.exit(1);
});
