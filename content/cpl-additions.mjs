/**
 * Sections written to fill verified gaps in the CPL course material.
 *
 * Every entry here exists because `scripts/cpl-audit.mjs` found a syllabus
 * item the imported decks do not teach, and because a source that does teach
 * it was found and read. Nothing is written from memory: `provenance` names
 * where the material came from, and an entry without one does not belong in
 * this file.
 *
 * Two rules the brief sets, enforced by the importer rather than by good
 * intentions:
 *
 *   1. **Nothing source-facing reaches the student.** No URLs, citations or
 *      "according to" notes appear in `blocks`. `provenance` is written to the
 *      mapping's admin-only evidence field and to the change log, never to the
 *      page.
 *   2. **Nothing is invented.** Where a requirement needs a regulatory value
 *      that the supplied material does not carry — a current Civil Aviation
 *      Act 2023 criterion, an aircraft-specific procedure — the item is left
 *      out of this file and reported as an open gap instead. A section that
 *      teaches a plausible-sounding wrong number is worse than no section.
 *
 * Placement follows the brief too: `anchorModule` names the existing module a
 * section belongs beside, and the importer files it immediately after that
 * module rather than in an appendix.
 */

/** @typedef {{ type: string, [k: string]: unknown }} Block */

export const CPL_ADDITIONS = [
  /* ================================================================== 16 */

  {
    subject: "air-law",
    course: "cpl-theory",
    items: ["16.30.36"],
    // Security areas are an aerodrome subject, and this reads on from the
    // aerodrome operations material rather than from the paperwork chapter.
    anchorModule: "Aerodromes",
    title: "Identity Documentation in Security Areas",
    provenance: "NZICPAPPL-CPLAirLawBook.pdf p38 (CAR 19)",
    blocks: [
      {
        type: "paragraph",
        text: "Designated aerodromes and designated installations contain areas where access is controlled. These are security areas and security enhanced areas, and entry to them carries a documentation requirement on every person inside, flight crew included.",
      },
      { type: "heading", text: "The requirement" },
      {
        type: "paragraph",
        text: "No person may enter or remain in a security area or a security enhanced area of a designated aerodrome or designated installation unless that person either:",
      },
      {
        type: "subitem",
        label: "(a)",
        text: "wears an airport identity card on the front of their outer garment; or",
      },
      {
        type: "subitem",
        label: "(b)",
        text: "has another approved identity document in their possession.",
      },
      { type: "heading", text: "Why it is worded that way" },
      {
        type: "paragraph",
        text: "The card is required to be worn on the outer garment, and on the front of it, so that it can be seen without anyone having to ask. A card in a pocket satisfies the possession test for the alternative document but not the wearing test for the card itself.",
      },
      {
        type: "note",
        variant: "info",
        title: "Operationally",
        text: "The obligation sits on the individual, not on the operator. A crew member walking airside is personally responsible for displaying identification, and being part of a crew does not remove that.",
      },
      { type: "heading", text: "Check yourself" },
      {
        type: "paragraph",
        text: "You are walking from the terminal to the aircraft through a security area with your identity card clipped to your flight bag. Does that satisfy the rule?",
      },
      {
        type: "paragraph",
        text: "No. The card must be worn on the front of an outer garment. Carried on a bag it is neither worn nor, being the airport identity card itself, does it fall under the alternative-document provision as a substitute for wearing it.",
      },
    ],
  },

  {
    subject: "air-law",
    course: "cpl-theory",
    items: ["16.63.8", "16.63.10"],
    anchorModule: "Air Traffic Services",
    title: "Normal Separation Standards, and When They Are Reduced",
    provenance: "NZICPAPPL-CPLAirLawBook.pdf p56–57 (AIP ENR)",
    blocks: [
      {
        type: "paragraph",
        text: "Where ATC is separating traffic, it does so against published standards. Knowing those standards tells you what protection you actually have, and knowing where they may be reduced tells you when to expect to see another aircraft closer than you might assume.",
      },
      { type: "heading", text: "Vertical separation" },
      {
        type: "table",
        headers: ["Level band", "Vertical separation between controlled flights"],
        rows: [
          ["Below FL290", "1000 ft"],
          ["Above FL290", "2000 ft"],
        ],
      },
      { type: "heading", text: "Horizontal separation" },
      {
        type: "paragraph",
        text: "Horizontal separation is applied in one of four forms, and which one is in use depends on the surveillance and navigation available to the controller:",
      },
      { type: "subitem", label: "(a)", text: "longitudinal separation;" },
      { type: "subitem", label: "(b)", text: "lateral separation;" },
      { type: "subitem", label: "(c)", text: "radar separation;" },
      { type: "subitem", label: "(d)", text: "geographical separation." },
      { type: "heading", text: "When the vertical standard may be reduced" },
      {
        type: "paragraph",
        text: "The 1000 ft standard may be reduced to 500 ft within controlled airspace, but only when all of the following hold together:",
      },
      { type: "subitem", label: "(a)", text: "both aircraft are medium or light weight category aircraft; and" },
      { type: "subitem", label: "(b)", text: "the lower aircraft is VFR or Special VFR; and" },
      { type: "subitem", label: "(c)", text: "the lower aircraft is operating at an altitude of 4500 ft or below." },
      {
        type: "note",
        variant: "warning",
        title: "All three, not any one",
        text: "These are cumulative conditions. A heavy aircraft, an IFR aircraft below, or an altitude above 4500 ft each on its own puts the pair back on the 1000 ft standard.",
      },
      { type: "heading", text: "Why a CPL candidate is asked this" },
      {
        type: "paragraph",
        text: "Reduced separation is the case where a VFR aircraft at or below 4500 ft in controlled airspace may legitimately see traffic 500 ft above or below. Expecting 1000 ft in that situation and being surprised by 500 ft is exactly the misunderstanding the requirement exists to prevent.",
      },
    ],
  },

  /* ================================================================== 34 */

  {
    subject: "human-factors",
    course: "cpl-theory",
    items: ["34.30.6"],
    // Closes the run of physiological systems: the student has just learned
    // how the body fails in flight, and this is what to do about it.
    anchorModule: "Anatomy of the Ear",
    title: "When to Consult Your Aviation Medical Examiner",
    provenance: "NZICPAPPL-CPLHumanFactors.pdf p33 (Fitness to Fly)",
    blocks: [
      {
        type: "paragraph",
        text: "Fitness to fly means being mentally and physically capable of performing everything the flight requires. Holding a current medical certificate is a legal requirement, but it is a snapshot: it says you were fit on the day you were examined, not that you are fit today.",
      },
      {
        type: "paragraph",
        text: "Medical fitness for flight can only be assessed by an Aviation Medical Examiner. An AME is not the same as a general practitioner, and a GP clearing you to return to work is not a clearance to return to flying.",
      },
      { type: "heading", text: "Symptoms that should send you to an AME before further flight" },
      { type: "subitem", label: "(a)", text: "any change in brain function or in consciousness;" },
      { type: "subitem", label: "(b)", text: "chest pain;" },
      { type: "subitem", label: "(c)", text: "respiratory problems;" },
      { type: "subitem", label: "(d)", text: "any significant change to vision." },
      {
        type: "paragraph",
        text: "The common thread is that each of these can incapacitate without warning, and each can be made worse by the cabin environment — reduced pressure, reduced oxygen partial pressure, vibration, and a workload that does not pause while you deal with it.",
      },
      { type: "heading", text: "The pre-flight self-check" },
      {
        type: "paragraph",
        text: "Before every flight, run the IMSAFE checklist. It is a personal fitness check, and it belongs alongside the aircraft checks rather than instead of them:",
      },
      { type: "subitem", label: "I", text: "Illness" },
      { type: "subitem", label: "M", text: "Medication" },
      { type: "subitem", label: "S", text: "Stress" },
      { type: "subitem", label: "A", text: "Alcohol and drugs" },
      { type: "subitem", label: "F", text: "Fatigue" },
      { type: "subitem", label: "E", text: "Eating" },
      {
        type: "note",
        variant: "info",
        title: "Whose responsibility",
        text: "Keeping the medical current, and flying only within its conditions, is the pilot's own responsibility. Nobody else is required to notice that you are unfit.",
      },
    ],
  },

  {
    subject: "human-factors",
    course: "cpl-theory",
    items: ["34.44.32"],
    anchorModule: "Spatial Orientation",
    title: "Special Perceptual Problems: Water, Height and Low Flying",
    provenance: "NZICPAPPL-CPLHumanFactors.pdf p60 (Water and Height Judgment)",
    blocks: [
      {
        type: "paragraph",
        text: "Judging height is a visual task, and it depends on having cues to judge against. Remove the cues and the judgement does not become harder in proportion — it becomes unreliable in a particular direction, which is what makes it dangerous.",
      },
      { type: "heading", text: "Smooth water" },
      {
        type: "paragraph",
        text: "Flying over a smooth water surface makes height extremely difficult to judge, because the surface offers almost no texture to read distance from. The characteristic error is to fly lower than intended, and it is worse the smoother the water is.",
      },
      {
        type: "paragraph",
        text: "The consequences are documented rather than theoretical. Helicopters have flown into the sea during night approaches to offshore rigs, and multi-engine aeroplanes have struck the water with their propellers while attempting to fly at fifty feet over a calm sea or lake.",
      },
      { type: "heading", text: "Low flying over land" },
      {
        type: "paragraph",
        text: "When low flying, the pilot must assess height above the ground to time a profile adjustment or a power reduction. That assessment is built from several cues at once:",
      },
      {
        type: "subitem",
        label: "(a)",
        text: "the apparent speed of objects on the ground, which increases as height reduces;",
      },
      {
        type: "subitem",
        label: "(b)",
        text: "the apparent size of familiar objects such as runway lights, which increases as height reduces.",
      },
      {
        type: "note",
        variant: "warning",
        title: "Why this belongs in an agricultural or low-level briefing",
        text: "Each of these cues degrades in the conditions low-level operations often take place in — unfamiliar terrain, poor light, featureless surfaces. When the cues degrade the error is not random: height is consistently overestimated, and the aircraft ends up lower than the pilot believes.",
      },
    ],
  },
];

/**
 * Gaps deliberately left open.
 *
 * Recorded here so the audit can report them as decisions rather than as
 * oversights. Each names what would be needed to close it.
 */
export const OPEN_GAPS = [
  {
    items: ["16.2.4"],
    reason:
      "The syllabus requires the fit-and-proper criteria of the Civil Aviation Act 2023 section 80, and notes that they changed from the 1990 Act. The supplied Air Law book teaches the 1990 Act criteria on every page that covers this. Writing the section from that book would teach superseded law.",
    needs: "The current section 80 text, or authorisation to source it from official CAA material.",
  },
  {
    items: ["26.24.8", "26.24.6"],
    reason:
      "A solid-state ignition integrity check is an aircraft-specific procedure set by the manufacturer. Neither the course material nor a reference book for Subject 26 was supplied, and inventing a plausible sequence of checks would be exactly the failure mode the brief rules out.",
    needs: "The relevant aircraft or engine maintenance documentation, or a Subject 26 reference book.",
  },
];
