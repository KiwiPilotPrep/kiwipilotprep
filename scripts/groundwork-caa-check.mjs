/**
 * Does the Groundwork actually prepare a candidate for the flight test?
 *
 * The authority is the CAA's own form: **Part 61 private pilot licence —
 * aeroplane flight test report, CAA 24061-22, Rev 7, April 2025**, saved at
 * `.cache/caa-flight-test/24061-022.pdf`. Section 4 of that form lists every
 * task an examiner marks, each with the objectives beside it.
 *
 * The first eight tasks on the form are the eight modules the PRD prescribes,
 * with the same names in the same order. Everything after them is flown rather
 * than talked about, and is outside what this product covers — it is listed
 * here as out of scope rather than folded into a module where it does not
 * belong.
 *
 * For each of the eight, the objectives printed on the form are checked
 * against what the module actually teaches. This is an internal check: nothing
 * it produces is shown to a student, and the form's wording never appears on a
 * page.
 *
 *   node scripts/groundwork-caa-check.mjs [--verbose]
 */
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const FORM = ".cache/caa-flight-test/24061-022.txt";
const verbose = process.argv.includes("--verbose");

/**
 * Section 4 of the form, transcribed. `task` and `objective` are the form's own
 * words; `expect` is what a page must mention for that objective to count as
 * taught, so the check is about substance rather than about repeating the
 * form's phrasing back at itself.
 */
const GROUND_TASKS = [
  {
    task: "Personal preparation",
    objective: "IM SAFE, documents, privileges, currency, limitations",
    module: "Personal Preparation",
    expect: [
      ["IMSAFE", /\bIM\s?SAFE\b/i],
      ["the documents a pilot carries", /\blicence\b|\bmedical certificate\b|\bphoto identification\b|\blogbook\b/i],
      ["privileges", /\bprivileges?\b/i],
      ["currency", /\bcurrenc(y|ies)\b|\bbiennial\b|\bBFR\b/i],
      ["limitations", /\blimitations?\b/i],
      ["recency", /\brecenc(y|ies)\b|\bthree takeoffs?\b|\b90 days\b/i],
    ],
  },
  {
    task: "Aircraft documents",
    objective:
      "Knowledge of Certificate of Airworthiness; Knowledge of Technical Log; " +
      "Knowledge of Flight Manual, CAA forms 2129 & 2173",
    module: "Aircraft Documents",
    expect: [
      ["Certificate of Airworthiness", /certificate of airworthiness|\bC of A\b/i],
      ["the technical log", /technical log|\btech log\b/i],
      ["the flight manual", /flight manual|\bAFM\b|\bPOH\b/i],
      ["CAA form 2129", /\b2129\b/],
      ["CAA form 2173", /\b2173\b/],
      ["the certificate of registration", /certificate of registration/i],
      ["maintenance releases and airworthiness review", /airworthiness review|maintenance release|\bAD(s)?\b|airworthiness directive/i],
    ],
  },
  {
    task: "Weather, AIP NZ and supplements",
    objective: "Area forecasts, TAF, METAR, NOTAMS, AIP, Go/No go",
    module: "Weather, AIP NZ, and Supplements",
    expect: [
      ["area forecasts", /\bGRAFOR\b|area forecast|\bAAW\b|area winds/i],
      ["TAF", /\bTAF\b/],
      ["METAR", /\bMETAR\b/],
      ["NOTAM", /\bNOTAM/i],
      ["the AIP", /\bAIP\b/],
      ["supplements", /\bsupplement/i],
      ["the go / no-go decision", /go\s*\/?\s*no.?go|\bdecision to fly\b/i],
    ],
  },
  {
    task: "Performance and operating requirements",
    objective: "P Charts, group rating, seasonal effects on performance",
    module: "Performance and Operating Requirements",
    expect: [
      ["P-charts", /\bP.?chart/i],
      ["the group rating system", /group rating/i],
      ["seasonal and atmospheric effects", /density altitude|seasonal|temperature and pressure|\bISA\b/i],
      ["declared distances", /\bTODA\b|\bASDA\b|\bTORA\b|\bLDA\b|declared distance/i],
    ],
  },
  {
    task: "Fuel management",
    objective: "Fuel required, quantity, consumption, system",
    module: "Fuel Management",
    expect: [
      ["fuel required and reserves", /\breserve/i],
      ["quantity and water checks", /water|drain|quantity/i],
      ["consumption", /consumption|leaning|mixture/i],
      ["the fuel system", /fuel system|venting|tank/i],
      ["fuel grades and contamination", /avgas|\b100LL\b|grade|contamination|misfuel/i],
    ],
  },
  {
    task: "Loading",
    objective: "MAUW, C of G position, load distribution, securing",
    module: "Loading",
    expect: [
      ["maximum all-up weight", /\bMAUW\b|maximum all.up weight|maximum takeoff weight/i],
      ["centre of gravity", /centre of gravity|center of gravity|\bC of G\b|\bCG\b/i],
      ["load distribution", /load distribution|\bmoment\b|\barm\b/i],
      ["securing the load", /securing|secure|restrain/i],
      ["the envelope and categories", /envelope|utility|normal category/i],
    ],
  },
  {
    task: "Pre-flight inspection",
    objective: "Interior, exterior, load security",
    module: "Pre-Flight Inspection",
    expect: [
      ["the interior check", /interior|cockpit check/i],
      ["the exterior walk-around", /exterior|walk.?around/i],
      ["load security", /load security|securing/i],
    ],
  },
  {
    task: "Emergency equipment",
    objective: "Passenger supervision, briefing",
    module: "Emergency Equipment",
    expect: [
      ["passenger supervision", /passenger/i],
      ["the passenger briefing", /brief/i],
      ["the ELT", /\bELT\b|locator transmitter/i],
      ["fire extinguisher and first aid", /extinguisher|first aid/i],
      ["life jackets and over-water equipment", /life ?jacket|over.?water|life ?raft/i],
    ],
  },
];

