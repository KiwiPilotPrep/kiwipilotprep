import Link from "next/link";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ownedProductIds } from "@/lib/entitlements";
import { formatMinor } from "@/lib/money";
import { count } from "@/lib/plural";
import { preferredCurrency, rememberCurrency, type Currency } from "@/lib/currency";
import { isComingSoon } from "@/lib/coming-soon";
import BuyButton from "@/components/checkout/BuyButton";

export const metadata = { title: "Pricing — KiwiPilotPrep", alternates: { canonical: "/pricing" } };

/**
 * The one place a course is chosen and bought.
 *
 * Everything on sale is here — the three theory packages, the two groundwork
 * courses, the complete pass, and a picker for any single subject — and every
 * button goes straight to checkout for that exact product. There used to be a
 * second page listing the same things again, so a visitor who clicked "Get
 * PPL Package" was shown the whole catalogue and asked to choose once more.
 * One page chooses; checkout charges.
 *
 * Prices, inclusions and CTAs all come from Product rows. Nothing here is a
 * hardcoded package, and nothing here is a converted price: NZD and INR are
 * two figures configured on the same product, and the toggle only decides
 * which of them is read.
 */

/** Remembers the currency, then returns to the pricing page. */
async function chooseCurrency(formData: FormData) {
  "use server";
  const value = String(formData.get("currency") ?? "");
  const currency: Currency = value === "INR" ? "INR" : "NZD";
  await rememberCurrency(currency);
  redirect(`/pricing?currency=${currency}`);
}

