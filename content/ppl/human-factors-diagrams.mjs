/**
 * Which Human Factors source images reach a student, and why the rest do not.
 *
 * A hundred and sixteen distinct figures, every one looked at on a contact
 * sheet, and this deck's are unusually good: labelled anatomy of the eye, the
 * ear, the heart and the lungs; the dark adaptation curve; the semi-circular
 * canals against the axes they sense; the Yerkes-Dodson curve; the sleep
 * cycle and the circadian clock; the information processing model; Reason's
 * Swiss cheese and the HFACS tree; five flight decks from a 737-200 to a 787;
 * and a set of runway perspective drawings that are the clearest thing in the
 * subject. All of that stays.
 *
 * Four do not.
 *
 * A note on the medical illustrations, since several carry a publisher's
 * credit line — the Mayo Foundation on the middle-ear drawing, a hospital's
 * logo on the outer-ear one. Those are attribution on genuine teaching
 * diagrams, and attribution is not branding to be stripped. They stay as
 * they are, credit included. What is rejected below is different in kind: a
 * competing provider's finished slide, a stock library's watermarked preview,
 * and a film still used as a joke about the person it depicts.
 *
 * Keyed by SHA-1, which is stable across re-extraction, so a decision made
 * once stays made.
 */

/** Images that must not be shown to a student, with the reason each was rejected. */
export const DROPPED = {
  "3c1a110bd4464567f23133783d5014c6f6626d6d":
    "Another training provider's finished slide, dropped in whole: a blue " +
    "header reading “Spatial Disorientation: The Leans”, a paragraph of their " +
    "text, two aircraft photographs, and “pilotmall.com” across the foot of " +
    "it. It is a page from someone else's course sitting inside a " +
    "KiwiPilotPrep lesson, and the paragraph on it says what the lesson " +
    "already says.",

  "e8f981575a4194b1c450fc4f6480091d7e4ff1b4":
    "A film still of an overweight fighter pilot, used on the slide about " +
    "obesity. It is a joke at the expense of the people the slide is about, it " +
    "teaches nothing, and it is a frame of a copyrighted film.",

  "93ce68a15d39e8365e7231e084816b1e3bc03be0":
    "A still from the American sitcom The Office, used on the first aid slide " +
    "alongside a cue to play the clip it comes from. The cue has gone with the " +
    "video, which was never part of what was supplied, and what is left is a " +
    "frame of a copyrighted television programme that shows a joke rather than " +
    "a compression technique. The CPR ratio and sequence are taught in the " +
    "slide text beside it.",

  "bcaef3c9f3f2bca95fba3d2fa3b1363817b286b9":
    "A stock-library preview of an intestinal infection illustration, with " +
    "“shutterstock.com · 2015226362” watermarked across the bottom. An " +
    "unlicensed preview image, and the gastroenteritis it illustrates is " +
    "described in the slide text.",
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
