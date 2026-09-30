/**
 * Validates the rebuilt Aircraft Technical Knowledge course against the CAA
 * syllabus — internally, and only internally.
 *
 * The syllabus is not the course and is not shown to a student: its rows are
 * archived, the index route redirects to the course material, and no lesson
 * prints an objective block. What the syllabus is still good for is the
 * question this script asks — has the course actually taught everything the
 * exam can ask about? A curriculum built from a book rather than from a
 * checklist has to be checked against the checklist afterwards, because
 * nothing in the build guarantees it.
 *
 * Two kinds of evidence are gathered for each of the 210 items:
 *
 *   - Structural. The chapter that declares the item's topic code, which is
 *     what `LessonSyllabusItem` was written from. This says where the course
 *     believes the material is.
 *
 *   - Textual. The distinctive words of the requirement, looked for in the
 *     lessons themselves. This says whether the material is actually there.
 *     "Explain the need for valve timing (i.e. valve lead, lag and overlap)"
 *     reduces to valve/timing/lead/lag/overlap, and a lesson that carries all
 *     five is teaching it.
 *
 * Structural evidence alone is not treated as coverage. A chapter can declare
 * a topic code and still not answer one of the items beneath it, and that is
 * exactly the gap worth finding.
 *
 * Read-only. Writes docs/cms/PPL-ATK-CAA-COVERAGE.md, which is internal.
 *
 *   node scripts/ppl-atk-caa-check.mjs [--verbose]
 */
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const COURSE = "ppl-theory";

/**
 * Which subject to check, and where its report goes.
 *
 * Written for Aircraft Technical Knowledge and generalised when the other
 * five subjects were rebuilt onto the same pipeline. With no argument it does
 * exactly what it always did, so the ATK report keeps its filename and the
 * ATK rebuild document keeps pointing at a file that exists.
 */
const REPORTS = {
  "aircraft-technical-knowledge": "docs/cms/PPL-ATK-CAA-COVERAGE.md",
  "flight-radiotelephony": "docs/cms/PPL-RADIO-CAA-COVERAGE.md",
  navigation: "docs/cms/PPL-NAV-CAA-COVERAGE.md",
  "air-law": "docs/cms/PPL-LAW-CAA-COVERAGE.md",
  meteorology: "docs/cms/PPL-MET-CAA-COVERAGE.md",
  "human-factors": "docs/cms/PPL-HF-CAA-COVERAGE.md",
};

const flagIndex = process.argv.indexOf("--subject");
const SUBJECT = flagIndex === -1 ? "aircraft-technical-knowledge" : process.argv[flagIndex + 1];
const OUT = REPORTS[SUBJECT];
if (!OUT) {
  throw new Error(
    `no CAA report configured for "${SUBJECT}" — ` +
      `known subjects: ${Object.keys(REPORTS).join(", ")}`,
  );
}

/**
 * Words that carry no subject meaning.
 *
 * The syllabus verbs are in here — "state", "describe", "explain" — because
 * every requirement starts with one and matching on them would score every
 * lesson equally. So are the ordinary function words, and the handful of
 * aviation words so common in this subject that they separate nothing:
 * "aircraft" appears in a third of the items and in almost every lesson.
 */
const STOP = new Set([
  "state", "describe", "explain", "define", "name", "list", "identify", "outline",
  "calculate", "determine", "given", "including", "include", "includes", "appropriate",
  "where", "which", "that", "this", "these", "those", "with", "from", "into", "onto",
  "and", "the", "for", "are", "its", "his", "her", "their", "have", "has", "had",
  "will", "can", "may", "must", "should", "would", "could", "between", "during",
  "about", "above", "below", "after", "before", "when", "while", "each", "both",
  "not", "any", "all", "how", "why", "what", "use", "used", "using", "basic",
  "general", "typical", "common", "main", "different", "various", "such", "other",
  "than", "then", "also", "more", "most", "less", "least", "aircraft", "aeroplane",
  "engine", "engines", "system", "systems", "flight", "effect", "effects", "type",
  "types", "function", "functions", "principle", "principles", "operation", "need",
  "relevant", "associated", "possible", "correlation", "advantages", "disadvantages",
  // The scaffolding the CAA writes its requirements in. "State the purpose of
  // the following components" says nothing about the subject matter; the
  // components named after it do.
  "purpose", "purposes", "procedure", "procedures", "conduct", "conducting",
  "action", "actions", "take", "taken", "follow", "following", "component",
  "components", "importance", "briefly", "term", "terms", "simple", "normal",
  "special", "correct", "feature", "features", "principal", "measure", "measures",
  "condition", "conditions", "available", "subsequent", "interpretation", "once",
  "over", "under", "within", "against", "concerning", "regarding", "respect",
  "manner", "means", "method", "methods", "example", "examples", "situation",
  "versus", "element", "elements", "rely", "relies", "demonstrate", "ability",
  "approximate", "preserve", "removal", "stock", "difference", "differences",
  "conducive", "respect", "plant", "constitute", "concerned", "regard",
]);

