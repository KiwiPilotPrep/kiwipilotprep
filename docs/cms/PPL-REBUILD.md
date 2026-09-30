# The five remaining PPL theory subjects — rebuild

Internal. Air Law, Air Navigation and Flight Planning, Meteorology, Human
Factors and Flight Radiotelephony, rebuilt from their source decks onto the
same pipeline that produced Aircraft Technical Knowledge. ATK itself is not
touched by any of this; it is in `PPL-ATK-REBUILD.md` and is unchanged.

## What was replaced, and why

All five subjects already had a course. Each was a deck-ordered import: one
module per PowerPoint section, one lesson per slide or per short run of
slides, the slide's own title as the lesson title, and no editorial layer at
all. That is a faithful copy of a classroom deck and it is not a course. A
student reading it met "(no title)" lessons, three-word lessons, section
dividers as content, video cues with no video, and the instructor's asides to
a room that is not there.

What replaced it is a curriculum: chapters chosen for a reader working alone,
topics that gather the slides which belong together, and an authored layer —
introductions, key points, context, misconceptions, takeaways, worked
examples — wrapped around the source material rather than replacing it.

## The shape of it

| Subject | Slides | Claimed | Skipped | Chapters | Lessons | Source blocks | Authored blocks | Figures shown | Figures rejected | Mappings |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Flight Radiotelephony | 157 | 145 | 12 | 14 | 79 | 613 | 119 | 38 / 46 | 8 | 368 |
| Air Navigation and Flight Planning | 239 | 215 | 24 | 14 | 93 | 1,090 | 131 | 82 / 87 | 5 | 660 |
| Human Factors | 257 | 231 | 26 | 23 | 179 | 1,392 | 220 | 90 / 116 | 3 | — |
| Air Law | 381 | 350 | 31 | 27 | 224 | 1,642 | 252 | 102 / 104 | 2 | 1,806 |
| Meteorology | 531 | 493 | 38 | 19 | 197 | 1,949 | 227 | 275 / 312 | 36 | 1,771 |
| **Total** | **1,565** | **1,434** | **131** | **97** | **772** | **6,686** | **949** | **587 / 665** | **54** | **4,605** |

Human Factors has no mappings on purpose; see the syllabus note below.

Every one of the 1,565 slides is either claimed by exactly one topic or
skipped with a reason written next to it in the subject module. The builder
refuses to finish otherwise: no duplicate claims, no unclaimed teaching
slides, no claims outside the deck.

## Where the structure came from

Four of the five decks mark their own sections and those sections are close
to a teaching order already, so the chapter list mostly follows them. The
departures are all gathering rather than moving, and each is written down at
the top of its subject module:

- **Human Factors** had two section dividers in 257 slides, and looked
  structureless. It is not: twenty-odd times the deck stops, puts one line on
  an otherwise empty slide — "Hypoxia", "Entrapped Gases", "Spatial
  Orientation" — and starts a new run. Those unmarked breaks are the chapter
  list. Flight anxiety was moved to sit with stress, and motion sickness with
  G forces, because in both cases the deck taught the same physiology twice a
  chapter apart.
- **Meteorology** runs Mountain Weather on through the Thunderstorms section
  without a divider; it is a chapter of its own here, as it is in the CAA
  syllabus. The Water Vapour section turns into air density halfway, so the
  chapter is named for both.
- **Air Law** keeps the deck's order almost exactly, because in a subject
  whose content is "what the rule says", reordering is a way of quietly
  changing what it says. Four sections are folded into neighbours where a
  divider split one idea.
- **Navigation** teaches the lost procedure in one place. The deck introduces
  it at 134–138 and returns to it at 163–168; split across two chapters it
  reads as two half-explanations.

The CAA syllabus is **not** the student-facing structure. Its rows stay
`ARCHIVED` and are used only for the internal coverage check below.

## The authored layer

949 authored blocks across the five subjects, against 6,686 source blocks.
Every block carries `origin: "source"` or `origin: "authored"`, and a source
block carries the slide number its words are actually on. The validator
checks both directions: no authored block carries a source citation, and
every source block's words are on the slide it cites.

Nothing was invented. Authored blocks frame, connect and warn — they do not
state regulations, limitations or numbers that are not in the source. Where
an authored block quotes a figure (the Föhn calculation, the chunked
clearance, the decibel table) the figure comes off the slide it is describing.

## Diagram decisions

Each subject has a `*-diagrams.mjs` module keyed by SHA-1, so a decision made
once survives re-extraction. 54 images across the five subjects are rejected,
each with a written reason. They fall into four kinds:

