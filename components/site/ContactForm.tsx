"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { submitContactMessage } from "@/lib/contact-actions";

const SUBJECTS = [
  { value: "general", label: "General Inquiry" },
  { value: "enterprise", label: "Flight School Enterprise" },
  { value: "error", label: "Report Question Error" },
  { value: "refund", label: "Claim Pass Guarantee Refund" },
] as const;

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = /\.(pdf|jpe?g|png)$/i;

type Errors = Partial<Record<"name" | "email" | "subject" | "message" | "files" | "consent", string>>;

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/** PRD 4.2 contact + refund submission form. */
export default function ContactForm({ initialSubject = "" }: { initialSubject?: string }) {
  const [subject, setSubject] = useState(initialSubject);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [note, setNote] = useState<{ text: string; bad: boolean } | null>(null);
  const [over, setOver] = useState(false);
  // `useActionState` posts through the server action whether or not the
  // page has hydrated, so a message is never lost to a slow connection.
  const [result, formAction, pending] = useActionState(submitContactMessage, null);

  /**
   * The input the files are actually posted from.
   *
   * The chips above are React state, built from the picker and from drops,
   * and a file input's own list cannot be assigned from an array — so the
   * state is copied into a real `FileList` here through a DataTransfer.
   * Without this the form posted a count and no files, which is how the
   * result sheet on a guarantee claim used to disappear between the student
   * pressing Send and an admin opening the message.
   */
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = fileInput.current;
    if (!el || typeof DataTransfer === "undefined") return;
    const dt = new DataTransfer();
    for (const f of files) dt.items.add(f);
    el.files = dt.files;
  }, [files]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    let rejected = false;
    const accepted: File[] = [];
    Array.from(list).forEach((f) => {
      if (!ACCEPT.test(f.name) || f.size > MAX_BYTES) rejected = true;
      else accepted.push(f);
    });
    setFiles((prev) => [...prev, ...accepted]);
    setErrors((e) => ({
      ...e,
      files: rejected ? "Attachments must be PDF, JPG or PNG and under 10 MB." : undefined,
    }));
  }

  /**
   * Client-side validation, as an enhancement only.
   *
   * It cancels the submit when something is obviously wrong so the sender
   * gets an answer without a round trip. When everything checks out it does
   * nothing and lets the form post to the server action, which validates
   * again and is the thing that actually decides.
   */
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      next.email = "Please enter a valid email address.";
    if (!subject) next.subject = "Please choose what your message is about.";
    if (message.length < 10) next.message = "Please tell us a little about your enquiry.";
    // A guarantee claim is not actionable without the official result sheet.
    if (subject === "refund" && files.length === 0)
      next.files = "A pass guarantee claim needs your official Aspeq result sheet attached.";
    // Affirmative agreement before we process a message and any attachments.
    if (form.get("consent") !== "on")
      next.consent = "Please agree to the Privacy Policy so we can respond.";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      e.preventDefault();
      setNote({ text: "Please check the highlighted fields and try again.", bad: true });
      return;
    }
    setNote(null);
  }

  /** A field marked `.bad` shows its error message and reddens its border. */
  const fieldClass = (key: keyof Errors) => `fld${errors[key] ? " bad" : ""}`;

  return (
    <section className="sec tint" id="contact">
      <div className="wrap">
        <div className="sec-head center r in">
          <div className="eyebrow">Contact</div>
          <h2 className="h2">Talk to us, or claim your guarantee.</h2>
          <p className="lede">
            General questions, flight school enquiries, question corrections and
            pass-guarantee refunds all come through this one form.
          </p>
        </div>

        <div className="cgrid mt-l">
          <div className="r in">
            <div className="cpoint">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3.5 6.5h17v11h-17z" />
                <path d="M3.5 7l8.5 6 8.5-6" />
              </svg>
              <div>
                <b>General enquiries</b>
                <p>Questions about subjects, access or how the platform works.</p>
              </div>
            </div>
            <div className="cpoint">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 20.5V9l8-5.5 8 5.5v11.5z" />
                <path d="M9.5 20.5v-6h5v6" />
              </svg>
              <div>
                <b>Flight school enterprise</b>
                <p>Bulk licensing and an instructor dashboard for tracking student progress.</p>
              </div>
            </div>
            <div className="cpoint">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16.2h.01" />
              </svg>
              <div>
                <b>Report a question error</b>
                <p>Spotted something wrong in a question or explanation? Tell us and we will correct it.</p>
              </div>
            </div>
            <div className="cpoint">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.8l7.4 3v5.7c0 4.4-3.1 8.2-7.4 9.7-4.3-1.5-7.4-5.3-7.4-9.7V5.8z" />
                <path d="M8.8 12.2l2.3 2.3 4.1-4.6" />
              </svg>
              <div>
                <b>Claim the pass guarantee</b>
                <p>Attach your official Aspeq result sheet and we will process a full bank-transfer refund.</p>
              </div>
            </div>
          </div>

          <form className="cform r in" action={formAction} onSubmit={onSubmit} noValidate>
            <div className="frow">
              <div className={fieldClass("name")}>
                <label htmlFor="c-name">
                  Full Name <span className="reqd" aria-hidden="true">*</span>
                </label>
                <input id="c-name" name="name" type="text" autoComplete="name" placeholder="Jordan Ngata" />
                <p className="ferr">{errors.name}</p>
              </div>
              <div className={fieldClass("email")}>
                <label htmlFor="c-email">
                  Email Address <span className="reqd" aria-hidden="true">*</span>
                </label>
                <input id="c-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
                <p className="ferr">{errors.email}</p>
              </div>
            </div>

            <div className={fieldClass("subject")}>
              <label htmlFor="c-subject">
                What is this about? <span className="reqd" aria-hidden="true">*</span>
              </label>
              <div className="selwrap">
                <select
                  id="c-subject"
                  name="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="">Choose a subject…</option>
                  {SUBJECTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="ferr">{errors.subject}</p>
              {subject === "refund" && (
                <p className="fhint gua-hint on">
                  Attach your official Aspeq result sheet below. Refunds require 100% of study
                  modules and all mock exams to have been completed.
                </p>
              )}
            </div>

            <div className={fieldClass("message")}>
              <label htmlFor="c-msg">
                Message <span className="reqd" aria-hidden="true">*</span>
              </label>
              <textarea
                id="c-msg"
                name="message"
                placeholder="Tell us what you need — the more detail, the faster we can help."
              />
              <p className="ferr">{errors.message}</p>
            </div>

            <div className={fieldClass("files")}>
              <label htmlFor="c-file">Attachment</label>
              <label
                className={`drop${over ? " over" : ""}`}
                htmlFor="c-file"
                onDragEnter={(e) => {
                  e.preventDefault();
                  setOver(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(true);
                }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setOver(false);
                  addFiles(e.dataTransfer.files);
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.5 15v3.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V15" />
                  <path d="M7.5 9L12 4.5 16.5 9M12 4.5v11" />
                </svg>
                <span>
                  <b>Attach your KDR or score sheet</b>
                  <span>PDF, JPG or PNG · up to 10 MB each</span>
                </span>
                <input
                  id="c-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>

              <div className="files">
                {files.map((f, n) => (
                  <div className="file" key={`${f.name}-${n}`}>
                    <span>{f.name}</span>
                    <span className="fsz">{humanSize(f.size)}</span>
                    <button
                      type="button"
                      aria-label="Remove attachment"
                      onClick={() => setFiles((prev) => prev.filter((_, k) => k !== n))}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <p className="ferr">{errors.files}</p>
            </div>

            {/* Carries the files themselves. Hidden because the drop zone
                above is the control a person uses; this is where what they
                chose is handed to the server. */}
            <input
              ref={fileInput}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              id="c-files-payload"
              name="files"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
            />
            <div className={fieldClass("consent")}>
              <label className="consent">
                <input type="checkbox" name="consent" value="on" />
                <span>
                  I agree to KiwiPilotPrep using my message and any attached documents to respond to
                  my enquiry, in line with the{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                </span>
              </label>
              <p className="ferr">{errors.consent}</p>
            </div>

            <button className="btn btn-p btn-w" type="submit" disabled={pending}>
              Send Message
            </button>

            {(result || note) && (
              <p
                className={`fnote on${result ? (result.ok ? "" : " warn") : note?.bad ? " warn" : ""}`}
                role="status"
                aria-live="polite"
              >
                {result
                  ? result.ok
                    ? `Thanks ${result.name.split(" ")[0]} — your message has been received. We reply to every enquiry, usually within one working day.`
                    : result.error
                  : note?.text}
              </p>
            )}

            <p className="fhint" style={{ marginTop: "14px" }}>
              Submissions route to support@kiwipilotprep.com. We usually reply within 3 working days.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
