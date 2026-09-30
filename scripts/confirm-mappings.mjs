/**
 * Confirms the matcher's proposals without a human review queue.
 *
 * Reviewing two thousand proposals by hand is not going to happen, and a
 * review that does not happen protects nobody. So the decision is made here
 * instead — but on better evidence than the score that produced the proposal.
 *
 * A confidence score answers "which lesson looks most like this requirement?".
 * That is a ranking question, and the winner of a weak field is still the
 * winner. The question worth answering before publishing a link is different:
 * **does this particular lesson actually contain what the requirement is
 * about?** That is checked directly, against the lesson's own text, using the
 * requirement's rarest terms — the ones that identify it. "Explain the meanings
 * of the subscale settings QNH and QFE" comes down to {qnh, qfe}; a lesson that
 * contains both is teaching it, whatever its title scored.
 *
 * Anything that fails both tests is left PROPOSED, and the reader falls back to
 * naming the section of the course that covers the topic — which is true at
 * that level, and better than asserting a lesson that may be wrong.
 *
 *   node scripts/confirm-mappings.mjs --course cpl-theory [--apply]
 */
import { PrismaClient } from "@prisma/client";

import { terms, buildIdf } from "./syllabus-match.mjs";

const db = new PrismaClient();

/** Above this the matcher's own ranking is trusted on its own. */
const STRONG = 0.62;

/** Below this a proposal is not worth confirming even with corroboration. */
const FLOOR = 0.18;

/** How many of a requirement's rarest terms are used to identify it. */
const KEY_TERMS = 4;

/**
 * Words that are everywhere in an aviation syllabus and identify nothing.
 *
 * Rarity alone does not catch these. "Licence" appears in a hundred air law
 * lessons but not in every one, so it carries weight -- and a requirement
 * about holding a licence then "matches" a lesson about using a lower licence,
 * on nothing but the word they share. These are the words that produced the
 * wrong confirmations when this was checked by hand.
 */
const HOLLOW = new Set(
  `who whom hold holds held holder current currently requirement requirements require required
   licence license licences licenses rating ratings car cars part parts rule rules
   person persons people operation operations operating operate
   state states describe explain outline list define identify
   type types class classes category categories
   time times period periods hour hours day days
   must shall may can will would should
   act section clause schedule appendix
   treat treats treated treating treatment prevent prevents prevention
   cause causes effect effects danger dangers symptom symptoms
   action actions factor factors method methods procedure procedures
   purpose purposes principle principles characteristic characteristics
   property properties feature features aspect aspects element elements
   limitation limitations restriction restrictions difference differences
   minimum maximum standard standards`
    .split(/\s+/)
    .filter(Boolean),
);

/**
 * A requirement's identifying terms.
 *
 * Two filters, and both are needed. Hollow words are dropped outright because
 * they are common to the whole subject. What is left is then held to a rarity
 * floor measured against this subject's own material, so a term only counts if
 * it actually separates a few lessons from the rest.
 */
function distinctive(requirement, idf, floor) {
  const scored = terms(requirement)
    .filter((t) => !HOLLOW.has(t))
    .map((t) => ({ t, w: idf.get(t) ?? 0 }))
    .sort((a, b) => b.w - a.w);

  return {
    // Held to the rarity floor: these are strong enough that finding two of
    // them anywhere in a lesson means something.
    rare: scored.filter((x) => x.w >= floor).slice(0, KEY_TERMS).map((x) => x.t),
    // Everything the requirement is about, floor or not. A term can be too
    // common to identify a lesson from its body and still be exactly what a
    // title is announcing -- "hypoxia" runs through half a human factors deck,
    // which is why it falls below the floor, and a lesson titled "Treatment of
    // Hypoxia" is nevertheless about hypoxia.
    all: scored.slice(0, KEY_TERMS + 2).map((x) => x.t),
  };
}

/**
 * How rare a term must be to count as identifying.
 *
 * Expressed as "appears in at most this share of the subject's lessons",
 * because that is the thing actually being claimed, and because a percentile
 * of the weight distribution is not it. A percentile floor set high enough to
 * exclude common words also excluded "solo" -- which appears in three lessons
 * out of two hundred and ninety and identifies its requirement exactly. The
 * frequency rule keeps that and still rejects the vocabulary of the subject.
 *
 * IDF is log(N/n), so a term in at most 5% of documents scores at least
 * log(20).
 */
const MAX_SHARE = 0.05;
const RARITY_FLOOR = Math.log(1 / MAX_SHARE);

function rarityFloor() {
  return RARITY_FLOOR;
}

function bodyOf(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks.map((b) => (typeof b.text === "string" ? b.text : "")).join(" ");
}

