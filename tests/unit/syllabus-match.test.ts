import { describe, it, expect } from "vitest";

// Plain ESM with no type declarations — the matcher is a build script.
import {
  terms,
  buildIdf,
  coverage,
  stemsAgree,
  scoreLesson,
  alignModules,
  bandOf,
  proposalsFor,
  headClause,
  clausesOf,
  BANDS,
} from "../../scripts/syllabus-match.mjs";

/**
 * The properties that decide whether a proposed lesson-to-syllabus link is
 * worth putting in front of a reviewer.
 *
 * A wrong link is worse than no link: it sends a student who lost marks on a
 * code to a page that does not teach it, and tells them that is the answer. So
 * the tests that matter here are the ones about *not* matching — that a shared
 * instruction verb proves nothing, that a common word proves little, and that
 * a confident-looking score cannot be manufactured out of locality alone.
 */

const CORPUS = [
  "Coriolis Force",
  "Pressure Gradient",
  "The Forces Involved",
  "Frictional Forces",
  "Gusts",
  "Squalls",
  "Wind Measurement",
  "Diurnal Variation of the Surface Wind",
  "Cup Anemometer and Wind Vane",
  "Wind Change During Climb or Descent",
];
const idf = buildIdf(CORPUS);

describe("terms", () => {
  it("drops the syllabus's own instruction verbs", () => {
    // "Outline", "describe", "state" open most CAA requirements and carry no
    // information about which lesson teaches them.
    expect(terms("Outline the cause of Coriolis force")).toEqual(["cause", "coriolis", "force"]);
    expect(terms("State the units used to describe wind speed")).toEqual([
      "units",
      "wind",
      "speed",
    ]);
  });

  it("keeps short technical terms that matter", () => {
    expect(terms("Define the International Standard Atmosphere (ISA)")).toContain("isa");
    expect(terms("radiation fog forms overnight")).toContain("fog");
    expect(terms("set the QNH on the subscale")).toContain("qnh");
  });

  it("is case and punctuation insensitive", () => {
    expect(terms("Buys Ballot's Law")).toEqual(terms("BUYS BALLOT'S LAW."));
  });

  it("returns nothing for empty or verb-only input", () => {
    expect(terms("")).toEqual([]);
    expect(terms(null)).toEqual([]);
    expect(terms("Describe the following")).toEqual([]);
  });
});

describe("buildIdf", () => {
  it("weights a rare term above a common one", () => {
    expect(idf.get("coriolis")).toBeGreaterThan(idf.get("wind"));
  });

  it("gives a term present in every document no weight at all", () => {
    const flat = buildIdf(["wind speed", "wind direction", "wind measurement"]);
    expect(flat.get("wind")).toBe(0);
  });

  it("survives an empty corpus without dividing by zero", () => {
    expect(buildIdf([]).size).toBe(0);
    expect(Number.isFinite(coverage(terms("coriolis"), terms("coriolis"), buildIdf([])))).toBe(true);
  });
});

describe("coverage", () => {
  it("is 1 when every meaningful term is present", () => {
    expect(coverage(terms("Coriolis force"), terms("Coriolis Force"), idf)).toBeCloseTo(1, 5);
  });

  it("is 0 when nothing overlaps", () => {
    expect(coverage(terms("Coriolis force"), terms("Cloud classification"), idf)).toBe(0);
  });

  it("is asymmetric — a long lesson can fully cover a short requirement", () => {
    // The question is whether the lesson covers the item, not whether the two
    // are about equally much.
    const need = terms("geostrophic wind");
    const long = terms("Centripetal Force, Geostrophic and Gradient Wind Explained At Length");
    expect(coverage(need, long, idf)).toBeCloseTo(1, 5);
    expect(coverage(long, need, idf)).toBeLessThan(1);
  });

  it("lets the rare term decide, when a requirement mixes rare and common", () => {
    // Coverage is a ratio, so a one-word requirement scores 1 whenever it
    // matches. Rarity shows itself when several terms compete: catching
    // "coriolis" and missing "wind" must beat the other way round.
    const need = terms("coriolis wind");
    const caughtRare = coverage(need, terms("Coriolis Force"), idf);
    const caughtCommon = coverage(need, terms("Wind Measurement"), idf);
    expect(caughtRare).toBeGreaterThan(caughtCommon);
  });

  it("does not let a term the deck never uses crush a real match", () => {
    // "Cause" appears nowhere in this corpus. Treating an unseen term as
    // maximally rare would sink a requirement that otherwise matched exactly.
    const withUnknown = coverage(terms("the cause of coriolis force"), terms("Coriolis Force"), idf);
    expect(withUnknown).toBeGreaterThan(0.8);
  });

  it("gives partial credit for a plural or participle, not full", () => {
    const partial = coverage(terms("gusts"), terms("Gust"), idf);
    expect(partial).toBeGreaterThan(0);
    expect(partial).toBeLessThan(1);
  });

  it("is 0 for an empty requirement rather than NaN", () => {
    expect(coverage([], terms("anything"), idf)).toBe(0);
  });

  it("falls back to plain overlap when every term weighs nothing", () => {
    // A one-document corpus gives every term zero weight. Returning 0 there
    // would disable matching altogether rather than admit it cannot rank.
    const flat = buildIdf(["Wind"]);
    expect(coverage(terms("wind"), terms("The Wind"), flat)).toBe(1);
    expect(coverage(terms("wind"), terms("Cloud"), flat)).toBe(0);
  });
});

