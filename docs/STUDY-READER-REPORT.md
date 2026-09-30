# Study Reader — Implementation Report

KiwiPilotPrep · Syllabus-indexed study material · 9 September 2026

**983 automated checks pass.** Build, type-check and lint clean. Nothing in
Phases 1–6 changed.

---

## 0. One deviation from the brief, stated up front

The brief names **Subject 10 — Human Factors** as the pilot. The material
supplied was **Subject 12 — Aircraft Technical Knowledge (Aeroplane)**, so the
pilot was built on what was actually provided.

Nothing about the implementation is specific to either subject: codes, topics
and items all come from the database, and the importer takes any AC61-3 subject
syllabus. Human Factors can be loaded with one command when its files arrive.

---

## 1. What was implemented

A student now reaches study material this way:

```
Course → Subject → Official syllabus index → Syllabus item → Study page
```

- **`/study/<course>/<subject>`** — the whole official syllabus for a subject,
  grouped by CAA section and topic, with completion shown per topic.
- **`/study/<course>/<subject>/<code>`** — one requirement. The official CAA
  wording, then the study notes explaining it, then Mark Complete, Previous,
  Next and Practice Questions.
- **Search** by code or wording, accepting `12.6.24`, `12-6-24` or `12.6`
  (which returns every item in that topic).
- **A collapsible index** — sticky sidebar on desktop, behind a button on
  mobile, with the active item highlighted and the containing topic opened.

The URL is built from the syllabus code. No database id appears in any route.

---

## 2. Database changes

One additive migration, `20260909090000_syllabus_study_material`. Four new
tables; no existing column altered, no row deleted.

| Model | Purpose |
|---|---|
| `SyllabusTopic` | `subjectId`, `code`, `title`, section, order, status |
| `SyllabusItem` | `syllabusTopicId`, **`code` (unique)**, `requirement`, order, status, `sourcePageFrom/To` |
| `StudyContent` | `syllabusItemId` (unique), `blocks`, `references`, status |
| `SyllabusItemProgress` | unique `(userId, syllabusItemId)`, `completedAt` |

Two decisions worth stating:

**The code is a field, never derived from a title.** `SyllabusItem.code` is
globally unique because it is the academic key — the CAA prints these numbers
on knowledge deficiency reports. Titles get edited; codes must not move.

**`StudyContent` reuses the existing `blocks` shape** from `ChapterContent`, so
the existing renderer and validation apply unchanged. This is a new place to
put content, not a second content system.

---

## 3. Routes added

| Route | Who |
|---|---|
| `/study/[courseSlug]/[subjectSlug]` | entitled students — index + search |
| `/study/[courseSlug]/[subjectSlug]/[code]` | entitled students — the reader |
| `/admin/syllabus` | admin — coverage across all subjects |
| `/admin/syllabus/[subjectId]` | admin — manage one subject's index |

Nothing existing was changed or removed.

---

## 4. CMS changes

`/admin/syllabus` lists every subject with its topic count, item count and how
many items have published notes — so the gap between "the syllabus is loaded"
and "a student can read it" is visible without clicking through.

`/admin/syllabus/[subjectId]` provides: create topic, create item, enter the
official code, enter the official requirement, publish/unpublish, archive,
reorder, search by code or wording, and **Preview as a student** — the same
page a student sees, with the same branding and no download control (§22).

Built on the existing server-action + `revalidatePath` pattern and the existing
admin components. Reachable from the existing nav under *Syllabus & Study*.

**Nothing is hard-deleted.** Items may already be referenced by questions,
attempts or progress, so the only controls offered are publish, unpublish and
archive (§23).

---

## 5. How the index maps to study content

```
Subject
 └── SyllabusTopic   12.4  The Atmosphere
      └── SyllabusItem   12.4.2  "Name the principal gases…"   ← official, verbatim
           └── StudyContent   blocks                            ← the explanation
                └── Questions  matched on kdrCode = 12.4.2
```

**Requirement and explanation are separate rows and separate edit actions.**
Saving notes cannot touch the CAA wording; editing the wording cannot touch the
notes (§5).

**Practice questions need no new link.** The CAA states these reference numbers
"will be used on knowledge deficiency reports" — so the syllabus code and the
KDR code are one identifier. Questions already carry `kdrCode`, and matching on
it uses the existing relationship rather than inventing a second one (§11).

---

## 6. How progress is stored

`SyllabusItemProgress`, unique on `(userId, syllabusItemId)` — so marking
complete is idempotent rather than something that accumulates rows. Verified:
pressing it three times leaves one row.

It is a **sibling** of `ChapterProgress`, not a replacement. The two describe
different units of study and existing chapter progress had to keep working
untouched. Nothing is kept in `localStorage` (§10).

Entitlement is re-checked inside the server action, not trusted from the page
that rendered the button.

**One thing changed because of a test.** The subject page originally showed
progress as a percentage alone. One item of 210 is 0.47%, which rounds to 0% —
a student marking their first item complete would have seen no change at all.
It now leads with the count (`1 / 210`) and adds the percentage once it is
non-zero.

---

## 7. How the pilot content was mapped

| | |
|---|---|
| Syllabus topics imported | **42 of 42** |
| Syllabus items imported | **210 of 210** |
| Items with study notes | **12** |
| Items with a source page reference | **170** |
| Source chapters matched to a topic | **26 of 31** |

