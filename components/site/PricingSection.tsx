"use client";

import { useState } from "react";

import type { ExtraPackage, PlanPrice } from "@/lib/home-pricing";
import { isComingSoon } from "@/lib/coming-soon";
import BuyButton from "@/components/checkout/BuyButton";

/**
 * The homepage pricing section.
 *
 * This is the whole shop, on the front page. The copy is hand-written; the
 * figures, the discount codes and the checkout are not — every card carries
 * the same BuyButton the pricing page uses, so a visitor applies a coupon and
 * buys right here without being sent to a second page to do it. The single
 * subject is chosen inline in the same way.
 *
 * Currency lives in React state so the NZD/INR toggle updates the prices, the
 * buy buttons and the single-subject picker together, with no reload and no
 * loss of scroll position. The choice is written to the same cookie the
 * pricing page and checkout read, so it carries across the site.
 */

type PlanKey = "ppl" | "cpl" | "ir" | "ftppl" | "ftcpl" | "complete";

const SLUGS: Record<PlanKey, string> = {
  ppl: "ppl-theory-package",
  cpl: "cpl-theory-package",
  ir: "ir-theory-package",
  ftppl: "ppl-flight-test-package",
  ftcpl: "cpl-flight-test-package",
  complete: "complete-aviator-pass",
};

const LABELS: Record<PlanKey, string> = {
  ppl: "Get PPL Package",
  cpl: "Get CPL Package",
  ir: "Get IR Package",
  ftppl: "Get PPL Groundwork",
  ftcpl: "Get CPL Groundwork",
  complete: "Get the Complete Pass",
};

