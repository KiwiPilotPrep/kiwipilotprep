"use client";

import { useActionState } from "react";

import {
  updateContactStatus,
  type ContactStatusResult,
} from "@/app/admin/contact-actions";

/**
 * The Working / Resolve / Reopen buttons on one message.
 *
 * A single form with three submit buttons, each carrying the status it
 * means, so the action is one code path rather than three near-copies.
 *
 * While it is in flight the buttons are disabled and the pressed one says
 * so; afterwards the row says what happened. Previously they were plain
 * forms that navigated and looked identical on the way back, which is how
 * an admin ends up clicking Resolve three times and never being sure.
 *
 * Without JavaScript this is still a form that posts and still changes the
 * status — the feedback is the part that needs the client.
 */
export default function ContactStatusActions({
  id,
  status,
}: {
  id: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
}) {
  const [result, formAction, pending] = useActionState<ContactStatusResult, FormData>(
    updateContactStatus,
    null,
  );

  // Only this row's own result. One action state per row, but the id is
  // checked anyway so a stale result can never be shown against a
  // different message.
  const mine = result && (result.ok ? result.id === id : true) ? result : null;

  // Which buttons this row offers, given where it already is.
  const offered: { to: string; label: string }[] = [
    ...(status !== "IN_PROGRESS" ? [{ to: "IN_PROGRESS", label: "Working" }] : []),
    ...(status !== "RESOLVED" ? [{ to: "RESOLVED", label: "Resolve" }] : []),
    ...(status === "RESOLVED" ? [{ to: "NEW", label: "Reopen" }] : []),
  ];

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <div className="acts" style={{ gap: "6px", flexWrap: "nowrap" }}>
        {offered.map((o) => (
          <button
            key={o.to}
            className="btn btn-g btn-sm"
            type="submit"
            name="status"
            value={o.to}
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? "Saving…" : o.label}
          </button>
        ))}
      </div>
      {mine && (
        <p
          className="xs"
          role="status"
          style={{ marginTop: "6px", color: mine.ok ? undefined : "var(--red, #9C3A28)" }}
        >
          {mine.message}
        </p>
      )}
    </form>
  );
}