**The syllabus is complete.** All 42 topics and 210 items are loaded with the
official wording reproduced exactly, lettered sub-clauses and all.

**The study notes are not, and this is the honest part.** The source is a
506-page slide deck. It prints a syllabus code only where an item begins, and
only **17 codes survive in the extractable text layer** — the rest are rendered
as images. Content was written only where the source prints the item's own
code. That is 12 items.

Three guards stop the importer over-reaching:

1. **No positional mapping.** Chapters look like they map to topics in order —
   and they do, until Chapter 14. The deck has no chapter for *12.30 Fuel
   Tanks*, so from there everything drifts by one and Lubrication content would
   land under a Fuel Tanks requirement. Tested, and rejected.
2. **No over-long extraction.** When the *next* item's code is missing there is
   nothing to stop an extraction running to the end of the deck. Two items
   (12.4.16, 12.18.6) would have absorbed 385 pages and ~1,000 blocks each.
   Both are discarded and reported by name.
3. **Retraction on re-run.** If a later run can no longer justify content an
   earlier run wrote, it deletes it rather than leaving a previous mistake in
   place.

Chapters are matched to topics on the **title the source itself prints**, never
on an ordinal.

---

## 8. Previous academy branding — confirmed removed

The source PDF's text layer was scanned for URLs, email addresses, copyright
notices and academy-style names. **It contained none** — the only hits for
"aviation" and "training" were ordinary content words.

The importer takes **text only**. No page images are carried across, so any
logo or watermark rendered as an image in the source cannot reach the student
experience by construction.

An automated check fails the build if *academy*, *flight school*, *flying
school*, *aeroclub* or *aero club* appears on the index or a study page.

**CAA references were deliberately not stripped.** A separate test asserts that
`AC61-3` still appears — removing official source attribution along with
branding would have been the wrong kind of thorough (§21).

---

## 9. KiwiPilotPrep branding — confirmed

The watermark uses the **project's existing brand mark** — the same four-point
star as the site header and footer — not a new logo invented for this feature.
It sits behind the content at 13% opacity, is `aria-hidden`, and carries
`pointer-events: none` so it cannot intercept a tap.

Asserted by test on every study page.

---

## 10. No student-facing PDF download — confirmed

There is no Download, Save PDF or Export control anywhere in the study
experience, and the source PDF is not served from any route.

A test fails on any of: `download pdf`, `save pdf`, `export pdf`, an `<a>`
carrying a `download` attribute, or any `.pdf` URL appearing in the markup of
either page.

---

## 11. Tests performed

**983 checks.** New in this pass: 29 unit tests and 42 end-to-end checks.

| Suite | Checks |
|---|---|
| Unit — syllabus codes (14) and the parser (15) | 29 of 181 |
| **Study Reader end to end** | **42** |
| Auth · Verification · IDOR | 76 · 35 · 32 |
| Payments · Coupons · Mocks · Guarantee | 40 · 39 · 58 · 65 |
| CMS · Dynamic content | 10 · 24 |
| UAT acceptance criteria | 131 |
| Responsive / browser / a11y (real Chromium, 7 widths) | 250 |

Every numbered check in the brief's §24 list passes, plus: official wording
reproduced verbatim, an unentitled student blocked by URL, a non-existent code
and an unentitled one returning identically, repeated Mark Complete staying
idempotent, and the index rendering from the database rather than a fixture.

**A defect the suite caught in the platform, not the feature:** with a real
`RESEND_API_KEY` configured, every test signup fired a rejected send at the
Resend account. The test server must run with `RESEND_API_KEY=` empty. Now
documented in the README, because it is not obvious and it costs real API quota.

---

## 12. What could not be confidently mapped

Stated plainly rather than filled in:

**198 of 210 items have no study notes.** The source does not print their codes
in extractable text, so there is no evidence of where their content begins or
ends. The official requirement is shown for every one of them, and the reader
says the notes are not yet written rather than showing something plausible.

**5 source chapters could not be matched to a topic** by the title the source
prints:

| Chapter | Pages | Likely topic — *not* assumed |
|---|---|---|
| Ch4 Power Plant and Systems | 65–85 | possibly 12.10 Engines – General Piston Engines |
| Ch10 Electronic Ignition | 132–133 | possibly 12.22 Ignition systems – Solid State |
| Ch20 Ancillary Systems | 295–301 | unclear |
| Ch22 The Forces Acting on the Aircraft | 324–338 | possibly 12.60 Straight and Level Flight |
| Ch31 Weight and Balance | 481–506 | spans 12.106–12.110 |

**2 items were extracted and then discarded** (12.4.16, 12.18.6) because the
extraction ran past any plausible boundary.

**No images or diagrams were imported.** The source's visuals are embedded page
images, and pulling them in risks carrying a watermark or logo across with
them. §16 asks for visuals where they genuinely help; that needs a per-image
decision, not a bulk extract.

### The straightforward way to close the gap

Every unmapped item already has: its official requirement, its topic, a page
range pointing into the source, and an admin screen to write notes into. The
work is content entry against a complete index — not further engineering.

The alternative is OCR over the page images to recover the codes rendered as
graphics. That would raise coverage substantially, but OCR output would need
checking before it went in front of anyone sitting a real exam.

---

## Not claimed

That the study material is complete. The **syllabus index** is complete and
verbatim; **12 items** have notes. The remaining 198 show their official
requirement and say plainly that notes are not yet written — which is the
honest state, and visible at a glance from `/admin/syllabus`.
