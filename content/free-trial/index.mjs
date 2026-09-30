/**
 * The free ten-question mock bank.
 *
 * One file per theory subject, ten questions each. The bank is deliberately
 * small: it exists so that every theory subject can offer the free mock, not
 * so that the free mock can stand in for a paid one.
 *
 * Each question names the KiwiPilotPrep section it belongs to by the title of
 * a CourseModule of its own subject. The builder resolves that title against
 * the curriculum and refuses to run if it does not find exactly one match, so
 * a section cannot be invented here and cannot drift when the curriculum is
 * renamed — the build breaks instead, which is the point.
 */
import { subject as pplAirLaw } from "./ppl-air-law.mjs";
import { subject as pplNavigation } from "./ppl-navigation.mjs";
import { subject as pplMeteorology } from "./ppl-meteorology.mjs";
import { subject as pplHumanFactors } from "./ppl-human-factors.mjs";
import { subject as pplTechnical } from "./ppl-aircraft-technical-knowledge.mjs";
import { subject as pplRadio } from "./ppl-flight-radiotelephony.mjs";
import { subject as cplAirLaw } from "./cpl-air-law.mjs";
import { subject as cplNavigation } from "./cpl-navigation.mjs";
import { subject as cplMeteorology } from "./cpl-meteorology.mjs";
import { subject as cplHumanFactors } from "./cpl-human-factors.mjs";
import { subject as cplTechnical } from "./cpl-aircraft-technical-knowledge.mjs";
import { subject as cplPrinciples } from "./cpl-principles-of-flight.mjs";
import { subject as irNavigation } from "./ir-navigation.mjs";
import { subject as irNavaids } from "./ir-navaids.mjs";
import { subject as irAirLaw } from "./ir-air-law.mjs";

export const SUBJECTS = [
  pplAirLaw,
  pplNavigation,
  pplMeteorology,
  pplHumanFactors,
  pplTechnical,
  pplRadio,
  cplAirLaw,
  cplNavigation,
  cplMeteorology,
  cplHumanFactors,
  cplTechnical,
  cplPrinciples,
  irNavigation,
  irNavaids,
  irAirLaw,
];

/** How many questions each subject's free mock is built from. */
export const QUESTIONS_PER_SUBJECT = 10;
