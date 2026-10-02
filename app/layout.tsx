import type { Metadata } from "next";
import { Instrument_Sans, Inter } from "next/font/google";

import "./globals.css";

/**
 * Fonts are self-hosted through next/font rather than a <link> to Google.
 * That removes a render-blocking third-party request, eliminates the layout
 * shift while the face loads, and means no font request leaves the origin.
 */
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-instrument",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * The canonical origin. Set NEXT_PUBLIC_SITE_URL in production so canonical
 * URLs, Open Graph tags and the sitemap all point at the real domain; the
 * localhost fallback keeps development honest rather than silently emitting
 * production URLs from a dev machine.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DESCRIPTION =
  "Exam-focused PPL, CPL and IR theory preparation for New Zealand pilots — built from real student exam recalls.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KiwiPilotPrep — PPL, CPL & IR Theory Exam Preparation (NZ)",
    // Every page sets its own title; this keeps the brand on the end of it.
    template: "%s — KiwiPilotPrep",
  },
  description: DESCRIPTION,
  applicationName: "KiwiPilotPrep",
  keywords: [
    "Aspeq",
    "PPL theory",
    "CPL theory",
    "IR theory",
    "New Zealand pilot exams",
    "aviation theory exam preparation",
  ],  openGraph: {
    type: "website",
    siteName: "KiwiPilotPrep",
    locale: "en_NZ",
    url: SITE_URL,
    title: "KiwiPilotPrep — PPL, CPL & IR Theory Exam Preparation (NZ)",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "KiwiPilotPrep — Pilot Theory Exam Preparation",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Runs before first paint so a dark-mode visitor never sees a white flash.
// Mirrors lib/theme: explicit choice wins, otherwise the OS, otherwise dark.
const THEME_BOOTSTRAP = `
try {
  var t = localStorage.getItem('kpp.theme');
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-NZ"
      className={`${instrumentSans.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
