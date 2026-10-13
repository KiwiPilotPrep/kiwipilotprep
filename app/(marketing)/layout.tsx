import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { pricingAnchorByCourse, pricingAnchorFor } from "@/lib/pricing-anchors";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import CookieNotice from "@/components/site/CookieNotice";
import SiteEffects from "@/components/site/SiteEffects";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, courses, pricingAnchors] = await Promise.all([
    getCurrentUser(),
    db.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        subjects: {
          where: { status: "PUBLISHED" },
          select: {
            _count: { select: { modules: true, syllabusTopics: true, chapters: true } },
          },
        },
      },
    }),
    pricingAnchorByCourse(),
  ]);

  // A course that has been created but not yet filled still belongs on the
  // site -- a visitor should be able to see that it is coming rather than
  // wonder whether it exists. What it must not do is look ready: a course with
  // no modules, no syllabus and no chapters has nothing to open, so it is
  // listed and marked instead of linked.
  //
  // Where the menu points depends on who is reading it. A signed-in student
  // gets the course, because that is their material. A visitor gets the pricing
  // card for the package that sells it, on the home page, because the course
  // route would only bounce them to the login screen -- which answers a
  // question they did not ask and loses the one they did.
  const tracks = courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    subjectCount: c.subjects.length,
    ready: c.subjects.some(
      (s) => s._count.modules > 0 || s._count.syllabusTopics > 0 || s._count.chapters > 0,
    ),
    href: user ? `/courses/${c.slug}` : pricingAnchorFor(pricingAnchors, c.id),
  }));

  return (
    <>
      <a className="skip-link" href="#top">Skip to main content</a>
      <SiteEffects />
      <Header user={user} tracks={tracks} />
      <main id="top" tabIndex={-1}>{children}</main>
      <Footer />
      <CookieNotice />
    </>
  );
}
