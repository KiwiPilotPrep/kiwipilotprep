/**
 * Putting the shape back into text five PowerPoint decks took out of it.
 *
 * These five arrive in better condition than the Aircraft Technical Knowledge
 * PDF did, and for a structural reason: a PowerPoint slide knows its own
 * title, records the indent level of every bullet, and keeps a native table as
 * a table. So the repairs the PDF needed — recovering headings from capital
 * letters, restoring Wingdings bullets, rejoining a hundred and thirty split
 * sentences — are mostly unnecessary here. What is left is four things:
 *
 *   - The slide title. It is a real title and it belongs in the lesson as a
 *     heading, but a topic gathers several slides and a heading repeated three
 *     times down one page is worse than none. So a title is emitted once, is
 *     dropped when it merely repeats the topic's own name, and is dropped
 *     again when the slide before it carried the same one.
 *
 *   - The title said twice. Some slides repeat their own title as the first
 *     line of the body — eleven of them in Flight Radiotelephony alone — which
 *     reaches the page as a heading followed immediately by the same words as
 *     a paragraph.
 *
 *   - Typography. A slide has no superscripts to lose, but it does carry
 *     "CO2" for carbon dioxide and "m2" for square metres, and a handful of
 *     compounds broken by a line wrap.
 *
 *   - Whatever a particular deck does that no other deck does. Those are keyed
 *     to the deck and the slide, so each one was looked at on that slide before
 *     it was written, and a re-extraction that changes the wording stops
 *     applying it rather than applying it to the wrong words.
 *
 * Nothing here rewrites. Everything removes, rejoins, re-labels or replaces a
 * character with the character it stands for.
 *
 * This is a separate module from `source-repairs.mjs` on purpose: that one is
 * the finished Aircraft Technical Knowledge repair set, keyed to that book's
 * pages, and it is not touched by this rebuild.
 */

const flat = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const key = (s) => flat(s).toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * Typography a slide cannot express, restored.
 *
 * Mechanical, and deliberately short: these decks are clean, and a long rule
 * list applied to clean text is a way of introducing errors rather than
 * removing them.
 */
const TYPOGRAPHY = [
  // The masculine ordinal indicator and its lookalike, standing in for degrees.
  [/[ᵒº]/g, "°"],
  // Chemical subscripts.
  [/\bCO2\b/g, "CO₂"],
  [/\bH2O\b/g, "H₂O"],
  [/\bN2\b/g, "N₂"],
  [/\bO2\b/g, "O₂"],
  // Squared and cubed units.
  [/\b(m|cm|km|ft|in)3\b/g, "$1³"],
  [/\b(m|cm|km|ft|in)2\b/g, "$1²"],
  // A compound the line wrap split: "self- contained", "aero- engines".
  [/([a-z])- ([a-z])/g, "$1-$2"],
  // The same in a heading, set with spaces either side.
  [/\b([A-Z]{2,}) - ([A-Z]{2,})\b/g, "$1-$2"],
  // A space that drifted in front of its punctuation.
  [/\s+([,;.])(?=\s|$)/g, "$1"],
  // A full stop that lost the space after it.
  [/([a-z])\.([A-Z][a-z])/g, "$1. $2"],
];

export function typeset(text) {
  let out = String(text);
  for (const [pattern, replacement] of TYPOGRAPHY) out = out.replace(pattern, replacement);
  return out;
}

/**
 * A running header the layout glued to the title.
 *
 * The Flight Radiotelephony deck prints "Frequencies" in a corner of several
 * slides, and the extractor reads it as the first characters of the title
 * beside it: "FrequenciesLight Signals", "FrequenciesCommunication Listings",
 * "FrequenciesAutomatic Terminal Information Service". It is furniture, and
 * the word it is stuck to is the real title.
 */
const RUNNING_HEADER = /^Frequencies(?=[A-Z])/;

/**
 * A bare web address on a slide.
 *
 * Navigation slide 124 links a third-party flight computer simulator hosted by
 * a university in North Dakota. It may or may not still resolve, it is not
 * KiwiPilotPrep's, and a raw URL in the middle of a paragraph is not something
 * a reader can use. The teaching around it stays. Official New Zealand
 * references — the AIP and the CAA's own rule pages — are not touched: those
 * are where a student is supposed to go.
 */
