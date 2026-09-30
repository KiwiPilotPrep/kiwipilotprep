"use client";

import { useFormStatus } from "react-dom";

/**
 * A submit button that admits it is working.
 *
 * The guarantee workflow does real things — it opens refunds and moves
 * money — and each of those takes a moment on the server. A button that
 * looks identical during that moment invites a second click, and a second
 * click on "Open refund" is exactly the event the duplicate-refund guard
 * exists to catch. Better not to invite it.
 *
 * `useFormStatus` reads the state of the form this sits inside, so there is
 * nothing to wire up per form and nothing to keep in sync.
 */
export default function SubmitButton({
  children,
  pendingLabel = "Working…",
  className = "btn btn-g btn-sm",
  disabled = false,
  title,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className={className}
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      title={title}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
