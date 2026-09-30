import "server-only";

import { db } from "@/lib/db";
import { compareSections, sectionLabel } from "./section";
import { kdrBand } from "@/lib/mock/engine";
import { toOptions } from "@/lib/mock/engine";

/**
 * The data behind a KiwiPilotPrep Knowledge Deficiency Report.
 *
 * Built entirely from `MockAttemptQuestion`, whose snapshots are written when
 * the attempt starts and never touched again. That is deliberate: a report is
 * a record of what a student was told on the day, so editing a question, its
 * explanation or its topic afterwards must not rewrite a report they already
 * have. Nothing here reads the live question, the live topic or the CMS.
 *
 * The report is KiwiPilotPrep's own. It carries this platform's revision areas
 * and nothing from any external syllabus: `caanzRefSnapshot` and
 * `ac61RefSnapshot` stay on the row for internal validation and never appear
 * in anything a student reads.
 */

export type MissedQuestion = {
  order: number;
  prompt: string;
  /** Null where the student answered nothing. */
  yourAnswer: string | null;
  /** Null where the snapshot has no option marked correct — see below. */
  correctAnswer: string | null;
  /** Only when the question actually carries one. Never invented. */
  explanation: string | null;
  revisionArea: string;
};

export type RevisionArea = {
  area: string;
  /**
   * The chapter this area sits inside, when the area is a point. Null when
   * the area is itself a chapter, so nothing is printed twice.
   */
  chapter: string | null;
  missed: number;
  attempted: number;
  accuracy: number;
  band: "strong" | "improving" | "weak";
};

/**
 * A result broken down by KiwiPilotPrep section.
 *
 * Computed once, here, and handed to every renderer. The scorecard, the
 * result email and the PDF all read these arrays rather than each grouping
 * the attempt their own way, which is the only way three views of one attempt
 * can be guaranteed to name the same strengths and the same weaknesses.
 */
export type AreaBreakdown = {
  /** Every section this paper touched, in syllabus order. */
  all: RevisionArea[];
  /** Sections answered well. Best first. */
  strong: RevisionArea[];
  /** Sections not yet answered well. Weakest first. */
  weak: RevisionArea[];
  /** Sections with at least one miss. Most missed first. */
  revision: RevisionArea[];
};

/**
 * Groups a marked attempt by section.
 *
 * `rows` are the KDR rows the marking already wrote, so the breakdown can
 * never disagree with the marks. `missedByArea` covers the one case they do
 * not reach: a question with no section still belongs in a student's report,
 * and is carried under the unmapped heading rather than dropped.
 *
 * A section can arrive on more than one row — two questions, same section,
 * written at different times. A student reading the same heading twice on one
 * page reasonably wonders which is which, so rows are merged on the label
 * they are shown under and the accuracy recomputed from the combined totals.
 */
export function aggregateAreas(
  rows: ReadonlyArray<{
    kdrCode: string | null;
    kdrTopic: string | null;
    kdrChapter?: string | null;
    attempted: number;
    correct: number;
  }>,
  missedByArea: ReadonlyMap<string, number>,
  strongPercent: number,
  weakPercent: number,
  /** The chapter above each missed area, where the snapshot recorded one. */
  chapterByArea: ReadonlyMap<string, string | null> = new Map(),
): AreaBreakdown {
  const merged = new Map<string, { attempted: number; correct: number; chapter: string | null }>();
  for (const k of rows) {
    const area = sectionLabel(k.kdrCode, k.kdrTopic);
    const acc = merged.get(area) ?? { attempted: 0, correct: 0, chapter: k.kdrChapter ?? null };
    acc.attempted += k.attempted;
    acc.correct += k.correct;
    // Rows merged under one label share a chapter by construction; the
    // first one that names it wins, and a row from before the chapter was
    // recorded simply leaves it as it found it.
    acc.chapter = acc.chapter ?? k.kdrChapter ?? null;
    merged.set(area, acc);
  }

  const all: RevisionArea[] = [...merged.entries()].map(([area, v]) => {
    const accuracy = v.attempted === 0 ? 0 : Math.round((v.correct / v.attempted) * 100);
    return {
      area,
      chapter: v.chapter,
      missed: v.attempted - v.correct,
      attempted: v.attempted,
      accuracy,
      band: kdrBand(accuracy, strongPercent, weakPercent),
    };
  });

  for (const [area, n] of missedByArea) {
    if (all.some((r) => r.area === area)) continue;
    all.push({
      area,
      chapter: chapterByArea.get(area) ?? null,
      missed: n,
      attempted: n,
      accuracy: 0,
      band: "weak",
    });
  }

  all.sort((a, b) => compareSections(a.area, b.area));

  return {
    all,
    strong: all
      .filter((a) => a.band === "strong")
      .sort((a, b) => b.accuracy - a.accuracy || compareSections(a.area, b.area)),
    weak: all
      .filter((a) => a.band !== "strong")
      .sort((a, b) => a.accuracy - b.accuracy || b.missed - a.missed || compareSections(a.area, b.area)),
    revision: all
      .filter((a) => a.missed > 0)
      .sort((a, b) => b.missed - a.missed || a.accuracy - b.accuracy || compareSections(a.area, b.area)),
  };
}

