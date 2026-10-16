/**
 * Putting the semantic shape back on content lifted from the decks.
 *
 * The builders turn a source text line at outline level 0 into a `paragraph`
 * and nothing else. For the seven PowerPoint sources that loses slide titles
 * and top-level bullets; for the eight extracted from PDF, where every line is
 * at level 0, it loses everything — a page of bullet points becomes a run of
 * prose paragraphs, a numbered procedure loses its order, and a caution reads
 * as ordinary body text.
 *
 * This module decides, from evidence rather than from appearance, which of
 * those paragraphs were something else. It is deliberately narrow. Measuring
 * the 2,450 runs of unpunctuated fragments the audit found showed three
 * different things wearing one shape:
 *
 *   - genuine bullet lists      ("Glider Tow Rating", "Parachute Drop Rating")
 *   - two-column tables         ("Gliding Distance", "30 min", "50 NM")
 *   - a lead-in and its bullets ("… is current if it:", "Was issued within …")
 *
 * Only the first can be repaired without guessing, so only the first is
 * repaired. A run carrying a bare measurement is reported as a suspected table
 * and left alone, because reconstructing columns from a flat list means
 * inventing which cell each value belongs to. A run whose first line ends in a
 * colon keeps that line as the paragraph it is and lists what follows.
 *
 * Nothing here rewrites words. Every repair moves text between blocks or
 * changes a block type; the only characters it removes are a leading "1." from
 * a step whose number the ordered list then supplies, and whole lines that are
 * demonstrably furniture, a duplicate, or the lesson title repeated.
 */

/* ------------------------------------------------------------------ shapes */

