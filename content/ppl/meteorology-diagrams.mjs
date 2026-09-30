/**
 * Which Meteorology source images reach a student, and why the rest do not.
 *
 * Three hundred and twelve distinct figures, every one looked at on a contact
 * sheet, and by a distance the richest set in the five decks: the tephigram
 * work for stability, twenty-odd photographs of named cloud types, the
 * mountain wave and rotor drawings, the thunderstorm life cycle, the icing
 * accretion diagrams, the carburettor venturi, the front cross-sections, the
 * New Zealand airflow maps, and a long run of real MetService charts, TAFs,
 * METARs, radar returns and satellite images. Almost all of it stays.
 *
 * Thirty-six do not, and they are all one thing: PowerPoint annotation.
 *
 * Several slides in this deck are a chart with shapes drawn on top of it —
 * an arrow pointing at a trough, a ring around a col, a box around a station
 * pressure, an X over an area of no gale. The extractor stores every shape as
 * its own image, so what reaches a lesson is the chart followed by a red
 * arrow on a white page, followed by an empty rectangle, followed by the
 * letter A in a box. The arrow pointed at something on a chart it is no
 * longer on.
 *
 * The line drawn here: bare geometry goes — arrows, lines, rings, empty
 * boxes, X marks — and so does a label that is only an identifier, such as
 * "A", "B", "1004" or "?". A callout carrying words stays, because words
 * still teach when the arrow beside them is gone: "Low Pressure", "Trough of
 * low pressure", "This East side of New Zealand has the bad weather (Stable
 * Conditions)". In every case the chart the shapes were drawn on is kept, so
 * nothing that was actually being pointed at has been lost.
 *
 * Keyed by SHA-1, which is stable across re-extraction, so a decision made
 * once stays made.
 */

const chart = (what, slide) =>
  `${what} drawn on the mean sea level analysis on slide ${slide}. Lifted off ` +
  `the chart it points at nothing; the chart itself is kept.`;

