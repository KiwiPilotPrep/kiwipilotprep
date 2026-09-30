/**
 * The PPL curriculum.
 *
 * One module per subject, each declaring the chapters and topics a student
 * meets and the source pages each topic is built from. The builder
 * (scripts/build-ppl-course.mjs) turns these into the course and refuses to
 * finish if any page of a source is unaccounted for. This is the same shape as
 * `content/cpl/index.mjs` and `content/ir/index.mjs`, and deliberately so: the
 * three courses are built by three siblings of one script.
 *
 * Only Aircraft Technical Knowledge is here. It is the subject that had no
 * course at all — forty-two published syllabus topics and not one lesson — so
 * it is the one where a rebuild adds a course rather than replacing one. The
 * other five PPL subjects each still have their original deck-ordered import,
 * which is a working course; they are rebuilt onto this pipeline next, one at
 * a time, each finished and validated before the following one is started.
 */
import { subject as aircraftTechnical } from "./aircraft-technical-knowledge.mjs";
import { subject as flightRadio } from "./flight-radiotelephony.mjs";
import { subject as navigation } from "./navigation.mjs";
import { subject as humanFactors } from "./human-factors.mjs";
import { subject as airLaw } from "./air-law.mjs";
import { subject as meteorology } from "./meteorology.mjs";

export const SUBJECTS = [aircraftTechnical, flightRadio, navigation, humanFactors, airLaw, meteorology];
