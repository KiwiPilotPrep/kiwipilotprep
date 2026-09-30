"use client";

import { useState } from "react";

import { RULES } from "@/lib/password-policy";

/**
 * A password input that shows the rules and ticks them off as you type.
 *
 * The list is rendered from the same `RULES` the server checks against, so the
 * two cannot drift apart. This is UX, not security — the server applies the
 * policy again on submit and is the only thing that decides.
 *
 * The checklist is always visible rather than appearing on the first mistake:
 * someone should be able to read what is wanted before they start typing, not
 * be corrected afterwards.
 */
export default function PasswordField({
  name = "password",
  id = "password",
  label = "Password",
  autoComplete = "new-password",
}: {
  name?: string;
  id?: string;
  label?: string;
  autoComplete?: string;
}) {
  const [value, setValue] = useState("");
  const [shown, setShown] = useState(false);

  return (
    <div className="fld">
      <label htmlFor={id}>{label}</label>

      <div className="pw-wrap">
        <input
          id={id}
          name={name}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-describedby={`${id}-rules`}
          required
        />
        <button
          className="pw-toggle"
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-pressed={shown}
        >
          {shown ? "Hide" : "Show"}
        </button>
      </div>

      <ul className="pw-rules" id={`${id}-rules`}>
        {RULES.map((rule) => {
          // Nothing is marked failed before they have typed anything — an
          // empty form covered in red crosses is just noise.
          const met = value.length > 0 && rule.test(value);
          const state = value.length === 0 ? "idle" : met ? "met" : "unmet";
          return (
            <li className={`pw-rule ${state}`} key={rule.id}>
              <span aria-hidden="true" className="pw-mark">
                {met ? "✓" : "•"}
              </span>
              <span>{rule.label}</span>
              {/* Read out only once satisfied, so a screen reader is not told
                  about every failure on every keystroke. */}
              {met && <span className="sr-only"> — met</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
