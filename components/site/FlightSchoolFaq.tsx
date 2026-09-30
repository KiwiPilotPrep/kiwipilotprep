"use client";

import { useState } from "react";

const ITEMS = [
  {
    q: "How many seats do we need?",
    a: "One per student who needs access at the same time. Seats are reusable — release a seat when a student finishes and it becomes available for the next intake, without buying more.",
  },
  {
    q: "What happens when a student leaves the school?",
    a: "Remove them and their seat is freed immediately. Their own account, study progress and mock history stay with them — we do not delete a student's record when a school stops sponsoring them.",
  },
  {
    q: "Can our instructors see other schools' students?",
    a: "No. Membership is resolved from the signed-in instructor's own account, so another school's pages return not-found rather than a permission error. The check is on the server, not in the interface.",
  },
  {
    q: "What can instructors see about a student?",
    a: "Course and subject progress, chapter completion, practice accuracy, mock history and KDR performance. Not passwords, not payment details, and not guarantee or refund information.",
  },
  {
    q: "Do students use the same platform as individual buyers?",
    a: "Yes — the same subjects, the same timed mock engine and the same KDR scorecards. A school seat grants access to that content; it does not put students on a different, lesser version.",
  },
  {
    q: "Does the pass guarantee apply to school-sponsored students?",
    a: "The guarantee is tied to a qualifying purchase and the published conditions. Talk to us about how it applies to your licence before you buy, and we will confirm it in writing rather than leave it ambiguous.",
  },
  {
    q: "How is a student invited?",
    a: "You enter their email and we send an invitation link. It expires in 14 days, can only be accepted from the address it was sent to, and can be revoked at any time before it is used.",
  },
  {
    q: "Can we pay in INR?",
    a: "Yes. Pricing is available in New Zealand dollars and Indian rupees.",
  },
];

/** Schools FAQ. Same accordion behaviour as the main site FAQ. */
export default function FlightSchoolFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="faq mt-l" id="fs-faq">
      {ITEMS.map((item, i) => (
        <div className={`fq${open === i ? " on" : ""}`} key={item.q}>
          <button
            className="fq-b"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            type="button"
          >
            {item.q}
            <span className="pm" />
          </button>
          <div
            className="fq-p"
            style={open === i ? { maxHeight: "400px" } : undefined}
          >
            <div className="in">{item.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
