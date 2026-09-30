# Lecture material migration — five PPL courses

Five supplied lecture decks were migrated into the CMS. This was a **migration,
not a summarisation**: nothing in the sources was shortened, rewritten,
corrected, modernised or reordered. Where something could not be carried across
it is marked in place rather than dropped.

## The sources

| # | Course | Source file | Slides/pages |
|---|---|---|---|
| 1 | PPL Meteorology | `PPLMeteorology2024_Professional.pptx` | 531 |
| 2 | PPL Air Navigation and Flight Planning | `PPLNavigation-Updated_Professional.pptx` | 239 |
| 3 | PPL Air Law | `PPLLawPowerPointNew_Professional.pptx` | 381 |
| 4 | PPL Human Factors in Aviation | `PPLHFUpdated-Complete_Professional.pptx` | 257 |
| 5 | Flight Radio Telephony | `FRTOLectureSlides_Professional.pdf` | 157 |

Four CAA syllabi were supplied alongside them and imported separately, as the
official examinable index (`PPL SYLLABUS/Subject No. 2, 4, 6, 8`). No syllabus
was supplied for Human Factors, so that subject has lessons but no CAA index.

## The shape it was migrated into

```
Course  →  Subject  →  CourseModule  →  Lesson  →  StudyContent.blocks  →  MediaAsset
```

This sits **beside** the syllabus tree, not inside it:

```
Subject ─┬─ SyllabusTopic → SyllabusItem → StudyContent    the examinable index
         └─ CourseModule  → Lesson       → StudyContent    the lecture course
```

Two trees rather than one, because the two orders genuinely disagree. The
syllabus is organised by CAA code; a deck is organised the way the subject is
taught. An earlier import forced lecture material onto syllabus codes and lost
every chapter that had no confident match — 15 of 42 topics ended up empty and
80 diagrams became unreachable. Keeping the lecture tree in its own right means
a lesson with no syllabus match is still reachable under its module.
`Lesson.syllabusItemId` links the two where a match exists, and is null
otherwise; a missing link costs traceability, never access.

## How the structure was derived

From the deck itself, never from a template:

- A slide carrying **only a heading** opens a **module**.
- A slide with a **heading and content** opens a **lesson**.
- A slide with **no heading** continues the lesson before it.
- The same heading repeated on consecutive slides is one long lesson, not two.
- Content arriving before any heading gets an `Introduction` module, so it
  cannot fall outside the tree.

Titles are read from the title placeholder where the deck uses one, and
otherwise from the largest top-of-slide text run. A large run that reads as a
finished sentence is treated as emphasised body text, not a heading — otherwise
a teaching point becomes a lesson name.

## What is deliberately excluded

Only three classes of thing, all of them non-teaching:

1. **Repeated small images** — appearing on 5+ slides at under 60 KB. These are
   logos and borders. This rule is what keeps another provider's branding out
   of the student experience.
2. **Slide-number text boxes** and slide-number placeholders. The slide range
   is recorded as a field on the lesson instead.
3. **Embedded video files**, which cannot play in the reader. Each is marked in
   place as `[MEDIA — PRESERVE FROM SOURCE]` with its slide number. 18 of them.

A slide that was genuinely blank in the source is kept as
`[NO CONTENT IN SOURCE]`, so the slide count still reconciles.

## Running the pipeline

```bash
npm run cms:extract    # sources  → .cache/decks/<course>/manifest.json + assets/
npm run cms:syllabi    # CAA PDFs → SyllabusTopic / SyllabusItem
npm run cms:import     # manifests → CourseModule / Lesson / StudyContent
npm run cms:report     # docs/cms/MASTER-INDEX.md, COVERAGE.md, per-course JSON
npm run cms:map        # propose lesson ↔ syllabus links, write SYLLABUS-MAP.md
```

