"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { initHeader, initReveal } from "@/lib/site-interactions";

/**
 * Page-wide Phase 1 behaviours: sticky header and reveal-on-scroll.
 * Re-runs per route so sections rendered by a new page still animate in.
 */
export default function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanups = [initHeader(), initReveal()];
    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
