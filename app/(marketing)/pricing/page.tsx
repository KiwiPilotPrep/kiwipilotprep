import { redirect } from "next/navigation";

/**
 * There is one set of prices, and it lives on the front page.
 *
 * This route used to render a second copy of it: the same six packages, the
 * same currency switch, the same buy buttons, on a page a reader arrived at
 * without context -- usually by following "back to pricing" out of a checkout
 * they had not finished, which took them off the page they had been buying on
 * to a list of everything. Every link into it now names the section on the
 * home page instead.
 *
 * The route is kept as a redirect rather than deleted. It has been in the
 * sitemap, it is the kind of address people type and bookmark, and a 404 is a
 * worse answer to "where are the prices" than a scroll to them. Anything the
 * checkout needs to report on the way back -- a refused code, a course not yet
 * on sale -- is carried through and said next to the cards it is about.
 *
 * `/pricing/subject` is a different thing and is untouched: the twenty-one
 * individual subjects have no cards on the home page, so that page is the only
 * place they are sold.
 */
export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const carried = new URLSearchParams();
  for (const key of ["currency", "coupon", "soon", "error"]) {
    const value = params[key];
    const first = Array.isArray(value) ? value[0] : value;
    if (first) carried.set(key, first);
  }

  const query = carried.toString();
  redirect(`/${query ? `?${query}` : ""}#pricing`);
}