/**
 * Spellings the syllabus and the book do not share.
 *
 * Only true variants of the same word belong here — a word the course teaches
 * under a different name is a vocabulary gap and must be fixed in the course,
 * not hidden in this table. "Cam shaft" is how the book sets it and
 * "camshaft" is how the CAA sets it; that is a space, not a gap.
 */
const ALIASES = {
  camshaft: ["cam shaft"],
  crankshaft: ["crank shaft"],
  coordinator: ["co-ordinator"],
  coordination: ["co-ordination"],
  coordinated: ["co-ordinated"],
};

/**
 * The distinctive words of a piece of text.
 *
 * Hyphens are split rather than kept: the syllabus writes "float-type",
 * "de-icing" and "non-symmetrical" where the book writes "float type carburettor",
 * "carburettor heat" and "symmetrical aerofoil", and a compound token would
 * report a gap that is a punctuation difference. The lettered list markers of
 * a requirement — "(a)", "(b)" — go the same way.
 */
const words = (text) =>
  [
    ...new Set(
      String(text)
        .toLowerCase()
        .replace(/\([a-z0-9]{1,3}\)/g, " ")
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !STOP.has(w)),
    ),
  ];

/**
 * Singular/plural and -ing/-ed forms count as the same word, and the two
 * spellings of carburettor count as one — the CAA writes the American form in
 * some items and the book uses the British form throughout.
 */
const stem = (w) =>
  w
    .replace(/^carburet(or|tor|ion|tion|ation)$/, "carburett")
    .replace(/^carburett?or$/, "carburett")
    .replace(/(ies)$/, "y")
    // A regular plural loses its "s" before anything else, so "airframes" and
    // "airframe" reduce to the same word. Taking "es" off first gave "airfram"
    // on one side and "airframe" on the other, and reported the difference as
    // a missing term.
    .replace(/([^s])s$/, "$1")
    .replace(/(ing|ed)$/, "");

/**
 * Items the word matcher scores badly and a person has checked by hand.
 *
 * The matcher reduces a requirement to its distinctive words and looks for
 * them in the lessons. It is a good way of finding a subject that has not been
 * taught, and a poor way of judging one that has been taught in different
 * words: "Distinguish between normal and emergency checklists" fails because
 * the course explains the difference without ever using the word
 * "distinguish", and "Describe the optical characteristics of the windshield"
 * fails because New Zealand spells it windscreen.
 *
 * The wrong fix is to write the syllabus's verbs into the teaching, which
 * would make the matcher agree without making the course any better. The right
 * one is this: each entry below names the lesson that was opened and read, so
 * the claim is auditable and the score stops hiding the items that are still
 * genuinely missing.
 */
