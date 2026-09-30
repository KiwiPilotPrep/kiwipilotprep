/**
 * Scoring for "which lesson teaches this syllabus item?".
 *
 * Everything here is pure, so it can be tested without a database. The driver
 * that reads Postgres and writes proposals lives in `map-syllabus.mjs`.
 *
 * The problem this is shaped around: a syllabus item is written as an
 * examinable instruction — "Outline the cause of Coriolis force" — and a
 * lesson is titled as a teaching heading — "Coriolis Force". The verbs and
 * connective words the syllabus uses carry no information at all, and the
 * words that do carry it are exactly the rare ones. So terms are weighted by
 * how rare they are in the subject, and the syllabus's own instruction verbs
 * are removed outright.
 *
 * The second idea is locality. A deck teaches a subject in roughly syllabus
 * order and names its sections after the same things — "The Wind" against
 * topic 8.12 Wind. Aligning modules to topics first means "Properties" (a
 * lesson title carrying almost no information on its own) is read inside the
 * Coriolis section, where it is the right answer for 8.12.12, instead of
 * competing with every other lesson in the subject.
 */

/**
 * Words that appear in so many syllabus requirements that matching on them is
 * noise. These are the instruction verbs the CAA writes every item with, plus
 * ordinary English connectives.
 */
const STOP = new Set(
  `a an the and or of to in on at for with by from as is are be been being that this these those
   its their it they which what when where how why not no any all each both either
   describe explain state list define outline identify demonstrate discuss detail
   name give show recall interpret decode apply calculate determine select recognise recognize
   following include includes including terms term reference references referred
   respect regard regarding relation relating relate related use used using
   general basic simple main major minor
   shall must may can will would should could
   above below between within without under over through during after before
   such other others another same different various
   effect effects affect affects
   aircraft aeroplane helicopter pilot flight flying
   new zealand nz caa`
    .split(/\s+/)
    .filter(Boolean),
);

/** Splits text into the terms worth matching on. */
export function terms(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[-']+|[-']+$/g, ""))
    // Three letters is the shortest thing worth matching: "fog", "ISA", "QNH".
    .filter((w) => w.length >= 3 && !STOP.has(w));
}

/**
 * Inverse document frequency across a corpus of documents.
 *
 * "wind" appears in forty lessons of a meteorology deck and tells you almost
 * nothing; "coriolis" appears in three and tells you almost everything. This
 * is what makes the difference between the two.
 */
export function buildIdf(documents) {
  const seen = new Map();
  for (const doc of documents) {
    for (const term of new Set(terms(doc))) {
      seen.set(term, (seen.get(term) ?? 0) + 1);
    }
  }
  const total = Math.max(documents.length, 1);
  const idf = new Map();
  let max = 0;
  for (const [term, count] of seen) {
    // Plain log(N/n), so a term present in every single document lands at
    // exactly zero. That case is not hypothetical — "wind" runs through every
    // lesson of a wind module — and a term that cannot separate any two
    // lessons should carry no weight at all rather than a small residue.
    const weight = Math.max(0, Math.log(total / count));
    idf.set(term, weight);
    if (weight > max) max = weight;
  }

  // A term the corpus has never seen cannot tell two lessons apart, so it must
  // not dominate the score. Treating it as maximally rare is the intuitive
  // move and the wrong one: one incidental word in a requirement that the deck
  // simply never uses would then outweigh every word that actually matched,
  // and a correct match would score as a near-miss. That a term is absent
  // entirely is a coverage gap, reported separately — not a ranking signal.
  Object.defineProperty(idf, "unseenWeight", { value: max * 0.2, enumerable: false });
  return idf;
}

/** Weight for one term. Unseen terms carry little, for the reason above. */
function weightOf(idf, term) {
  const known = idf.get(term);
  if (known !== undefined) return known;
  return idf.unseenWeight ?? 0;
}

/**
 * How much of `needle`'s meaning is present in `haystack`, from 0 to 1.
 *
 * Deliberately asymmetric: the question is whether the lesson covers the
 * requirement, not whether the two are about equally much. A long lesson that
 * fully covers a short requirement should score 1, and it does.
 */
