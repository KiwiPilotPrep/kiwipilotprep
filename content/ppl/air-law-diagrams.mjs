/**
 * Which Air Law source images reach a student, and why the rest do not.
 *
 * A hundred and four distinct figures, every one looked at on a contact
 * sheet. This deck's figures are unusually literal — certificates, log pages,
 * NOTAM printouts, chart extracts, tables straight out of the AIP, and
 * screenshots of the actual wording of Civil Aviation Rules. That last group
 * is kept deliberately: where the exact words of a rule are what is being
 * taught, an image of the rule is better than a paraphrase of it, and each
 * one is captioned with what it says so that the caption carries the sense
 * even where the image is small.
 *
 * Two are rejected, for the two reasons that recur across all five decks:
 * annotation separated from what it annotated, and someone else's
 * copyrighted graphic.
 *
 * Keyed by SHA-1, which is stable across re-extraction, so a decision made
 * once stays made.
 */

/** Images that must not be shown to a student, with the reason each was rejected. */
export const DROPPED = {
  "44c6f34bb3dc1af82ad5a7e55dee32da9c67b171":
    "A hollow red rectangle, 478x29, drawn over the restricted category " +
    "airworthiness certificate on slide 81 to box the operating limitations " +
    "line. Lifted off the certificate it is an empty box highlighting nothing, " +
    "and the certificate it was drawn on is kept.",

  "e84f9e6cc7455889623fff9c5ba55e6416ac5405":
    "A PAPI diagram in French — “Système PAPI : ce que le pilote voit”, with " +
    "the indications labelled trop haut, sur le plan and trop bas — carrying " +
    "the line “copyright graouland :))”. A student cannot read it, and it is " +
    "somebody's personal copyrighted drawing. The PAPI indications are taught " +
    "in the slide text and in the VASIS and T-VASIS figures beside it.",
};

/** Figures the deck stores rotated. None in this deck. */
export const UPSIDE_DOWN = {};

/** True if this image must not reach a student. */
export function isRejectedImage(sha1) {
  return Object.hasOwn(DROPPED, sha1);
}

/** True if this image has to be turned 180° before it is stored. */
export function isUpsideDown(sha1) {
  return Object.hasOwn(UPSIDE_DOWN, sha1);
}
