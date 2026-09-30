# PPL Theory — final validation against current CAA material

Internal. A pass over all six PPL theory subjects after the rebuilds, checking
them as a student meets them and against the CAA material that is current
today rather than the mapping report written last time.

## The document this was validated against

**Advisory Circular AC61-3 Revision 31, 5 April 2025**, Appendix II — Private
Pilot Licence Written Examination Syllabus. The four syllabi supplied at the
start of the project were already from that revision; the copy of the whole
AC now in `.cache/syllabi/ac061-3.pdf` was fetched from the CAA so that the
one subject missing from that set could be added, and so that the Advisory
Circular's own guidance — the DL9 medical section in particular — could be
read rather than assumed.

Where the supplied teaching decks and AC61-3 Revision 31 disagree, the
Advisory Circular wins for the student-facing explanation. That happened
twice, and both are recorded below.

## 1. Human Factors — Subject No. 10

The previous rebuild marked Human Factors `syllabusUnavailable`. That is
resolved, and the reasoning behind it was half right and half wrong.

It was right that these lessons must never be mapped to **Subject No. 34**.
That is the CPL Human Factors syllabus, from AC61-5 Revision 38, written for
commercial operations and explicitly presupposing PPL knowledge. It is a
different and larger syllabus and mapping PPL lessons to it would have put
another subject's item ids into the mapping table.

It was wrong that no PPL Human Factors syllabus existed. **Subject No. 10
Human Factors** is in AC61-3 Revision 31, on pages 63 to 73, with a Human
Factors Matrix before it. It was simply absent from the set of pages supplied
— `docs/CMS-MIGRATION.md` recorded that at the time and said that supplying it
would fix the subject.

What was done:

- The Human Factors pages of AC61-3 Revision 31 were lifted into
  `PPL SYLLABUS/Subject No. 10 Human Factors.pdf`, so the existing importer
  reads them exactly as it reads the other four.
- `scripts/import-syllabi.mjs` gained the entry and a `--subject` filter, so
  one subject can be imported without deleting the other three subjects'
  syllabus rows and the lesson mappings that hang off them.
- The import produced **31 topics and 165 items**, with 5 unparsed lines — the
  subject preamble and one section heading, the same category the other four
  produce and for the same reason.
- `scripts/ppl-visibility.mjs` archived them alongside the rest. All 334 PPL
  syllabus topics are `ARCHIVED`; none is published to a student.
- The 23 chapters of `content/ppl/human-factors.mjs` now declare Subject 10
  codes — 10.2 through 10.66 — and the build wrote **1,610 mappings**.
- `syllabusUnavailable` is gone from the subject and from the builder. The
  escape hatch existed for a subject with no syllabus to map to, and there is
  no longer any such subject.

Subject 10 and Subject 34 remain separate records under separate subjects, as
they are in the two Advisory Circulars.

## 2. CAA coverage — all six subjects

`node scripts/ppl-atk-caa-check.mjs --subject <slug>`

| Subject | CAA subject | Topics | Items | Covered | Partial | Uncovered |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Flight Radiotelephony | No. 2 | 9 | 33 | 21 | 11 | 0 |
| Air Law | No. 4 | 30 | 159 | 140 | 19 | 0 |
| Air Navigation and Flight Planning | No. 6 | 26 | 78 | 57 | 19 | 0 |
| Meteorology | No. 8 | 21 | 139 | 127 | 12 | 0 |
| Human Factors | No. 10 | 31 | 165 | 144 | 21 | 0 |
| Aircraft Technical Knowledge | No. 12 | 42 | 210 | 199 | 10 | 0 |

Three of those items are flying-lesson objectives — measuring a distance on a
chart to ±1%, folding a map, and demonstrating proficiency in transmitting.
They are recorded in `FLYING_LESSON` in the checker rather than left in the
score as gaps a written course could never close.

The checker also gained a `VERIFIED_BY_HAND` register. Its word matcher is
good at finding a subject that has not been taught and poor at judging one
taught in different words: "Distinguish between normal and emergency
checklists" failed because the course explains the difference without using
the word *distinguish*, and "the optical characteristics of the windshield"
failed because New Zealand spells it *windscreen*. Writing the syllabus's
verbs into the teaching would have made the matcher agree without making the
course better, so instead each of those items names the lesson that was opened
and read. Every entry in that register was checked by hand.

## 3. Teaching added

**Content and context fixes: 132 authored blocks across the five rebuilt
subjects**, plus 5 figure captions. Every one was written against the slide it
sits with.

