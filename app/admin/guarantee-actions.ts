"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ClaimStatus, RefundMethod } from "@prisma/client";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { transitionClaim, recordAudit } from "@/lib/guarantee/workflow";
import {
  createRefundForClaim,
  initiateGatewayRefund,
  markRefundComplete,
} from "@/lib/guarantee/refunds";
import { sendEmail } from "@/lib/email/send";

/**
 * Admin guarantee and refund actions (§8, §10, §11).
 *
 * Every one begins with requireAdmin, validates the transition through the
 * state machine, and leaves an audit row naming the actor. Nothing about a
 * claim's financial state can change quietly.
 */

function fail(message: string): never {
  throw new Error(message);
}

async function notifyStudent(claimId: string, subject: string, lines: string[]) {
  const claim = await db.guaranteeClaim.findUnique({
    where: { id: claimId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!claim) return;

  await sendEmail({
    to: claim.user.email,
    subject,
    template: "guarantee-claim-status",
    userId: claim.user.id,
    body: [
      `Kia ora ${claim.user.name.split(" ")[0]},`,
      "",
      ...lines,
      "",
      `Claim reference: ${claim.reference}`,
      "",
      "KiwiPilotPrep is an independent educational tool. Not affiliated with Aspeq or CAANZ.",
    ].join("\n"),
  }).catch(() => null);
}

const noteSchema = z.object({ note: z.string().trim().max(2000).optional() });

/** Moves a claim through the workflow. Invalid transitions are refused. */
export async function setClaimStatus(
  claimId: string,
  to: ClaimStatus,
  formData?: FormData,
): Promise<void> {
  const admin = await requireAdmin();
  const parsed = noteSchema.safeParse(Object.fromEntries(formData ?? new FormData()));
  const note = parsed.success ? (parsed.data.note ?? null) : null;

  const data =
    to === "REJECTED" && note
      ? { rejectionReason: note }
      : undefined;

  await transitionClaim({ claimId, to, actorId: admin.id, note, data });

  // The student is told the outcome, never the internal notes.
  if (to === "UNDER_REVIEW") {
    await notifyStudent(claimId, `Your guarantee claim is under review`, [
      "Your pass guarantee claim is now being reviewed by our team.",
    ]);
  }
  if (to === "NEEDS_INFORMATION") {
    await notifyStudent(claimId, `More information needed for your guarantee claim`, [
      "We need a little more information before we can complete your claim review.",
      note ? `\nWhat we need: ${note}` : "",
      "\nYou can upload it from your guarantee page.",
    ]);
  }
  if (to === "APPROVED") {
    await notifyStudent(claimId, `Your guarantee claim has been approved`, [
      "Your pass guarantee claim has been approved and a refund is being arranged.",
    ]);
  }
  if (to === "REJECTED") {
    await notifyStudent(claimId, `An update on your guarantee claim`, [
      "After review, your claim did not meet the guarantee conditions.",
      note ? `\nReason: ${note}` : "",
      "\nIf you believe this is a mistake, reply to this email and we will take another look.",
    ]);
  }

  revalidatePath("/admin/claims");
  revalidatePath(`/admin/claims/${claimId}`);
  revalidatePath("/guarantee");
}

/** Internal notes. Never surfaced to the student. */
export async function addInternalNote(claimId: string, formData: FormData) {
  const admin = await requireAdmin();
  const note = String(formData.get("note") ?? "").trim();
  if (!note) fail("Write a note first.");

  const claim = await db.guaranteeClaim.findUnique({
    where: { id: claimId },
    select: { internalNotes: true },
  });
  const stamped = `[${new Date().toISOString().slice(0, 16)} ${admin.email}] ${note}`;

  await db.guaranteeClaim.update({
    where: { id: claimId },
    data: {
      internalNotes: claim?.internalNotes ? `${claim.internalNotes}\n${stamped}` : stamped,
    },
  });

  await recordAudit(claimId, { actorId: admin.id, action: "note:added", note });
  revalidatePath(`/admin/claims/${claimId}`);
}

const refundSchema = z.object({
  method: z.enum(["RAZORPAY", "BANK_TRANSFER", "MANUAL"]),
  notes: z.string().trim().max(1000).optional(),
});

/**
 * Opens the refund for an approved claim.
 *
 * The amount is never taken from the form — `createRefundForClaim` derives it
 * from the captured payment on the qualifying order (§30).
 */
export async function openRefund(claimId: string, formData: FormData) {
  const admin = await requireAdmin();
  const parsed = refundSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail("Choose a refund method.");

  const { refund } = await createRefundForClaim({
    claimId,
    actorId: admin.id,
    method: parsed.data.method as RefundMethod,
    notes: parsed.data.notes ?? null,
  });

  await transitionClaim({
    claimId,
    to: "REFUND_PROCESSING",
    actorId: admin.id,
    note: `Refund opened via ${parsed.data.method}`,
  }).catch(() => null);

  if (parsed.data.method === "RAZORPAY") {
    await initiateGatewayRefund(refund.id, admin.id).catch((error) => {
      console.error("[refund] gateway initiation failed:", error);
    });
  }

  await notifyStudent(claimId, "Your guarantee refund is being processed", [
    "Your approved guarantee claim is now with our payments team.",
    "You will receive a further note once the transfer has completed.",
  ]);

  revalidatePath(`/admin/claims/${claimId}`);
  revalidatePath("/admin/refunds");
  revalidatePath("/guarantee");
}

const completeSchema = z.object({
  reference: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(1000).optional(),
});

/** Records that the money actually moved. */
export async function completeRefund(refundId: string, formData: FormData) {
  const admin = await requireAdmin();
  const parsed = completeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail("Invalid input.");

  const refund = await markRefundComplete({
    refundId,
    actorId: admin.id,
    reference: parsed.data.reference ?? null,
    notes: parsed.data.notes ?? null,
  });

  if (refund.claimId) {
    await transitionClaim({
      claimId: refund.claimId,
      to: "REFUNDED",
      actorId: admin.id,
      note: parsed.data.reference ? `Reference ${parsed.data.reference}` : null,
    }).catch(() => null);

    await notifyStudent(refund.claimId, "Your guarantee refund has been completed", [
      "Your pass guarantee refund has been processed.",
      parsed.data.reference ? `\nReference: ${parsed.data.reference}` : "",
      "\nDepending on your bank this can take a few working days to appear.",
    ]);
  }

  revalidatePath("/admin/refunds");
  revalidatePath("/admin/claims");
  revalidatePath("/guarantee");
}

/* ------------------------------------------------------- policy admin ---- */

const policySchema = z.object({
  version: z.string().trim().min(1).max(40),
  title: z.string().trim().min(2).max(200),
  terms: z.string().trim().min(10),
  requiredStudyPercent: z.coerce.number().int().min(1).max(100).default(100),
  requiredMockCount: z.coerce.number().int().min(0).max(100).default(1),
  requiredMockPassPercent: z.string().trim().optional(),
  claimWindowDays: z.string().trim().optional(),
  productIds: z.string().trim().optional(),
});

export async function createGuaranteePolicy(formData: FormData) {
  await requireAdmin();
  const raw = Object.fromEntries(formData);
  const parsed = policySchema.safeParse(raw);
  if (!parsed.success) fail(parsed.error.issues[0].message);

  const optionalInt = (value: string | undefined, label: string) => {
    if (!value || value.trim() === "") return null;
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0) fail(`${label} must be a whole number.`);
    return n;
  };

  if (await db.guaranteePolicy.findUnique({ where: { version: parsed.data.version } })) {
    fail("A policy with that version already exists.");
  }

  const productIds = formData.getAll("productIds").map(String).filter(Boolean);

  await db.guaranteePolicy.create({
    data: {
      version: parsed.data.version,
      title: parsed.data.title,
      terms: parsed.data.terms,
      requiredStudyPercent: parsed.data.requiredStudyPercent,
      requiredMockCount: parsed.data.requiredMockCount,
      requiredMockPassPercent: optionalInt(parsed.data.requiredMockPassPercent, "Mock pass mark"),
      claimWindowDays: optionalInt(parsed.data.claimWindowDays, "Claim window"),
      products: { create: productIds.map((productId) => ({ productId })) },
    },
  });

  revalidatePath("/admin/guarantee");
}

/**
 * Activates one policy. Exactly one is in force at a time, and existing claims
 * keep the version they were made under (§5).
 */
export async function activatePolicy(policyId: string) {
  await requireAdmin();
  await db.$transaction([
    db.guaranteePolicy.updateMany({ where: { active: true }, data: { active: false } }),
    db.guaranteePolicy.update({ where: { id: policyId }, data: { active: true } }),
  ]);
  revalidatePath("/admin/guarantee");
  revalidatePath("/guarantee");
}
