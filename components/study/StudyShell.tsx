"use client";

import { useCallback, useEffect, useSyncExternalStore, type ReactNode } from "react";

/**
 * The reading environment: navigation, content, tools — and Focus Mode.
 *
 * Focus Mode collapses the index and the tool rail and widens the reading
 * column. It is the only toggle here on purpose: the brief asks for one useful
 * control, not a panel of them.
 *
 * The choice is remembered per browser because it is a reading preference, not
 * account state — someone who studies on a laptop in focus and on a tablet
 * with the index open should get what they set on each. It is read inside an
 * effect so the server and the first client render always agree.
 */
export default function StudyShell({
  nav,
  tools,
  children,
}: {
  nav: ReactNode;
  tools?: ReactNode;
  children: ReactNode;
}) {
  // localStorage is an external store, so it is read through the API React
  // provides for exactly that. This avoids both a hydration mismatch and the
  // cascading render that a setState-inside-an-effect would cause: the server
  // snapshot is always "off", and the client's real value arrives on the first
  // commit.
  const isFocus = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);

  const toggle = useCallback(() => {
    try {
      localStorage.setItem("kpp.focus", isFocus ? "0" : "1");
    } catch {
      /* a browser that refuses storage still gets a working reader */
    }
    // Nothing else listens for our own writes, so tell the store ourselves.
    window.dispatchEvent(new Event(FOCUS_EVENT));
  }, [isFocus]);

  // Escape leaves Focus Mode — the way out of any full-bleed reading view.
  useEffect(() => {
    if (!isFocus) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFocus, toggle]);

  return (
    <div className={`study-shell${isFocus ? " is-focus" : ""}`}>
      <div className="study-nav-col">{nav}</div>

      <div className="study-read-col">{children}</div>

      <aside className="study-tool-col">
        <div className="study-tools">
          <button
            className={`tool-btn${isFocus ? " is-on" : ""}`}
            type="button"
            onClick={toggle}
            aria-pressed={isFocus}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" strokeWidth="1.7"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" />
            </svg>
            <span>{isFocus ? "Exit focus" : "Focus mode"}</span>
          </button>
          {tools}
        </div>
      </aside>

      {isFocus && (
        <button className="focus-exit" type="button" onClick={toggle}>
          Exit focus mode <kbd>Esc</kbd>
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- the store */

const FOCUS_EVENT = "kpp:focus";

function subscribe(onChange: () => void) {
  window.addEventListener(FOCUS_EVENT, onChange);
  // Another tab changing the preference should be reflected here too.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(FOCUS_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function clientSnapshot(): boolean {
  try {
    return localStorage.getItem("kpp.focus") === "1";
  } catch {
    return false;
  }
}

/** The server cannot know a browser preference, so it renders the index open. */
function serverSnapshot(): boolean {
  return false;
}
