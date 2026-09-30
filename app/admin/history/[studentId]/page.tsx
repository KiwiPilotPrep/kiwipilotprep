import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { studentHistory } from "@/lib/admin/student-history";
import { Crumb } from "@/components/admin/ui";
import StudentHistoryView from "@/components/admin/StudentHistory";
import GuaranteeEligibility from "@/components/admin/GuaranteeEligibility";

export const metadata = { title: "Student history — Admin" };

/**
 * One student, everything about them.
 *
 * The same data and the same component the guarantee claim review uses, so
 * an admin answering a support question and an admin assessing a refund are
 * looking at the same record rather than two views that might disagree.
 *
 * Admin-only, enforced here on the server. Nothing on this page is reachable
 * by changing an id in the address bar as a student.
 */
export default async function AdminStudentHistoryPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  await requireRole("ADMIN");
  const { studentId } = await params;

  const data = await studentHistory(studentId);
  if (!data) notFound();

  return (
    <>
      <Crumb
        trail={[
          { href: "/admin/history", label: "Student History" },
          { label: data.student.name },
        ]}
      />

      <div className="ahead">
        <div>
          <h1>{data.student.name}</h1>
          <p>
            {data.student.email} · joined{" "}
            {data.student.createdAt.toLocaleDateString("en-NZ")}
          </p>
        </div>
        <div className="acts" style={{ gap: "8px" }}>
          <Link className="btn btn-g btn-sm" href="/admin/history">
            Back to Student History
          </Link>
          <Link className="btn btn-g btn-sm" href={`/admin/students?grant=${data.student.id}`}>
            Grant access
          </Link>
        </div>
      </div>

      <StudentHistoryView data={data} allowAccessChanges />
      <GuaranteeEligibility assessment={data.guarantee} />
    </>
  );
}