`cms:import` replaces a subject's modules wholesale rather than merging, so a
re-run cannot interleave two imports. Media assets are keyed by content hash
and upserted, so re-running does not duplicate images. The importer counts what
it wrote against what it read and **throws rather than finishing** if the two
disagree — a silent shortfall would be indistinguishable from success.

Extraction needs `python-pptx` and `pypdf`:

```bash
python -m pip install python-pptx pypdf
```

## Where a student sees it

| Route | What it shows |
|---|---|
| `/courses/<course>/subjects/<subject>` | redirects to the syllabus reader, or to the lessons if there is no syllabus |
| `/study/<course>/<subject>` | the CAA syllabus index, with a **Course material** panel above it |
| `/study/<course>/<subject>/lessons` | modules and lessons, with search |
| `/study/<course>/<subject>/lessons/<lesson>` | the lesson reader |

Everything is behind `canAccessSubject`, checked server-side before any lesson
content is read. Diagrams are served only through
`/api/study-figures/<assetId>`, which checks the same entitlement — the bytes
live outside the web root and there is no public URL for them.

## Verification

`npm run test:lessons` — 80 checks. The important ones compare the database
against the **extracted manifests**, not against the importer's own output:

- every source slide is represented in the CMS tree
- module, lesson, text-block, diagram and table counts all reconcile
- lessons are stored in source order, and slide numbers never run backwards
- sampled source wording appears in the database **byte for byte**
- every figure block resolves to a stored, non-public asset
- an unentitled student gets 404 on the index, on a lesson, and on a diagram
- no PDF download is offered, and no previous-provider branding appears

`tests/unit/deck-index.test.ts` — 19 checks on the tree-building rules
themselves, including the cases that lose content when they go wrong: an
untitled continuation slide, a repeated heading, a video-only slide, a blank
slide, and a divider that turns out to carry content.

`tests/unit/syllabus-match.test.ts` — 51 checks on the matcher. Most of them
are about *not* matching: that a shared instruction verb proves nothing, that
locality cannot manufacture a match, that a long word may not swallow a short
one, and that a lesson teaching one entry of a list scores below one that
answers the whole item.

`tests/unit/mapping-review.test.ts` — 15 checks on the review actions, chiefly
that `confirmBand` cannot be talked below its floor by any argument, and that
returning a link to the queue clears its reviewer so the audit trail never
claims someone approved an undecided link.

## Known limits

- **Human Factors has no CAA syllabus** in the supplied set, so it has 2 modules
  rather than a proper section structure, and no examinable index. Supplying
  `Subject No. 10` would fix both.
- **Navigation's deck marks few sections** (14 modules for 239 slides), so some
  modules are large. That is the deck's own structure, not a parsing failure.
- **25 lines of syllabus preamble** across the four CAA PDFs are captured in
  `.cache/syllabi/*.txt` but not attached to a topic — they are subject-level
  notes ("Note: this syllabus is principally based on…"), and filing them under
  a topic would misattribute them.
- **Lesson-to-syllabus links are proposed, not live.** See below.

## Lesson ↔ syllabus mapping (Phase 1)

`npm run cms:map` proposes which lesson teaches each syllabus item and writes
`docs/cms/SYLLABUS-MAP.md` for review.

**Nothing it writes is visible to a student.** Every row lands in
`LessonSyllabusItem` as `PROPOSED`; the reader follows only `CONFIRMED` links,
and `tests/lessons.mjs` asserts that no proposal has leaked into a page. A bad
proposal costs a reviewer thirty seconds; a bad *live* link would send a student
who lost marks on 8.10.14 to a page that does not teach it.

The link is many-to-many on purpose. One lesson on Coriolis force covers 8.12.8,
8.12.10 and 8.12.12, and one item is often taught across several consecutive
lessons — a single foreign key would force a choice between them and lose the
rest silently.

### How a lesson is scored against an item

Four ideas, all in `scripts/syllabus-match.mjs` and all unit-tested:

1. **Instruction verbs are removed.** "Describe", "outline", "state" open most
   requirements and say nothing about which lesson teaches them.
