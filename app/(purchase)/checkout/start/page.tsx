import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { alreadyOwnsProduct } from "@/lib/entitlements";
import { startCheckout } from "@/lib/checkout";
import { isComingSoon } from "@/lib/coming-soon";

export const metadata = { title: "Starting checkout" };

/**
 * The purchase entry point (§17).
 *
 * Its whole job is to survive the detours. Someone clicks "Get PPL Package"
 * while logged out; they are sent to log in, then to confirm their email, and
 * each of those sends them back here with the product still attached. Without
 * this, the chosen course is lost the moment they are bounced to a form and
 * they have to find it again afterwards.
 *
 * The product id travels through, but nothing about it is trusted: the price,
 * the currency and the availability are all read from the database here, after
 * the round trip, exactly as if the request had arrived cold.
 *
 * It sits outside the `(student)` group on purpose. That group's layout gates
 * every page behind `requireUser()`, which redirects to a bare `/login` — so
 * while this page lived there the layout answered first and the `next` below
 * never ran. A signed-out student clicked "Get PPL Package", logged in, and
 * arrived at their dashboard with no idea where their purchase had gone. This
 * page renders nothing and does its own gating, so it needs no chrome.
 */
export default async function StartCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; currency?: string; coupon?: string }>;
}) {
  const { product: productId, currency: currencyParam, coupon } = await searchParams;
  if (!productId) redirect("/pricing");

  const currency = currencyParam === "INR" ? "INR" : "NZD";
  // The code the student typed on the pricing card travels with the product
  // so signing in or confirming an address does not quietly drop it. It is
  // still only a claim: `startCheckout` re-evaluates it against the stored
  // price before anything is charged.
  const couponCode = coupon?.trim().slice(0, 40) || undefined;
  const here =
    `/checkout/start?product=${encodeURIComponent(productId)}&currency=${currency}` +
    (couponCode ? `&coupon=${encodeURIComponent(couponCode)}` : "");

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(here)}`);
  if (!user.emailVerifiedAt) redirect(`/verify/sent?next=${encodeURIComponent(here)}`);

  // Re-read the product rather than trusting anything carried through the
  // detour. An id in a URL is a claim about what to sell, not what it costs.
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true, status: true },
  });
  if (!product || product.status !== "PUBLISHED") redirect("/pricing?error=unavailable");

  // A disabled button stops the click, not the URL. Without this an old link
  // or a typed address would still open an order for a course that has no
  // material behind it yet.
  if (isComingSoon(product.slug)) redirect(`/pricing?soon=1#${product.slug}`);

  if (await alreadyOwnsProduct(user.id, product.id)) redirect("/dashboard?owned=1");

  const result = await startCheckout({ user, productId: product.id, currency, couponCode });

  if (!result.ok) {
    if (result.alreadyOwned) redirect("/dashboard?owned=1");
    // A code that no longer applies must not cost them the purchase: send
    // them back to the card with the reason, not to a dead end.
    if (result.couponRejected) {
      redirect(`/pricing?currency=${currency}&coupon=rejected#${product.slug}`);
    }
    redirect(`/pricing?currency=${currency}#${product.slug}`);
  }

  // The order summary, not the gateway. Currency and any discount were
  // settled on the pricing page, but the student still gets to read back what
  // they are about to be charged before a payment window opens.
  redirect(`/checkout/${result.orderId}`);
}