const VERIFIED_BY_HAND = {
  "human-factors": {
    "10.4.2": "Airmanship and Human Factors → What Human Factors Means",
    "10.8.10": "The Atmosphere, Respiration and Circulation → External Respiration and → Internal Respiration",
    "10.18.4": "Vision → Anatomy of the Eye (rods and cones, and where each sits in the retina)",
    "10.18.14": "Vision → Sunglasses (tints recommended and avoided, polarised lenses)",
    "10.18.28": "Visual Illusions → Perception and the False Horizon",
    "10.18.36": "Visual Illusions → Fog, Haze and the Windscreen (windshield, in NZ spelling)",
    "10.32.4": "Alcohol, Medication and Drugs → Alcohol (the bottle-to-throttle interval)",
    "10.40.2": "Sleep and Fatigue → Sleep (individual requirement, authored)",
    "10.46.4": "Situational Awareness and Decision Making → Maintaining Situational Awareness",
    "10.48.10": "Situational Awareness and Decision Making → Decision Making (authored context)",
    "10.54.10": "Safety Culture and Reporting → Safe Behaviour (negligence against recklessness, authored)",
    "10.54.12": "Safety Culture and Reporting → Punitive Sanction",
    "10.62.4": "Checklists and Documents → Types of Checklist",
    "10.66.8": "First Aid and Survival → Survival Equipment (New Zealand terrain, authored)",
  },
  navigation: {
    "6.4.12": "Aeronautical Charts → Reading the Legend, and Flight Planning → Chart Preparation",
    "6.28.4": "The Navigation Computer → Multiplication and Division, and → Conversions",
    "6.28.10": "Wind, Climb and Descent Calculations → Descent Planning",
    "6.34.4": "Wind, Climb and Descent Calculations → Finding Heading and Groundspeed",
    "6.36.2": "Track Corrections and the 1 in 60 Rule → The 1 in 60 Rule, and → Closing Angle",
    "6.60.2": "Flight Planning → Flight Notification and SARTIME",
    "6.62.2": "Cruise Performance → Fuel Planning, and The Navigation Computer → Fuel Consumption Problems",
    "6.70.2": "Radio Aids for VFR Navigation → GPS Integrity and Accuracy",
    "6.70.4": "Radio Aids for VFR Navigation → GPS Errors and Human Factors",
    "6.70.6": "Radio Aids for VFR Navigation → GPS Integrity and Accuracy",
    "6.72.2": "Radio Aids for VFR Navigation → Primary and Secondary Radar",
    "6.72.6": "Radio Aids for VFR Navigation → Primary and Secondary Radar (Mode A and Mode C)",
  },
  "flight-radiotelephony": {
    "2.4.2": "The Radio in the Aircraft → Tuning the Radio, → Squelch and → Transmitting",
    "2.6.2": "Transponders → Operating the Transponder",
    "2.8.4": "Emergency Radio Procedures → Emergency Locator Transmitter Requirements",
    "2.8.6": "Emergency Radio Procedures → Emergency Locator Transmitters",
    "2.8.8": "Emergency Radio Procedures → Inadvertent Activation and the Self-Test",
    "2.10.10": "Callsigns → Where Frequencies Are Published, and Radio at Aerodromes",
    "2.14.4": "Emergency Radio Procedures → The MAYDAY Call and → The PAN-PAN Call",
    "2.14.6": "Emergency Radio Procedures → Radio Silence",
    "2.14.8": "Emergency Radio Procedures → Radio Silence (DISTRESS TRAFFIC ENDED)",
  },
  "air-law": {
    "4.30.12": "General Operating Requirements → Seats and Safety Belts",
  },
};

/**
 * Objectives that describe a practical skill rather than knowledge, and that
 * no written course can teach or claim to have taught. They are recorded so
 * that a reader can see they were considered and set aside on purpose.
 */
const FLYING_LESSON = {
  navigation: {
    "6.6.6": "Measuring a distance on a chart to ±1% is a chart-and-ruler exercise done with an instructor.",
    "6.42.4": "Folding a map for a cross-country is done with the map in your hands.",
  },
  "flight-radiotelephony": {
    "2.10.2": "Demonstrating proficiency in transmitting is assessed on the radio, not on a page.",
  },
  meteorology: {},
  "human-factors": {},
  "air-law": {},
  "aircraft-technical-knowledge": {},
};

