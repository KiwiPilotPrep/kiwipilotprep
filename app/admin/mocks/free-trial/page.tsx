import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { questionSectionLabel } from "@/lib/report/section";
import { TRIAL_QUESTION_COUNT, TRIAL_DURATION_MINUTES } from "@/lib/mock/trial";
import MockTabs from "@/components/admin/MockTabs";
import { updateQuestionMeta } from "../../mock-actions";

export const metadata = { title: "Free trial — Admin" };

/**
 * The free ten-question mock, by subject.
 *
 * There is one free trial and it is the same engine as a paid mock, so this
 * page manages the only thing that is actually different about it: which
 * questions a subject may offer. A subject becomes available the moment ten
 * of its published questions are marked eligible, and unavailable again the
 * moment it drops below ten — nothing is switched on by hand, which is why
 * the count is the headline on every row.
 */
export default async function FreeTrialAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  await requireRole("ADMIN");
  const { subject: subjectId } = await searchParams;

  // Only the courses that offer the free mock. Flight test groundwork is
  // oral preparation with no multi-choice bank, so it is out of scope here
  // rather than listed as perpetually unavailable.
  const subjects = await db.subject.findMany({
    where: { status: "PUBLISHED", course: { status: "PUBLISHED", freeTrialEnabled: true } },
    orderBy: [{ course: { order: "asc" } }, { order: "asc" }],
    select: { id: true, title: true, course: { select: { title: true } } },
  });

  // The eligible count per subject, the same way the chooser counts it:
  // published, marked eligible, attached to the subject directly or through
  // one of its chapters.
  const counts = new Map<string, number>();
  for (const s of subjects) {
    counts.set(
      s.id,
      await db.question.count({
        where: {
          status: "PUBLISHED",
          freeTrialEligible: true,
          OR: [{ subjectId: s.id }, { chapter: { subjectId: s.id } }],
        },
      }),
    );
  }

  const ready = subjects.filter((s) => (counts.get(s.id) ?? 0) >= TRIAL_QUESTION_COUNT).length;
  const selected = subjectId ?? subjects[0]?.id;

  const questions = selected
    ? await db.question.findMany({
        where: { OR: [{ subjectId: selected }, { chapter: { subjectId: selected } }] },
        orderBy: [{ freeTrialEligible: "desc" }, { order: "asc" }],
        select: {
          id: true,
          prompt: true,
          status: true,
          moduleId: true,
          difficulty: true,
          caanzRef: true,
          ac61Ref: true,
          freeTrialEligible: true,
          explanation: true,
          module: { select: { sectionCode: true, title: true } },
          lesson: { select: { pointNumber: true, title: true } },
          _count: { select: { options: true } },
        },
      })
    : [];

  const selectedCount = selected ? (counts.get(selected) ?? 0) : 0;

  return (
    <>
      <MockTabs current="/admin/mocks/free-trial" />

      <div className="ahead">
        <div>
          <h1>Free trial</h1>
          <p>
            One reusable {TRIAL_QUESTION_COUNT}-question mock, {TRIAL_DURATION_MINUTES} minutes,
            and <b>one per student account</b> — a student chooses a single subject and that
            spends it. A subject offers it automatically once {TRIAL_QUESTION_COUNT} of its
            published questions are marked eligible, and stops offering it if the count falls
            back below {TRIAL_QUESTION_COUNT}.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-hd">
          <h2>
            Availability
            <span className="xs">
              {" "}
              · {ready} of {subjects.length} subjects can offer the free mock
            </span>
          </h2>
        </div>
        <table className="atable">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Eligible questions</th>
              <th>Free mock</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => {
              const n = counts.get(s.id) ?? 0;
              const available = n >= TRIAL_QUESTION_COUNT;
              return (
                <tr key={s.id}>
                  <td className="nm">
                    {s.course.title.replace(/^KiwiPilotPrep — /, "")} · {s.title}
                  </td>
                  <td className="num">
                    {n}
                    {!available && (
                      <span className="xs"> · {TRIAL_QUESTION_COUNT - n} more needed</span>
                    )}
                  </td>
                  <td>
                    <span className={`pill-s ${available ? "published" : "archived"}`}>
                      {available ? "Available" : "Not available yet"}
                    </span>
                  </td>
                  <td>
                    <Link
                      className={`btn btn-sm ${s.id === selected ? "btn-p" : "btn-g"}`}
                      href={`/admin/mocks/free-trial?subject=${s.id}`}
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="panel mt-m">
          <div className="panel-hd">
            <h2>
              Questions
              <span className="xs">
                {" "}
                · {selectedCount} eligible of {questions.length}
              </span>
            </h2>
            <Link className="btn btn-p btn-sm" href={`/admin/mocks/questions/new?subject=${selected}&trial=1`}>
              Add question
            </Link>
          </div>

          {questions.length === 0 ? (
            <div className="empty">
              <b>No questions for this subject yet</b>
              Add ten and the free mock turns itself on.
            </div>
          ) : (
            <table className="atable">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>KiwiPilotPrep section</th>
                  <th>Options</th>
                  <th>Status</th>
                  <th>Free mock</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <Link className="nm" href={`/admin/mocks/questions/${q.id}?trial=1`}>
                        {q.prompt.slice(0, 84)}
                        {q.prompt.length > 84 ? "…" : ""}
                      </Link>
                      {!q.explanation && <span className="xs"> · no explanation</span>}
                      {q._count.options !== 4 && (
                        <span className="xs"> · {q._count.options} options</span>
                      )}
                    </td>
                    <td className="xs">
                      {q.module ? (
                        questionSectionLabel(q)
                      ) : (
                        <span className="pill-s archived">Not mapped</span>
                      )}
                    </td>
                    <td className="num">{q._count.options}</td>
                    <td>
                      <span
                        className={`pill-s ${q.status === "PUBLISHED" ? "published" : q.status === "ARCHIVED" ? "archived" : "draft"}`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td>
                      <form action={updateQuestionMeta.bind(null, q.id)}>
                        {/* The rest of the row rides along so flipping this
                            one toggle cannot blank the others. */}
                        <input type="hidden" name="moduleId" value={q.moduleId ?? ""} />
                        <input type="hidden" name="difficulty" value={q.difficulty ?? ""} />
                        <input type="hidden" name="caanzRef" value={q.caanzRef ?? ""} />
                        <input type="hidden" name="ac61Ref" value={q.ac61Ref ?? ""} />
                        <input
                          type="hidden"
                          name="freeTrialEligible"
                          value={q.freeTrialEligible ? "" : "on"}
                        />
                        <button className="btn btn-g btn-sm" type="submit">
                          {q.freeTrialEligible ? "Eligible ✓" : "Not eligible"}
                        </button>
                      </form>
                    </td>
                    <td>
                      <Link className="btn btn-g btn-sm" href={`/admin/mocks/questions/${q.id}?trial=1`}>
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}
