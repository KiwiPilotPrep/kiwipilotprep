import type { NextConfig } from "next";

/**
 * Response headers applied to every route.
 *
 * The Content-Security-Policy is the one worth reading closely. Razorpay
 * Checkout loads its script from checkout.razorpay.com and opens the card form
 * in a frame from api.razorpay.com, so those hosts are named explicitly rather
 * than the policy being widened to allow anything. `'unsafe-inline'` remains on
 * script-src because Next's App Router streams inline bootstrap and flight data
 * on every page; removing it means adopting nonces across the whole render
 * path, which is a change worth making deliberately rather than as part of a
 * headers pass.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.razorpay.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Browsers will not sniff a response into a different type than we declared.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Belt and braces alongside frame-ancestors, for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing in this app uses a camera, microphone or location.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Two years, subdomains included. Only sent over HTTPS in practice.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  // Never advertise the framework version to anyone probing the site.
  poweredByHeader: false,
  reactStrictMode: true,

  experimental: {
    // A server action is refused when the Origin it arrives with does not
    // match the host serving the page — the defence against a form on someone
    // else's site posting into this one. A tunnel is a second, legitimate host
    // for the same app, so it is named here explicitly. Local testing only:
    // this list should hold nothing but the real domain in production.
    serverActions: {
      allowedOrigins: ["localhost:3100", "127.0.0.1:3100"],
    },
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Exam material, scorecards and claim documents must never sit in a
        // shared cache, and must not be replayed from the browser's back cache.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
      {
        // Routes that hand back somebody else's uploaded file.
        //
        // The site policy above is written for our own pages and would let an
        // uploaded file reach for scripts and frames if a browser were ever
        // talked into treating one as a document. These two routes get the
        // opposite policy — nothing may load, nothing may run — and it is set
        // here rather than only in the handler because a rule in this file
        // takes precedence over a header the handler sets.
        //
        // Images are still allowed from our own origin so the admin preview
        // renders; the route itself decides what may be shown inline at all.
        source: "/api/:kind(documents|contact-attachments)/:path*",
        headers: [
          {
            // `default-src 'none'` already means no script may run, no
            // subresource may load and nothing may be fetched — which is the
            // protection that matters, since the content type of an inline
            // response is chosen by the server and is never text/html.
            //
            // `sandbox` is deliberately absent. It puts the response in an
            // opaque origin, which stops the browser's own PDF viewer from
            // opening the file at all, and "Open PDF" that opens nothing is
            // not a feature. `object-src 'self'` is what lets that viewer run.
            key: "Content-Security-Policy",
            value:
              "default-src 'none'; img-src 'self' data:; object-src 'self'; " +
              "frame-ancestors 'self'",
          },
          // SAMEORIGIN rather than DENY: the preview is an <img> on our own
          // admin page, and DENY would break opening a PDF from it.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
