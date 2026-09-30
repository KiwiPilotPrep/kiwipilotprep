/**
 * CPL Flight Test Groundwork — the module shells, and nothing else.
 *
 * The PRD requires PPL and CPL Groundwork to use the same eight sections, so
 * the eight modules exist here under the same names and in the same order, and
 * the builder checks that list against `PRESCRIBED_MODULES` exactly as it does
 * for PPL.
 *
 * What is deliberately absent is content. No CPL Groundwork material has been
 * supplied. Copying the PPL material across would be wrong twice over — it is
 * written to the PPL syllabus, and a commercial candidate reading PPL
 * privileges and PPL fuel reserves would be studying the wrong requirements —
 * and writing plausible-looking teaching to fill the gap would be worse, since
 * it would be indistinguishable from client material to everybody who came
 * afterwards.
 *
 * So each module carries a summary describing what it will cover, drawn from
 * the PRD's own description of the section, and no lessons. A module with a
 * summary and no lessons is honest: the structure is in place, the shape of
 * the course is visible, and there is nothing pretending to be content.
 *
 * When the client supplies the CPL material, the work is:
 *
 *   1. put the files in `CPL Groundwork/` and add them to the DOCS list in
 *      `scripts/extract-groundwork.mjs`;
 *   2. replace the `topics: []` below with claims against those documents, the
 *      same way `ppl-flight-test.mjs` does;
 *   3. drop `shellsOnly` so the builder starts requiring every module to have
 *      lessons again;
 *   4. run `node scripts/build-groundwork-course.mjs --course cpl-flight-test`.
 *
 * Nothing else has to change. The course, the subject, the products that grant
 * it and the entitlements that reference it are all already in place, and this
 * build writes modules underneath them.
 */

export const curriculum = {
  course: "cpl-flight-test",
  subject: "flight-test-groundwork",
  deck: "groundwork-cpl",

  /** No CPL Groundwork document has been supplied, so there is none to claim. */
  documents: [],

  /**
   * Permission for a module to have no lessons yet. It exists so that the
   * empty state is something a curriculum has to declare on purpose rather
   * than something a broken build can produce by accident, and it comes out
   * the moment there is material to put in.
   */
  shellsOnly:
    "No CPL Flight Test Groundwork material has been supplied. The eight " +
    "prescribed modules are in place and empty, ready for it.",

  skip: {},

  modules: [
    {
      title: "Personal Preparation",
      intro:
        "IMSAFE, the documents a commercial pilot must hold, and the " +
        "privileges, currency and limitations that come with the licence. " +
        "Material for this module is in preparation.",
      topics: [],
    },
    {
      title: "Aircraft Documents",
      intro:
        "Certificate of Airworthiness, technical log, flight manual, CAA Form " +
        "2129 and CAA Form 2173. Material for this module is in preparation.",
      topics: [],
    },
    {
      title: "Weather, AIP NZ, and Supplements",
      intro:
        "Area forecasts, TAF, METAR, NOTAMs, the AIP, and the go/no-go " +
        "decision. Material for this module is in preparation.",
      topics: [],
    },
    {
      title: "Performance and Operating Requirements",
      intro:
        "P-charts, the group rating system, and the seasonal atmospheric " +
        "effects on performance. Material for this module is in preparation.",
      topics: [],
    },
    {
      title: "Fuel Management",
      intro:
        "Reserves required, quantity calculations, consumption rates and fuel " +
        "system management. Material for this module is in preparation.",
      topics: [],
    },
    {
      title: "Loading",
      intro:
        "Maximum all-up weight, the centre of gravity envelope, load " +
        "distribution and securing cargo. Material for this module is in preparation.",
      topics: [],
    },
    {
      title: "Pre-Flight Inspection",
      intro:
        "Interior checks, the exterior walk-around, and verifying load " +
        "security. Material for this module is in preparation.",
      topics: [],
    },
    {
      title: "Emergency Equipment",
      intro:
        "Passenger supervision and the passenger emergency briefing. " +
        "Material for this module is in preparation.",
      topics: [],
    },
  ],
};
