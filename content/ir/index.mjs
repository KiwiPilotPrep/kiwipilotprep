/**
 * The IR curriculum.
 *
 * One module per subject, each declaring the chapters and topics a student
 * meets and the source pages each topic is built from. The builder
 * (scripts/build-ir-course.mjs) turns these into the course and refuses to
 * finish if any page of a manual is unaccounted for.
 */
import { subject as ifrNavigation } from "./ifr-navigation.mjs";
import { subject as ifrNavaids } from "./ifr-navaids.mjs";
import { subject as irAirLaw } from "./ir-air-law.mjs";

export const SUBJECTS = [ifrNavigation, ifrNavaids, irAirLaw];
