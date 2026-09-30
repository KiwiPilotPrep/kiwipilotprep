"use server";

import crypto from "node:crypto";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assessGuarantee } from "@/lib/guarantee/eligibility";
import { transitionClaim, recordAudit, ClaimError } from "@/lib/guarantee/workflow";
import { putFile, validateUpload, StorageError } from "@/lib/storage";
import { sendEmail } from "@/lib/email/send";
import { rateLimit } from "@/lib/rate-limit";

/**
 * The student side of a guarantee claim: submit one, and add a document when
 * more is asked for.
 *
 * Everything that decides an outcome is recomputed here, server-side. The
 * eligibility, the pinned snapshot and the refund amount all come from the
 * database, never from anything the form carried.
 */

/** A human-quotable claim reference, e.g. GC-LZ4K9-1A2B. */
function reference() {
  return `GC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
}

export async function submitClaim(formData: FormData) {
  const user = await requireUser();

  const assessment = await assessGuarantee(user.id);
  if (!assessment.applicable || !assessment.orderId || !assessment.policyId) {
    redirect("/guarantee?error=not-applicable");
  }
  if (assessment.existingClaim && assessment.existingClaim.status !== "DRAFT") {
    redirect("/guarantee?error=duplicate");
  }
  if (!assessment.eligible) {
    redirect("/guarantee?error=not-eligible");
  }

  const examName = String(formData.get("examName") ?? "").trim();
  const examResult = String(formData.get("examResult") ?? "").trim();
  const sittingRaw = String(formData.get("examSittingDate") ?? "").trim();
  const note = String(formData.get("studentNote") ?? "").trim();
  const file = formData.get("document");

  if (examName.length < 2) redirect("/guarantee?error=exam-name");
  if (!(file instanceof File) || file.size === 0) redirect("/guarantee?error=document-required");

  const problem = validateUpload(file);
  if (problem) redirect(`/guarantee?error=document&detail=${encodeURIComponent(problem)}`);

  let stored;
  try {
    stored = await putFile(`guarantee/${user.id}`, file);
  } catch (error) {
    const message = error instanceof StorageError ? error.message : "Upload failed.";
    redirect(`/guarantee?error=document&detail=${encodeURIComponent(message)}`);
  }

  const claim = await db.$transaction(async (tx) => {
    const created = await tx.guaranteeClaim.upsert({
      where: { userId_orderId: { userId: user.id, orderId: assessment.orderId! } },
      create: {
        reference: reference(),
        userId: user.id,
        orderId: assessment.orderId!,
        policyId: assessment.policyId!,
        status: "DRAFT",
        examName,
        examResult: examResult || null,
        examSittingDate: sittingRaw ? new Date(sittingRaw) : null,
        studentNote: note || null,
        // Pinned at submission so later progress or policy changes cannot
        // rewrite what was assessed (§5).
        studyPercentAtClaim: assessment.studyPercent,
        mocksCompletedAtClaim: assessment.mocksCompleted,
        policyVersionAtClaim: assessment.policyVersion,
      },
      update: {
        examName,
        examResult: examResult || null,
        examSittingDate: sittingRaw ? new Date(sittingRaw) : null,
        studentNote: note || null,
      },
    });
    await tx.guaranteeDocument.create({
      data: {
        claimId: created.id,
        storageKey: stored.storageKey,
        filename: stored.filename,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        uploadedById: user.id,
      },
    });
    return created;
  });

  await transitionClaim({
    claimId: claim.id,
    to: "SUBMITTED",
    actorId: user.id,
    note: "Submitted by student",
  }).catch((error) => {
    if (!(error instanceof ClaimError)) throw error;
  });

  await sendEmail({
    to: user.email,
    subject: `Guarantee claim ${claim.reference} received`,
    template: "guarantee-claim-submitted",
    userId: user.id,
    body: [
      `Kia ora ${user.name.split(" ")[0]},`,
      "",
      `We have received your pass guarantee claim ${claim.reference}.`,
      "",
      `  Purchase:   ${assessment.productTitle} (${assessment.orderReference})`,
      `  Study:      ${assessment.studyPercent}%`,
      `  Mocks:      ${assessment.mocksCompleted} of ${assessment.requiredMockCount}`,
      "",
      "Our team will review your submitted result sheet against the guarantee",
      "terms and be in touch. Submitting a claim does not by itself approve a",
      "refund — eligibility is verified first.",
      "",
      "KiwiPilotPrep is an independent educational tool. Not affiliated with Aspeq or CAANZ.",
    ].join("\n"),
  }).catch(() => null);

  revalidatePath("/guarantee");
  revalidatePath("/dashboard");
  redirect(`/guarantee?submitted=${claim.reference}`);
}

export async function addClaimDocument(claimId: string, formData: FormData) {
  const user = await requireUser();

  const claim = await db.guaranteeClaim.findUnique({ where: { id: claimId } });
  if (!claim || claim.userId !== user.id) redirect("/guarantee?error=not-found");
  if (claim.status === "REFUNDED" || claim.status === "CLOSED") {
    redirect("/guarantee?error=closed");
  }

  const file = formData.get("document");
  if (!(file instanceof File) || file.size === 0) redirect("/guarantee?error=document-required");

  const problem = validateUpload(file);
  if (problem) redirect(`/guarantee?error=document&detail=${encodeURIComponent(problem)}`);

  // Uploads consume disk that is never automatically reclaimed, so a claim
  // cannot be used to fill the volume. Twelve files an hour is far more than
  // any genuine claim needs.
  const uploads = await rateLimit(`claim-upload:${user.id}`, {
    limit: 12,
    windowMs: 60 * 60_000,
  });
  if (!uploads.ok) {
    redirect(
      "/guarantee?error=document&detail=" +
        encodeURIComponent("Too many uploads in a short time. Please try again shortly."),
    );
  }

  const stored = await putFile(`guarantee/${user.id}`, file);
  await db.guaranteeDocument.create({
    data: {
      claimId: claim.id,
      storageKey: stored.storageKey,
      filename: stored.filename,
      mimeType: stored.mimeType,
      sizeBytes: stored.sizeBytes,
      uploadedById: user.id,
    },
  });

  await recordAudit(claim.id, {
    actorId: user.id,
    action: "document:added",
    note: stored.filename,
  });

  // Answering a request for information puts the claim back in the queue.
  if (claim.status === "NEEDS_INFORMATION") {
    await transitionClaim({
      claimId: claim.id,
      to: "SUBMITTED",
      actorId: user.id,
      note: "Student supplied additional information",
    }).catch(() => null);
  }

  revalidatePath("/guarantee");
  redirect("/guarantee?added=1");
}
