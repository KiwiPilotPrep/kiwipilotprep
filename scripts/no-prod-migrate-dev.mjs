/**
 * Refuses `prisma migrate dev` when NODE_ENV says production.
 *
 * `migrate dev` is a development command: it can decide the database has
 * drifted and offer to reset it, which against production data is not a
 * prompt anybody should ever be one keystroke away from. Production applies
 * migrations with `prisma migrate deploy`, which only ever plays pending
 * migrations forward and never resets anything.
 *
 * Wired into the `db:migrate` script so the guard cannot be forgotten.
 */
if (process.env.NODE_ENV === "production") {
  console.error(
    "\n  Refusing to run `prisma migrate dev` with NODE_ENV=production.\n" +
      "  It can prompt to reset the database.\n\n" +
      "  Use:  npm run db:migrate:deploy\n",
  );
  process.exit(1);
}