| Subject | Blocks added | Figure captions added |
| --- | ---: | ---: |
| Air Law | 44 | 0 |
| Human Factors | 47 | 5 |
| Meteorology | 24 | 0 |
| Navigation | 12 | 4 |
| Flight Radiotelephony | 22 | 0 |

They came from two places. A student-perspective audit of all 1,041 lessons
flagged 124 in the five rebuilt subjects that read badly on the page — a
picture with almost nothing said about it, a page of labels with no sentence
among them, a long run of raw slide text with no framing, a topic whose only
words were its one-line introduction. All 124 are now clear. The rest closed
genuine gaps against AC61-3 Revision 31:

- **DECIDE, SADIE and FDODAR** (10.48.14). The deck gives all three models
  step by step and never names one of them; the initial letters of the steps
  on the slides *are* the mnemonics.
- **The IMSAFE checklist** (10.30.8). The CAA's own I'M SAFE poster was on the
  slide, uncaptioned. It is captioned now with all six items.
- **Individual sleep requirement and sleep disorders** (10.40.2, 10.40.6).
- **Colour coding conventions on instruments** (10.60.10).
- **Personal limitations and decision points** (10.48.18), and the general
  concepts behind decision making (10.48.10).
- **Negligence against recklessness** (10.54.10) — the slide names at-risk and
  high-culpability behaviour without drawing the distinction underneath them.
- **Survival equipment for New Zealand terrain** (10.66.8).
- **Why illegal drugs are unacceptable** (10.32.10), stated as reasoning.
- **ISA deviation and aircraft performance** (8.10.18).
- **Where New Zealand aviation weather comes from** (8.2.2).
- **Stable, unstable and conditionally unstable air defined together** (8.18.2),
  and the cloud prefixes (8.22.8).
- **Why sun or moonlight does not change prevailing visibility** (8.26.4).
- **Where flight manual fuel consumption rates come from** (6.46.2).

## 4. Current regulatory accuracy

Two places where the supplied decks were behind the current requirement.

**The DL9 medical.** AC61-3 Revision 31 sets out a second medical route to a
private pilot licence — a Land Transport DL9 medical certificate at class 2
with a passenger endorsement — and the reduced privileges that come with
relying on it. The Air Law deck taught the DL9 currency periods and nothing
about the limitations. The eleven reduced privileges are now taught in *PPL
Privileges and Limitations*, from the Advisory Circular itself, and the
holder's obligation on a change of medical condition is taught in Human
Factors *Aviation Medical Certificates* (10.30.5).

**The fit and proper person test.** The syllabus item carries its own warning:
"The criteria for 'fit and proper' have changed slightly in the CA Act 2023,
compared to the 1990 Act." The deck mentioned the test in four words. The
criteria are now taught in *The Civil Aviation Act*, taken from section 80 of
the Civil Aviation Act 2023 itself.

A sweep for superseded legislation found no reference anywhere to the Civil
Aviation Act 1990; the Air Law deck already refers to the 2023 Act. Historical
examples were left where they teach and are framed as history — the 2004
transition altitude change, the 2004 and 2002 accident case studies, daylight
saving from 1927 — because none of them is presented as current requirement.

## 5. Two source repairs that changed how lists read

A colon introduces a list, and on a slide the items of a list very often start
with a lower-case word:

> The holder of a Private Pilot Licence shall not act as Pilot-in-Command or
> as co-pilot of an aircraft: / at night. / on a cross-country flight. /
> unless an appropriately qualified Flight Instructor has certified…

The rejoin repair was merging those into the lead-in, producing a sentence
with full stops in the middle of it. Two rules were added to
`content/ppl/deck-repairs.mjs`: nothing is joined onto a line that ends in a
colon, and a line that has already ended in a full stop is never continued
because the next line starts lower-case. Both are general, both are why
`restoreColonLists` exists, and together they recovered list structure across
all five decks — the source block count rose by 96 as merged items separated
again.

## 6. Branding, cues and syllabus leakage

Scanned across all six subjects and over HTTP.

- **Branding: 0.** No academy name, instructor credit, watermark host,
  third-party URL or email address in any student-facing block.