/** "1 month access", "3 months access", "Lifetime access". */
function accessLabel(months: number | null): string {
  return months === null ? "Lifetime access" : `${count(months, "month")} access`;
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ currency?: string; coupon?: string }>;
}) {
  const { currency: raw, coupon } = await searchParams;
  const currency = await preferredCurrency(raw);

  const [user, products] = await Promise.all([
    getCurrentUser(),
    db.product.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      include: {
        prices: true,
        items: {
          include: {
            course: {
              select: {
                id: true,
                slug: true,
                title: true,
                _count: { select: { subjects: { where: { status: "PUBLISHED" } } } },
              },
            },
            subject: {
              select: {
                id: true,
                title: true,
                course: { select: { id: true, title: true } },
                _count: {
                  select: {
                    chapters: { where: { status: "PUBLISHED" } },
                    modules: {
                      where: { status: "PUBLISHED", lessons: { some: { status: "PUBLISHED" } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const owned = user
    ? await ownedProductIds(
        user.id,
        products.map((p) => p.id),
      )
    : new Set<string>();

  /* ----------------------------------------------------------- sections --- */
  // Derived from what each product grants, not from a list of slugs, so a
  // product added in the admin console lands in the right section by itself.
  const singles = products.filter(
    (p) => p.items.length > 0 && p.items.every((i) => i.courseId === null && i.subjectId !== null),
  );
  const packages = products.filter((p) => !singles.includes(p));
  const theoryPackages = packages.filter(
    (p) => p.items.length === 1 && p.items[0].course?.slug.endsWith("-theory"),
  );
  const otherPackages = packages.filter((p) => !theoryPackages.includes(p));

  /* ------------------------------------------------- single-subject data --- */
  // The single subjects have their own focused page (/pricing/subject); here
  // we only need the cheapest, to show a "from …" on the card that links to it.
  const cheapestSingle = singles
    .map((p) => p.prices.find((x) => x.currency === currency)?.amountMinor)
    .filter((m): m is number => typeof m === "number")
    .sort((a, b) => a - b)[0];

  /* ------------------------------------------------------------- a card --- */
  const card = (product: (typeof products)[number]) => {
    const price = product.prices.find((p) => p.currency === currency);
    const isOwned = owned.has(product.id);
    // Still listed, still priced — but the material behind it is not ready,
    // so there is nothing to sell yet.
    const soon = isComingSoon(product.slug);

    return (
      <div
        className={`plan r in${soon ? " is-soon" : ""}`}
        data-plan={product.slug}
        id={product.slug}
        key={product.id}
      >
        {soon && <span className="flag flag-soon">Coming Soon</span>}
        <div className="pn">{product.items.some((i) => i.courseId) ? "Package" : "Single subject"}</div>
        <h2 className="plan-title">{product.title}</h2>
        {product.description && <p className="pd">{product.description}</p>}

        <div className="vchip">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.2V12l3.2 2" />
          </svg>
          <span>{accessLabel(product.accessMonths)}</span>
        </div>

        <div className="amt">
          {price ? (
            <>
              <span className="v">{formatMinor(price.amountMinor, currency)}</span>
              <span className="c">{currency}</span>
            </>
          ) : (
            <span className="v">—</span>
          )}
        </div>
        <p className="pnote">{price ? "one-time" : `Not available in ${currency}`}</p>

        <ul>
          {product.items.map((item) => (
            <li key={item.id}>
              <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7" />
              </svg>
              {item.course
                ? `${item.course.title} — ${count(item.course._count.subjects, "subject")}`
                : item.subject?.title}
            </li>
          ))}
          {product.items.length === 0 && (
            <li>
              <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7" />
              </svg>
              Contents being configured
            </li>
          )}
        </ul>

        {soon ? (
          <>
            <button className="btn btn-g btn-w" type="button" disabled>
              Coming Soon
            </button>
            <p className="fhint" style={{ marginTop: "10px", textAlign: "center" }}>
              The material for this course is being prepared. It is not on sale yet.
            </p>
          </>
        ) : isOwned ? (
          <Link className="btn btn-g btn-w" href="/dashboard">
            You already have this — Continue Learning
          </Link>
        ) : !price ? (
          <Link className="btn btn-g btn-w" href="/contact">
            Enquire
          </Link>
        ) : (
          // The same button signed in or out. Signed out it carries the
          // product, the currency and any code through the login and comes
          // back to this purchase rather than to a list of everything.
          <BuyButton
            productId={product.id}
            currency={currency}
            label={`Get ${product.title}`}
            signedIn={Boolean(user)}
          />
        )}
      </div>
    );
  };

  return (
    <section className="sec" id="pricing">
      <div className="wrap">
        <div className="sec-head center r in">
          <div className="eyebrow">Pricing</div>
          <h1 className="h2">Pick your licence track, or take the lot.</h1>
          <p className="lede">
            Pay once for what you need. Switching currency does not change the course — only which
            of the two prices set for it you are charged.
          </p>

          {/* The first control on the page, above every price it governs. A
              plain form, so it works with or without JavaScript, and a server
              action, so the figure shown and the figure charged are the same
              database row rather than two guesses that can drift apart. */}
          <form action={chooseCurrency} className="cur-switch">
            <span className="cur-switch-lbl" id="currency-label">
              Prices shown in
            </span>
            <div className="cur" role="group" aria-labelledby="currency-label">
              <button
                className={`curb${currency === "NZD" ? " on" : ""}`}
                name="currency"
                value="NZD"
                type="submit"
                aria-pressed={currency === "NZD"}
              >
                NZD $
              </button>
              <button
                className={`curb${currency === "INR" ? " on" : ""}`}
                name="currency"
                value="INR"
                type="submit"
                aria-pressed={currency === "INR"}
              >
                INR ₹
              </button>
            </div>
          </form>
        </div>

        {coupon === "rejected" && (
          <div className="cnote warning r in" style={{ marginTop: "18px" }}>
            <b>That discount code could not be applied</b>
            <p>Your course is still available below — buy it without the code, or try another.</p>
          </div>
        )}

        {products.length === 0 ? (
          <div className="empty panel mt-l">
            <b>No packages published yet</b>
            Products appear here as soon as an administrator publishes them.
          </div>
        ) : (
          <>
            {/* ------------------------------------------- theory packages */}
            {theoryPackages.length > 0 && (
              <>
                <h2 className="price-band r in" id="theory-packages">
                  Theory packages
                  <span>Every subject in one licence track</span>
                </h2>
                <div className="price-grid">{theoryPackages.map(card)}</div>
              </>
            )}

            {/* --------------------------------- groundwork and full access */}
            {otherPackages.length > 0 && (
              <>
                <h2 className="price-band r in" id="groundwork">
                  Flight test groundwork &amp; full access
                  <span>Preparation for the flight test, or everything at once</span>
                </h2>
                <div className="price-grid">{otherPackages.map(card)}</div>
              </>
            )}

            {/* --------------------------------------------- single subject */}
            {/* Not the whole subject selector wedged in here — its own focused
                page. This card only points at it, so the pricing page stays a
                list of packages rather than two selectors stacked together. */}
            {cheapestSingle !== undefined && (
              <div className="addon single-addon r in" data-plan="single" id="single-subject">
                <span className="addon-ic">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h9l4 4v13H6z" /><path d="M14.5 3.5V8H19M9 12h6M9 16h4" /></svg>
                </span>
                <div>
                  <h3>Buy a single subject</h3>
                  <p className="pd">
                    Any one PPL, CPL or IR subject on its own — full material, practice questions
                    and its mock exam. <b>1 month access</b>.
                  </p>
                </div>
                <div className="amt">
                  <span className="pnote">from</span>{" "}
                  <span className="v">{formatMinor(cheapestSingle, currency)}</span>
                  <span className="c">{currency}</span>
                </div>
                <Link className="btn btn-p" href="/pricing/subject">
                  Choose a subject
                </Link>
              </div>
            )}
          </>
        )}

        <p className="price-note r in">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 16v-4.5M12 8.2h.01" />
          </svg>
          Prices are set in the admin console · Access begins as soon as payment is confirmed ·
          Guarantee eligibility requires meeting all published requirements
        </p>
      </div>
    </section>
  );
}
