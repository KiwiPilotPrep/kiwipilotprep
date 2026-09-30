"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function activeTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/** Sun/moon switcher — PRD 2.1. Persists to localStorage, follows the OS until chosen. */
export default function ThemeToggle() {
  // Starts undefined so the first render matches the server, then resolves to
  // whatever the bootstrap script already applied. Setting it in an effect body
  // would cascade a second render on every mount.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const sync = () => setTheme(activeTheme());
    sync();

    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onScheme = () => {
      // Only follow the OS while the visitor has not chosen for themselves.
      if (!localStorage.getItem("kpp.theme")) {
        document.documentElement.removeAttribute("data-theme");
        sync();
      }
    };
    mq.addEventListener("change", onScheme);
    return () => mq.removeEventListener("change", onScheme);
  }, []);

  function toggle() {
    const next: Theme = activeTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("kpp.theme", next);
    } catch {
      // private mode — the choice just will not persist
    }
    setTheme(next);
  }

  return (
    <button
      className="tt"
      onClick={toggle}
      aria-label="Switch theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <svg className="i-sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
      </svg>
      <svg className="i-moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 14.3A8.5 8.5 0 1 1 9.7 3.5a6.9 6.9 0 0 0 10.8 10.8z" />
      </svg>
    </button>
  );
}
