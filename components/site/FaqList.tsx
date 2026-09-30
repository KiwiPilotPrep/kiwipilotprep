"use client";

import { useEffect } from "react";
import { initFaq } from "@/lib/site-interactions";

export default function FaqList() {
  useEffect(() => { initFaq(); }, []);
  return (
    <>
      {/* ========================= FAQ ========================= */}
      <section className="sec" id="faq">
        <div className="wrap">
          <div className="sec-head center r">
            <div className="eyebrow">FAQ</div>
            <h2 className="h2">Questions, answered.</h2>
          </div>

          <div className="faq" id="faqlist">
            <div className="fq">
              <button className="fq-b">Who is this platform for?<span className="pm"></span></button>
              <div className="fq-p"><div className="in">Student pilots preparing for New Zealand CAA theory examinations at PPL or CPL level. It suits anyone studying independently, alongside a flight school, or revising after an unsuccessful attempt.</div></div>
            </div>
            <div className="fq">
              <button className="fq-b">Which PPL subjects are covered?<span className="pm"></span></button>
              <div className="fq-p"><div className="in">All six PPL theory subjects:
                <ul><li>Air Law</li><li>Navigation</li><li>Meteorology</li><li>Human Factors</li><li>Aircraft Technical Knowledge</li><li>Flight Radio Telephony</li></ul>
              </div></div>
            </div>
            <div className="fq">
              <button className="fq-b">Which CPL subjects are covered?<span className="pm"></span></button>
              <div className="fq-p"><div className="in">All six CPL theory subjects:
                <ul><li>Air Law</li><li>Navigation General</li><li>Flight Planning</li><li>Meteorology</li><li>Human Factors</li><li>Aircraft Technical Knowledge &amp; Principles of Flight</li></ul>
              </div></div>
            </div>
            <div className="fq">
              <button className="fq-b">Can I buy just one subject?<span className="pm"></span></button>
              <div className="fq-p"><div className="in">Yes. Individual subjects can be purchased on their own — useful if you only have one exam left, or you want to try the platform on a single subject before committing to a package.</div></div>
            </div>
            <div className="fq">
              <button className="fq-b">Can I buy the complete PPL package?<span className="pm"></span></button>
              <div className="fq-p"><div className="in">Yes. The PPL Package includes all six PPL subjects with study material, practice questions, explanations, mock exams and readiness tracking for each.</div></div>
            </div>
            <div className="fq">
              <button className="fq-b">Can I buy the complete CPL package?<span className="pm"></span></button>
              <div className="fq-p"><div className="in">Yes. The CPL Package includes all six CPL subjects on the same basis. If you&rsquo;re working towards both licences, the Complete Package covers all twelve.</div></div>
            </div>
            <div className="fq">
              <button className="fq-b">Are mock exams included?<span className="pm"></span></button>
              <div className="fq-p"><div className="in">Yes. Every subject includes timed, full-length mock examinations designed to reflect realistic exam conditions, followed by a result breakdown showing strong areas, weak areas and recommended revision.</div></div>
            </div>
            <div className="fq">
              <button className="fq-b">Can I try sample questions first?<span className="pm"></span></button>
              <div className="fq-p"><div className="in">Yes — you can sit a free 10-question mock in the subject of your choice, timed and marked, with the same result breakdown and report as a full mock. Start one from the <a className="lnk" href="/trial">free mock page</a>.</div></div>
            </div>
            <div className="fq">
              <button className="fq-b">How does the first-attempt guarantee work?<span className="pm"></span></button>
              <div className="fq-p"><div className="in">The guarantee is built around measurable preparation rather than being an unconditional promise. You&rsquo;ll need to complete the required study material for the course and sit the required mock exams, meeting the minimum mock score where the policy sets one. If you meet every requirement, sit your exam and still don&rsquo;t pass, you may qualify for a refund. <b>Eligibility criteria and refund conditions apply</b> and the full terms will be published with the platform.</div></div>
            </div>
            <div className="fq">
              <button className="fq-b">How long will I have access?<span className="pm"></span></button>
              <div className="fq-p"><div className="in">Package access runs for 3 months from purchase, and 12 months on the Complete Aviator Pass. A single subject bought on its own carries 1 month of access.</div></div>
            </div>
            <div className="fq">
              <button className="fq-b">Can I pay in NZD or INR?<span className="pm"></span></button>
              <div className="fq-p"><div className="in">Yes. Prices are shown and charged in New Zealand dollars or Indian rupees, so international students aren&rsquo;t guessing at conversion.</div></div>
            </div>
            <div className="fq">
              <button className="fq-b">Is this an official CAA/ASPEQ platform?<span className="pm"></span></button>
              <div className="fq-p"><div className="in"><b>No.</b> This platform is an independent preparation resource and should not be presented as an official CAA/ASPEQ website unless an official relationship is confirmed. It is not affiliated with, endorsed by, or connected to the Civil Aviation Authority of New Zealand or ASPEQ, and it does not deliver official examinations. All examinations are sat through the official examination provider.</div></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
