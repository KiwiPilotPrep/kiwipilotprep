"use server";

import { revalidatePath } from "next/cache";
import type { ContactStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/**
 * Moves a contact message through the queue.
 *
 * The message itself is never edited: it is what the student wrote, and an
 * admin console that can quietly reword an enquiry is not a record of one.
 * Only the status changes.
 *
 * Shaped for `useActionState` so the button can say what happened. A status
 * button that looks identical before and after the click leaves an admin
 * guessing whether the click registered, and guessing usually means
 * clicking again.
 */

const STATUSES: ContactStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED"];

const PAST_TENSE: Record<ContactStatus, string> = {
  NEW: "Reopened",
  IN_PROGRESS: "Marked as being worked on",
  RESOLVED: "Resolved",
};

export type ContactStatusResult =
  | { ok: true; id: string; status: ContactStatus; message: string }
  | { ok: false; message: string }
  | null;

export async function updateContactStatus(
  _previous: ContactStatusResult,
  formData: FormData,
): Promise<ContactStatusResult> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as ContactStatus;

  if (!id) return { ok: false, message: "That message is no longer there." };
  if (!STATUSES.includes(status)) {
    return { ok: false, message: "That is not a status this queue uses." };
  }

  try {
    await db.contactMessage.update({ where: { id }, data: { status } });
  } catch {
    return { ok: false, message: "Could not save that. The message may have been removed." };
  }

  revalidatePath("/admin/claims");
  revalidatePath("/admin/queries");
  return { ok: true, id, status, message: PAST_TENSE[status] };
}

/**
 * The same change, for callers that already know the id and the status and
 * do not need a result — kept so a plain form still works without
 * JavaScript.
 */
export async function setContactStatus(id: string, status: ContactStatus) {
  await requireAdmin();
  await db.contactMessage.update({ where: { id }, data: { status } });
  revalidatePath("/admin/claims");
  revalidatePath("/admin/queries");
}
