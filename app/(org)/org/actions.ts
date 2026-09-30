"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { emailBaseUrl } from "@/lib/site-url";
import { requireUser } from "@/lib/auth";
import { requireMembership, requireOrgStudent, OrgError } from "@/lib/org/access";
import { assignSeat, revokeSeat, createInvitation } from "@/lib/org/seats";
import { sendEmail } from "@/lib/email/send";
import { renderEmail, renderText } from "@/lib/email/templates";

/**
 * Flight school actions.
 *
 * Every one resolves the caller's membership of the organisation named in the
 * arguments before doing anything. The organizationId in a form post is a
 * claim, not a credential (§28).
 */

export async function inviteStudent(organizationId: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  const membership = await requireMembership(user, organizationId, "invitations");

  const email = String(formData.get("email") ?? "").trim();
  const licenseId = String(formData.get("licenseId") ?? "").trim() || null;

  try {
    const { invitation, token } = await createInvitation({
      organizationId,
      email,
      licenseId,
      invitedById: user.id,
    });

    const link = `${await emailBaseUrl()}/invite/${token}`;

    // Same branded layout as verification and password reset — one email
    // service and one look, rather than a second style for enterprise mail.
    const content = {
      heading: `${membership.organizationName} has invited you`,
      paragraphs: [
        "Kia ora,",
        `${membership.organizationName} has invited you to join their KiwiPilotPrep account, which gives you access to the material they have paid for.`,
      ],
      action: { label: "Accept invitation", url: link },
      footnotes: [
        `This invitation expires on ${invitation.expiresAt.toLocaleDateString("en-NZ")}.`,
        "If you do not have an account yet, you can create one on the same page.",
      ],
    };

    await sendEmail({
      to: invitation.email,
      subject: `You have been invited to ${membership.organizationName} on KiwiPilotPrep`,
      template: "org-invitation",
      // Carries a single-use invitation token; keep it out of the mail log.
      sensitive: true,
      body: renderText(content),
      html: renderEmail(content),
    }).catch(() => null);

    revalidatePath(`/org/${organizationId}/students`);
    redirect(`/org/${organizationId}/students?invited=${encodeURIComponent(invitation.email)}`);
  } catch (error) {
    if (error instanceof OrgError) {
      redirect(`/org/${organizationId}/students?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
}

export async function revokeInvitation(organizationId: string, invitationId: string) {
  const user = await requireUser();
  await requireMembership(user, organizationId, "invitations");

  await db.organizationInvitation.updateMany({
    // Scoped by organisation, so an id from another school matches nothing.
    where: { id: invitationId, organizationId, status: "PENDING" },
    data: { status: "REVOKED" },
  });

  revalidatePath(`/org/${organizationId}/students`);
}

export async function assignStudentSeat(
  organizationId: string,
  licenseId: string,
  studentUserId: string,
): Promise<void> {
  const user = await requireUser();
  await requireMembership(user, organizationId, "seats");

  try {
    await assignSeat({ organizationId, licenseId, studentUserId });

    const student = await db.user.findUnique({
      where: { id: studentUserId },
      select: { email: true, name: true },
    });
    const license = await db.enterpriseLicense.findUnique({
      where: { id: licenseId },
      include: { product: { select: { title: true } } },
    });

    if (student && license) {
      await sendEmail({
        to: student.email,
        subject: `Your KiwiPilotPrep access is ready`,
        template: "seat-assigned",
        userId: studentUserId,
        body: [
          `Kia ora ${student.name.split(" ")[0]},`,
          "",
          `Your flight school has assigned you access to ${license.product.title}.`,
          "",
          `Start studying: ${await emailBaseUrl()}/dashboard`,
          "",
          "KiwiPilotPrep is an independent educational tool. Not affiliated with Aspeq or CAANZ.",
        ].join("\n"),
      }).catch(() => null);
    }

    revalidatePath(`/org/${organizationId}/students`);
    revalidatePath(`/org/${organizationId}/seats`);
    redirect(`/org/${organizationId}/seats?assigned=1`);
  } catch (error) {
    if (error instanceof OrgError) {
      redirect(`/org/${organizationId}/seats?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
}

export async function revokeStudentSeat(organizationId: string, seatId: string): Promise<void> {
  const user = await requireUser();
  await requireMembership(user, organizationId, "seats");

  try {
    await revokeSeat({ organizationId, seatId });
    revalidatePath(`/org/${organizationId}/seats`);
    revalidatePath(`/org/${organizationId}/students`);
    redirect(`/org/${organizationId}/seats?revoked=1`);
  } catch (error) {
    if (error instanceof OrgError) {
      redirect(`/org/${organizationId}/seats?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
}

/**
 * Removes a student from the school.
 *
 * Marks the enrolment REMOVED and frees their seats. Their account, progress
 * and mock history are untouched — the student keeps their own records (§23).
 */
export async function removeStudent(organizationId: string, studentUserId: string) {
  const user = await requireUser();
  await requireMembership(user, organizationId, "students");

  const link = await requireOrgStudent(organizationId, studentUserId);

  await db.$transaction(async (tx) => {
    const seats = await tx.enterpriseSeat.findMany({
      where: { organizationStudentId: link.id, status: "ASSIGNED" },
      select: { id: true },
    });

    await tx.enterpriseSeat.updateMany({
      where: { id: { in: seats.map((s) => s.id) } },
      data: { status: "AVAILABLE", organizationStudentId: null, revokedAt: new Date(), assignedAt: null },
    });

    await tx.organizationStudent.update({
      where: { id: link.id },
      data: { status: "REMOVED", removedAt: new Date() },
    });
  });

  revalidatePath(`/org/${organizationId}/students`);
}