async function main() {
  const verbose = process.argv.includes("--verbose");

  const subject = await db.subject.findFirst({
    where: { slug: SUBJECT, course: { slug: COURSE } },
    select: { id: true, title: true },
  });
  if (!subject) throw new Error(`no ${SUBJECT} in ${COURSE}`);

  const topics = await db.syllabusTopic.findMany({
    where: { subjectId: subject.id },
    orderBy: { displayOrder: "asc" },
    select: {
      code: true, title: true, status: true,
      items: { orderBy: { displayOrder: "asc" }, select: { id: true, code: true, requirement: true, status: true } },
    },
  });

  const modules = await db.courseModule.findMany({
    where: { subjectId: subject.id, status: "PUBLISHED" },
    orderBy: { displayOrder: "asc" },
    select: {
      title: true,
      lessons: {
        where: { status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true, title: true, slug: true, sourceFrom: true, sourceTo: true,
          content: { select: { blocks: true } },
          mappings: { select: { syllabusItemId: true } },
        },
      },
    },
  });

  // One searchable haystack per lesson: its title, its chapter's title and
  // every word of its content, source and authored alike.
  const lessons = [];
  for (const m of modules) {
    for (const l of m.lessons) {
      const text = [
        m.title,
        l.title,
        ...(l.content?.blocks ?? []).flatMap((b) => [
          b.text ?? "", b.title ?? "", b.term ?? "",
          ...(b.items ?? []), ...(b.headers ?? []), ...((b.rows ?? []).flat()),
        ]),
      ]
        .join(" ")
        .toLowerCase();
      lessons.push({
        raw: text,
        chapter: m.title,
        title: l.title,
        slug: l.slug,
        pages: l.sourceFrom === l.sourceTo ? `${l.sourceFrom}` : `${l.sourceFrom}–${l.sourceTo}`,
        items: new Set(l.mappings.map((x) => x.syllabusItemId)),
        // Hyphens split here exactly as they do on the requirement side, so
        // "anti-balance" in a lesson matches "anti-balance" in an item.
        stems: new Set(
          text
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .filter(Boolean)
            .map(stem),
        ),
      });
    }
  }

  const rows = [];
  for (const topic of topics) {
    for (const item of topic.items) {
      const terms = words(item.requirement);
      const wanted = terms.map(stem);
      const structural = lessons.filter((l) => l.items.has(item.id));

      // Scored over the whole subject, not only over the chapter that claims
      // the topic: a lesson in another chapter teaching it is still coverage,
      // and finding it there is worth knowing.
      const scored = lessons
        .map((l) => {
          const hit = wanted.filter((w) => l.stems.has(w));
          return { lesson: l, hit: hit.length, missed: wanted.filter((w) => !l.stems.has(w)) };
        })
        .sort((a, b) => b.hit - a.hit || Number(b.lesson.items.has(item.id)) - Number(a.lesson.items.has(item.id)));

      const best = scored[0];

      // A requirement is often answered by a chapter rather than by one topic
      // of it: "explain the function of the main components of a four-stroke
      // engine, including the valves and the camshaft" is taught across the
      // components topic and the valve timing topic. So the evidence is
      // gathered over the chapter that claims the item, and the lessons that
      // actually carry the words are named.
      const chapters = [...new Set(structural.map((l) => l.chapter))];
      const inChapter = lessons.filter((l) => chapters.includes(l.chapter));

      const carries = (lesson, w) =>
        lesson.stems.has(w) || (ALIASES[w] ?? []).some((alias) => lesson.raw.includes(alias));

      const inside = new Set();
      for (const l of inChapter) for (const w of wanted) if (carries(l, w)) inside.add(w);
      // A term the claiming chapter does not carry may still be taught: spark
      // plugs belong to the ignition chapter even where an engine-components
      // item names them. Where that happens the lesson is named, so the
      // reviewer can see the teaching is real and merely lives next door.
      const elsewhere = new Map();
      for (const w of wanted) {
        if (inside.has(w)) continue;
        const carrier = lessons.find((l) => !chapters.includes(l.chapter) && carries(l, w));
        if (carrier) elsewhere.set(w, carrier);
      }
      const carriers = inChapter
        .map((l) => ({ lesson: l, hit: wanted.filter((w) => carries(l, w)).length }))
        .filter((x) => x.hit > 0)
        .sort((a, b) => b.hit - a.hit)
        .slice(0, 3);

      const missing = wanted.filter((w) => !inside.has(w) && !elsewhere.has(w));
      const ratio = wanted.length ? (wanted.length - missing.length) / wanted.length : 0;
      // An item whose requirement is made entirely of syllabus scaffolding —
      // "Describe the function and operation of an aircraft ELT" reduces to
      // nothing once the verbs and the three-letter abbreviation are removed —
      // cannot be judged on words. It is judged on the structural mapping and
      // marked for a human to read.
      const unjudgeable = wanted.length === 0;
      const strong = !unjudgeable && missing.length === 0;
      const partial = !strong && !unjudgeable && ratio >= 0.8;

      rows.push({
        topic,
        item,
        terms: wanted,
        best,
        ratio,
        missing,
        elsewhere,
        carriers,
        structural,
        status: unjudgeable
          ? structural.length
            ? "BY EYE"
            : "NOT COVERED"
          : strong
            ? "COVERED"
            : partial
              ? "PARTIAL"
              : "NOT COVERED",
      });
    }
  }

  // A hand check outranks the word matcher, in both directions: an item read
  // and confirmed in a lesson counts as covered, and one that can only be
  // demonstrated in an aeroplane is taken out of the score rather than left in
  // it as a gap the course could never close.
  const verified = VERIFIED_BY_HAND[SUBJECT] ?? {};
  const practical = FLYING_LESSON[SUBJECT] ?? {};
  for (const r of rows) {
    if (practical[r.item.code]) {
      r.status = "FLYING LESSON";
      r.note = practical[r.item.code];
    } else if (verified[r.item.code] && r.status !== "COVERED") {
      r.status = "COVERED";
      r.note = `checked by hand: ${verified[r.item.code]}`;
    }
  }

  const covered = rows.filter((r) => r.status === "COVERED");
  const partial = rows.filter((r) => r.status === "PARTIAL");
  const gaps = rows.filter((r) => r.status === "NOT COVERED");
  const byEye = rows.filter((r) => r.status === "BY EYE");
  const unmapped = rows.filter((r) => r.structural.length === 0);

  /* ---------------------------------------------------------------- report */
  const out = [];
  const w = (s = "") => out.push(s);

  w("# PPL Aircraft Technical Knowledge — CAA syllabus validation");
  w();
  w("Generated by `scripts/ppl-atk-caa-check.mjs`. **Internal only.** The syllabus is not the");
  w("course: these rows are archived, the syllabus index redirects to the course material, and no");
  w("lesson prints an objective block. This file exists to answer one question — does the course");
  w("teach everything the exam can ask about?");
  w();
  w("Two kinds of evidence per item. *Structural*: the chapter that declares the item's topic code,");
  w("which is what the lesson→item mappings were written from. *Textual*: the distinctive words of");
  w("the requirement, looked for in the lessons themselves. Structural evidence alone is not");
  w("counted as coverage — a chapter can claim a topic and still not answer an item beneath it.");
  w();
  w("## Result");
  w();
  w(`- **Topics validated: ${topics.length}/42**`);
  w(`- **Items checked: ${rows.length}/210**`);
  w(`- Covered: **${covered.length}**`);
  w(`- Partial: **${partial.length}**`);
  w(`- Not covered: **${gaps.length}**`);
  w(`- Checked by eye — requirement is all scaffolding, no distinctive words: **${byEye.length}**`);
  w(`- Genuinely N/A: **0** — every item in this syllabus is teachable from the source book`);
  w(`- Items with no structural mapping: ${unmapped.length}`);
  w();
  w(`Every syllabus topic is claimed by at least one chapter: ${topics.every((t) => rows.some((r) => r.topic.code === t.code && r.structural.length)) ? "yes" : "NO"}.`);
  w();

  if (gaps.length || partial.length || byEye.length) {
    w("## Items needing a look");
    w();
    w("| Code | Requirement | Best teaching location | Terms found | Status |");
    w("| --- | --- | --- | ---: | --- |");
    for (const r of [...gaps, ...partial, ...byEye]) {
      const req = String(r.item.requirement).replace(/\s+/g, " ").slice(0, 90);
      w(
        `| \`${r.item.code}\` | ${req} | ${r.carriers.map((c) => c.lesson.title).join("; ") || "—"} | ` +
          `${r.terms.length - r.missing.length}/${r.terms.length} | ${r.status} |`,
      );
    }
    w();
  }

  w("## Every item");
  w();
  for (const topic of topics) {
    const mine = rows.filter((r) => r.topic.code === topic.code);
    const good = mine.filter((r) => r.status === "COVERED").length;
    w(`### \`${topic.code}\` ${topic.title} — ${good}/${mine.length} covered`);
    w();
    w("| Item | Requirement | Taught in | Source pages | Status |");
    w("| --- | --- | --- | --- | --- |");
    for (const r of mine) {
      const req = String(r.item.requirement).replace(/\s+/g, " ").slice(0, 110);
      const taught = r.carriers.length ? r.carriers.map((c) => c.lesson.title).join("; ") : r.best.lesson.title;
      const pages = r.carriers.length ? r.carriers.map((c) => c.lesson.pages).join(", ") : r.best.lesson.pages;
      w(
        `| \`${r.item.code}\` | ${req} | ${taught} | ${pages} | ` +
          `${r.status}${r.status === "COVERED" ? "" : ` (${r.terms.length - r.missing.length}/${r.terms.length})`} |`,
      );
    }
    w();
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, out.join("\n") + "\n");

  console.log(`${SUBJECT}: topics ${topics.length} · items ${rows.length}`);
  const flying = rows.filter((r) => r.status === "FLYING LESSON");
  console.log(
    `covered ${covered.length} · partial ${partial.length} · not covered ${gaps.length}` +
      (flying.length ? ` · flying-lesson objectives ${flying.length}` : ""),
  );
  console.log(`wrote ${OUT}`);
  if (verbose) {
    for (const r of [...gaps, ...partial, ...byEye]) {
      console.log(
        `\n${r.status}  ${r.item.code}  ${String(r.item.requirement).replace(/\s+/g, " ").slice(0, 100)}`,
      );
      console.log(`   chapter: ${r.structural[0]?.chapter ?? "(unmapped)"} — ${r.carriers.map((c) => `${c.lesson.title} (${c.hit})`).join("; ")}`);
      console.log(`   missing terms: ${r.missing.join(", ")}`);
    }
  }
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
