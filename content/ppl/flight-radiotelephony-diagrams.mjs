/**
 * Which Flight Radiotelephony source images reach a student, and why the rest
 * do not.
 *
 * Forty-six distinct figures, every one opened and looked at on a contact
 * sheet before anything was decided about it. The great majority are exactly
 * what a radio course needs — waveform diagrams, the radio stack, headsets and
 * microphones, aerodrome charts, visual navigation charts, chart symbol
 * tables, the light signal table, the transponder code tables, and a labelled
 * photograph of where each aerial lives on the airframe. All of those stay.
 *
 * Eight do not, and they divide into three kinds: annotation lifted off the
 * chart it was drawn on, third-party branding, and frames grabbed from
 * somebody else's video.
 *
 * Keyed by SHA-1, which is stable across re-extraction, so a decision made
 * once stays made.
 */

/** Images that must not be shown to a student, with the reason each was rejected. */
export const DROPPED = {
  /* ---- annotation separated from what it annotated -------------------- */
  "9b01877ec69dcd710413799911d48bb7e489370d":
    "An empty red ellipse, 415x234. Slide 31 draws four of these over a visual " +
    "navigation chart to ring the airspace being described; pulled out on their " +
    "own they are four red ovals in white space. The chart they were drawn on is " +
    "kept.",
  "0217b3ee4e0b45308096a93f76be268c581fd75a":
    "A second empty red ellipse from the same slide, 416x234.",
  "3a8f8d6e1987d21068601a1ac49ee4c28a81a83c":
    "A third empty red ellipse from the same slide, 415x234.",
  "013376b902e5069085642ce5b31e06792a275a71":
    "A fourth empty red ellipse from the same slide, 415x196.",

  /* ---- somebody else's branding ---------------------------------------- */
  "fe657f5a3efeb963bb4597420c0e9207ed2cc1eb":
    "A cartoon face over the caption “Yor readback is not right…Do you want me " +
    "to go over again?”, watermarked “VASAviation — www.itsonic.net”. Another " +
    "site's branding on a KiwiPilotPrep page, and a joke rather than teaching: " +
    "the read-back rules on the slides either side are the material.",
  "000a9f2f06010bb97f2cc8f725486cbf7cbfff11":
    "A fireworks clipart, 122x110, carrying the watermark “shutterstock-169970066”. " +
    "A stock library's watermark is exactly what a student must not be shown, and " +
    "the picture teaches nothing in any case.",

  /* ---- frames grabbed from a video -------------------------------------- */
  "d625783a4a6099518c5d0baae3442a9f276caad2":
    "A 480x360 video frame of an airliner on approach with a subtitle burnt into " +
    "it — “Shamrock 12G Heavy …em, you can proceed directly to the field. Any " +
    "runway you need.” Somebody else's recording, and the exchange it illustrates " +
    "is written out in the slide text.",
  "2345d710ba2a0a93241b5f57f792ef7fcf87d575":
    "A 480x360 video frame, letterboxed top and bottom, of a base-station radio " +
    "mounted under a vehicle dashboard. Dark, hard to make out, and not the " +
    "aircraft installation the topic is about.",
};

/**
 * Figures the deck stores rotated, which the extractor pulled out unrotated.
 *
 * None in this deck: every figure came out the way up it was drawn. The export
 * exists so the builder can treat all subjects the same way.
 */
export const UPSIDE_DOWN = {};

/** True if this image must not reach a student. */
export function isRejectedImage(sha1) {
  return Object.hasOwn(DROPPED, sha1);
}

/** True if this image has to be turned 180° before it is stored. */
export function isUpsideDown(sha1) {
  return Object.hasOwn(UPSIDE_DOWN, sha1);
}
