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
  // Every track in this menu leads to its price, and that does not depend on
  // who is reading. Sending a signed-in student into the course instead looked
  // helpful and was not: the marketing site is where someone decides what to
  // buy, so a tap there went to a course page and then bounced to pricing
  // anyway for anyone without it. A student who wants to study starts from
  // their dashboard, which is the surface built for it.
  const tracks = courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    subjectCount: c.subjects.length,
    ready: c.subjects.some(
      (s) => s._count.modules > 0 || s._count.syllabusTopics > 0 || s._count.chapters > 0,
    ),
    href: pricingAnchorFor(pricingAnchors, c.id),
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