export type KdrReport = {
  student: { name: string; email: string };
  exam: { title: string; subject: string | null; attemptNumber: number };
  completedAt: Date | null;
  autoSubmitted: boolean;
  result: {
    total: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    scorePercent: number;
    passed: boolean | null;
    passingPercent: number | null;
  };
  summary: string;
  /** Every section, in syllabus order. */
  areas: RevisionArea[];
  /** Where this paper went well. */
  strongAreas: RevisionArea[];
  /** Where it did not. */
  weakAreas: RevisionArea[];
  /** Sections carrying at least one missed question. */
  revisionAreas: RevisionArea[];
  missed: MissedQuestion[];
};

function areaOf(q: { kdrTopicSnapshot: string | null; kdrCodeSnapshot: string | null }): string {
  // A question with no mapping still belongs in the report; it is grouped
  // under a neutral heading rather than dropped or crashing the build.
  return sectionLabel(q.kdrCodeSnapshot, q.kdrTopicSnapshot);
}

/**
 * One sentence about this result and nothing more.
 *
 * Said only from what the attempt recorded. No readiness claim, no prediction,
 * and no encouragement that the marks do not support.
 */
function summarise(scorePercent: number, areas: RevisionArea[], missedCount: number): string {
  if (missedCount === 0) {
    return "Every question was answered correctly. Nothing in this paper points to a revision area.";
  }
  const worst = areas.filter((a) => a.missed > 0).slice(0, 2).map((a) => a.area);
  const where =
    worst.length === 0
      ? ""
      : worst.length === 1
        ? ` Missed questions were concentrated in ${worst[0]}.`
        : ` Missed questions were concentrated in ${worst[0]} and ${worst[1]}.`;

  const standing =
    scorePercent >= 80
      ? "Strong overall performance."
      : scorePercent >= 60
        ? "A solid result with clear ground to make up."
        : "This paper found substantial gaps.";

  return `${standing}${where}`;
}

/**
 * Reads one attempt and returns its report, or null when the attempt is not
 * this user's or is not finished. Ownership is checked here rather than by the
 * caller so every route that renders a report enforces it the same way.
 */
export async function buildKdrReport(attemptId: string, userId: string): Promise<KdrReport | null> {
  const attempt = await db.mockAttempt.findUnique({
    where: { id: attemptId },
    include: {
      user: { select: { name: true, email: true } },
      mockExam: { select: { passingPercent: true, kdrStrongPercent: true, kdrWeakPercent: true } },
      questions: { orderBy: { order: "asc" } },
      kdrResults: { orderBy: { accuracy: "asc" } },
    },
  });

  if (!attempt) return null;
  if (attempt.userId !== userId) return null;
  if (attempt.status === "IN_PROGRESS") return null;

  const missed: MissedQuestion[] = [];
  for (const q of attempt.questions) {
    if (q.isCorrect === true) continue;

    const options = toOptions(q.optionsSnapshot);
    const chosen = q.selectedOptionId ? options.find((o) => o.id === q.selectedOptionId) : undefined;
    const correct = options.find((o) => o.isCorrect);

    missed.push({
      order: q.order,
      prompt: q.promptSnapshot,
      yourAnswer: chosen?.text ?? null,
      correctAnswer: correct?.text ?? null,
      explanation: q.explanationSnapshot?.trim() || null,
      revisionArea: areaOf(q),
    });
  }

  // Grouped by the one aggregator every renderer uses, so the scorecard, the
  // email and the PDF cannot describe this attempt three different ways.
  const missesByArea = new Map<string, number>();
  const chapterByArea = new Map<string, string | null>();
  for (const q of attempt.questions) {
    if (q.isCorrect === true) continue;
    const area = areaOf(q);
    if (!chapterByArea.has(area)) chapterByArea.set(area, q.kdrChapterSnapshot ?? null);
  }
  for (const m of missed) missesByArea.set(m.revisionArea, (missesByArea.get(m.revisionArea) ?? 0) + 1);

  const areas = aggregateAreas(
    attempt.kdrResults,
    missesByArea,
    attempt.mockExam.kdrStrongPercent,
    attempt.mockExam.kdrWeakPercent,
    chapterByArea,
  );

  return {
    student: { name: attempt.user.name, email: attempt.user.email },
    exam: {
      title: attempt.examTitle,
      subject: attempt.subjectTitle,
      attemptNumber: attempt.attemptNumber,
    },
    completedAt: attempt.submittedAt,
    autoSubmitted: attempt.autoSubmitted,
    result: {
      total: attempt.totalQuestions,
      correct: attempt.correctCount,
      incorrect: attempt.incorrectCount,
      unanswered: attempt.unansweredCount,
      scorePercent: attempt.scorePercent,
      passed: attempt.passed,
      passingPercent: attempt.mockExam.passingPercent,
    },
    summary: summarise(attempt.scorePercent, areas.revision, missed.length),
    areas: areas.all,
    strongAreas: areas.strong,
    weakAreas: areas.weak,
    revisionAreas: areas.revision,
    missed,
  };
}

/** What the report calls this result. Never "pass" unless a mark defines one. */
export function resultStatus(r: KdrReport): string {
  if (r.result.passed === null) return "Completed";
  return r.result.passed ? "Pass" : "Needs revision";
}