2. **Rarity decides.** Terms are IDF-weighted against *this subject's own*
   lessons: "coriolis" separates three lessons from two hundred, "wind"
   separates nothing. A term the deck never uses carries little weight — that
   it is absent is a coverage gap, reported separately, not a ranking signal.
3. **A requirement is read more than one way.** Whole sentence, head clause, or
   one lettered entry of a list — the title is scored against whichever it
   answers best. Without this, a lesson called "Measurement of Surface Air
   Temperature" scored 0.26 against the item of the same name, because the
   item's thirty words of qualifiers can never appear in a four-word title.
4. **Locality multiplies, never creates.** Deck modules are first aligned to
   syllabus topics by title ("The Wind" ↔ 8.12 Wind); an item then scores
   higher inside its aligned module. It is a multiplier on existing evidence,
   so being in the right section can never manufacture a match on its own.

### What Phase 1 found

| Subject | Items | Covered | Gaps | Strong | Likely | Weak |
|---|---|---|---|---|---|---|
| Air Law | 159 | 147 | 12 | 18 | 65 | 109 |
| Air Navigation | 78 | 68 | 10 | 20 | 23 | 53 |
| Meteorology | 139 | 131 | 8 | 124 | 43 | 56 |
| Flight Radiotelephony | 33 | 30 | 3 | 15 | 12 | 17 |
| **Total** | **409** | **376 (92%)** | **33** | **177** | **143** | **235** |

The **33 gaps** are the point of the exercise: examinable syllabus items that
nothing in the lecture deck plausibly teaches — 8.36.2 "Define an air-mass",
8.10.6 "State the significance of air pressure to aviation", 8.26.10 "Explain
the factors involved in slant range". Until now there was no way to see them.

Human Factors is absent from the table because no CAA syllabus was supplied for
it; Aircraft Technical Knowledge because no deck was.

## Phase 2 — the review console, and what a confirmation does

### The console

**`/admin/syllabus-map`** — the review queue, one subject at a time, highest
confidence first. Each row shows the requirement, the proposed lesson (linked,
so it can be opened and read), and the matcher's own evidence: title score,
body score, and whether the lesson sits in the module aligned to that topic.

Above the queue sits the **coverage gap list** for the subject, because that is
the finding that matters most: examinable items nothing was proposed for.

**Confirm all strong** rules on a whole band in one action. It is floored at
0.62 in `confirmBand` itself, not in the UI — a bulk action must never be able
to reach the weak band, and a floor enforced in the caller is a floor a crafted
form post walks past. Every decision records who made it and when.

### What a confirmation turns on

| Where | Before | After |
|---|---|---|
| Lesson page | no syllabus code shown | the official requirement quoted at the top, verbatim, for **every** confirmed item |
| Lesson tool rail | no practice link | **Practice (n)**, matched on the CAA code |
| Syllabus item page | an empty page | **"This is taught in"** — links to the lessons that cover it |

A `PROPOSED` link renders nothing anywhere. `tests/lessons.mjs` proves it by
confirming a link mid-run, checking the page changes, then putting it back and
checking the page changes again.

### Two content bugs the review surfaced

Checking whether the reported gaps were genuine turned up two extraction faults
rather than matcher faults:

1. **12 lessons were titled after the source file** — `PPLMeteorology2024_Professional`.
   The slide straight after a section divider has no heading of its own, and
   the fallback used the filename. It now takes the section's name. Students
   were seeing those titles too.
2. **Body text promoted to lesson titles** — "Important! Fuel Pounds is not a
   unit!" A large top-of-slide run ending in `!` is emphasised body text, not a
   heading, and a multi-line title now keeps only its first line as the title
   and returns the rest to the body. Text-block counts went **up**, never down.

Gaps fell from 76 to 33 and strong matches rose from 91 to 177 on the back of
those two fixes — most of the "missing" material had been there all along under
an unusable title.