- **Annotation lifted off what it annotated** — 46 of the 54, almost all in
  Meteorology. PowerPoint stores every drawn shape as its own image, so a
  MetService chart with an arrow and a ring on it arrives as the chart, then
  a red arrow on a white page, then an empty circle. The chart is always
  kept; the loose shapes are not. The line drawn: bare geometry goes, and so
  does a label that is only an identifier ("A", "B", "1004", "?"); a callout
  carrying a sentence stays.
- **Another provider's branding** — the NZICPA wordmark in Navigation, and a
  complete pilotmall.com slide dropped whole into Human Factors.
- **Stock-library and GIF-site watermarks** — a shutterstock preview, a
  makeagif-watermarked radar diagram.
- **Images that teach nothing** — a bare prohibition sign standing in for a
  sentence, a film still used as a joke about the person on the slide, a
  French PAPI diagram carrying somebody's personal copyright line.

Publisher credit lines on genuine medical and aviation diagrams — the Mayo
Foundation on the middle-ear drawing, the AIP's own watermark on a circular —
are attribution, not branding to be stripped, and are kept as they are.

## What was skipped, and why

131 slides. Every skip has a reason in the subject module. They are:

- **Section dividers** — 97 of them, whose names became chapter titles.
- **Cover and exam-format slides** — the exam length and question count belong
  on the course page, not in a lesson.
- **Embedded videos** — 12 in Meteorology, which arrive as slides with no text
  and no image because the video is not part of what was supplied.
- **Slides whose drawing did not survive extraction** — the Föhn calculation
  exercise and its two answer slides in Meteorology, which reach the importer
  as a pile of loose labels around a diagram that is not there. The same
  calculation is taught, worked in full, on a figure that did survive.
- **Classroom artefacts** — a "Student to demonstrate to Instructor" exercise
  in Navigation, and a version note in Meteorology naming the instructor who
  last edited the PowerPoint.

Cues to play a video, and questions the instructor asks the room, are removed
from slides that are otherwise kept — nine of them, listed in the `callouts`
table of the subject that carries each.

## Source repairs

`content/ppl/deck-repairs.mjs` is shared by all five. It is deliberately
short, because a PowerPoint arrives in far better condition than the ATK PDF
did: it knows its own title, records bullet indent levels, and keeps a table
as a table. What it does:

- Emits a slide title once per run rather than once per slide, and drops it
  when it merely repeats the topic name.
- Removes a title the slide repeats as its own first line, whole or split
  across two or three boxes.
- Restores bullets typed into the text as a glyph, and bullets typed as a
  hyphen.
- Rejoins sentences the text box cut in half, and marks up lists a colon
  introduces and nothing else does.
- Fixes typography a slide cannot express: CO₂, m², the degree sign, a
  compound broken by a line wrap.
- Strips a bare third-party URL, leaving the AIP and CAA references alone.

Anything one deck needs and the others do not is keyed to that deck and that
slide, in a `TABLES` block at the top of the subject module, so a
re-extraction that changes the wording stops applying the repair rather than
applying it to the wrong words. There are 19 such entries across the five
subjects.

## Validation

`node scripts/ppl-validate.mjs` — clean for all six PPL subjects. It checks
source coverage, diagram reconciliation, provenance, content quality
(hollow lessons, thin lessons, unexplained figures, repeated paragraphs,
duplicate slugs) and leakage (CAA codes, objectives, academy names, deck
furniture).

`node scripts/ppl-atk-caa-check.mjs --subject <slug>` — the internal check
that the course teaches what the exam can ask about. It is a word-match
heuristic and is read as a prompt to look, not as a verdict:

| Subject | Topics | Items | Covered | Partial | Not matched |
| --- | ---: | ---: | ---: | ---: | ---: |
| Aircraft Technical Knowledge | 42 | 210 | 199 | 10 | 0 |
| Air Law | 30 | 159 | 139 | 19 | 1 |
| Meteorology | 21 | 139 | 122 | 12 | 5 |
| Navigation | 26 | 78 | 43 | 21 | 14 |
| Flight Radiotelephony | 9 | 33 | 12 | 12 | 9 |

Every "not matched" item was read by hand. Almost all are the heuristic
missing a syllabus verb rather than the course missing the material — the
missing terms it reports are words like "involved", "knowledge", "might",
"competently". The genuinely absent items are practical-skill objectives that
no slide deck teaches and no reading of one can: folding a map for a
cross-country, measuring a distance on a chart to ±1%, and demonstrating
proficiency in transmitting. Those are flying-lesson objectives.

