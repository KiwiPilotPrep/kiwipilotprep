import Link from "next/link";

import { requireVerifiedEmail } from "@/lib/auth";
import { trialState, TRIAL_QUESTION_COUNT, TRIAL_DURATION_MINUTES } from "@/lib/mock/trial";

import { beginTrial } from "./actions";

export const metadata = { title: "Free 10-question mock — KiwiPilotPrep" };

/**
 * Choose a subject, then sit the free ten-question mock.
 *
 * One free mock per account, not one per subject. Choosing a subject spends
 * it, which is why the page says so before the choice is made rather than
 * after — a student who picks Air Law and then wonders where Navigation went
 * was not told enough.
 *
 * Everything after the choice is the ordinary mock engine: the same timed
 * paper, the same scorecard, revision areas, report and email a paid mock
 * produces.
 */
const REASON: Record<string, string> = {
  NOT_READY: "That subject does not have enough free questions available yet.",
  FORBIDDEN: "You have already used your free mock.",
  EXPIRED: "Your previous attempt ran out of time and has been submitted.",
  NOT_ENOUGH_QUESTIONS: "That subject does not have enough free questions available yet.",
};

export default async function TrialPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireVerifiedEmail();
  const { error } = await searchParams;
  const { subjects, used } = await trialState(user.id);

  /* ------------------------------------------------------------- spent */

  if (used) {
    return (
      <div className="wrap sec">
        <div className="sec-head">
          <div className="eyebrow">Free mock</div>
          <h1 className="h2">Free Trial used</h1>
          <p className="lede mt-s">
            You have already completed your free {TRIAL_QUESTION_COUNT}-question mock
            {used.subjectTitle ? ` in ${used.subjectTitle}` : ""}. There is one per account, so it
            cannot be taken again in another subject.
          </p>
        </div>

        <div className="cnote info" style={{ marginTop: "22px" }}>
          <b>Explore our full courses to continue practising</b>
          <p>
            Full-length mock exams, every subject, unlimited attempts and the complete study
            material come with a package.
          </p>
          <div className="acts" style={{ marginTop: "12px", gap: "10px", flexWrap: "wrap" }}>
            <Link className="btn btn-p btn-sm" href="/pricing">
              View pricing
            </Link>
            {used.attemptId && (
              <Link className="btn btn-g btn-sm" href={`/mocks/attempts/${used.attemptId}`}>
                See your result
              </Link>
            )}
            <Link className="btn btn-g btn-sm" href="/mocks/history">
              Mock history
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------ chooser */

  const byCourse = new Map<string, typeof subjects>();
  for (const s of subjects) {
    if (!byCourse.has(s.courseTitle)) byCourse.set(s.courseTitle, []);
    byCourse.get(s.courseTitle)!.push(s);
  }

  const anyReady = subjects.some((s) => s.ready);

  return (
    <div className="wrap sec">
      <div className="sec-head">
        <div className="eyebrow">Free mock</div>
        <h1 className="h2">Sit a free {TRIAL_QUESTION_COUNT}-question mock.</h1>
        <p className="lede mt-s">
          Pick one subject. You get {TRIAL_QUESTION_COUNT} questions, {TRIAL_DURATION_MINUTES}{" "}
          minutes on the clock, and the full result afterwards — your score, the questions you
          missed with worked explanations, and the revision areas to work on.
        </p>
        <p className="fnote on warn mt-s">
          <b>One free mock per account.</b> Whichever subject you choose is the one you get, so
          pick the one you most want to test yourself on.
        </p>
      </div>

      {error && REASON[error] && (
        <div className="cnote warning" style={{ marginTop: "18px" }}>
          <b>Not started</b>
          <p>{REASON[error]}</p>
        </div>
      )}

      {!anyReady && (
        <div className="cnote info" style={{ marginTop: "18px" }}>
          <b>Nothing available just now</b>
          <p>
            No subject has a free mock ready at the moment. The full mock exams are available with
            any package.
          </p>
        </div>
      )}

      {[...byCourse.entries()].map(([courseTitle, list]) => (
        <div key={courseTitle} className="mt-l">
          <div className="sec-head">
            <h2 className="h3">{courseTitle}</h2>
          </div>
          <div className="cards">
            {list.map((s) => (
              <div className="card" key={s.subjectId}>
                <h3 className="h4">{s.subjectTitle}</h3>
                {s.ready ? (
                  <>
                    <p className="xs">
                      {TRIAL_QUESTION_COUNT} questions · {TRIAL_DURATION_MINUTES} minutes
                    </p>
                    <form action={beginTrial.bind(null, s.subjectId)}>
                      <button className="btn btn-p btn-sm" type="submit">
                        Start free mock
                      </button>
                    </form>
                  </>
                ) : (
                  <p className="xs">Not available yet.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="xs" style={{ marginTop: "26px" }}>
        The free mock is a sample. Full-length mock exams in every subject come with a package —{" "}
        <Link href="/pricing">see what is included</Link>.
      </p>
    </div>
  );
}
