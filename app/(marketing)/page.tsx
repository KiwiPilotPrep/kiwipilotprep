import Image from "next/image";

import CourseTracks from "@/components/site/CourseTracks";
import PricingSection from "@/components/site/PricingSection";
import { homePlanPrices } from "@/lib/home-pricing";
import { preferredCurrency } from "@/lib/currency";
import { getCurrentUser } from "@/lib/auth";
import FaqList from "@/components/site/FaqList";
import ContactForm from "@/components/site/ContactForm";

/* The canonical for this route. The root layout no longer declares one,
 * because metadata is inherited and a single shared canonical told search
 * engines every page was a copy of this one. */
export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  // What the front-page pricing section needs to sell the packages right there:
  // the prices, the currency to show them in, and whether the visitor is signed
  // in (drives the button copy). A single subject is chosen on its own focused
  // page, so its list is not needed here.
  const [plans, currency, user] = await Promise.all([
    homePlanPrices(),
    preferredCurrency(),
    getCurrentUser(),
  ]);

  return (
    <>
      {/* ========================= HERO ========================= */}
      <section className="hero">
        <div className="wrap-w hero-grid">
          <div className="hero-copy">
            <span className="pill r in"><i></i> Memory-based recalls from recent Aspeq examinations</span>
            <h1 className="h1 r" style={{ "--d": ".05s" } as React.CSSProperties}>Prepare smarter. Walk into your <em>Aspeq exam</em> ready.</h1>
            <p className="lede r" style={{ "--d": ".1s" } as React.CSSProperties}>
              Exam-focused preparation for Aspeq PPL, CPL, and IR theory exams — built from real student exam recalls.
            </p>

            {/* 1.3 Prominent trust badge */}
            <div className="tbadge r" style={{ "--d": ".13s" } as React.CSSProperties}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l7.4 3v5.7c0 4.4-3.1 8.2-7.4 9.7-4.3-1.5-7.4-5.3-7.4-9.7V5.8z" /><path d="M8.8 12.2l2.3 2.3 4.1-4.6" /></svg>
              <span>
                <b>First-Attempt Pass Guarantee</b>
                <span>Meet the published requirements — if you don&rsquo;t pass, claim a full refund.</span>
              </span>
            </div>

            <div className="hero-actions r" style={{ "--d": ".17s" } as React.CSSProperties}>
              <a className="btn btn-p btn-lg" href="/trial">Start Free 10-Question Mock →</a>
              <a className="btn btn-s btn-lg" href="#pricing">See Pricing</a>
            </div>
            <div className="hero-trust r" style={{ "--d": ".21s" } as React.CSSProperties}>
              <b>PPL · 6 Subjects</b><span className="dot"></span>
              <b>CPL · 6 Subjects</b><span className="dot"></span>
              <b>IR · 3 Subjects</b><span className="dot"></span>
              <b>Flight Test Groundwork</b>
            </div>
          </div>

          <div className="hero-vis r" style={{ "--d": ".24s" } as React.CSSProperties}>
            <div className="photo">
              {/* Self-hosted rather than hot-linked: the hero is the LCP element, and a
                  third party going down or changing a URL should not be able to break
                  the top of the homepage. Serving it from the origin also keeps the
                  image CSP tight. */}
              <Image
                src="/hero-cockpit.jpg"
                alt="Cockpit instrument panel during flight"
                width={1600}
                height={1200}
                priority
                sizes="(max-width: 900px) 100vw, 620px"
              />
              <span className="photo-tag">Aotearoa · Pilot Theory Prep</span>
            </div>

            <div className="float">
              <div className="lbl">Exam readiness</div>
              <div className="val">82%</div>
              <div className="bar"><i></i></div>
            </div>

            <div className="qcard">
              <div className="qcard-hd">
                <span className="t">Aspeq Recall Practice</span>
                <span className="n num">Question 24 / 40</span>
              </div>
              <div className="qcard-bd">
                <p className="q">Which statement best describes the effect of increasing density altitude on take-off performance?</p>
                <div className="opt"><span className="k">A</span> Take-off distance decreases</div>
                <div className="opt"><span className="k">B</span> Climb rate is unaffected</div>
                <div className="opt sel"><span className="k">C</span> Take-off distance increases</div>
                <div className="opt"><span className="k">D</span> Stall speed (IAS) increases</div>
              </div>
              <div className="qcard-ft">
                <span className="acc">Accuracy <b>86%</b></span>
                <span className="btn btn-p btn-sm">Check Answer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= SOCIAL PROOF STRIP (4.1) ========================= */}
      <section className="strip">
        <div className="wrap-w">
          <div className="strip-in">
            <div className="strip-i"><div className="v">150+</div><div className="l">Students Prepared</div></div>
            <div className="strip-i"><div className="v">Real Aspeq</div><div className="l">Exam Recalls</div></div>
            <div className="strip-i"><div className="v">Instant</div><div className="l">KDR Reports Emailed</div></div>
            <div className="strip-i"><div className="v">Guarantee</div><div className="l">Pass or refund · terms apply</div></div>
            <div className="strip-i"><div className="v">15</div><div className="l">Theory Subjects + Flight Test</div></div>
          </div>
        </div>
      </section>

      {/* ========================= THE PROBLEM ========================= */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head r">
            <div className="eyebrow">The Problem</div>
            <h2 className="h2">Studying more doesn&rsquo;t always mean studying better.</h2>
            <p className="lede">Most student pilots don&rsquo;t fail because they didn&rsquo;t work hard enough. They fail because
              the hours went into the wrong things.</p>
          </div>

          <div className="g3 mt-l">
            <div className="prob-i r">
              <div className="n">01</div>
              <h3 className="h3">Too much information</h3>
              <p>Students can spend hours going through material without knowing what actually matters for the exam.</p>
            </div>
            <div className="prob-i r" style={{ "--d": ".08s" } as React.CSSProperties}>
              <div className="n">02</div>
              <h3 className="h3">Question banks aren&rsquo;t enough</h3>
              <p>Getting an answer right is not the same as understanding why it is right.</p>
            </div>
            <div className="prob-i r" style={{ "--d": ".16s" } as React.CSSProperties}>
              <div className="n">03</div>
              <h3 className="h3">No clear readiness signal</h3>
              <p>Students often don&rsquo;t know whether they are actually prepared to sit the real thing.</p>
            </div>
          </div>

          <div className="prob-note r">
            <span className="ic">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#8FC3EA" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
                <circle cx="12" cy="12" r="3.4" />
              </svg>
            </span>
            <p>That&rsquo;s why this platform is built around focused learning, deliberate practice and measurable preparation.</p>
          </div>
        </div>
      </section>

      {/* ========================= FOUNDER / CREDIBILITY ========================= */}
      <section className="sec tint story" id="story">
        <div className="wrap">
          <div className="founder">
            <div className="portrait r">
              <div>
                <div className="ph">
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#6C8098" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8.2" r="3.8" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
                  </svg>
                </div>
                <div className="cap">Founder portrait</div>
                <div className="cap2">Image to be supplied</div>
              </div>
            </div>

            <div className="r" style={{ "--d": ".08s" } as React.CSSProperties}>
              <div className="eyebrow">Why this exists</div>
              <h2 className="h2" style={{ marginBottom: "26px" } as React.CSSProperties}>Built from real exam preparation experience.</h2>
              <p className="f-quote">“I struggled to find material that focused on what actually gets asked in the exams — so I started creating my own.”</p>
              <div className="f-body">
                <p>What began as personal notes turned into a full set of exam-focused study material. It was written
                  around one question: what does a student actually need to know to sit this exam with confidence?</p>
                <p>That material has been developed and shared for around one to one and a half years. In that time it
                  has been used by more than 100 people preparing for their New Zealand theory exams — many of whom
                  passed on their first attempt.</p>
                <p>KiwiPilotPrep is the next step: the same material, rebuilt into a proper interactive preparation
                  platform with practice questions, explanations, mock exams and a clear readiness picture.</p>
              </div>
              <div className="f-meta">
                <div><div className="v">1–1.5 yrs</div><div className="l">Material developed &amp; refined</div></div>
                <div><div className="v">150+</div><div className="l">Students helped to prepare</div></div>
                <div><div className="v">15</div><div className="l">Subjects covered</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= HOW IT WORKS ========================= */}
      <section className="sec invert" id="how">
        <div className="wrap">
          <div className="sec-head center r">
            <div className="eyebrow">How It Works</div>
            <h2 className="h2">A preparation path, not a pile of PDFs.</h2>
            <p className="lede">Five stages that take you from first read to knowing you&rsquo;re ready.</p>
          </div>

          <div className="flow">
            <div className="step r">
              <span className="ring">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 5.5A2 2 0 0 1 6 4h5v16H6a2 2 0 0 0-2 1.5z" /><path d="M20 5.5A2 2 0 0 0 18 4h-5v16h5a2 2 0 0 1 2 1.5z" />
                </svg>
              </span>
              <div className="n">01</div>
              <h3>Learn</h3>
              <p>Study focused material.</p>
            </div>
            <div className="step r" style={{ "--d": ".07s" } as React.CSSProperties}>
              <span className="ring">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="3.5" width="16" height="17" rx="2.2" /><path d="M8.5 9h7M8.5 13h7M8.5 17h4" />
                </svg>
              </span>
              <div className="n">02</div>
              <h3>Practice</h3>
              <p>Answer exam-style questions.</p>
            </div>
            <div className="step r" style={{ "--d": ".14s" } as React.CSSProperties}>
              <span className="ring">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="8.5" /><path d="M12 16.5v-4.5M12 8.2h.01" />
                </svg>
              </span>
              <div className="n">03</div>
              <h3>Understand</h3>
              <p>See explanations and learn from mistakes.</p>
            </div>
            <div className="step r" style={{ "--d": ".21s" } as React.CSSProperties}>
              <span className="ring">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="13" r="7.5" /><path d="M12 9.5V13l2.4 1.6M9 2.5h6" />
                </svg>
              </span>
              <div className="n">04</div>
              <h3>Mock</h3>
              <p>Take realistic timed examinations.</p>
            </div>
            <div className="step r" style={{ "--d": ".28s" } as React.CSSProperties}>
              <span className="ring">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3.2 20 6.5v5.6c0 4.4-3.2 7.6-8 9.1-4.8-1.5-8-4.7-8-9.1V6.5z" /><path d="M8.8 12.2l2.3 2.3 4.1-4.6" />
                </svg>
              </span>
              <div className="n">05</div>
              <h3>Ready</h3>
              <p>Understand your preparation level before the real exam.</p>
            </div>
            <div className="step r" style={{ "--d": ".35s" } as React.CSSProperties}>
              <span className="ring">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.5 9.5a8.5 8.5 0 1 0 .6 4.4" /><path d="M20.5 4.5v5h-5" /><path d="M9.6 12.4l1.9 1.9 3.4-3.8" />
                </svg>
              </span>
              <div className="n">06</div>
              <h3>Guaranteed</h3>
              <p>Meet the requirements and don&rsquo;t pass? Claim a full refund.</p>
            </div>
          </div>

          <div className="flow-note r">
            <a className="btn btn-s" href="/trial">Try a free 10-question mock</a>
          </div>
        </div>
      </section>

            <CourseTracks />


      {/* ========================= MOCK EXAMS ========================= */}
      <section className="sec invert" id="mocks">
        <div className="wrap">
          <div className="sec-head r">
            <div className="eyebrow">Mock Exams</div>
            <h2 className="h2">Practise before the pressure is real.</h2>
            <p className="lede">Timed, full-length mock examinations that mirror the conditions you&rsquo;ll sit in — then a
              result breakdown that tells you exactly where to revise.</p>
          </div>

          <div className="split mt-l" style={{ alignItems: "start" } as React.CSSProperties}>
            {/* exam UI */}
            <div className="exam r">
              <div className="exam-hd">
                <div className="name"><em>Mock Examination</em> PPL · Air Law</div>
                <span className="timer">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
                  <span id="timer">42:16</span>
                </span>
              </div>
              <div className="exam-bd">
                <div className="exam-prog">
                  <span className="lbl">Q 24 / 40</span>
                  <span className="track"><i></i></span>
                  <span className="lbl">60% complete</span>
                </div>
                <p className="exam-q">Before a flight in controlled airspace, the pilot-in-command is responsible for ensuring that:</p>
                <div className="exam-opt"><span className="k">A</span> The aircraft has been refuelled within the last 24 hours</div>
                <div className="exam-opt sel"><span className="k">B</span> All required documents are carried and current</div>
                <div className="exam-opt"><span className="k">C</span> A flight plan has been filed for every flight</div>
                <div className="exam-opt"><span className="k">D</span> The aircraft has been inspected by an engineer that day</div>
              </div>
              <div className="exam-ft">
                <button className="flagbtn" id="flagbtn">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 21V4.5M5.5 5.5h11l-2 3.6 2 3.6h-11" /></svg>
                  <span id="flagtx">Flag question</span>
                </button>
                <div className="navsq">
                  <i className="done">21</i><i className="done">22</i><i className="flag">23</i><i className="cur">24</i><i>25</i><i>26</i><i>27</i><i>28</i>
                </div>
                <span className="btn btn-p btn-sm">Submit exam</span>
              </div>
            </div>

            {/* result */}
            <div className="result r" style={{ "--d": ".1s" } as React.CSSProperties}>
              <div className="result-hd">
                <div className="donut">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#EDF1F5" strokeWidth="11" />
                    <circle className="donut-arc" cx="60" cy="60" r="50" fill="none" stroke="#1E7A5A" strokeWidth="11" strokeLinecap="round" strokeDasharray="314" strokeDashoffset="314" data-pct="84" />
                  </svg>
                  <span className="val"><b>84%</b><span>Score</span></span>
                </div>
                <div className="rt">
                  <span className="tag">Above pass threshold</span>
                  <h3 className="h3">Mock result</h3>
                  <p className="small">Pass threshold 70% · 40 questions · completed in 48 minutes.</p>
                </div>
              </div>
              <div className="result-bd">
                <div className="area">
                  <div className="t">Strong areas</div>
                  <div className="arow" data-w="94"><span className="nm">Airspace &amp; classifications</span><span className="tr"><i></i></span><span className="pc">94%</span></div>
                  <div className="arow" data-w="90"><span className="nm">Documents &amp; requirements</span><span className="tr"><i></i></span><span className="pc">90%</span></div>
                </div>
                <div className="area">
                  <div className="t">Weak areas</div>
                  <div className="arow low" data-w="58"><span className="nm">Rules of the air</span><span className="tr"><i></i></span><span className="pc">58%</span></div>
                  <div className="arow low" data-w="62"><span className="nm">Licensing &amp; currency</span><span className="tr"><i></i></span><span className="pc">62%</span></div>
                </div>
                <div className="rec">
                  <span className="ic"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#9A6516" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.5v.01M12 8v8" /><circle cx="12" cy="12" r="9" /></svg></span>
                  <div>
                    <div className="t">Recommended revision</div>
                    <p>Revisit Rules of the Air (topics 3 &amp; 5), then sit another mock to see whether it has stuck.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* The panel above is an illustration of a full-length mock, and it
              shows a forty-question paper. Saying so here is what stops a
              visitor reading the picture as the free offer. */}
          <p className="small r" style={{ marginTop: "20px", opacity: 0.75 } as React.CSSProperties}>
            Illustrated above: a full-length mock exam, included with every package. The free mock
            is 10 questions.
          </p>

          <div className="mock-cta r" style={{ maxWidth: "640px" } as React.CSSProperties}>
            <p className="lede">
              <b style={{ color: "#fff" } as React.CSSProperties}>Know where you stand before you sit the real exam.</b>
            </p>
            {/* The panel above illustrates a full-length mock. The free one is
                ten questions — said here rather than left to be inferred from
                a picture of a forty-question paper. */}
            <p className="lede">
              Try it free: a real 10-question mock in the subject of your choice, timed and marked,
              with the same result breakdown and report. Full-length mocks come with a package.
            </p>
            <a className="btn btn-p" href="/trial">Start a free 10-question mock</a>
          </div>
        </div>
      </section>






      {/* ========================= GUARANTEE ========================= */}
      <section className="sec invert gua" id="guarantee">
        <div className="wrap gua-grid">
          <div className="r">
            <span className="seal">
              <span className="ic"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.2 20 6.5v5.6c0 4.4-3.2 7.6-8 9.1-4.8-1.5-8-4.7-8-9.1V6.5z" /><path d="M8.8 12.2l2.3 2.3 4.1-4.6" /></svg></span>
              <span className="tx">First-Attempt Guarantee</span>
            </span>
            <h2 className="h2">Prepare with confidence.</h2>
            <p className="lede mt-s">Our first-attempt guarantee is built around measurable preparation. Do the work the
              platform asks for, and you&rsquo;re covered.</p>
            <p className="small mt-m">We can&rsquo;t sit the exam for you — but we can be specific about what preparation looks
              like. Every requirement below is something you can see in your own readiness view before you book.</p>
            <div className="hero-actions">
              <a className="btn btn-s" href="#faq">View Guarantee Requirements</a>
            </div>
            <p className="disc">Eligibility criteria and refund conditions apply. Final guarantee terms will be published
              with the platform and must be met in full before a refund claim can be assessed.</p>
          </div>

          <div className="req-card r" style={{ "--d": ".1s" } as React.CSSProperties}>
            <div className="hd">
              <span className="t">Eligibility requirements</span>
              <span className="c">6 of 6 met</span>
            </div>
            <div className="req"><span className="tick"><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg></span><span className="tx">Required study material completed</span><span className="vl">100%</span></div>
            <div className="req"><span className="tick"><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg></span><span className="tx">Required practice questions completed</span><span className="vl">All</span></div>
            <div className="req"><span className="tick"><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg></span><span className="tx">Minimum practice accuracy</span><span className="vl">Met</span></div>
            <div className="req"><span className="tick"><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg></span><span className="tx">Required mock exams completed</span><span className="vl">Met</span></div>
            <div className="req"><span className="tick"><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg></span><span className="tx">Minimum mock exam score</span><span className="vl">Met</span></div>
            <div className="req"><span className="tick"><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg></span><span className="tx">Required study activity</span><span className="vl">Met</span></div>

            <div className="req-out">
              <p><b>Meet the requirements. Sit your exam.</b> If you still don&rsquo;t pass, you may qualify for a refund
                under the published guarantee terms.</p>
            </div>
          </div>
        </div>
      </section>






            <PricingSection plans={plans} currency={currency} signedIn={Boolean(user)} />

      {/* ========================= ABOUT ========================= */}
      <section className="sec tint" id="about">
        <div className="wrap split">
          <div className="r">
            <div className="eyebrow">About</div>
            <h2 className="h2">Why this platform exists.</h2>
            <p className="lede mt-s">KiwiPilotPrep didn&rsquo;t start as a business. It started as one student&rsquo;s notes, written
              because nothing available was answering the right question.</p>
            <div className="hero-actions">
              <a className="btn btn-p" href="#pricing">Start Preparing</a>
              <a className="btn btn-s" href="#story">Read the full story</a>
            </div>
          </div>

          <div className="r" style={{ "--d": ".08s" } as React.CSSProperties}>
            <p className="about-q">“I struggled to find material that focused on what actually gets asked.”</p>
            <div className="about-list">
              <div className="it"><span className="st">01</span><div>
                <h3 className="h4">I started creating my own.</h3>
                <p className="small">Notes became structured material — organised around exam topics rather than textbook chapters.</p>
              </div></div>
              <div className="it"><span className="st">02</span><div>
                <h3 className="h4">Other students started using it.</h3>
                <p className="small">Over roughly one to one and a half years, the material was shared, corrected and improved with each group.</p>
              </div></div>
              <div className="it"><span className="st">03</span><div>
                <h3 className="h4">After helping 150+ students prepare…</h3>
                <p className="small">…the next step was turning that material into a proper preparation platform — with practice, explanations, mocks and readiness built in.</p>
              </div></div>
            </div>
          </div>
        </div>
      </section>

            <FaqList />

            <ContactForm />

    </>
  );
}