export function coverage(needleTerms, haystackTerms, idf) {
  const needle = new Set(needleTerms);
  if (!needle.size) return 0;
  const haystack = new Set(haystackTerms);

  let matched = 0;
  let total = 0;
  for (const term of needle) {
    const weight = weightOf(idf, term);
    total += weight;
    if (haystack.has(term)) matched += weight;
    // A near-miss on a longer word is usually a plural or a participle
    // ("gust"/"gusts", "friction"/"frictional"). Worth partial credit, not
    // full. Five characters is the floor: below it, too many unrelated short
    // words share a prefix.
    else if (term.length >= 5 && [...haystack].some((h) => stemsAgree(term, h))) {
      matched += weight * 0.7;
    }
  }
  if (total > 0) return matched / total;

  // Every term carried zero weight — they all appear in every document of the
  // corpus, so rarity cannot separate anything. Rather than declare no match
  // and disable matching entirely, fall back to plain overlap. This is the
  // degenerate small-corpus case; on a real subject it never fires.
  let plain = 0;
  for (const term of needle) if (haystack.has(term)) plain += 1;
  return plain / needle.size;
}

/** Cheap suffix-tolerant comparison — no stemmer, no dictionary. */
export function stemsAgree(a, b) {
  if (a === b) return true;
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  if (longer.length - shorter.length > 3) return false;
  return longer.startsWith(shorter.slice(0, Math.max(4, shorter.length - 2)));
}

/**
 * The part of a requirement that names its subject.
 *
 * A CAA requirement opens by naming the thing and then qualifies it at length:
 * "Outline the measurement of surface air temperature in New Zealand (as
 * reported in aviation observations), and relate that to actual temperatures
 * experienced above a sealed or grass runway." A lesson title can never cover
 * all of that, so scoring a four-word title against a thirty-word sentence
 * makes a perfect match — a lesson actually called "Measurement of Surface Air
 * Temperature" — look like a weak one.
 */
export function headClause(requirement) {
  if (!requirement) return "";
  const first = String(requirement).split("\n")[0];
  const cut = first.search(/[,;:(]| and | with respect to | in terms of | as (?:laid|reported|applicable)/i);
  const head = cut > 0 ? first.slice(0, cut) : first;
  // Only use the head where it still names something. "Describe the following:"
  // reduces to nothing, and the full line is the better bet.
  return terms(head).length >= 2 ? head : first;
}

/**
 * The lettered sub-clauses of a requirement, as separate strings.
 *
 * Many items are lists: "decode the information contained in the following
 * forecasts and reports: (a) GRAFOR; (b) TAF; (c) METAR; ..." — and each entry
 * is taught in its own lesson. Scored as one long string, a lesson called
 * "TAF (Aerodrome Forecast)" covers two terms out of twenty and reads as no
 * match, when it is in fact the right answer for clause (b).
 */
export function clausesOf(requirement) {
  if (!requirement) return [];
  return String(requirement)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\([a-z0-9]{1,3}\)/i.test(line))
    .map((line) => line.replace(/^\([a-z0-9]{1,3}\)\s*/i, "").replace(/[;.]$/, "").trim())
    .filter(Boolean);
}

/**
 * Scores one lesson against one syllabus item.
 *
 * The title is weighted far above the body because a lesson's title is what it
 * is *about*, while its body mentions many things in passing. A body-only
 * match is real evidence but weak evidence, and the returned score says so.
 */
