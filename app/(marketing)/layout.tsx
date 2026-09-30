import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import CookieNotice from "@/components/site/CookieNotice";
import SiteEffects from "@/components/site/SiteEffects";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, courses] = await Promise.all([
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
  ]);

  // A course that has been created but not yet filled still belongs on the
  // site -- a visitor should be able to see that it is coming rather than
  // wonder whether it exists. What it must not do is look ready: a course with
  // no modules, no syllabus and no chapters has nothing to open, so it is
  // listed and marked instead of linked.
  const tracks = courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    subjectCount: c.subjects.length,
    ready: c.subjects.some(
      (s) => s._count.modules > 0 || s._count.syllabusTopics > 0 || s._count.chapters > 0,
    ),
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