describe("stemsAgree", () => {
  it("accepts an ordinary inflection", () => {
    expect(stemsAgree("frictional", "friction")).toBe(true);
    expect(stemsAgree("pressure", "pressures")).toBe(true);
  });

  it("refuses two different words that merely start alike", () => {
    expect(stemsAgree("condensation", "conduction")).toBe(false);
    expect(stemsAgree("altitude", "altimeter")).toBe(false);
  });

  it("refuses a long word swallowing a short one", () => {
    expect(stemsAgree("ice", "icebreaker")).toBe(false);
  });
});

describe("headClause", () => {
  it("stops at the qualifying clause", () => {
    const head = headClause(
      "Outline the measurement of surface air temperature in New Zealand (as reported in aviation observations), and relate that to actual temperatures above a runway.",
    );
    expect(terms(head)).toEqual(["measurement", "surface", "air", "temperature"]);
  });

  it("stops at a colon introducing a list", () => {
    expect(terms(headClause("Identify the following features found on surface weather maps:"))).toEqual([
      "features",
      "found",
      "surface",
      "weather",
      "maps",
    ]);
  });

  it("stops at a legal citation", () => {
    const head = headClause("Describe the duties of the PIC, as laid down in the CA Act 2023.");
    expect(terms(head)).toEqual(["duties", "pic"]);
  });

  it("leaves a short requirement alone", () => {
    expect(headClause("Define pressure gradient.")).toBe("Define pressure gradient.");
  });

  it("keeps the full line when trimming would leave nothing to match on", () => {
    // "Describe the following:" reduces to no terms at all, so the head is
    // worse than useless and the whole line is the better bet.
    const full = "Describe the following: conduction, convection and advection.";
    expect(headClause(full)).toBe(full);
  });

  it("handles empty input", () => {
    expect(headClause("")).toBe("");
    expect(headClause(null)).toBe("");
  });
});

describe("clausesOf", () => {
  const LIST = [
    "In plain language, decode the information contained in the following forecasts and reports:",
    "(a) GRAFOR;",
    "(b) TAF;",
    "(c) METAR;",
    "(d) SPECI.",
  ].join("\n");

  it("pulls out each lettered entry on its own", () => {
    expect(clausesOf(LIST)).toEqual(["GRAFOR", "TAF", "METAR", "SPECI"]);
  });

  it("ignores the lead-in line", () => {
    expect(clausesOf(LIST)).not.toContain(
      "In plain language, decode the information contained in the following forecasts and reports:",
    );
  });

  it("returns nothing for a requirement without sub-clauses", () => {
    expect(clausesOf("Define pressure gradient.")).toEqual([]);
    expect(clausesOf("")).toEqual([]);
    expect(clausesOf(null)).toEqual([]);
  });
});

