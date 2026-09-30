import Link from "next/link";

import { db } from "@/lib/db";
import { createMockExam, setMockStatus, deleteMockExam } from "@/app/admin/mock-actions";
import { StatusPill, StatusSelect, Empty } from "@/components/admin/ui";
import MockTabs from "@/components/admin/MockTabs";

export default async function AdminMocksPage() {
  const [exams, courses] = await Promise.all([
    db.mockExam.findMany({
      // The free trials are provisioned by the application, one per subject,
      // and are managed on their own tab. Fifteen of them in this list would
      // bury the paid mocks it exists to show.
      where: { isFreeTrial: false },
      orderBy: [{ status: "asc" }, { order: "asc" }],
      include: {
        course: { select: { title: true } },
        subject: { select: { title: true } },
        _count: { select: { attempts: true, picks: true } },
      },
    }),
    db.course.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: { order: "asc" },
      select: {
        id: true, title: true,
        subjects: { where: { status: { not: "ARCHIVED" } }, orderBy: { order: "asc" }, select: { id: true, title: true } },
      },
    }),
  ]);

  return (
    <>
      <MockTabs current="/admin/mocks" />

      <div className="ahead">
        <div>
          <h1>Mock Exams</h1>
          <p>
            Question count, duration, pass mark and randomisation are all settings — questions are
            drawn from the live bank each time a student starts.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-hd">
          <h2>
            Paid mocks ({exams.length})
            <span className="xs">
              {" "}
              · {exams.filter((e) => e.status === "PUBLISHED").length} live. Free trials are on
              their own tab.
            </span>
          </h2>
        </div>
        {exams.length === 0 ? (
          <Empty title="No mock exams yet" hint="Create your first mock below." />
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>Mock</th><th>Draws from</th><th>Questions</th><th>Duration</th>
                <th>Pass mark</th><th>Attempts</th><th>Status</th><th />
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.id}>
                  <td className="nm">
                    <Link href={`/admin/mocks/${e.id}`}>{e.title}</Link>
                    <div className="xs">/{e.slug}</div>
                  </td>
                  <td>{e.subject?.title ?? e.course?.title ?? <span className="xs">Whole bank</span>}</td>
                  <td className="num">
                    {e.questionCount}
                    {e._count.picks > 0 && (
                      <div className="xs">{e._count.picks} picked</div>
                    )}
                  </td>
                  <td className="num">{e.durationMinutes} min</td>
                  <td className="num">{e.passingPercent === null ? "—" : `${e.passingPercent}%`}</td>
                  <td className="num">{e._count.attempts}</td>
                  <td><StatusPill status={e.status} /></td>
                  <td>
                    <div className="acts">
                      {e.status !== "PUBLISHED" ? (
                        <form action={setMockStatus.bind(null, e.id, "PUBLISHED")}>
                          <button className="btn btn-g btn-sm" type="submit">Publish</button>
                        </form>
                      ) : (
                        <form action={setMockStatus.bind(null, e.id, "DRAFT")}>
                          <button className="btn btn-g btn-sm" type="submit">Unpublish</button>
                        </form>
                      )}
                      {e.status !== "ARCHIVED" && (
                        <form action={setMockStatus.bind(null, e.id, "ARCHIVED")}>
                          <button className="btn btn-g btn-sm" type="submit">Archive</button>
                        </form>
                      )}
                      {/* Delete is only offered where it is actually a
                          delete. A mock somebody has sat is archived
                          instead — the action decides, and says so. */}
                      <form action={deleteMockExam.bind(null, e.id)}>
                        <button className="btn btn-d btn-sm" type="submit">
                          {e._count.attempts > 0 ? "Retire" : "Delete"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <div className="panel-hd"><h2>Create a mock exam</h2></div>
        <div className="panel-bd">
          <form className="inline-form" action={createMockExam}>
            <div className="fld">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" placeholder="e.g. PPL Air Law Mock 1" required />
            </div>
            <div className="fld">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" rows={2} />
            </div>

            <div className="fld">
              <label htmlFor="scope">Draw questions from</label>
              <div className="selwrap">
                <select id="scope" name="scope" defaultValue="">
                  <option value="">Whole question bank</option>
                  {courses.map((c) => (
                    <optgroup key={c.id} label={c.title}>
                      <option value={`course:${c.id}`}>Whole course — {c.title}</option>
                      {c.subjects.map((s) => (
                        <option key={s.id} value={`subject:${s.id}`}>Subject — {s.title}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <p className="fhint">Entitlement to sit the mock follows this choice.</p>
            </div>

            <div className="frow">
              <div className="fld">
                <label htmlFor="questionCount">Number of questions</label>
                <input id="questionCount" name="questionCount" type="number" min={1} max={200} defaultValue={20} />
              </div>
              <div className="fld">
                <label htmlFor="durationMinutes">Duration (minutes)</label>
                <input id="durationMinutes" name="durationMinutes" type="number" min={1} max={600} defaultValue={40} />
              </div>
            </div>

            <div className="frow">
              <div className="fld">
                <label htmlFor="passingPercent">Pass mark (%)</label>
                <input id="passingPercent" name="passingPercent" type="number" min={1} max={100} placeholder="70" />
                <p className="fhint">Blank means graded with no pass/fail.</p>
              </div>
              <StatusSelect />
            </div>

            <div className="frow">
              <div className="fld">
                <label htmlFor="kdrStrongPercent">KDR strong threshold (%)</label>
                <input id="kdrStrongPercent" name="kdrStrongPercent" type="number" min={1} max={100} defaultValue={80} />
              </div>
              <div className="fld">
                <label htmlFor="kdrWeakPercent">KDR weak threshold (%)</label>
                <input id="kdrWeakPercent" name="kdrWeakPercent" type="number" min={0} max={99} defaultValue={50} />
              </div>
            </div>

            <label className="chk">
              <input type="checkbox" name="randomize" defaultChecked />
              Randomise question order for each attempt
            </label>

            <button className="btn btn-p" type="submit">Create mock exam</button>
          </form>
        </div>
      </div>
    </>
  );
}
