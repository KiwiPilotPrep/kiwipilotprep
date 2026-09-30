import { requireRole } from "@/lib/auth";
import { listStudents } from "@/lib/admin/student-history";
import StudentList from "@/components/admin/StudentList";

export const metadata = { title: "Student History — Admin" };

const PAGE = 50;

/**
 * Student History — the record, on its own, reachable without a claim.
 *
 * Students & Access exists to change what somebody can reach. This exists to
 * read what they have done: what they bought, what it cost them at the time,
 * how far through the course they are and how their mocks went. An admin
 * answering a support question should not have to open a refund claim to see
 * any of that.
 *
 * The list is shown immediately. Searching filters it; clearing restores it.
 */
export default async function AdminStudentHistoryListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; skip?: string }>;
}) {
  await requireRole("ADMIN");
  const { q = "", skip: skipParam } = await searchParams;
  const skip = Math.max(0, Number.parseInt(skipParam ?? "0", 10) || 0);

  const { rows, total, query } = await listStudents({ query: q, take: PAGE, skip });

  return (
    <>
      <div className="ahead">
        <div>
          <h1>Student History</h1>
          <p>
            Every student&rsquo;s purchases, access, progress and mock attempts in one place.
            Open a student to see their full record.
          </p>
        </div>
      </div>

      <StudentList
        rows={rows}
        total={total}
        query={query}
        skip={skip}
        take={PAGE}
        basePath="/admin/history"
      />
    </>
  );
}