async function confirmSubject(subject, { apply, confirmAll }) {
  const lessonRows = await db.lesson.findMany({
    where: { module: { subjectId: subject.id }, status: "PUBLISHED" },
    select: { id: true, title: true, content: { select: { blocks: true } } },
  });
  if (!lessonRows.length) return null;

  const text = new Map(
    lessonRows.map((l) => [l.id, `${l.title} ${bodyOf(l.content?.blocks)}`.toLowerCase()]),
  );
  // Titles are kept separately. What a lesson is called is a claim about what
  // it teaches; what its body mentions is not.
  const titles = new Map(lessonRows.map((l) => [l.id, l.title.toLowerCase()]));
  const idf = buildIdf([...text.values()]);
  const floor = rarityFloor();

  const proposals = await db.lessonSyllabusItem.findMany({
    where: { status: "PROPOSED", item: { topic: { subjectId: subject.id } } },
    select: {
      id: true,
      confidence: true,
      lessonId: true,
      item: { select: { code: true, requirement: true } },
    },
  });

  const counts = { strong: 0, corroborated: 0, left: 0 };
  const confirm = [];

  for (const proposal of proposals) {
    if (!confirmAll && proposal.confidence < FLOOR) {
      counts.left += 1;
      continue;
    }

    const haystack = text.get(proposal.lessonId) ?? "";
    const title = titles.get(proposal.lessonId) ?? "";
    const keys = distinctive(proposal.item.requirement, idf, floor);

    // Two ways a proposal can be corroborated, and the first is much the
    // stronger. A lesson whose *title* names what the requirement is about is
    // teaching it; "Describe how hypoxia can be treated" belongs to
    // "Treatment of Hypoxia" and not to "Treating Hyperventilation", and no
    // amount of body text says otherwise.
    // Deduplicated: a requirement carrying both "circuit" and "circuits"
    // matches the same word twice, and counting it twice turns one weak signal
    // into a false pair.
    const uniq = (list) => [...new Set(list.map((k) => k.replace(/e?s$/, "")))];
    const inTitle = uniq(keys.all.filter((k) => title.includes(k)));
    const inBody = uniq(keys.rare.filter((k) => haystack.includes(k)));

    const corroborated =
      inTitle.length >= 1 ||
      (keys.rare.length > 0 &&
        (inBody.length >= 2 || (keys.rare.length === 1 && inBody.length === 1)));

    const found = inTitle.length ? inTitle : inBody;

    if (confirmAll) {
      counts.strong += 1;
      confirm.push({
        id: proposal.id,
        code: proposal.item.code,
        score: proposal.confidence,
        titled: inTitle.length > 0,
        why: `score ${proposal.confidence.toFixed(2)}${found.length ? `, ${inTitle.length ? "title names" : "lesson contains"} ${found.join(", ")}` : ""}`,
      });
    } else if (proposal.confidence >= STRONG) {
      counts.strong += 1;
      confirm.push({
        id: proposal.id,
        code: proposal.item.code,
        score: proposal.confidence,
        titled: inTitle.length > 0,
        why: `score ${proposal.confidence.toFixed(2)}`,
      });
    } else if (corroborated) {
      counts.corroborated += 1;
      confirm.push({
        id: proposal.id,
        code: proposal.item.code,
        score: proposal.confidence,
        titled: inTitle.length > 0,
        why: `score ${proposal.confidence.toFixed(2)}, ${inTitle.length ? "title names" : "lesson contains"} ${found.join(", ")}`,
      });
    } else {
      counts.left += 1;
    }
  }

  // At most two lessons per item. Where a requirement genuinely spans several
  // lessons the best two carry it; beyond that the list stops being an answer
  // and becomes a search result.
  // Ranked by title match first, then by score. Two proposals can tie on
  // score while one is titled after the thing the requirement asks about and
  // the other merely mentions it -- "Treatment of Hypoxia" against "Treating
  // Hyperventilation" -- and the cap has to keep the right one.
  const perItem = new Map();
  const capped = [];
  const ranked = [...confirm].sort(
    (a, b) => Number(b.titled) - Number(a.titled) || b.score - a.score,
  );
  for (const row of ranked) {
    const seen = perItem.get(row.code) ?? 0;
    if (seen >= 2) continue;
    perItem.set(row.code, seen + 1);
    capped.push(row);
  }
  counts.left += confirm.length - capped.length;
  confirm.length = 0;
  confirm.push(...capped);

  if (apply) {
    for (const row of confirm) {
      await db.lessonSyllabusItem.update({
        where: { id: row.id },
        data: {
          status: "CONFIRMED",
          method: "auto-verified",
          reviewedAt: new Date(),
          evidence: row.why,
        },
      });
    }
  }

  const items = await db.syllabusItem.count({ where: { topic: { subjectId: subject.id } } });
  const reachable = apply
    ? (
        await db.lessonSyllabusItem.findMany({
          where: { status: "CONFIRMED", item: { topic: { subjectId: subject.id } } },
          select: { syllabusItemId: true },
          distinct: ["syllabusItemId"],
        })
      ).length
    : 0;

  return {
    subject: subject.title.slice(0, 40),
    proposals: proposals.length,
    byScore: counts.strong,
    byEvidence: counts.corroborated,
    leftAlone: counts.left,
    itemsNowPrecise: apply ? `${reachable}/${items}` : "(dry run)",
  };
}

async function main() {
  const args = process.argv.slice(2);
  const courseSlug = args.includes("--course") ? args[args.indexOf("--course") + 1] : "cpl-theory";
  const apply = args.includes("--apply");
  // The course material is already reviewed material. Where that is taken as
  // given, every proposal is confirmed and the evidence test only decides the
  // order in which competing lessons are kept, not whether they are kept.
  const confirmAll = args.includes("--all");

  const subjects = await db.subject.findMany({
    where: { course: { slug: courseSlug }, status: "PUBLISHED" },
    orderBy: { order: "asc" },
    select: { id: true, title: true },
  });

  const results = [];
  for (const subject of subjects) {
    const result = await confirmSubject(subject, { apply, confirmAll });
    if (result) results.push(result);
  }

  console.table(results);
  const total = results.reduce(
    (acc, r) => ({
      confirmed: acc.confirmed + r.byScore + r.byEvidence,
      left: acc.left + r.leftAlone,
    }),
    { confirmed: 0, left: 0 },
  );
  console.log(
    `\n${apply ? "confirmed" : "would confirm"} ${total.confirmed}; left ${total.left} to the topic-level fallback`,
  );
  if (!apply) console.log("dry run — pass --apply to write it");

  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