/** Everything on the form after the eight, which is flown rather than briefed. */
const AIRBORNE_TASKS = [
  "Engine start, warm up and shutdown",
  "ATS procedures",
  "Taxiing and brake check",
  "Engine checks, run and operation",
  "Pre-takeoff checks",
  "Takeoff (normal, crosswind, short field)",
  "Engine failure techniques",
  "Climbing, straight and level, medium turns, descent",
  "Slow flight",
  "Stalls (basic, power on, wing drop)",
  "Magnetic compass headings",
  "Steep turns",
  "Forced landing with power",
  "Forced landing without power",
  "Flap usage / side slipping",
  "Low flying",
  "Joining the circuit",
  "Approach and landing (normal, flapless, crosswind, short field)",
  "Approach and go-around",
  "Radiotelephony tuning and procedures",
  "Threat and Error Management (TEM), decision making",
  "Lookout",
  "Flight orientation",
];

async function main() {
  if (!fs.existsSync(FORM)) throw new Error(`${FORM} is missing — fetch CAA 24061-22 first`);
  const form = fs.readFileSync(FORM, "utf8");

  // The transcription above is checked against the form rather than trusted:
  // if a task name is no longer on the form, the form has changed.
  const missingFromForm = [...GROUND_TASKS.map((t) => t.task)].filter(
    (t) => !form.toLowerCase().includes(t.toLowerCase()),
  );
  if (missingFromForm.length) {
    throw new Error(`these tasks are not in the saved form — it may have been revised: ${missingFromForm.join(", ")}`);
  }
  const rev = form.match(/Rev\s+\d+:\s+\w+\s+\d{4}/)?.[0] ?? "(revision not found)";

  const subject = await db.subject.findFirst({
    where: { slug: "flight-test-groundwork", course: { slug: "ppl-flight-test" } },
    select: { id: true },
  });
  const modules = await db.courseModule.findMany({
    where: { subjectId: subject.id },
    orderBy: { displayOrder: "asc" },
    select: {
      title: true,
      lessons: { select: { title: true, content: { select: { blocks: true } } } },
    },
  });

  const textOf = (m) =>
    m.lessons
      .flatMap((l) => [l.title, ...(l.content?.blocks ?? []).flatMap((b) => [b.text, b.title, b.caption, ...(b.items ?? []), ...(b.headers ?? []), ...((b.rows ?? []).flat())])])
      .filter((x) => typeof x === "string")
      .join("\n");

  const gaps = [];
  const rows = [];

  for (const t of GROUND_TASKS) {
    const m = modules.find((x) => x.title === t.module);
    if (!m) {
      gaps.push(`${t.task}: no module named "${t.module}"`);
      continue;
    }
    const body = textOf(m);
    const missing = t.expect.filter(([, re]) => !re.test(body)).map(([label]) => label);
    for (const label of missing) gaps.push(`${t.task}: nothing found about ${label}`);
    rows.push({
      "flight test task": t.task,
      module: t.module,
      topics: m.lessons.length,
      objectives: t.expect.length,
      covered: t.expect.length - missing.length,
    });
    if (verbose) {
      console.log(`\n${t.task}\n   form objective: ${t.objective}`);
      for (const [label, re] of t.expect) console.log(`   ${re.test(body) ? "✓" : "✗"} ${label}`);
    }
  }

  console.log(`\nCAA 24061-22 — Part 61 private pilot licence, aeroplane flight test report (${rev})\n`);
  console.table(rows);

  console.log(`\nOutside this product's scope — flown on the day, not briefed on the ground (${AIRBORNE_TASKS.length} tasks):`);
  for (const t of AIRBORNE_TASKS) console.log(`   ${t}`);
  console.log(
    "\nThe six written examinations the form records dates for are PPL Theory,\n" +
      "a separate course, and are not part of the Groundwork package.",
  );

  if (gaps.length) {
    console.log(`\n${gaps.length} gap(s):`);
    for (const g of gaps) console.log(`   ${g}`);
    process.exitCode = 1;
  } else {
    console.log("\nEvery objective the form prints against the eight ground tasks is taught.");
  }

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(String(e.message ?? e));
  await db.$disconnect();
  process.exit(1);
});
