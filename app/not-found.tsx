import Link from "next/link";

export const metadata = { title: "Page not found" };

/**
 * Also the page a student lands on when something exists but is not theirs —
 * several routes call `notFound()` rather than "forbidden" so that an id
 * cannot be probed for existence. The wording therefore has to work for both
 * "no such page" and "not yours", without hinting which it was.
 */
export default function NotFound() {
  return (
    <section className="sec">
      <div className="wrap auth-wrap">
        <div className="sec-head center r in">
          <div className="eyebrow">404</div>
          <h1 className="h2">We couldn&rsquo;t find that page.</h1>
          <p className="lede mt-s">
            The link may be out of date, or the page may not be part of your current access.
          </p>
        </div>

        <div className="acts" style={{ justifyContent: "center", marginTop: "26px" }}>
          <Link className="btn btn-p" href="/">
            Back to the homepage
          </Link>
          <Link className="btn btn-g" href="/dashboard">
            Go to my dashboard
          </Link>
        </div>

        <p className="xs" style={{ textAlign: "center", marginTop: "22px" }}>
          Still stuck? <Link href="/contact">Get in touch</Link> — we reply within three working
          days.
        </p>
      </div>
    </section>
  );
}
