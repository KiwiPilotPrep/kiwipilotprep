"use client";

import Link from "next/link";
import { useState } from "react";

import { count } from "@/lib/plural";

import BuyButton from "./BuyButton";

type Option = {
  productId: string;
  title: string;
  subjectTitle: string;
  courseId: string;
  courseTitle: string;
  chapters: number;
  accessMonths: number | null;
  priceNZD: string | null;
  priceINR: string | null;
};

/**
 * One card on the pricing page for buying a single subject.
 *
 * Two dropdowns, a price, a discount code and a button — the same shape as
 * the package cards beside it, because it is the same decision made the same
 * way. It was briefly a pair of numbered step panels, which read as a
 * separate selection page sitting inside the pricing page; choosing a subject
 * is one choice, not a journey.
 *
 * The currency is the page's, not this card's. Two currency controls on one
 * screen can disagree, and the one the student can see is the one they will
 * be charged in.
 */
export default function SubjectPicker({
  courses,
  options,
  ownedIds,
  signedIn,
  currency,
}: {
  courses: Array<{ id: string; title: string }>;
  options: Option[];
  ownedIds: string[];
  signedIn: boolean;
  currency: "NZD" | "INR";
}) {
  const [courseId, setCourseId] = useState("");
  const [productId, setProductId] = useState("");

  const inCourse = options.filter((o) => o.courseId === courseId);
  const chosen = options.find((o) => o.productId === productId) ?? null;
  const owned = chosen ? ownedIds.includes(chosen.productId) : false;
  const price = chosen ? (currency === "NZD" ? chosen.priceNZD : chosen.priceINR) : null;

  return (
    <div className="plan subject-card r in" id="single-subject-card">
      {/* No heading of its own: the section above already says what this is,
          and saying it twice makes one choice look like two. */}
      <div className="pn">Single subject</div>
      <p className="pd">
        Any one PPL, CPL or IR subject on its own — full material, practice questions and its
        mock exam.
      </p>

      <div className="subject-fields">
        <div className="fld">
          <label htmlFor="course">Course</label>
          <div className="selwrap">
            <select
              id="course"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setProductId("");
              }}
            >
              <option value="">Choose a course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="fld">
          <label htmlFor="subject">Subject</label>
          <div className="selwrap">
            <select
              id="subject"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={!courseId}
            >
              <option value="">{courseId ? "Choose a subject…" : "Pick a course first"}</option>
              {inCourse.map((o) => (
                <option key={o.productId} value={o.productId}>
                  {o.subjectTitle}
                </option>
              ))}
            </select>
          </div>
          {courseId && inCourse.length === 0 && (
            <p className="fhint">No single subjects are on sale for this course yet.</p>
          )}
        </div>
      </div>

      {/* The access window stays visible while the choice is being made. A
          single subject is the shortest product on sale and nobody should
          discover that afterwards. */}
      <div className="vchip">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.2V12l3.2 2" />
        </svg>
        <span>
          {!chosen
            ? "Access shown once you choose"
            : chosen.accessMonths == null
              ? "Lifetime access"
              : `${count(chosen.accessMonths, "month")} access`}
        </span>
      </div>

      <div className="amt">
        <span className="v">{price ?? "—"}</span>
        <span className="c">{currency}</span>
      </div>
      <p className="pnote">
        {!chosen
          ? "Choose a course and subject to see the price"
          : price
            ? `${count(chosen.chapters, "chapter")} · this subject only — the rest of ${chosen.courseTitle} stays locked`
            : `Not available in ${currency}`}
      </p>

      {!chosen ? (
        <button className="btn btn-p btn-w" type="button" disabled>
          Get Subject
        </button>
      ) : owned ? (
        <Link className="btn btn-g btn-w" href="/dashboard">
          You already have this subject — continue learning
        </Link>
      ) : !price ? (
        <Link className="btn btn-g btn-w" href="/contact">
          Enquire about {currency} pricing
        </Link>
      ) : (
        // The same button the packages use, so a subject takes a discount code
        // and survives a login in exactly the same way.
        <BuyButton
          productId={chosen.productId}
          currency={currency}
          label={`Get ${chosen.subjectTitle}`}
          signedIn={signedIn}
        />
      )}
    </div>
  );
}