const BARE_URL = /https?:\/\/(?!(?:www\.)?(?:aip\.net\.nz|caa\.govt\.nz))\S+/gi;

/**
 * Words that cannot end a sentence, used to spot a line the layout cut in two.
 * The same list the ATK repairs use, for the same reason.
 */
const DANGLING = new Set([
  "a", "an", "the", "and", "or", "but", "if", "of", "to", "in", "on", "at", "for", "with",
  "from", "by", "as", "into", "onto", "than", "then", "that", "which", "this", "these",
  "those", "it", "its", "is", "are", "was", "were", "be", "been", "being", "has", "have",
  "had", "do", "does", "did", "will", "can", "may", "must", "should", "would", "could",
  "more", "most", "less", "least", "up", "down", "over", "under", "between", "during",
  "per", "about", "above", "below", "after", "before", "when", "where", "while", "any",
  "each", "both", "not", "no", "so", "such", "their", "his", "her", "our", "your", "we",
  "they", "he", "she", "you", "off", "out", "via", "upon", "without", "along", "across",
  "through", "around", "near", "until", "since", "unless", "though", "although",
]);

/** Is this line set in capitals, the way a deck sets a heading? */
function isShouted(text) {
  const letters = String(text).replace(/[^A-Za-z]/g, "");
  if (letters.length < 3) return false;
  return letters.replace(/[^A-Z]/g, "").length / letters.length >= 0.8;
}

/**
 * Bullets typed into the text rather than made into a list.
 *
 * Two slides of the Flight Radiotelephony deck — the ATIS pair — carry fifteen
 * bullet characters inside single text boxes, so the whole list arrives as one
 * paragraph reading "Information Service (ATIS) •Aerodrome •Issue receipt code
 * letter •Issue time". Split on the character, the list is a list again.
 */
const INLINE_BULLET = /[•●▪]/;
const INLINE_BULLET_SPLIT = /[•●▪]/g;

function restoreInlineBullets(blocks) {
  const out = [];
  let restored = 0;
  for (const block of blocks) {
    if (block.kind !== "text" || !INLINE_BULLET.test(block.text)) {
      out.push(block);
      continue;
    }
    const pieces = block.text.split(INLINE_BULLET_SPLIT);
    const lead = flat(pieces[0]);
    if (lead) out.push({ ...block, text: lead });
    for (const piece of pieces.slice(1)) {
      const text = flat(piece);
      if (!text) continue;
      out.push({ ...block, level: Math.max(1, block.level ?? 0), text });
      restored += 1;
    }
  }
  return { blocks: out, restored };
}

/**
 * Bullets a slide author typed as a hyphen.
 *
 * The layout kept them as ordinary lines, so they arrive as "- the DI (DGI) is
 * aligned." — sometimes already inside a bulleted run, where the renderer then
 * prints a bullet and a hyphen, and sometimes not, where a member of a list
 * reads as a stray sentence. Both are the same slide author doing the same
 * thing, so both become bullets and the hyphen goes.
 */
function restoreDashBullets(blocks) {
  const out = [];
  let restored = 0;
  for (const block of blocks) {
    if (block.kind !== "text") {
      out.push(block);
      continue;
    }
    const text = flat(block.text);
    // A leading hyphen followed by a space and a word. Not a minus sign in
    // front of a number, and not an em-dash opening an aside.
    if (!/^[-–]\s+[A-Za-z]/.test(text)) {
      out.push(block);
      continue;
    }
    restored += 1;
    out.push({ ...block, text: text.replace(/^[-–]\s+/, ""), level: Math.max(block.level ?? 0, 1) });
  }
  return { blocks: out, restored };
}