export default function PricingSection({
  plans,
  extras = [],
  currency: initialCurrency = "NZD",
  signedIn = false,
  owned = [],
  notice,
}: {
  plans: Record<string, PlanPrice>;
  /** Published packages with no written card, described from their own rows. */
  extras?: ExtraPackage[];
  currency?: "NZD" | "INR";
  signedIn?: boolean;
  /** Product slugs this reader already holds, so a card does not sell twice. */
  owned?: string[];
  /** Something the checkout bounced back here to say. */
  notice?: "coupon-rejected" | "coming-soon" | "unavailable";
}) {
  // The server already reads the currency cookie (preferredCurrency) to pick
  // initialCurrency, so this starts on the right money with no flash.
  const [currency, setCurrency] = useState<"NZD" | "INR">(initialCurrency);

  const choose = (next: "NZD" | "INR") => {
    setCurrency(next);
    // Written where the server can read it, so the pricing page and checkout
    // quote the same money without asking again.
    try {
      document.cookie = `kpp_currency=${next};path=/;max-age=${180 * 24 * 60 * 60};samesite=lax`;
    } catch {
      /* ignore */
    }
  };

  const priceText = (key: string) => {
    const p = plans[key];
    return (currency === "INR" ? p?.inr : p?.nzd) ?? "Contact us";
  };

  const held = new Set(owned);

  /** "3 months access" / "Lifetime access", as the written cards phrase it. */
  const accessLabel = (months: number | null) =>
    months === null ? "Lifetime access" : `${months} month${months === 1 ? "" : "s"} access`;

  /** The same three outcomes as a written card, for a package without one. */
  const extraCta = (extra: ExtraPackage) => {
    if (isComingSoon(extra.slug)) {
      return (
        <button className="btn btn-g btn-w" type="button" disabled>
          Coming Soon
        </button>
      );
    }
    if (held.has(extra.slug)) {
      return (
        <a className="btn btn-g btn-w" href="/dashboard">
          You already have this — Continue Learning
        </a>
      );
    }
    const price = currency === "INR" ? extra.inr : extra.nzd;
    if (!price) {
      return (
        <a className="btn btn-g btn-w" href="/contact">
          Enquire
        </a>
      );
    }
    return (
      <BuyButton
        productId={extra.id}
        currency={currency}
        label={`Get ${extra.title}`}
        signedIn={signedIn}
      />
    );
  };

  /** A card's call to action: coming-soon, already-bought, or the buy control. */
  const cta = (key: PlanKey) => {
    const slug = SLUGS[key];
    const id = plans[key]?.id;
    if (isComingSoon(slug)) {
      return (
        <button className="btn btn-g btn-w" type="button" disabled>
          Coming Soon
        </button>
      );
    }
    // Somebody who has already bought this needs a way in, not a second sale.
    if (held.has(slug)) {
      return (
        <a className="btn btn-g btn-w" href="/dashboard">
          You already have this — Continue Learning
        </a>
      );
    }
    if (!id) {
      // Only if the product is missing from the database — never in normal use.
      return (
        <a className="btn btn-g btn-w" href="/contact">
          Enquire
        </a>
      );
    }
    return (
      <BuyButton productId={id} currency={currency} label={LABELS[key]} signedIn={signedIn} />
    );
  };

  /**
   * What the checkout sends people back here to be told.
   *
   * It used to bounce to a separate pricing page to say it, which meant a
   * refused code or an unfinished course took the reader off the page they were
   * buying on. The message belongs next to the cards it is about.
   */
  const NOTICES = {
    "coupon-rejected": "That discount code was not recognised, so the prices below are the full ones.",
    "coming-soon": "The material for that course is still being prepared, so it is not on sale yet.",
    unavailable: "That package is not on sale at the moment. The rest are below.",
  } as const;

  return (
    <>
      {/* ========================= PRICING ========================= */}
      <section className="sec" id="pricing">
        <div className="wrap">
          <div className="sec-head center r">
            <div className="eyebrow">Pricing</div>
            <h2 className="h2">Pick your licence track, or take the lot.</h2>
            <p className="lede">Pay once for the track you need. Switching currency does not
              change the course — only which of the two prices set for it you are charged.</p>

            {notice && (
              <p className="prob-note mt-s" role="status">
                {NOTICES[notice]}
              </p>
            )}

            <div className="cur-switch">
              <span className="cur-switch-lbl" id="home-currency-label">Prices shown in</span>
              <div className="cur" role="group" aria-labelledby="home-currency-label">
                <button
                  className={`curb${currency === "NZD" ? " on" : ""}`}
                  type="button"
                  aria-pressed={currency === "NZD"}
                  onClick={() => choose("NZD")}
                >
                  NZD $
                </button>
                <button
                  className={`curb${currency === "INR" ? " on" : ""}`}
                  type="button"
                  aria-pressed={currency === "INR"}
                  onClick={() => choose("INR")}
                >
                  INR ₹
                </button>
              </div>
            </div>
          </div>

          <div className="price-grid">
            <div id="ppl-theory-package" data-plan="ppl" className="plan r">
              <div className="pn">Theory</div>
              <h3>PPL Theory Package</h3>
              <p className="pd">All six PPL theory subjects.</p>
              <div className="vchip"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.2V12l3.2 2" /></svg> <span>3 months access</span></div>
              <div className="amt"><span className="v">{priceText("ppl")}</span><span className="c">{currency}</span></div>
              <p className="pnote">one-time</p>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> All 6 PPL subjects</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Full study material</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Chapter-wise inline questions</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Timed mock exams</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Automated KDR scorecard by email</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Pass guarantee eligibility</li>
              </ul>
              {cta("ppl")}
            </div>

            <div id="cpl-theory-package" data-plan="cpl" className="plan r" style={{ "--d": ".06s" } as React.CSSProperties}>
              <div className="pn">Theory</div>
              <h3>CPL Theory Package</h3>
              <p className="pd">All six CPL theory subjects.</p>
              <div className="vchip"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.2V12l3.2 2" /></svg> <span>3 months access</span></div>
              <div className="amt"><span className="v">{priceText("cpl")}</span><span className="c">{currency}</span></div>
              <p className="pnote">one-time</p>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> All 6 CPL subjects</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Full study material</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Chapter-wise inline questions</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Timed mock exams</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Automated KDR scorecard by email</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Pass guarantee eligibility</li>
              </ul>
              {cta("cpl")}
            </div>

            <div id="ir-theory-package" data-plan="ir" className="plan r" style={{ "--d": ".12s" } as React.CSSProperties}>
              <div className="pn">Theory</div>
              <h3>IR Theory Package</h3>
              <p className="pd">All three Instrument Rating subjects.</p>
              <div className="vchip"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.2V12l3.2 2" /></svg> <span>3 months access</span></div>
              <div className="amt"><span className="v">{priceText("ir")}</span><span className="c">{currency}</span></div>
              <p className="pnote">one-time</p>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> All 3 IR subjects</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Full study material</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Chapter-wise inline questions</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Timed mock exams</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Automated KDR scorecard by email</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Pass guarantee eligibility</li>
              </ul>
              {cta("ir")}
            </div>

            <div id="ppl-flight-test-package" data-plan="ftppl" className="plan r" style={{ "--d": ".18s" } as React.CSSProperties}>
              <div className="pn">Groundwork</div>
              <h3>PPL Flight Test Groundwork</h3>
              <p className="pd">Eight oral and preparation modules.</p>
              <div className="vchip"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.2V12l3.2 2" /></svg> <span>3 months access</span></div>
              <div className="amt"><span className="v">{priceText("ftppl")}</span><span className="c">{currency}</span></div>
              <p className="pnote">one-time</p>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> All 8 prescribed modules</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Examiner-style oral prep</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Aircraft documents &amp; loading drills</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Go/no-go decision practice</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Pre-flight inspection walkthrough</li>
              </ul>
              {cta("ftppl")}
            </div>

            <div id="cpl-flight-test-package" data-plan="ftcpl" className="plan r is-soon" style={{ "--d": ".24s" } as React.CSSProperties}>
              <span className="flag flag-soon">Coming Soon</span>
              <div className="pn">Groundwork</div>
              <h3>CPL Flight Test Groundwork</h3>
              <p className="pd">The same eight modules at CPL depth.</p>
              <div className="vchip"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.2V12l3.2 2" /></svg> <span>3 months access</span></div>
              <div className="amt"><span className="v">{priceText("ftcpl")}</span><span className="c">{currency}</span></div>
              <p className="pnote">one-time</p>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> All 8 prescribed modules</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> CPL-standard oral prep</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Performance &amp; P-chart work</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Fuel management scenarios</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Emergency equipment briefings</li>
              </ul>
              {cta("ftcpl")}
            </div>

            <div id="complete-aviator-pass" data-plan="complete" className="plan best r" style={{ "--d": ".30s" } as React.CSSProperties}>
              <span className="flag">Best Value</span>
              <div className="pn">Complete</div>
              <h3>Complete Aviator Pass</h3>
              <p className="pd">Every theory subject and both groundwork tracks.</p>
              <div className="vchip"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.2V12l3.2 2" /></svg> <span>12 months access</span></div>
              <div className="amt"><span className="v">{priceText("complete")}</span><span className="c">{currency}</span></div>
              <p className="pnote">one-time &middot; everything included</p>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> All 15 theory subjects</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Both flight test groundwork tracks</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Full study material</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Chapter-wise inline questions</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Timed mock exams</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Automated KDR scorecard by email</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg> Pass guarantee eligibility</li>
              </ul>
              {cta("complete")}
            </div>

            {/*
              Packages published since the cards above were written.

              This page is the only pricing surface, so it cannot be a fixed
              list of six: an administrator who publishes a package has to see
              it offered. The written cards keep their copy; these are described
              from what the product actually grants.
            */}
            {extras.map((extra) => {
              const price = currency === "INR" ? extra.inr : extra.nzd;
              return (
                <div id={extra.slug} data-plan={extra.slug} className="plan r" key={extra.id}>
                  <div className="pn">Package</div>
                  <h3>{extra.title}</h3>
                  {extra.description && <p className="pd">{extra.description}</p>}
                  <div className="vchip">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.2V12l3.2 2" /></svg>{" "}
                    <span>{accessLabel(extra.months)}</span>
                  </div>
                  <div className="amt">
                    <span className="v">{price ?? "Contact us"}</span>
                    {price && <span className="c">{currency}</span>}
                  </div>
                  <p className="pnote">{price ? "one-time" : `Not available in ${currency}`}</p>
                  <ul>
                    {extra.contents.map((line, i) => (
                      <li key={i}>
                        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>{" "}
                        {line}
                      </li>
                    ))}
                  </ul>
                  {extraCta(extra)}
                </div>
              );
            })}
          </div>

          {/* One subject on its own has its own focused page — the front page
              shows the packages, and the subject picker is one click away and
              uncluttered, rather than a whole selector wedged in below. */}
          <div data-plan="single" className="addon r">
            <span className="addon-ic">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h9l4 4v13H6z" /><path d="M14.5 3.5V8H19M9 12h6M9 16h4" /></svg>
            </span>
            <div>
              <h3>Buy a single subject</h3>
              <p className="pd">Any one PPL, CPL or IR theory subject — full material, practice questions
                and its mock exam. <b>1 month access</b>, shorter than the packages.</p>
            </div>
            <div className="amt"><span className="v">{priceText("single")}</span><span className="c">{currency}</span></div>
            <a className="btn btn-p" href="/pricing/subject">Choose a subject</a>
          </div>

          <p className="price-note r">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#6C8098" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 16v-4.5M12 8.2h.01" /></svg>
            Access runs 3 months from purchase (12 months on the Complete Aviator Pass, 1 month on a single subject) · Payable in NZD or INR · Guarantee eligibility requires meeting all published requirements
          </p>
        </div>
      </section>
    </>
  );
}