Human Factors declares no syllabus codes at all, and says so in writing at
the top of its module. The archived CAA syllabus holds 33 Human Factors
topics under the **CPL** subject and none under the PPL one — the PPL record
was never loaded. Mapping PPL lessons to CPL syllabus rows would put the
wrong subject's item ids into the mapping table, so the subject maps to
nothing until a PPL Human Factors syllabus exists to map to. The builder
allows this only for a subject that declares `syllabusUnavailable` with a
reason, and rejects a subject that sets it and still declares codes.

## Mapping evidence

Every syllabus mapping the builder writes now records what it was made on:

> Declared in `content/ppl/air-law.mjs`: the chapter "Altimetry" teaches
> syllabus area 4.70, and this lesson is one of its topics.

The `method` is `authored` and the confidence is 1, because this is not a
matcher guessing from the words in a lesson — it is the curriculum saying
which areas a chapter teaches. `tests/lessons.mjs` asserts that no confirmed
mapping is left without evidence, which is what caught the omission.

Adding this rewrote the 2,134 Aircraft Technical Knowledge mapping rows as
well. Not one ATK lesson, block, slug, title or figure changed — the builder
produces byte-identical content for that subject — but its mapping rows now
carry the same evidence string as the rest.

## Data safety

The builder looks subjects up and never creates them, so course ids, subject
ids, slugs, products, prices, entitlements, orders, payments and progress
relationships are untouched. Modules and lessons for the subject being built
are replaced inside one transaction. Nothing outside `ppl-theory` is read or
written, and ATK, CPL, IR, the flight test groundwork courses and the admin
data are not touched by any run.

After the rebuild: 26 products, 7 orders, 9 entitlements, 10 questions and
3,697 media assets, all unchanged. All 303 syllabus topics remain `ARCHIVED`.
Every one of the six PPL subjects is still `PUBLISHED` under its original id
and slug.

## What the test suite had to change

`tests/lessons.mjs` asserted the old contract: same module count as the deck,
same lesson count, same order, same block totals, and the deck's text findable
somewhere in the database. All five of those are statements about a
deck-ordered import and all five are false of a curriculum, so they were
replaced with the claims that do have to hold:

- every slide is taught by exactly one topic or skipped with a written reason;
- no slide is claimed twice, claimed out of range, or both taught and skipped;
- the database holds a chapter per chapter and a lesson per topic;
- no lesson is empty;
- every source block cites a slide inside the deck, and no authored block
  cites one at all;
- blocks follow the order their topic declared; and
- **the words of a source block are the words on the slide it cites.**

The last one runs the opposite way round from the check it replaces. The old
suite took a slide and looked for its text somewhere in the database, which
works only while a lesson and a slide are the same thing. The new one takes a
stored block, reads the slide it says it came from, and asks whether those
words are on it — which is the claim `origin: "source"` actually makes, and
holds however the material is arranged. Comparison is on letters and digits
only, and a hand-written substitution is applied to the slide first, so a
correction the subject module wrote down is not reported as a rewrite and one
it did not write down still is. The subject modules export their repair
tables as `repairs` for exactly this.

## Known and left alone

Two things were found and deliberately not changed.

- Aircraft Technical Knowledge has one "(See next slide)" in the AHRS lesson
  — a pointer to a deck a student is not looking at. ATK is finished and out
  of scope for this rebuild, so it is recorded here rather than fixed.
- The `verification`, `auth` and `uat` suites fail on the e-mail flows, and
  `responsive` fails seven times on `stroke-dashoffset` on the marketing page.
  Both predate this work — the marketing page is dated 2026-09-06 and the
  `.env` that turns on real mail delivery is dated 2026-09-07 — and neither
  touches anything the rebuild changed. With `RESEND_API_KEY` set, the tests
  take the Resend path, their `@example.com` addresses are rejected, and the
  verification link never reaches the server log the suite reads. Blanking the
  key puts the links in the log and the suites still mismatch on which token
  they pick, so there is a second harness problem behind the first. Neither is
  in this brief.

## Reports

- `PPL-SOURCE-COVERAGE.md` — every slide of every deck, classified.
- `PPL-LAW-CAA-COVERAGE.md`, `PPL-MET-CAA-COVERAGE.md`,
  `PPL-NAV-CAA-COVERAGE.md`, `PPL-RADIO-CAA-COVERAGE.md` — the internal
  syllabus coverage tables, one per subject that has a syllabus.