/** Sentences the slide's text box cut in half. */
function rejoinLines(blocks) {
  const out = [];
  let joined = 0;
  for (const block of blocks) {
    const previous = out[out.length - 1];
    const isBody = block.kind === "text" && (block.level ?? 0) === 0;
    const followsText = previous && previous.kind === "text";
    if (isBody && followsText) {
      const before = flat(previous.text);
      const after = flat(block.text);
      const lastWord = (before.match(/([A-Za-z']+)\s*$/) ?? [])[1] ?? "";
      const closed = /[.:;!?"”)]$/.test(before);
      const unfinished = !closed && DANGLING.has(lastWord.toLowerCase());
      // A line that has already ended in a full stop has ended. The lower-case
      // start of the next line then means a new list item, not the rest of the
      // sentence — "at night." / "on a cross-country flight." — so a closed
      // line is never continued.
      const continues = !closed && /^[a-z]/.test(after);
      // A colon introduces a list, and the items of a list on a slide very
      // often start with a lower-case word: "shall not act as pilot-in-command
      // of an aircraft:" / "at night." / "on a cross-country flight." Merging
      // those into the lead-in produced a sentence with full stops in the
      // middle of it, so nothing is ever joined onto a line that ends in a
      // colon — restoreColonLists below is what those lines are for.
      const introducesList = /:$/.test(before);
      if (!introducesList && (unfinished || continues) && after && !isShouted(before) && !isShouted(after)) {
        out[out.length - 1] = { ...previous, text: `${before} ${after}` };
        joined += 1;
        continue;
      }
    }
    out.push(block);
  }
  return { blocks: out, joined };
}

/**
 * The lists a slide introduces with a colon and then leaves unmarked.
 *
 * Same repair as the ATK book needed, and for the same reason: three short
 * lines under "the following apply:" are a list, and printed as three
 * paragraphs they read as three unfinished sentences.
 */
function restoreColonLists(blocks) {
  const out = blocks.map((b) => ({ ...b }));
  const SHORT = 60;
  let restored = 0;
  for (let i = 0; i < out.length; i += 1) {
    const lead = out[i];
    if (lead.kind !== "text" || !/:$/.test(flat(lead.text))) continue;
    const run = [];
    for (let j = i + 1; j < out.length; j += 1) {
      const next = out[j];
      if (next.kind !== "text" || (next.level ?? 0) !== 0) break;
      if (flat(next.text).length > SHORT) break;
      run.push(j);
    }
    if (run.length < 2) continue;
    for (const j of run) out[j] = { ...out[j], level: 1 };
    restored += run.length;
    i = run[run.length - 1];
  }
  return { blocks: out, restored };
}

/**
 * Repairs one slide.
 *
 * @param {object[]} blocks the slide's blocks as the extractor produced them
 * @param {object} context
 * @param {number} context.slide the slide number
 * @param {string} context.slideTitle the slide's own title
 * @param {string} context.topicTitle the title of the topic it is being built into
 * @param {string} context.chapterTitle the title of the chapter that topic sits in
 * @param {string} context.previousTitle the title of the slide before it in this topic
 * @param {object} [context.tables] per-deck repair tables, keyed by slide:
 *   `callouts` (text to remove), `substitutions` ([from, to] pairs) and
 *   `titles` (a replacement title, or null to emit none)
 */
export function repairSlide(blocks, context = {}) {
  const {
    slide = 0,
    slideTitle = "",
    topicTitle = "",
    chapterTitle = "",
    previousTitle = "",
    tables = {},
  } = context;

  const counts = {
    headings: 0, echoes: 0, joined: 0, callouts: 0, urls: 0,
    bullets: 0, substitutions: 0,
  };

  let out = blocks.map((b) => ({ ...b }));
  // A slide whose title is not a title. Where the layout put a table cell or a
  // fragment where the title should be, the deck's own table names what to use
  // instead — or null, where the honest answer is nothing.
  const override = tables.titles?.[slide];
  const title =
    override === undefined ? flat(slideTitle).replace(RUNNING_HEADER, "") : flat(override ?? "");

  /* ---- the running header, stuck to whatever was beside it -------------- */
  out = out.map((b) =>
    b.kind === "text" && RUNNING_HEADER.test(flat(b.text))
      ? { ...b, text: flat(b.text).replace(RUNNING_HEADER, "") }
      : b,
  );

  /* ---- labels lifted off a picture, and text broken beyond repair ------- */
  const callouts = tables.callouts?.[slide] ?? [];
  if (callouts.length) {
    const wanted = new Set(callouts.map(key));
    const kept = out.filter((b) => !(b.kind === "text" && wanted.has(key(b.text))));
    counts.callouts += out.length - kept.length;
    out = kept;
  }

  /* ---- bullets typed into the text -------------------------------------
   * Before the echo check, so that a title fragment stuck to the front of a
   * bulleted run is a block of its own by the time the echo is looked for.
   */
  const inline = restoreInlineBullets(out);
  counts.bullets += inline.restored;
  out = inline.blocks;

  /* ---- bullets typed as a hyphen ---------------------------------------- */
  const dashed = restoreDashBullets(out);
  counts.bullets += dashed.restored;
  out = dashed.blocks;

  /* ---- the slide's own title, repeated as its first line ----------------
   * Whole, or split across the two or three blocks the layout wrapped it into:
   * "Automatic Terminal" + "Information Service (ATIS)" is the same echo as a
   * single block carrying both.
   */
  if (title) {
    const want = key(title);
    const drop = new Set();
    for (let i = 0; i < out.length; i += 1) {
      if (out[i].kind !== "text" || drop.has(i)) continue;
      let joined = "";
      const used = [];
      for (let j = i; j < out.length && j < i + 4; j += 1) {
        if (out[j].kind !== "text") break;
        joined += key(out[j].text);
        used.push(j);
        if (joined === want) {
          for (const k of used) drop.add(k);
          break;
        }
        if (!want.startsWith(joined)) break;
      }
    }
    if (drop.size) {
      counts.echoes += drop.size;
      out = out.filter((_, i) => !drop.has(i));
    }
  }

  /* ---- a third party's URL --------------------------------------------- */
  out = out
    .map((b) => {
      if (b.kind !== "text" || !BARE_URL.test(b.text)) return b;
      BARE_URL.lastIndex = 0;
      counts.urls += 1;
      return { ...b, text: flat(b.text.replace(BARE_URL, "")) };
    })
    .filter((b) => b.kind !== "text" || flat(b.text));

  /* ---- hand-checked substitutions for this slide ------------------------ */
  for (const [from, to] of tables.substitutions?.[slide] ?? []) {
    out = out.map((b) => {
      if (b.kind !== "text" || !b.text.includes(from)) return b;
      counts.substitutions += 1;
      return { ...b, text: b.text.replace(from, to) };
    });
  }

  /* ---- sentences the text box cut in half ------------------------------- */
  const rejoined = rejoinLines(out);
  counts.joined += rejoined.joined;
  out = rejoined.blocks;

  /* ---- lists a colon introduces and nothing marks ----------------------- */
  const lists = restoreColonLists(out);
  counts.bullets += lists.restored;
  out = lists.blocks;

  /* ---- the title, as a heading ------------------------------------------
   * Dropped where it would only repeat the topic's own name, and dropped
   * again where the slide before it in the same topic carried the same title —
   * a deck often spreads one idea over four slides that share a heading.
   */
  // A deck often titles nine consecutive slides "Transponders" inside a chapter
  // called Transponders. That heading tells a student nothing the page above it
  // has not already said, so it is dropped where it repeats the chapter or the
  // topic, and where the slide before it in the same topic carried the same one.
  if (
    title &&
    key(title) !== key(topicTitle) &&
    key(title) !== key(chapterTitle) &&
    key(title) !== key(previousTitle)
  ) {
    out.unshift({ kind: "heading", text: title });
    counts.headings += 1;
  }

  /* ---- typography, last, so earlier rules matched the extracted text ---- */
  out = out.map((b) => {
    if (b.kind === "grid") {
      return {
        ...b,
        headers: (b.headers ?? []).map(typeset),
        rows: (b.rows ?? []).map((row) => row.map(typeset)),
      };
    }
    if (b.kind === "table") {
      return { ...b, rows: (b.rows ?? []).map((row) => row.map(typeset)) };
    }
    if (typeof b.text !== "string") return b;
    return { ...b, text: typeset(b.text) };
  });

  return { blocks: out, counts };
}
