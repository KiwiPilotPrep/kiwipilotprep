"use client";

import { useFormStatus } from "react-dom";

/**
 * The control that finishes a topic and opens the following one.
 *
 * It replaces a pair — "Mark complete" in the tool rail and a separate "Next"
 * link in the pager — because the pair asked the reader to tell the site
 * something it could already see. Pressing Next is what records the
 * completion; opening the page is not.
 *
 * A plain form posting a server action, so the completion is written by the
 * server rather than trusted from the browser, and the button still works
 * before the page has hydrated. While the action is in flight the button
 * disables itself: the action is idempotent anyway, but a disabled button says
 * the press was received, which a student pressing twice because nothing
 * appeared to happen is entitled to.
 */
function Button({ label, title }: { label: string; title: string | null }) {
  const { pending } = useFormStatus();

  return (
    <button className="pager-next" type="submit" disabled={pending} rel="next">
      <small>{pending ? "Saving…" : label}</small>
      {title && <em>{title}</em>}
    </button>
  );
}

export default function NextLesson({
  action,
  next,
}: {
  action: () => Promise<void>;
  /** The topic this leads to, or null on the last one of the subject. */
  next: { title: string } | null;
}) {
  return (
    <form action={action} className="pager-form">
      <Button label={next ? "Next →" : "Finish topic"} title={next?.title ?? null} />
    </form>
  );
}
