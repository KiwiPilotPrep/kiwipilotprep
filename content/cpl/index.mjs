/**
 * The CPL curriculum.
 *
 * One module per subject, each declaring the chapters and topics a student
 * meets and the source slides each topic is built from. The builder
 * (scripts/build-cpl-course.mjs) turns these into the course and refuses to
 * finish if any slide of a deck is unaccounted for.
 *
 * Subjects are added one at a time, each one finished and validated before the
 * next is started, so the pipeline is proven on a deck whose structure already
 * holds before it is pointed at one whose structure has to be recovered.
 *
 * All six CPL theory subjects are built. The order they were built in was
 * cheapest-structure-first: Navigation and the other two PowerPoint decks
 * before the three that arrived as PDFs and had their structure recovered.
 */
import { subject as navigation } from "./navigation.mjs";
import { subject as airLaw } from "./air-law.mjs";
import { subject as meteorology } from "./meteorology.mjs";
import { subject as principlesOfFlight } from "./principles-of-flight.mjs";
import { subject as aircraftTechnical } from "./aircraft-technical-knowledge.mjs";
import { subject as humanFactors } from "./human-factors.mjs";

export const SUBJECTS = [
  navigation, airLaw, meteorology,
  principlesOfFlight, aircraftTechnical, humanFactors,
];