- **Syllabus requirement wording: 0.** Three blocks were carrying CAA
  objectives verbatim as headings — two on the Air Law medical slide ("State
  the normal currency period of the Land Transport medical certificate
  (DL9)…") and one Navigation slide heading identical to item 6.28.6. All
  three are now teaching prose; the facts underneath them are unchanged.
- **Classroom cues.** Nine video cues and instructor asides were removed
  earlier; the two remaining hits are a slide pointer in ATK (out of scope,
  below) and the phrase "a spoken safety brief or more commonly a safety
  video", which is ordinary English.
- **HTTP scan: 1,047 student pages fetched and read as a browser renders
  them.** No CAA code, objective label, internal id, provenance field,
  authoring note or build artefact reaches a student. Four pages contain
  numbers that look like syllabus codes and are not: a decimal-point worked
  example ("21.4, not 2.14"), the kilogram-to-pound factor 2.2, a climb time
  of 8.6 minutes, and the AIP reference GEN 2.2. Each was read in place.

The scan reads the article region with the course's own numbering removed —
the chapter.lesson code on a lesson and the same numbering down the contents
page both look like syllabus codes and are neither.

## 7. Diagrams

Every retained figure checked, not sampled: **938 placements, 927 distinct
assets** across the six subjects.

- 0 figures whose asset row is missing, 0 with missing or empty bytes.
- 0 world-readable — every one is private under `study/`.
- 0 duplicated within a lesson.
- 0 fragments too small to be a diagram.

One further rejection was made in this pass: a still from the American sitcom
*The Office*, used on the Human Factors first-aid slide beside a cue to play
the clip. The cue had already gone with the video; what was left was a frame
of a copyrighted television programme showing a joke rather than a compression
technique. Human Factors now rejects 4 images; the six-subject total is 271.

Small and oddly-shaped figures that survive were checked on a rendered page
rather than judged from their dimensions. The Meteorology callouts — "Weak
pressure gradient/Weak Wind", "This East side of New Zealand has the bad
weather" — render as legible boxed statements beneath the chart they belong
to, and read as captions rather than as artefacts.

## 8. Course naming

`My Courses` and every other place the course name appears read it straight
from the database, so one row was wrong rather than the pages.
`scripts/ppl-course-name.mjs` set it:

| Course | Before | After |
| --- | --- | --- |
| `ppl-theory` | PPL Theory | **KiwiPilotPrep — PPL Theory** |
| `cpl-theory` | KiwiPilotPrep — CPL Theory | unchanged |
| `ir-theory` | KiwiPilotPrep — IR Theory | unchanged |

The id, slug, status, subjects, products and entitlements were untouched. The
two Flight Test Groundwork courses were left alone: neither carries the
prefix, so they are consistent with each other, and neither was in scope.

## 9. What the test suite had to change

`tests/ppl-phase1.mjs` asserted that all **128** PPL syllabus topics were
archived and none deleted. There are 159 now — the 31 of Subject No. 10. The
claim has not changed and neither has the check; only the number of rows it is
made about, with the reason written beside it.

## 10. The state of it

| Subject | Chapters | Lessons | Source blocks | Authored blocks | Figures | Mappings |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Aircraft Technical Knowledge | 38 | 270 | 2,013 | 407 | 342 | 2,134 |
| Flight Radiotelephony | 14 | 79 | 613 | 141 | 41 | 368 |
| Air Navigation and Flight Planning | 14 | 92 | 1,095 | 145 | 83 | 652 |
| Human Factors | 23 | 179 | 1,391 | 257 | 90 | 1,610 |
| Air Law | 27 | 224 | 1,703 | 299 | 105 | 1,806 |
| Meteorology | 19 | 197 | 1,956 | 251 | 277 | 1,771 |
| **Total** | **135** | **1,041** | **8,771** | **1,500** | **938** | **8,341** |

Products 26, orders 7, entitlements 9, questions 10, media assets 3,697 — all
unchanged. Every PPL subject is `PUBLISHED` under its original id and slug.

## Aircraft Technical Knowledge — closed in a later pass

ATK was audited and left alone in this pass, as instructed at the time. Its 25
flagged lessons and the one "(See next slide)" artefact were closed
afterwards, in a focused pass recorded in `PPL-ATK-REBUILD.md`. Source claims,
chapters, lessons, slugs, ids, mappings and every diagram decision are
unchanged; the authored layer went from 407 blocks to 432 and one page-keyed
source repair was added. The student-perspective audit now returns **zero
across all six subjects**.

## Known and out of scope

**Pre-existing infrastructure failures, unrelated to this work.** The
`verification`, `auth` and `uat` suites fail on the e-mail flows and
`responsive` fails seven times, all seven on `stroke-dashoffset` on the
marketing page. The marketing page is dated 2026-09-06 and the `.env` that
turns on live mail delivery 2026-09-07, both before any of this. With
`RESEND_API_KEY` set the suites take the Resend path, their `@example.com`
addresses are rejected, and no verification link reaches the server log they
read; blanking the key puts the links in the log and the suites still mismatch
on which token they pick.
