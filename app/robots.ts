import type { MetadataRoute } from "next";

import { SITE_URL } from "./layout";

/**
 * Everything a signed-in student sees is behind auth already; the disallow
 * list exists so crawlers do not waste budget on pages that will only ever
 * redirect them to a login screen, and so order references and attempt ids
 * never turn up in a search index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/checkout",
          "/dashboard",
          "/mocks",
          "/org",
          "/profile",
          "/progress",
          "/invite",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
