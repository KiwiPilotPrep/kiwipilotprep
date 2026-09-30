import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";

/**
 * The student record moved to Student History, which is a section of its
 * own rather than a leaf of Students & Access.
 *
 * Kept as a redirect because links to it exist — in support tickets, in
 * browser history, and in anything an admin bookmarked.
 */
export default async function LegacyStudentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  await requireRole("ADMIN");
  const { studentId } = await params;
  redirect(`/admin/history/${studentId}`);
}