export function scoreLesson({ requirement, lessonTitle, lessonBody, idf, sameSection }) {
  const need = terms(requirement);
  if (!need.length) return { score: 0, titleScore: 0, bodyScore: 0 };

  const head = terms(headClause(requirement));
  const titleTerms = terms(lessonTitle);

  // A requirement can be read more than one way, and the title is scored
  // against whichever reading it answers best: the whole thing, the head
  // clause that names the subject, or — for a list item — one lettered entry.
  // A clause is discounted, because a lesson teaching one entry of a list
  // teaches part of the requirement, not all of it.
  const readings = [
    { terms: need, weight: 1 },
    ...(head.length ? [{ terms: head, weight: 1 }] : []),
    ...clausesOf(requirement)
      .map((clause) => ({ terms: terms(clause), weight: 0.9 }))
      .filter((reading) => reading.terms.length),
  ];

  let best = { cover: 0, terms: need };
  for (const reading of readings) {
    const cover = coverage(reading.terms, titleTerms, idf) * reading.weight;
    if (cover > best.cover) best = { cover, terms: reading.terms };
  }

  // How much of the title the winning reading accounts for. Coverage alone is
  // asymmetric, so "Pressure Gradient and Coriolis Force Interaction" scores
  // as perfectly on "Define pressure gradient" as the lesson actually called
  // "Pressure Gradient". This nudges the over-broad title below the exact one
  // without discarding it — both do teach the item. It is measured against the
  // reading that won, not against the head: measuring a clause match against
  // a head clause it never claimed to answer rewards the weaker match.
  const focus = titleTerms.length && best.terms.length
    ? coverage(titleTerms, best.terms, idf)
    : 1;

  const titleScore = best.cover * (0.85 + 0.15 * focus);
  const bodyScore = coverage(need, terms(lessonBody), idf);

  // Title carries the claim; body corroborates it.
  let score = titleScore * 0.72 + bodyScore * 0.28;

  // Being in the module that aligns with this item's topic is real evidence,
  // but it must not manufacture a match on its own — hence a multiplier on an
  // existing score rather than a bonus added to a zero.
  if (sameSection) score *= 1.25;

  return { score: Math.min(score, 1), titleScore, bodyScore };
}

/**
 * Aligns deck modules to syllabus topics by title.
 *
 * Returns a Map of topicCode -> moduleId for the pairings confident enough to
 * use as locality. Anything unconfident is simply left out: a wrong alignment
 * would push every item of a topic towards the wrong module, which is worse
 * than having no locality at all.
 */
export function alignModules({ topics, modules, idf, threshold = 0.34 }) {
  const pairs = [];
  for (const topic of topics) {
    for (const mod of modules) {
      const score = coverage(terms(topic.title), terms(mod.title), idf);
      if (score >= threshold) pairs.push({ topicCode: topic.code, moduleId: mod.id, score });
    }
  }

  // Greedy best-first, one module per topic and one topic per module. A deck
  // section and a syllabus topic name the same body of material; letting two
  // topics claim one module would spread its lessons across both.
  pairs.sort((a, b) => b.score - a.score);
  const byTopic = new Map();
  const usedModules = new Set();
  for (const pair of pairs) {
    if (byTopic.has(pair.topicCode) || usedModules.has(pair.moduleId)) continue;
    byTopic.set(pair.topicCode, pair.moduleId);
    usedModules.add(pair.moduleId);
  }
  return byTopic;
}

/** Confidence bands, so a reviewer reads a verdict rather than a decimal. */
export const BANDS = {
  strong: 0.62,
  likely: 0.4,
  weak: 0.22,
};

export function bandOf(score) {
  if (score >= BANDS.strong) return "strong";
  if (score >= BANDS.likely) return "likely";
  if (score >= BANDS.weak) return "weak";
  return "none";
}

/**
 * Picks the lessons to propose for one item.
 *
 * More than one is allowed on purpose — a requirement listing four cloud types
 * is genuinely taught across four lessons — but only where the runners-up are
 * close to the winner. A trailing list of half-scoring guesses would make the
 * review file useless, which is the one thing it cannot be.
 */
export function proposalsFor(scored, { max = 3, relative = 0.82 } = {}) {
  const ranked = [...scored].sort((a, b) => b.score - a.score);
  const best = ranked[0];
  if (!best || bandOf(best.score) === "none") return [];

  const cutoff = Math.max(best.score * relative, BANDS.weak);
  return ranked.filter((row) => row.score >= cutoff).slice(0, max);
}