export const TERMINAL = /[.!?]["')\]’”]?\s*$/;
export const LEAD_IN = /:\s*$/;
export const STARTS_LOWER = /^[a-z]/;
export const ORDINAL = /^\(?(\d{1,2})[.)]\s+(.+)$/s;
/**
 * A marker and what follows it.
 *
 * The separator set is wider than it looks because these decks are not
 * consistent: alongside "CAUTION:" they write "NOTE;" and "NOTE#". Reading only
 * a colon left the semicolon and hash inside the body — a callout reading
 * "; Always write the ZULU time by the plotted position line." — and refused
 * the callout altogether when the rule was tightened to require a separator.
 */
export const CALLOUT = /^(caution|warning|important|note|remember|danger)\b\s*[:;#–—-]?\s*(.*)$/is;
/** The characters these decks use to punctuate a marker off from its body. */
export const CALLOUT_SEPARATOR = /^[:;#–—-]/;

/**
 * A line that is only a quantity.
 *
 * "30 min", "50 NM", "1000ft", "5 years". On a slide these are the right-hand
 * column of a table, and a flat list of them is what a flattened table looks
 * like. Their presence in a run is the signal to leave the run alone.
 */
export const MEASURE_ONLY =
  /^[«(\[]?\s*\d[\d.,]*\s*(ft|feet|m|km|nm|kt|kts|knots|fpm|hr|hrs|hours?|min|mins|minutes|sec|secs|seconds?|days?|weeks?|months?|years?|kg|lb|lbs|%|°|deg|hpa|inhg|mb|c|f)?\s*[»)\]]?$/i;

/** Furniture a deck prints on every page rather than teaching. */
const FURNITURE = [
  /^page\s+\d+(\s+of\s+\d+)?$/i,
  /^\d{1,3}$/,
  /^(issue|revision|rev)\.?\s*\d+/i,
  /^(amendment|amdt)\s*\d+/i,
  /^(copyright|©)\b/i,
  /^all rights reserved/i,
  /^(confidential|draft)$/i,
  /^slide\s+\d+$/i,
  /^(continued|cont’?d\.?|contd\.?)$/i,
];

export const isFurniture = (text) => FURNITURE.some((re) => re.test(String(text ?? "").trim()));

/** Comparable form of a line: what it says, not how it was typed. */
export const shapeOf = (text) =>
  String(text ?? "")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Every word a block holds, for proving a repair changed no wording. */
export function wordsOf(block) {
  const parts = [];
  // Term before text, because that is the order a definition is read in. The
  // other way round reported every restored definition as a reordering of the
  // words it had kept.
  // A definition is read term first and a callout marker first, because that is
  // where they sit on the page. Reading the body first reported every one of
  // them as having reordered the words it had kept.
  const order =
    block?.type === "definition"
      ? ["term", "text", "title", "label", "caption", "alt"]
      : block?.type === "note"
        ? ["title", "text", "term", "label", "caption", "alt"]
        : ["text", "term", "title", "label", "caption", "alt"];
  for (const key of order) {
    if (typeof block?.[key] === "string") parts.push(block[key]);
  }
  if (Array.isArray(block?.items)) parts.push(...block.items.map(String));
  if (Array.isArray(block?.headers)) parts.push(...block.headers.map(String));
  if (Array.isArray(block?.rows)) for (const row of block.rows) parts.push(...row.map(String));
  return parts.join(" ").toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

/* ------------------------------------------------------------ the decisions */

const FINITE_VERB = /\b(is|are|was|were|will|shall|must|should|can|may|has|have|does|do|describe|used)\b/i;

/**
 * Does this read as a heading, rather than as a sentence that happens to be short?
 *
 * The extractor records whatever sat in a slide's title frame as that slide's
 * title, and on these decks that is sometimes a lead-in — "Common terms used
 * to describe aerofoils are:" — rather than a heading. Promoting one of those
 * is worse than leaving the paragraph it reads as, because the reader
 * title-cases headings and would print it "Common Terms Used To Describe
 * Aerofoils Are:".
 */
export function headingShaped(text) {
  const t = String(text ?? "").trim();
  if (!t || t.length > 72) return false;
  if (TERMINAL.test(t) || LEAD_IN.test(t)) return false;
  if (STARTS_LOWER.test(t)) return false;
  if (FINITE_VERB.test(t)) return false;
  return /[A-Za-z]/.test(t) && t.split(/\s+/).length <= 9;
}

/* ------------------------------------------------------------- definitions */

/** A left-hand side that labels something else rather than naming a term. */
const NOT_A_TERM =
  /^(step|stage|phase|example|answer|question|note|caution|warning|danger|important|prompt|examiner prompt|remember|task|aim|objective|method|summary|conclusion|introduction|overview|contents?)\b/i;
const TERM_COLON = /^([^:]{1,46}):\s+(.{20,})$/s;

/**
 * Did the source write this line as a term and its definition?
 *
 * The decks set out definitions on one line — "Radiation fog: Caused by the
 * Earth cooling at night due to the loss of terrestrial radiation." — and
 * stored as a paragraph the term is indistinguishable from the sentence around
 * it. The reader has a pattern for exactly this shape.
 *
 * Only source-origin blocks, because the authored lead-ins wear the same shape
 * and are not definitions: "The geometry of a good fix: how many lines, at
 * what angles, and what the triangle they leave behind is telling you" is the
 * course introducing what follows.
 *
 * The term must read as a noun phrase, and the definition must be a finished
 * sentence. An en-dash early in the body is how these decks open a list of
 * points, so "Chart use: Pinpoints – be accurate, make sure you know exactly
 * where you are" is a lead-in and stays a paragraph.
 */
export function definitionPair(block, context = {}) {
  if (block?.type !== "paragraph" || block.origin === "authored") return null;
  if (typeof block.text !== "string") return null;
  const m = block.text.trim().match(TERM_COLON);
  if (!m) return null;
  const [, term, body] = m;
  if (NOT_A_TERM.test(term) || FINITE_VERB.test(term)) return null;
  if (term.split(/\s+/).length > 4) return null;
  if (!/^[A-Z0-9]/.test(term)) return null;
  if (!TERMINAL.test(body.trim())) return null;
  if (/[–—-]/.test(body.slice(0, 24))) return null;

  /*
   * A colon inside one item of a list is not a definition.
   *
   * The symptom list on page 52 of the CPL Human Factors deck runs "Joint
   * pain." / "Itchiness and Numbness." / "Stomach pain." / "Disturbances in
   * vision: loss of acuity, flashes, blank areas." Every line is a symptom; the
   * colon on the fourth introduces examples. Reading it as a definition picks
   * one item out of a list and presents it as the term the topic turns on.
   *
   * What separates that from a real definition list is the company it keeps.
   * The fog definitions sit together — "Radiation fog: …", "Advection fog: …",
   * "Steam fog: …" — so each of them has a sibling of the same shape. A lone
   * colon among plain sentences does not.
   */
  // The question is not whether a sibling shares the shape. A definition can
  // stand alone — "Blood: composed of plasma carrying red and white blood
  // cells." is the only one on its page and is still a definition. Asking for a
  // sibling of the same shape rejected those too.
  //
  // What disqualifies the symptom line is the kind of company it keeps: it sits
  // inside a run of short, plainly punctuated items with no colons among them,
  // which is a list. A page of prose, or a page of other term-and-colon pairs,
  // is not.
  const siblings = context.siblings ?? null;
  if (siblings && siblings.length) {
    const alsoAPair = siblings.some((s) => {
      if (!s || s === block) return false;
      if (s.type === "definition") return true;
      return s.type === "paragraph" && typeof s.text === "string" && TERM_COLON.test(s.text.trim());
    });
    const plainListItems = siblings.filter(
      (s) =>
        s &&
        s !== block &&
        s.type === "paragraph" &&
        typeof s.text === "string" &&
        s.text.trim().length < 80 &&
        TERMINAL.test(s.text.trim()) &&
        !s.text.includes(":"),
    ).length;
    if (!alsoAPair && plainListItems >= 2) return null;
  }

  return { term: term.trim(), text: body.trim() };
}

/** Does this run of lines read as an itemised list and nothing else? */
export function isPlainList(items) {
  if (items.length < 3) return false;
  return items.every(
    (t) =>
      t.length > 0 &&
      t.length <= 120 &&
      !TERMINAL.test(t) &&
      !LEAD_IN.test(t) &&
      !STARTS_LOWER.test(t) &&
      !MEASURE_ONLY.test(t) &&
      t.split(/\s+/).length >= 2,
  );
}

/** Does this run look like a table that lost its columns? */
export function looksLikeFlattenedTable(items) {
  if (items.length < 3) return false;
  const measures = items.filter((t) => MEASURE_ONLY.test(t)).length;
  return measures >= 1 && measures < items.length;
}

/**
 * One pass over a record, returning the repaired blocks and what was done.
 *
 * `pageTitleOf(block)` answers "what did the extractor call the page this
 * block came from", or null. `recordTitle` is the lesson or item title, which
 * is already rendered as the page heading and so must not be repeated in the
 * body.
 */
/* -------------------------------------------------- regulatory structure */

/** A line the source closed as one item of a list. */
const ITEM_END = /(;|;\s*(and|or))\s*$/i;
/** The last item closes the sentence the lead-in opened. */
const LAST_END = /[.]\s*$/;
/** The source ends a line this way when the next line is a separate clause. */
const CLAUSE_CONNECTOR = /;\s*(and|or)?\s*$/i;

/**
 * A regulation's list, which the bullet rule refuses on sight.
 *
 * `isPlainList` rejects a line beginning in lower case, because such a line
 * usually continues the one above it. A rule's list is the exception: its items
 * complete the lead-in grammatically, so every one of them begins in lower
 * case. Page 213 of the PPL Air Law deck prints
 *
 *     Packages shall be marked and labelled showing:
 *     the proper shipping name of the Dangerous Goods …;
 *     when assigned, the corresponding UN number …;
 *     …
 *     any other markings as specified in the Technical Instructions.
 *
 * and stored as six paragraphs the structure of the requirement — five separate
 * things, all of them required — is gone. The discriminator is the punctuation
 * the source used, not capitalisation: a lead-in ending in a colon, then items
 * closed with semicolons and a full stop on the last.
 *
 * Every item must also be its own line in the extraction, which is what
 * `pageLinesOf` is for. Without it this rule does nothing, so a caller that
 * cannot supply the source lines gets the old behaviour rather than a guess.
 */
function regulatoryList(blocks, i, pageLinesOf) {
  const lead = blocks[i];
  if (lead?.type !== "paragraph" || typeof lead.text !== "string") return null;
  if (!LEAD_IN.test(lead.text.trim())) return null;
  if (lead.sourcePage == null) return null;

  const lines = pageLinesOf(lead);
  if (!lines || !lines.length) return null;
  const onPage = lines.map(shapeOf);
  if (!onPage.includes(shapeOf(lead.text))) return null;

  const run = [];
  let j = i + 1;
  while (j < blocks.length) {
    const b = blocks[j];
    if (b?.type !== "paragraph" || typeof b.text !== "string") break;
    if (b.sourcePage !== lead.sourcePage) break;
    const t = b.text.trim();
    if (!t || LEAD_IN.test(t)) break;
    const isItem = ITEM_END.test(t);
    const isLast = LAST_END.test(t);
    if (!isItem && !isLast) break;
    run.push({ block: b, text: t });
    j += 1;
    if (isLast) break;
  }

  if (run.length < 2) return null;
  if (!run.some((r) => ITEM_END.test(r.text))) return null;
  if (!run.every((r) => onPage.includes(shapeOf(r.text)))) return null;

  return { items: run.map((r) => r.text), through: j - 1, from: run[0].block };
}

/**
 * A block the rejoin pass welded together across a list boundary.
 *
 * The courses were built with a repair that rejoins a sentence the extractor
 * split across text frames. Where a rule lists its requirements each item ends
 * in a semicolon, so that repair read the semicolon as an unfinished sentence
 * and ran the last two items into one — "Is clearly illuminated; or Has lighted
 * position lights; or Is in an area that is marked by obstruction lights."
 * became a single sentence, and three alternatives stopped looking like
 * alternatives.
 *
 * The split comes from the manifest: the stored text must be exactly the
 * concatenation of consecutive recorded lines, and the boundary is where those
 * lines ended. Nothing is cut on punctuation in the stored text.
 */
function mergedSourceLines(block, pageLinesOf) {
  if (block?.type !== "paragraph" || typeof block.text !== "string") return null;
  if (block.sourcePage == null) return null;
  const text = block.text.trim();
  if (text.length < 60) return null;

  const lines = (pageLinesOf(block) ?? []).map((l) => String(l).trim()).filter(Boolean);
  if (lines.length < 2) return null;
  const shapes = lines.map(shapeOf);
  const want = shapeOf(text);
  if (shapes.includes(want)) return null;

  for (let s = 0; s < lines.length; s++) {
    let acc = shapes[s];
    if (!want.startsWith(acc)) continue;
    for (let e = s + 1; e < lines.length; e++) {
      acc = `${acc} ${shapes[e]}`;
      if (acc === want) {
        const parts = lines.slice(s, e + 1);
        // Only a merge across a list boundary. A sentence the extractor
        // genuinely split was rejoined on purpose, and undoing that re-breaks it.
        if (!parts.slice(0, -1).some((p) => CLAUSE_CONNECTOR.test(p))) return null;
        return { parts };
      }
      if (!want.startsWith(acc)) break;
    }
  }
  return null;
}

export function repairBlocks(
  blocks,
  { pageTitleOf = () => null, pageLinesOf = () => null, recordTitle = "" } = {},
) {
  const changes = [];
  const titleShape = shapeOf(recordTitle);
  const out = [];

  const note = (category, detail) => changes.push({ category, ...detail });

  /*
   * Un-merging comes first, over the whole record.
   *
   * A regulation's list cannot be recognised while its last two items are
   * still one block: the run breaks at the welded pair, because that pair is
   * not a line the source printed. Doing this inside the same loop left the
   * list rule reading the unrepaired array and finding nothing, so it is a
   * pass of its own.
   */
  let work = blocks;
  if (pageLinesOf !== undefined) {
    const split = [];
    let touched = false;
    for (const [i, b] of blocks.entries()) {
      const merged = mergedSourceLines(b, pageLinesOf);
      if (!merged) {
        split.push(b);
        continue;
      }
      for (const part of merged.parts) split.push({ ...b, text: part });
      note("source-lines-unmerged", {
        index: i,
        parts: merged.parts.length,
        sourcePage: b.sourcePage ?? null,
      });
      touched = true;
    }
    if (touched) work = split;
  }

  for (let i = 0; i < work.length; i++) {
    const b = work[i];

    if (b?.type !== "paragraph" || typeof b.text !== "string") {
      out.push(b);
      continue;
    }


    /* ---- a regulation's list, whose items all begin in lower case ---- */
    const regulatory = regulatoryList(work, i, pageLinesOf);
    if (regulatory) {
      out.push(b);
      out.push({
        type: "list",
        items: regulatory.items,
        origin: regulatory.from.origin ?? "source",
        ...(b.sourcePage != null ? { sourcePage: b.sourcePage } : {}),
        ...(b.sourceDoc ? { sourceDoc: b.sourceDoc } : {}),
      });
      note("regulatory-list", {
        index: i,
        items: regulatory.items.length,
        sourcePage: b.sourcePage ?? null,
      });
      i = regulatory.through;
      continue;
    }

    const text = b.text.trim();
    if (!text) {
      note("empty-block", { index: i });
      continue;
    }

    /* ---- furniture ---- */
    if (isFurniture(text)) {
      note("slide-furniture", { index: i, removed: text, sourcePage: b.sourcePage ?? null });
      continue;
    }

    /* ---- the record title repeated in its own body ---- */
    if (titleShape && shapeOf(text) === titleShape) {
      note("title-echo", { index: i, removed: text, recordTitle });
      continue;
    }

    /* ---- a duplicate of the block just emitted ---- */
    const last = out[out.length - 1];
    if (last && typeof last.text === "string" && shapeOf(last.text) === shapeOf(text)) {
      note("duplicate-adjacent", { index: i, removed: text });
      continue;
    }

    /* ---- a caution that reads as body text ---- */
    //
    // The marker has to be used as a marker. These words are also ordinary
    // English, and reading them as labels wherever they start a line broke
    // fifty-five sentences: "Remember to read back the clearance" became a
    // callout titled Remember whose body was "to read back the clearance";
    // "Danger areas are depicted on VNCs" became a DANGER warning announcing
    // that "areas are depicted on VNCs"; "Warning of controlled flight into
    // terrain" lost the noun it was the start of.
    //
    // What separates the two is what follows. A marker is punctuated off from
    // its body, or the body begins as its own sentence. A marker doing the work
    // of a verb, an adjective or a noun runs straight on in lower case.
    const callout = text.match(CALLOUT);
    const marked =
      callout &&
      (CALLOUT_SEPARATOR.test(text.slice(callout[1].length).trim()) || /^[A-Z0-9"“(]/.test(callout[2]));
    if (marked && callout[2] && callout[2].trim().length > 12) {
      const marker = callout[1].toLowerCase();
      const severe = marker === "caution" || marker === "warning" || marker === "danger" || marker === "important";
      out.push({
        ...b,
        type: "note",
        variant: severe ? "warning" : "info",
        title: callout[1].replace(/^./, (c) => c.toUpperCase()),
        text: callout[2].trim(),
      });
      note("warning-lost", { index: i, marker: callout[1], variant: severe ? "warning" : "info" });
      continue;
    }

    /* ---- a definition the source wrote on one line ---- */
    const siblings =
      b.sourcePage == null
        ? null
        : work.filter((x) => x && x !== b && x.sourcePage === b.sourcePage);
    const pair = definitionPair(b, { siblings });
    if (pair) {
      out.push({
        type: "definition",
        term: pair.term,
        text: pair.text,
        origin: b.origin ?? "source",
        ...(b.sourcePage != null ? { sourcePage: b.sourcePage } : {}),
        ...(b.sourceDoc ? { sourceDoc: b.sourceDoc } : {}),
      });
      note("definition-restored", { index: i, term: pair.term, sourcePage: b.sourcePage ?? null });
      continue;
    }

    /* ---- the slide title, stored as a paragraph ---- */
    const pageTitle = pageTitleOf(b);
    if (
      pageTitle &&
      !String(pageTitle).includes("\n") &&
      shapeOf(pageTitle) === shapeOf(text) &&
      headingShaped(text)
    ) {
      out.push({ ...b, type: "heading", text });
      note("heading-as-paragraph", { index: i, sourcePage: b.sourcePage ?? null, slideTitle: pageTitle });
      continue;
    }

    /* ---- a numbered procedure split across paragraphs ---- */
    const ord = text.match(ORDINAL);
    if (ord) {
      const run = [];
      let j = i;
      let expect = Number(ord[1]);
      while (j < work.length) {
        const c = work[j];
        if (c?.type !== "paragraph" || typeof c.text !== "string") break;
        const m = c.text.trim().match(ORDINAL);
        if (!m || Number(m[1]) !== expect) break;
        if (c.sourcePage !== b.sourcePage) break;
        run.push({ block: c, step: Number(m[1]), text: m[2].trim() });
        expect += 1;
        j += 1;
      }
      if (run.length >= 2) {
        out.push({
          type: "list",
          ordered: true,
          items: run.map((r) => r.text),
          origin: b.origin ?? "source",
          ...(b.sourcePage != null ? { sourcePage: b.sourcePage } : {}),
          ...(b.sourceDoc ? { sourceDoc: b.sourceDoc } : {}),
        });
        note("procedure-unordered", {
          index: i,
          steps: run.length,
          sourcePage: b.sourcePage ?? null,
          droppedNumbering: run.map((r) => r.step),
        });
        i = j - 1;
        continue;
      }
    }

    /* ---- a run of fragments from one page ---- */
    if (b.sourcePage != null && !TERMINAL.test(text)) {
      const run = [];
      let j = i;
      while (j < work.length) {
        const c = work[j];
        if (c?.type !== "paragraph" || typeof c.text !== "string") break;
        if (c.sourcePage !== b.sourcePage) break;
        const t = c.text.trim();
        if (!t || TERMINAL.test(t)) break;
        run.push(t);
        j += 1;
      }

      if (run.length >= 3) {
        if (looksLikeFlattenedTable(run)) {
          // Left exactly as it is. Which value belongs in which column is not
          // recoverable from a flat list, and inventing it would be worse than
          // showing the lines.
          note("table-suspected", {
            index: i,
            lines: run.length,
            sourcePage: b.sourcePage,
            sample: run.slice(0, 4),
          });
          out.push(b);
          continue;
        }
        if (isPlainList(run)) {
          out.push({
            type: "list",
            items: run,
            origin: b.origin ?? "source",
            ...(b.sourcePage != null ? { sourcePage: b.sourcePage } : {}),
            ...(b.sourceDoc ? { sourceDoc: b.sourceDoc } : {}),
          });
          note("bullets-as-prose", { index: i, items: run.length, sourcePage: b.sourcePage });
          i = j - 1;
          continue;
        }
        note("fragment-run-unresolved", {
          index: i,
          lines: run.length,
          sourcePage: b.sourcePage,
          sample: run.slice(0, 4),
        });
      }
    }

    out.push(b);
  }

  return { blocks: out, changes };
}
