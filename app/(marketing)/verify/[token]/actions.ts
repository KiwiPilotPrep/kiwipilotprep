"use server";

import { redirect } from "next/navigation";

import { consumeVerificationToken } from "@/lib/verification";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Redeems a verification token.
 *
 * This runs on a POST, and that is the security property rather than a detail
 * of how the page is built: the link in a confirmation email is fetched by
 * mail security scanners, link preview bots and antivirus proxies before any
 * person sees it, and every one of those issues a GET. While redemption lived
 * in the page's own render, such a fetch confirmed the address on the
 * recipient's behalf — so an address could be verified without its owner ever
 * clicking, which is exactly what email verification exists to rule out.
 *
 * No session is required, deliberately. People open these links in whatever
 * browser their mail app hands them, which is often not the one they signed up
 * in; the token is the proof, and the page points them at the login form
 * afterwards rather than telling them the link failed.
 */
export async function confirmEmailAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");

  // The token is unguessable, so this is not protecting the token itself —
  // it caps the cost of someone replaying one URL at the database.
  const limit = await rateLimit(`verify-confirm:${token.slice(0, 16)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!limit.ok) redirect(`/verify/${encodeURIComponent(token)}?busy=1`);

  const result = await consumeVerificationToken(token);

  if (!result.ok) {
    // Back to the same page, which will render the expired or unusable state
    // from a fresh read rather than this action guessing at the copy.
    redirect(`/verify/${encodeURIComponent(token)}`);
  }

  redirect(result.alreadyVerified ? "/verify/confirmed?already=1" : "/verify/confirmed");
}
