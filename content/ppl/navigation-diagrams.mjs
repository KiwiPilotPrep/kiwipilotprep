/**
 * Which Air Navigation source images reach a student, and why the rest do not.
 *
 * Eighty-seven distinct figures, every one looked at on a contact sheet. This
 * is the strongest set of diagrams in the five decks and almost all of it
 * stays: the great circle and rhumb line drawing, the magnetic field of the
 * Earth, the deviation card, the triangle of velocities, the twilight
 * geometry, the sunrise tables, the aerodrome charts, twenty-odd photographs
 * of the flight computer with the answer set up on it, the 1 in 60 geometry,
 * the reciprocal-track and diversion drawings, the VOR indicator, and the
 * radar principles.
 *
 * Five do not, and they are the same three kinds the other decks produced:
 * annotation lifted off the thing it annotated, an icon standing in for a
 * sentence, and branding.
 *
 * Keyed by SHA-1, which is stable across re-extraction, so a decision made
 * once stays made.
 */

/** Images that must not be shown to a student, with the reason each was rejected. */
export const DROPPED = {
  /* ---- annotation separated from what it annotated -------------------- */
  "04d191f3d3d66e3c9acd568dbf7a4cd0246a45b2":
    "An empty red ring, 67x64, drawn over a flight computer photograph on slide " +
    "117 to circle the reading being described. On its own it circles nothing, " +
    "and the photograph it was drawn on is kept.",
  "b34c68596fa5b70f16cfc5364a71ede299a1c187":
    "A second empty red ring, 68x64, used three times across the wind " +
    "calculation slides for the same purpose and with the same result.",

  /* ---- an icon in place of a sentence ---------------------------------- */
  "1f37454955265451dce34677d237a9edb0d9834d":
    "A red prohibition sign, 656x621, and nothing else — the slide's way of " +
    "saying “not this”. What it forbids is in the slide text, and a large red " +
    "circle with a bar through it teaches nobody which thing is being forbidden.",

  /* ---- branding --------------------------------------------------------- */
  "a944cc3ebcf78efe974a8172b9585c8a835222dc":
    "The New Zealand International Commercial Pilot Academy wordmark and fern, " +
    "480x134. Another provider's branding on a KiwiPilotPrep page, and not " +
    "teaching material by any reading.",
  "291321f9c6ddc42381a9ec39ef265e9bcccb083b":
    "A secondary radar diagram carrying a “makeagif.com” watermark across the " +
    "bottom. The diagram is sound — interrogator, transponder, 1030 and 1090 " +
    "MHz — but it is somebody else's watermarked image, and the frequencies it " +
    "labels are taught in the text and in the authored note beside it.",
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
