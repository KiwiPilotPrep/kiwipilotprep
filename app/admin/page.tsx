import { db } from "@/lib/db";

export default async function AdminDashboard() {
  const [courses, subjects, chapters, questions, students, attempts, completions] =
    await Promise.all([
      db.course.count({ where: { status: { not: "ARCHIVED" } } }),
      db.subject.count({ where: { status: { not: "ARCHIVED" } } }),
      db.chapter.count({ where: { status: { not: "ARCHIVED" } } }),
      db.question.count({ where: { status: { not: "ARCHIVED" } } }),
      db.user.count({ where: { role: "STUDENT" } }),
      db.questionAttempt.count(),
      db.chapterProgress.count({ where: { completedAt: { not: null } } }),
    ]);

  const recent = await db.chapterProgress.findMany({
    where: { completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    take: 8,
    include: {
      user: { select: { name: true } },
      chapter: { select: { title: true, subject: { select: { title: true } } } },
    },
  });

  const tiles = [
    { v: courses, l: "Courses" },
    { v: subjects, l: "Subjects" },
    { v: chapters, l: "Chapters" },
    { v: questions, l: "Questions" },
    { v: students, l: "Students" },
    { v: completions, l: "Chapters completed" },
    { v: attempts, l: "Question attempts" },
  ];

  return (
    <>
      <div className="ahead">
        <div>
          <h1>Dashboard</h1>
          <p>
            Live counts, read from the database on every load. Courses, subjects and chapters are
            built from the curriculum in code; what is managed here is examinations, commerce and
            people.
          </p>
        </div>
        {/* The courses CTA is gone with the courses admin: the curriculum is
            built from `content/` and reviewed in code. */}
      </div>

      <div className="tiles">
        {tiles.map((t) => (
          <div className="tile" key={t.l}>
            <div className="v">{t.v}</div>
            <div className="l">{t.l}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-hd">
          <h2>Recent chapter completions</h2>
        </div>
        {recent.length === 0 ? (
          <div className="empty">
            <b>No completions yet</b>
            Once students start marking chapters complete they will appear here.
          </div>
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>Student</th>
                <th>Subject</th>
                <th>Chapter</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id}>
                  <td className="nm">{r.user.name}</td>
                  <td>{r.chapter.subject.title}</td>
                  <td>{r.chapter.title}</td>
                  <td>{r.completedAt?.toLocaleString("en-NZ") ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
