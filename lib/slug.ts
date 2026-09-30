/**
 * URL slug generation, shared by the admin actions and the seed script so
 * both produce identical slugs for the same title.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Appends a short suffix when a slug already exists within its scope. */
export function disambiguate(slug: string, seed = Date.now()): string {
  return `${slug}-${seed.toString(36).slice(-4)}`;
}
