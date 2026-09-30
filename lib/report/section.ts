/**
 * The KiwiPilotPrep syllabus section — where it comes from, and how it is
 * written wherever a student sees it.
 *
 * There is one source. A question is assigned to a chapter (a CourseModule)
 * of its own subject, and optionally to a point (a Lesson) inside that
 * chapter. The chapter carries its number within the subject — 27 — and the
 * point carries its number within the chapter, so a point reads 27.3.
 * Everything a result says about "areas" is that mapping, read through this
 * file, and a point is preferred over its chapter because it is the more
 * precise place the author actually chose.
 *
 *   Question → chapter (+ point) → { code, title } → scorecard, email, PDF
 *
 * Nothing is inferred. A section is never derived from an external
 * authority's reference, never worked out from a question's position in a
 * list, and never typed in as free text beside the question. A question that
 * has not been assigned a section is reported as unmapped rather than given a
 * plausible-looking one, because a wrong revision area sends a student to
 * revise the wrong thing.
 *
 * One formatter, used by all three renderers, so a student comparing their
 * screen with the report they were emailed finds the same words in both.
 */

export const UNMAPPED_SECTION = "General revision";

/**
 * The section a question was assigned, or null when it has none.
 *
 * `chapter` is the label of the chapter above this section, and is set only
 * when the section is a point inside one. A question mapped to its chapter
 * and no further has no chapter above it to name, so this stays null and the
 * result shows one line rather than the same line twice.
 */
export type Section = { code: string | null; title: string; chapter: string | null };

/**
 * The section of a question, read from its module.
 *
 * Accepts the module as loaded — or null — so callers can pass a question
 * straight from a query without unpacking it, and so a question whose module
 * was archived out from under it degrades to unmapped instead of throwing.
 */
export function questionSection(
  question:
    | {
        module?: { sectionCode: string | null; title: string } | null;
        lesson?: { pointNumber: number | null; title: string } | null;
      }
    | null
    | undefined,
): Section | null {
  const m = question?.module;
  if (!m) return null;

  // A point is the finer answer, and the one the author chose deliberately.
  //
  // It is used only when the whole of it resolves — a chapter code, a point
  // number and a point title. A point is meaningless without the chapter it
  // sits in, so anything missing falls back to the chapter rather than
  // being patched up: a question mapped to a chapter and no further must
  // report as that chapter, and must never be given a point that its author
  // did not choose.
  const point = question?.lesson;
  const chapterCode = m.sectionCode?.trim() || null;
  const chapterTitle = m.title?.trim();
  if (chapterCode && chapterTitle && point && point.pointNumber != null) {
    const pointTitle = point.title?.trim();
    if (pointTitle) {
      return {
        code: `${chapterCode}.${point.pointNumber}`,
        title: pointTitle,
        chapter: sectionLabel(chapterCode, chapterTitle),
      };
    }
  }

  if (!chapterTitle) return null;
  return { code: chapterCode, title: chapterTitle, chapter: null };
}

/**
 * How a section is written: `1.10 — Right of Way Rules`.
 *
 * Either half alone still reads, and a question that has never been mapped
 * gets a neutral heading rather than being dropped from the breakdown — a
 * student's own missed question must appear somewhere.
 *
 * The code is KiwiPilotPrep's own numbering. No external authority's codes
 * are shown to a student; those live on the question for internal validation
 * and stop there.
 */
export function sectionLabel(code?: string | null, title?: string | null): string {
  const c = code?.trim();
  const t = title?.trim();
  if (c && t) return `${c} — ${t}`;
  return t || c || UNMAPPED_SECTION;
}

/**
 * The label for a question's place in the curriculum, point or chapter.
 *
 * The one call an admin screen should make: it reads the same mapping the
 * scorecard reads, so what an author sees beside a question in the bank and
 * what a student sees on their result are the same string.
 */
export function questionSectionLabel(
  question:
    | {
        module?: { sectionCode: string | null; title: string } | null;
        lesson?: { pointNumber: number | null; title: string } | null;
      }
    | null
    | undefined,
): string {
  const s = questionSection(question);
  return s ? sectionLabel(s.code, s.title) : UNMAPPED_SECTION;
}

/**
 * Sorts section labels by their code, so 2 comes before 10 and 27.2 before
 * 27.10. A chapter sorts immediately before its own points.
 */
export function compareSections(a: string, b: string): number {
  const parse = (s: string) => {
    const m = /^(\d+)(?:\.(\d+))?\s+—/.exec(s);
    // A bare chapter takes point 0 so it leads its own points.
    return m ? [Number(m[1]), m[2] === undefined ? 0 : Number(m[2])] : null;
  };
  const pa = parse(a);
  const pb = parse(b);
  if (pa && pb) return pa[0] - pb[0] || pa[1] - pb[1];
  if (pa) return -1;
  if (pb) return 1;
  return a.localeCompare(b);
}