describe("scoreLesson", () => {
  const base = { idf, sameSection: false };

  it("scores a direct title match highly", () => {
    const { score } = scoreLesson({
      ...base,
      requirement: "Outline the cause of Coriolis force.",
      lessonTitle: "Coriolis Force",
      lessonBody: "The Coriolis force arises from the rotation of the Earth.",
    });
    expect(bandOf(score)).toBe("strong");
  });

  it("weights the title far above the body", () => {
    const inTitle = scoreLesson({
      ...base,
      requirement: "Define the geostrophic wind.",
      lessonTitle: "The Geostrophic Wind",
      lessonBody: "Unrelated prose about aerodromes.",
    });
    const inBodyOnly = scoreLesson({
      ...base,
      requirement: "Define the geostrophic wind.",
      lessonTitle: "Summary",
      lessonBody: "The geostrophic wind blows parallel to the isobars.",
    });
    expect(inTitle.score).toBeGreaterThan(inBodyOnly.score * 2);
  });

  it("still records a body-only match as real but weak evidence", () => {
    const { score, titleScore, bodyScore } = scoreLesson({
      ...base,
      requirement: "State Buys Ballot's Law.",
      lessonTitle: "Summary",
      lessonBody: "Buys Ballot's Law relates wind direction to pressure.",
    });
    expect(titleScore).toBe(0);
    expect(bodyScore).toBeGreaterThan(0.5);
    expect(score).toBeGreaterThan(0);
    expect(bandOf(score)).not.toBe("strong");
  });

  it("proves nothing from a shared instruction verb", () => {
    // Both texts contain "describe" and "the following"; nothing else.
    const { score } = scoreLesson({
      ...base,
      requirement: "Describe the following forces.",
      lessonTitle: "Describe the following procedures",
      lessonBody: "",
    });
    expect(score).toBe(0);
  });

  it("does not manufacture a match out of locality alone", () => {
    // Being in the aligned module must multiply real evidence, never create it.
    const { score } = scoreLesson({
      ...base,
      sameSection: true,
      requirement: "Outline the cause of Coriolis force.",
      lessonTitle: "Cloud Classification",
      lessonBody: "Stratus, cumulus and cirrus.",
    });
    expect(score).toBe(0);
  });

  it("lifts a real but thin match when it sits in the aligned module", () => {
    // "Properties" alone says nothing; inside the Coriolis section it is the
    // right answer for "List the three properties of Coriolis force".
    const args = {
      ...base,
      requirement: "List the three properties of Coriolis force.",
      lessonTitle: "Properties",
      lessonBody: "The three properties of the Coriolis force are as follows.",
    };
    const loose = scoreLesson(args);
    const located = scoreLesson({ ...args, sameSection: true });
    expect(located.score).toBeGreaterThan(loose.score);
  });

  it("never exceeds 1, even with locality applied to a perfect match", () => {
    const { score } = scoreLesson({
      ...base,
      sameSection: true,
      requirement: "Coriolis force",
      lessonTitle: "Coriolis Force",
      lessonBody: "Coriolis force",
    });
    expect(score).toBeLessThanOrEqual(1);
  });

  it("rescues a long requirement whose head clause names the lesson exactly", () => {
    // This is the case that made a perfect match read as a weak one: the
    // trailing qualifiers of a thirty-word requirement can never appear in a
    // four-word lesson title.
    const local = buildIdf([
      "Measurement of Surface Air Temperature",
      "How Does Air Temperature Effect Landing?",
      "Celsius",
      "Kelvin (Absolute)",
      "Coriolis Force",
    ]);
    const { score } = scoreLesson({
      idf: local,
      sameSection: false,
      requirement:
        "Outline the measurement of surface air temperature in New Zealand (as reported in aviation observations), and relate that to actual temperatures experienced above a sealed or grass runway.",
      lessonTitle: "Measurement of Surface Air Temperature",
      lessonBody: "Surface air temperature is measured in a Stevenson screen.",
    });
    expect(bandOf(score)).toBe("strong");
  });

  it("ranks the exactly-named lesson above the broader one that also covers it", () => {
    const local = buildIdf([
      "Pressure Gradient",
      "Pressure Gradient and Coriolis Force Interaction",
      "Coriolis Force",
      "Frictional Forces",
    ]);
    const args = { idf: local, sameSection: false, requirement: "Define pressure gradient.", lessonBody: "" };
    const exact = scoreLesson({ ...args, lessonTitle: "Pressure Gradient" });
    const broader = scoreLesson({
      ...args,
      lessonTitle: "Pressure Gradient and Coriolis Force Interaction",
    });
    expect(exact.score).toBeGreaterThan(broader.score);
    // Both genuinely teach it, so the broader one must still be proposed.
    expect(bandOf(broader.score)).not.toBe("none");
  });

  it("matches a lesson that teaches one entry of a list requirement", () => {
    // The item lists thirteen report types; a lesson teaches one of them.
    // Scored against the whole list it covers two terms in twenty and reads as
    // no match, when it is the right answer for clause (b).
    const local = buildIdf([
      "GRAFOR",
      "TAF (Aerodrome Forecast)",
      "METAR and SPECI",
      "Cloud Characteristics",
      "Coriolis Force",
    ]);
    const requirement = [
      "In plain language, decode the information contained in the following forecasts and reports:",
      "(a) GRAFOR;",
      "(b) TAF;",
      "(c) METAR;",
      "(d) SPECI.",
    ].join("\n");

    const hit = scoreLesson({
      idf: local,
      sameSection: false,
      requirement,
      lessonTitle: "TAF (Aerodrome Forecast)",
      lessonBody: "",
    });
    expect(bandOf(hit.score)).not.toBe("none");

    // And it must still refuse a lesson that teaches none of the clauses.
    const miss = scoreLesson({
      idf: local,
      sameSection: false,
      requirement,
      lessonTitle: "Coriolis Force",
      lessonBody: "",
    });
    expect(miss.score).toBe(0);
  });

  it("scores a clause match below a match on the whole requirement", () => {
    // A lesson teaching one entry of a list teaches part of the item, not all
    // of it, and the score has to say so.
    const local = buildIdf(["TAF (Aerodrome Forecast)", "GRAFOR", "Cloud Characteristics"]);
    const whole = scoreLesson({
      idf: local, sameSection: false,
      requirement: "Decode a TAF.",
      lessonTitle: "TAF (Aerodrome Forecast)", lessonBody: "",
    });
    const clause = scoreLesson({
      idf: local, sameSection: false,
      requirement: "Decode the following:\n(a) TAF;\n(b) GRAFOR.",
      lessonTitle: "TAF (Aerodrome Forecast)", lessonBody: "",
    });
    expect(clause.score).toBeLessThan(whole.score);
  });

  it("returns zero for a requirement with no matchable terms", () => {
    expect(
      scoreLesson({ ...base, requirement: "Describe the following:", lessonTitle: "Wind", lessonBody: "" })
        .score,
    ).toBe(0);
  });
});

