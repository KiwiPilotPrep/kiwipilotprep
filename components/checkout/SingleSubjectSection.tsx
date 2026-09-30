"use client";

import { useState } from "react";

import type { SubjectOption } from "@/lib/single-subject";

import SubjectPicker from "./SubjectPicker";

/**
 * The single-subject page's body: a currency toggle over the picker.
 *
 * Its own small client island so the dedicated /pricing/subject page can stay
 * a plain server component. Currency lives in state, exactly as the home
 * pricing section does, so switching NZD/INR reprices the picker with no
 * reload — and the choice is written to the shared cookie so it carries to
 * checkout.
 */
export default function SingleSubjectSection({
  initialCurrency = "NZD",
  options,
  courses,
  signedIn,
}: {
  initialCurrency?: "NZD" | "INR";
  options: SubjectOption[];
  courses: Array<{ id: string; title: string }>;
  signedIn: boolean;
}) {
  const [currency, setCurrency] = useState<"NZD" | "INR">(initialCurrency);

  const choose = (next: "NZD" | "INR") => {
    setCurrency(next);
    try {
      document.cookie = `kpp_currency=${next};path=/;max-age=${180 * 24 * 60 * 60};samesite=lax`;
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <div className="cur-switch">
        <span className="cur-switch-lbl" id="subject-currency-label">Prices shown in</span>
        <div className="cur" role="group" aria-labelledby="subject-currency-label">
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

      <SubjectPicker
        courses={courses}
        options={options}
        ownedIds={[]}
        signedIn={signedIn}
        currency={currency}
      />
    </>
  );
}
