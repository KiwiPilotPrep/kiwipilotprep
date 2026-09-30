"use client";

/**
 * The Mark Complete control in the study tool rail.
 *
 * A plain form posting a server action, so it works without JavaScript and the
 * completion is written by the server rather than trusted from the client.
 */
export default function MarkComplete({
  action,
  completed,
}: {
  action: () => Promise<void>;
  completed: boolean;
}) {
  return (
    <form action={action}>
      <button className={`tool-btn${completed ? " is-done" : ""}`} type="submit">
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" strokeWidth="1.9"
          strokeLinecap="round" strokeLinejoin="round">
          {completed ? <path d="M5 12.5l4.5 4.5L19 7" /> : <circle cx="12" cy="12" r="8.5" />}
        </svg>
        <span>{completed ? "Completed" : "Mark complete"}</span>
      </button>
    </form>
  );
}