describe("alignModules", () => {
  const topics = [
    { code: "8.12", title: "Wind" },
    { code: "8.16", title: "Cloud and its Classification" },
    { code: "8.24", title: "Thunderstorms" },
  ];
  const modules = [
    { id: "m1", title: "The Wind" },
    { id: "m2", title: "Cloud and its Classification" },
    { id: "m3", title: "Icing" },
  ];
  const corpusIdf = buildIdf([...topics.map((t) => t.title), ...modules.map((m) => m.title)]);

  it("pairs a topic with the module that names the same material", () => {
    const map = alignModules({ topics, modules, idf: corpusIdf });
    expect(map.get("8.16")).toBe("m2");
  });

  it("leaves a topic unaligned rather than guessing", () => {
    // Nothing in the deck is called Thunderstorms; a wrong alignment would
    // push every item of the topic at the wrong module.
    const map = alignModules({ topics, modules, idf: corpusIdf });
    expect(map.has("8.24")).toBe(false);
  });

  it("never gives one module to two topics", () => {
    const map = alignModules({
      topics: [
        { code: "1.1", title: "Wind" },
        { code: "1.2", title: "Wind" },
      ],
      modules: [{ id: "only", title: "Wind" }],
      idf: buildIdf(["Wind"]),
    });
    expect([...map.values()].filter((id) => id === "only")).toHaveLength(1);
  });

  it("returns an empty map when there is nothing to align", () => {
    expect(alignModules({ topics: [], modules, idf: corpusIdf }).size).toBe(0);
    expect(alignModules({ topics, modules: [], idf: corpusIdf }).size).toBe(0);
  });
});

describe("bandOf", () => {
  it("names each band at its threshold", () => {
    expect(bandOf(BANDS.strong)).toBe("strong");
    expect(bandOf(BANDS.likely)).toBe("likely");
    expect(bandOf(BANDS.weak)).toBe("weak");
  });

  it("calls anything below the weak threshold none", () => {
    expect(bandOf(BANDS.weak - 0.01)).toBe("none");
    expect(bandOf(0)).toBe("none");
  });
});

describe("proposalsFor", () => {
  const row = (slug: string, score: number) => ({ slug, score });

  it("proposes nothing when the best candidate is not even weak", () => {
    expect(proposalsFor([row("a", 0.1), row("b", 0.05)])).toEqual([]);
  });

  it("returns the best candidate first", () => {
    const out = proposalsFor([row("a", 0.5), row("b", 0.9)]);
    expect(out[0].slug).toBe("b");
  });

  it("keeps close runners-up, because one item is often taught across lessons", () => {
    const out = proposalsFor([row("a", 0.9), row("b", 0.86), row("c", 0.84)]);
    expect(out).toHaveLength(3);
  });

  it("drops a distant runner-up rather than padding the review list", () => {
    const out = proposalsFor([row("a", 0.9), row("b", 0.3)]);
    expect(out).toHaveLength(1);
  });

  it("caps how many it will propose for one item", () => {
    const out = proposalsFor([
      row("a", 0.9), row("b", 0.9), row("c", 0.9), row("d", 0.9), row("e", 0.9),
    ]);
    expect(out).toHaveLength(3);
  });

  it("handles an empty candidate list", () => {
    expect(proposalsFor([])).toEqual([]);
  });
});
