import Link from "next/link";

import { db } from "@/lib/db";
import FlightSchoolFaq from "@/components/site/FlightSchoolFaq";

export const metadata = {
  title: "For Flight Schools — KiwiPilotPrep",
  description:
    "Enterprise licensing, seat management and real student progress visibility for New Zealand flight training organisations.",
};

/**
 * Public Flight Schools page.
 *
 * Everything claimed here is something the platform actually does — the seat
 * model, the role permissions and the instructor views are the Phase 5
 * implementation, described rather than invented. Counts come from the
 * database, and the dashboard preview is explicitly labelled as an example so
 * no fabricated cohort statistic is presented as real (PRD §31).
 */
export default async function FlightSchoolsPage() {
  const [courses, subjects, mocks] = await Promise.all([
    db.course.count({ where: { status: "PUBLISHED" } }),
    // Theory subjects only — flight test groundwork is a track, not a subject,
    // so this stays consistent with the 15 quoted elsewhere on the site.
    db.subject.count({
      where: {
        status: "PUBLISHED",
        course: { status: "PUBLISHED", NOT: { slug: { contains: "flight-test" } } },
      },
    }),
    db.mockExam.count({ where: { status: "PUBLISHED" } }),
  ]);

  return (
    <>
      {/* ============================== HERO ============================== */}
      <section className="hero fs-hero">
        <div className="wrap-w hero-grid">
          <div className="hero-copy">
            <span className="pill r in">
              <i />
              For flight schools &amp; training academies
            </span>
            <h1 className="h1 r" style={{ "--d": ".05s" } as React.CSSProperties}>
              Know which students are <em>actually ready</em>.
            </h1>
            <p className="lede r" style={{ "--d": ".1s" } as React.CSSProperties}>
              Licence seats for your cohort, assign them in a click, and see real study and mock
              performance for every student — not a guess, and not a spreadsheet.
            </p>

            <div className="tbadge r" style={{ "--d": ".13s" } as React.CSSProperties}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 20.5V9l8-5.5 8 5.5v11.5z" />
                <path d="M9.5 20.5v-6h5v6" />
              </svg>
              <span>
                <b>Your school, your data</b>
                <span>
                  Instructors see only your students. Nothing crosses between organisations.
                </span>
              </span>
            </div>

            <div className="hero-actions r" style={{ "--d": ".17s" } as React.CSSProperties}>
              <Link className="btn btn-p btn-lg" href="/contact?subject=enterprise">
                Talk to us about seats
              </Link>
              <Link className="btn btn-s btn-lg" href="/trial">
                Try the question format
              </Link>
            </div>

            <div className="hero-trust r" style={{ "--d": ".21s" } as React.CSSProperties}>
              <b>{subjects} theory subjects</b>
              <span className="dot" />
              <b>{courses} course tracks</b>
              <span className="dot" />
              <b>{mocks} timed mock exams</b>
            </div>
          </div>

          {/* An illustrative render of the real instructor view — built from the
              same components students and admins use, not a screenshot. */}
          <div className="hero-vis r" style={{ "--d": ".24s" } as React.CSSProperties}>
            <div className="fs-preview">
              <div className="fs-preview-hd">
                <span className="t">Cohort overview</span>
                <span className="xs">Example view</span>
              </div>
              <table className="atable">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Study</th>
                    <th>Best mock</th>
                    <th>Weakest KDR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="nm">A. Ngata</td>
                    <td className="num">92%</td>
                    <td className="num">84%</td>
                    <td className="xs">61.NAV.3</td>
                  </tr>
                  <tr>
                    <td className="nm">L. Whitfield</td>
                    <td className="num">64%</td>
                    <td className="num">71%</td>
                    <td className="xs">61.MET.5</td>
                  </tr>
                  <tr>
                    <td className="nm">P. Raman</td>
                    <td className="num">38%</td>
                    <td className="num">—</td>
                    <td className="xs">not sat yet</td>
                  </tr>
                  <tr>
                    <td className="nm">S. Duncan</td>
                    <td className="num">88%</td>
                    <td className="num">79%</td>
                    <td className="xs">61.LP.6</td>
                  </tr>
                </tbody>
              </table>
              <p className="fs-preview-ft xs">
                Illustrative data. Your dashboard shows your own students only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================== WHAT YOU GET ========================== */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head center r in">
            <div className="eyebrow">Built for training organisations</div>
            <h2 className="h2">Three things a school actually needs.</h2>
            <p className="lede">
              Not a reseller portal. A licence model, an instructor view, and the same exam
              engine your students already sit.
            </p>
          </div>

          <div className="g3 mt-l">
            <div className="subj r in">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3.5" y="7" width="17" height="13" rx="2.5" />
                  <path d="M8 7V5.2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V7M3.5 12h17" />
                </svg>
              </span>
              <h3>Seats you control</h3>
              <p>
                Buy a block of seats and assign them yourself. Assigning a seat grants that
                student access immediately; releasing it frees the seat for the next intake.
              </p>
              <ul>
                <li>Assign and release in a click</li>
                <li>Live count of used and free seats</li>
                <li>No per-student purchase admin</li>
              </ul>
            </div>

            <div className="subj r in" style={{ "--d": ".06s" } as React.CSSProperties}>
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.5 19.5h17" />
                  <path d="M6.5 16.5V11M11 16.5V6M15.5 16.5v-4M20 16.5V8.5" />
                </svg>
              </span>
              <h3>Progress you can act on</h3>
              <p>
                Study completion per subject, mock scores, and the syllabus areas each student is
                weakest in — counted from their actual records, never estimated.
              </p>
              <ul>
                <li>Chapter completion per subject</li>
                <li>Mock history and best score</li>
                <li>Weakest KDR areas, cohort-wide</li>
              </ul>
            </div>

            <div className="subj r in" style={{ "--d": ".12s" } as React.CSSProperties}>
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3.2 20 6.5v5.6c0 4.4-3.2 7.6-8 9.1-4.8-1.5-8-4.7-8-9.1V6.5z" />
                  <path d="M8.8 12.2l2.3 2.3 4.1-4.6" />
                </svg>
              </span>
              <h3>Roles that make sense</h3>
              <p>
                Owners handle licensing, admins manage students and invitations, instructors read
                academic progress. Enforced on the server, not by hiding buttons.
              </p>
              <ul>
                <li>Owner · Admin · Instructor</li>
                <li>One school cannot see another</li>
                <li>Students keep their own accounts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ HOW IT WORKS ======================== */}
      <section className="sec invert">
        <div className="wrap">
          <div className="sec-head center r in">
            <div className="eyebrow">Getting started</div>
            <h2 className="h2">From licence to first lesson in three steps.</h2>
          </div>

          <div className="flow fs-flow">
            <div className="step r in">
              <span className="ring">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6.5h16v13H4z" />
                  <path d="M4 10h16M8.5 3.5v3M15.5 3.5v3" />
                </svg>
              </span>
              <div className="n">01</div>
              <h3>Licence</h3>
              <p>Tell us your cohort size. We set up your school with that many seats.</p>
            </div>

            <div className="step r in" style={{ "--d": ".08s" } as React.CSSProperties}>
              <span className="ring">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.5 6.5h17v11h-17z" />
                  <path d="M3.5 7l8.5 6 8.5-6" />
                </svg>
              </span>
              <div className="n">02</div>
              <h3>Invite</h3>
              <p>
                Email your students an invitation. It expires in 14 days and only works from the
                address you sent it to.
              </p>
            </div>

            <div className="step r in" style={{ "--d": ".16s" } as React.CSSProperties}>
              <span className="ring">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="3.6" />
                  <path d="M5 20.5a7 7 0 0 1 14 0" />
                </svg>
              </span>
              <div className="n">03</div>
              <h3>Assign</h3>
              <p>Give them a seat and their course unlocks. Progress starts showing immediately.</p>
            </div>
          </div>

          <div className="flow-note r in">
            <Link className="btn btn-s" href="/contact?subject=enterprise">
              Ask about your cohort
            </Link>
          </div>
        </div>
      </section>

      {/* ============================== ROLES ============================= */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head center r in">
            <div className="eyebrow">Permissions</div>
            <h2 className="h2">Who can do what.</h2>
            <p className="lede">
              Every one of these is checked on the server. An instructor cannot reach another
              school&rsquo;s students by changing a link.
            </p>
          </div>

          <div className="panel mt-l">
            <table className="atable">
              <thead>
                <tr>
                  <th>Capability</th>
                  <th>Owner</th>
                  <th>Admin</th>
                  <th>Instructor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="nm">School settings and members</td>
                  <td>Yes</td>
                  <td>—</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td className="nm">Licences and seat allocation</td>
                  <td>Yes</td>
                  <td>Yes</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td className="nm">Invite and remove students</td>
                  <td>Yes</td>
                  <td>Yes</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td className="nm">Student progress and mock results</td>
                  <td>Yes</td>
                  <td>Yes</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td className="nm">Cohort reporting</td>
                  <td>Yes</td>
                  <td>Yes</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td className="nm">Payment or guarantee details of a student</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="cnote info mt-m">
            <b>What instructors deliberately cannot see</b>
            <p>
              The student view is academic only. Passwords, payment details, guarantee claims and
              refund records are never shown to a school — those belong to the student.
            </p>
          </div>
        </div>
      </section>

      {/* =============================== FAQ ============================== */}
      <section className="sec tint">
        <div className="wrap">
          <div className="sec-head center r in">
            <div className="eyebrow">Questions</div>
            <h2 className="h2">Common questions from schools.</h2>
          </div>
          <FlightSchoolFaq />
        </div>
      </section>

      {/* =============================== CTA ============================== */}
      <section className="sec">
        <div className="wrap">
          <div className="fs-cta r in">
            <div>
              <h2 className="h3">Talk to us about your next intake.</h2>
              <p className="small">
                Tell us roughly how many students and which licences you need, and we will come
                back with seat pricing. No obligation, and no card required to ask.
              </p>
            </div>
            <div className="acts">
              <Link className="btn btn-p" href="/contact?subject=enterprise">
                Contact us
              </Link>
              <Link className="btn btn-g" href="/pricing">
                See student pricing
              </Link>
            </div>
          </div>

          <p className="xs" style={{ marginTop: "22px", textAlign: "center" }}>
            KiwiPilotPrep is an independent educational tool. Not affiliated with Aspeq or CAANZ.
          </p>
        </div>
      </section>
    </>
  );
}
