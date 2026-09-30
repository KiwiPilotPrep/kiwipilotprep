/**
 * Which of the client's supplied images reach a student, and why the rest do
 * not.
 *
 * Forty-five distinct images came out of the four supplied PDFs and every one
 * was looked at. Twenty are technical and are kept: the declared-distance
 * drawings, the airspace VFR minima tables, the real MetService analysis and
 * prognosis charts, the annotated front and occlusion cross-sections, the
 * graphical SIGMET monitor, the SIGWX and GRAFOR charts, the area winds map
 * and its decode, the AIP meteorological terminology table, and the TAF and
 * METAR examples the weather walkthrough is built around.
 *
 * Twenty-five do not, and they fall into three groups.
 *
 * The study document is written in Pages, and four of its images are the word
 * processor's own furniture: a warning triangle, a light bulb and a pointing
 * hand used as bullet icons, and the "Dear Kate … John Appleseed" placeholder
 * letter that ships with the template. None of that is client teaching
 * material, and the placeholder in particular would be actively confusing on a
 * page about aircraft documents.
 *
 * The New Zealand airspace booklet is a public information magazine and all
 * nineteen of its pictures are stock photography — a control tower at dusk, an
 * albatross, a wind turbine, a drone at sunset, tandem skydivers, an explosion
 * illustrating live firing. They illustrate a subject rather than a fact. That
 * booklet's genuinely technical content, the airspace column drawings and the
 * area QNH zone map, is vector artwork that is not in the image layer at all,
 * so nothing technical is lost by dropping the photographs.
 *
 * And two tables are supplied twice. The VFR minima tables appear in the study
 * document and again in the weather walkthrough; a student meets them once,
 * where the teaching around them is.
 *
 * Keyed by SHA-1, so a decision made once survives re-extraction.
 */

/** Images that must not be shown to a student, with the reason each was rejected. */
export const DROPPED = {
  /* ---- Pages template furniture in the study document ------------------ */
  "036be0455c898f0d30a44ac67b6fa19c8275f9f1":
    "A yellow warning-triangle emoji, 160x160, used twice as a bullet icon " +
    "beside a caution. Decoration, not teaching.",
  c52472a85ed75978c5c3286c1e4c5cf4c797a378:
    "A light-bulb emoji, 160x160, used twice as a bullet icon beside a tip.",
  be4735d4d036cc56d4ad12dd71ed975863dc1a44:
    "The placeholder letter that ships with the Pages template — “Dear Kate … " +
    "John Appleseed”. It is the word processor's sample content, left in the " +
    "document by accident. It says nothing about flying, and a student who met " +
    "it would reasonably wonder what they were looking at.",
  "6d1d98eb5a5e11d324a4e8d0c9f2bc0523a2ecab":
    "A pointing-hand emoji, 160x160, used as a bullet icon.",

  /* ---- stock photography from the CAA airspace booklet ------------------ */
  e59115c404cdd154a0e4bf0878fb0e43a4e0490c:
    "The booklet's cover photograph: a control tower silhouetted against a " +
    "sunset, with an aircraft on approach behind it.",
  "8c4994db7b701aa3d33a5678cb55c33af5c60f95":
    "A drone hovering against a blue sky, on the contents page.",
  f19fbd5bcc86804475c0d8901b0bd25a3f626bbe:
    "A stack of AIP visual navigation chart covers, 166x369.",
  dc032b4ca7f1e79aea168dd4d7949f20767da930:
    "A fan of visual navigation and terminal charts, illustrating the chart " +
    "series table beside it. The table itself is text and is kept.",
  db44f99df15827b223a2d01eae733bd3feb14599:
    "A hand and a kneeboard in a cockpit, 295x831.",
  b3f61d6d76bb0be8b4d076b1b11d56c24daaf43d:
    "A pilot holding a visual navigation chart in a Cessna cockpit.",
  f410e9ce8a7eee7d243a70ed2d2a135c104584ec:
    "A royal albatross on a clifftop, illustrating a wildlife area.",
  be82a3351861091b5d65c67dc420f35db19592bb:
    "The same albatross photograph, cropped to a narrow column.",
  bb012a7d232ea81c9cdb2accdc6ab728937efac6:
    "An explosion on a firing range, illustrating military live firing inside " +
    "a restricted area.",
  a80aca04498ba74ad3f5968bfb24aa0d2f5efa22:
    "An aerial photograph of a coastal aerodrome and the town around it.",
  "294e915cc256306c95b0a4a16cb79d239c687504":
    "The same aerial photograph again on the facing page.",
  "05e779df1f79da2c60f4bf8abad0a8fa5656922c":
    "A wind turbine against the sky.",
  "178f86d9852452b2a198266bb54cdc5ae5c950a9":
    "The same turbine cropped to a narrow column, with a small drone beside it.",
  "86d041b3fd44b4ff590abf1ce42f62b21eaa1ba9":
    "A sliver of sky, 165x830 — a crop artefact rather than a picture of " +
    "anything.",
  f07c93caeca9d02b4a94daed3fbc3490e87c196a:
    "A drone photographed against a sunset.",
  "3e5a4ed85c25ce5fc08eb0a6a097299898660670":
    "Two tandem skydivers under canopy, illustrating a parachute landing area.",
  "39cdde391a96660be6006adcb0b6fd1c37efe21f":
    "A control tower photographed from below.",
  e22e569f814e523633e5a6af7e771ee7d87fa740:
    "The same tower cropped to a narrow column.",
  caeb2d50e12f614c47d65727697556a3912ca6bc:
    "Two air traffic controllers at a tower console.",

  /* ---- supplied twice --------------------------------------------------- */
  adecf3680aeca4b8b3fc843662f1230adff94429:
    "Tables 5 and 6 — the VFR minima at aerodromes inside a control zone and " +
    "in uncontrolled airspace. The same two tables are supplied in the study " +
    "document, where the teaching around them is, so the student meets them " +
    "there rather than twice.",
};

/** True if this image must not reach a student. */
export function isRejectedImage(sha1) {
  return Object.hasOwn(DROPPED, sha1);
}