/** Images that must not be shown to a student, with the reason each was rejected. */
export const DROPPED = {
  /* ---- slide 78: the MSL analysis, annotated ---------------------------- */
  e6926847ac6243064b8d1558844b7b3a74d0b414: chart("An empty red box, 93x67", 78),
  e9b49b33425e7a6102f46ff019558b61680106dd:
    "A question mark in a red box, 105x124, covering a station pressure on the " +
    "chart on slide 78 for the class to guess. It is a classroom device, not " +
    "teaching, and it hides nothing once it is off the chart.",
  "5ea0ac3d6d50f4338d57e6577232f2ac3387590c": chart("A red arrow, 81x40", 78),
  b34ea861b2de70537a2229f871bd3b19a5d55705:
    "The number 1004 in a red box, 105x80 — the answer to the question mark " +
    "above it, and meaningless without the chart position it was placed on.",
  f22463784ea37eab142a1d42c844cf88507ca989: chart("A second empty red box, 92x55", 78),

  /* ---- slide 82: highs, lows, ridges and troughs marked up -------------- */
  "5062bdbf10dd82e49cd9f1eae5c48660f10d6820": chart("A hand-drawn blue ring, 227x233", 82),
  b759f0c61f7bf6c5c45009405894ba0b03bc2597: chart("A small blue arrow, 35x45", 82),
  b1b3d64e1b9b3bc82e6f82ba7e422260b624cea9: chart("A thin blue arrow, 197x32", 82),
  f2b3933e85a86a1f6f86089d7189f400a2e1d700: chart("A blue block arrow, 43x49", 82),
  "7edff63fbbb869426efb072894690eeab84e2223": chart("A hand-drawn purple ring, 237x397", 82),
  "0f78d54bb119edbd9fd7dbee8b8fb3ee9c76cb2a": chart("A red arrow, 168x168", 82),
  af39ebea5bc1c0c49cab9f617d7627f6c671edbf: chart("A purple block arrow, 38x45", 82),
  "3a75977a79341cc071d32d506fec15dfc63ea85b": chart("A second purple block arrow, 34x44", 82),

  /* ---- slide 86: the prognosis chart, marked up ------------------------- */
  "397903f57f6bb71fc50cd571361054660dd63da0": chart("A blue arrow, 180x68", 86),
  dfd21557c631029ed5d921be6240169529154aab: chart("A thin red line, 299x517", 86),

  /* ---- slide 94: pressure gradient marked on the chart ------------------ */
  aab85eaaa8aec3867ea750a1bd2cff5874f87ee2:
    "The letter B in a red box, 74x89, marking a point on the chart on slide 94.",
  a8ca95a25d2b29e9000d1c82bada22f1109ea6b9:
    "A blue line, 345x184, drawn across the isobars on slide 94 to show a weak " +
    "gradient. Off the chart it is a line on a white page.",
  db5cea24e85a2c045d20388143cbc6adaa479617:
    "The letter A in a blue box, 75x88, marking a point on the chart on slide 94.",
  "762fb69df533a3e53658baa0564409135a4872b4":
    "The letter A in a red box, 75x88, marking a second point on the same chart.",
  dc5c6b721dbc30833b25427c943168f86d591b2e:
    "A red line, 171x171, drawn across the isobars on slide 94 to show a steep " +
    "gradient. Off the chart it is a line on a white page.",
  d49e52f1193e435eab9811a9ec5e5367a63e8074:
    "The letter B in a blue box, 74x89, marking a fourth point on the same chart.",

  /* ---- slide 156: terrain channelling, marked on a satellite image ------ */
  "57691101dc6ed313f2a2ea7bda299e8ef7d8cc0c":
    "A red arrow, 47x157, drawn over the satellite image of New Zealand on " +
    "slide 156 to point at a channelling gap. The image and the labels beside " +
    "it are kept.",
  "119e72e9f28128781df11f13efaaa2d9029b7078":
    "A second red arrow, 68x195, on the same image and for the same purpose.",
  "7e6b9c03500b1df1196d7b03523db54375974e54":
    "A third red arrow, 42x179, on the same image and for the same purpose.",

  /* ---- slide 404: rotor cloud photograph, boxed ------------------------- */
  "4d2bdaa18c06d958666aefc94201d86e5661bae0":
    "An empty red rectangle, 468x205, drawn over the rotor cloud photograph on " +
    "slide 404 to box the rotor. The photograph is kept.",

  /* ---- slides 476-482: the New Zealand airflow maps, marked up ---------- */
  "57b7b9e98c3a02990beeb8496d29b50df4347822":
    "An empty red rectangle, 175x214, outlining a region of the North Westerly " +
    "airflow map on slide 476. The map and the sentences beside it are kept.",
  "8b5dbf6d4d690b9ba282686e347e715bdf74a9da":
    "A second empty red rectangle, 262x187, on the same map.",
  "6d2730fadfa8faef9950bb38ba252262aa63666b":
    "A plain black arrow, 214x183, pointing at a region of the same map.",
  f2f4a5a576550a0f73c96e606494d776d0e4eeb2:
    "An empty red rectangle, 279x303, outlining a region of the South Easterly " +
    "airflow map on slide 480.",
  c1429cdf8a2ee5a45c2b408cb9862c14d8e6530e:
    "A second empty red rectangle, 339x177, on the same map.",
  c1d8a7c2330fc4af5cb0a6c2cacdf3a2acf6b7ea:
    "A red block arrow, 112x99, pointing at a region of the North Easterly " +
    "airflow map on slide 482.",
  "3635668fc8fe4869d75a188b6e0ad36b784f8467":
    "A red block arrow, 111x100, used three times on the same map.",
  c1f0e8ab2ec5448f9a89228e571d510d334661d7:
    "A red X, 159x194, marking an area of the same map where the flow is " +
    "blocked. The sentence that says so is kept.",
  "9ade11737d9dcf183e3619cddf80e76001e797ed":
    "A red block arrow, 112x100, on the same map.",
  d516382448c3571488c061ba649d2af90b9cbe69:
    "A second red X, 159x194, on the same map.",
  "95d6df68f5fcb8fa0eb6cf4722a4700aa7249061":
    "A red block arrow, 111x99, on the same map.",
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
