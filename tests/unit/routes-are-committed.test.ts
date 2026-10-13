import { execFileSync } from "node:child_process";

import { describe, expect, it } from "vitest";

/**
 * Every route the app defines must actually be in the repository.
 *
 * This exists because of a bug that was invisible everywhere except
 * production. The attempt report lived at a route segment named `report.pdf`,
 * and `.gitignore` carries `*.pdf` to keep generated reports out of the
 * repository. A gitignore pattern matches a directory as readily as a file, so
 * the whole `report.pdf/` directory was ignored and the `route.ts` inside it
 * was never committed.
 *
 * The result: it worked on every developer machine, every local test passed,
 * and the deployed site answered the download link with a 404 page — because
 * the handler was not there at all. Nothing in a build, a typecheck or a test
 * run can see that, since they all read the working tree.
 *
 * So the check is on the repository rather than the filesystem: ask git which
 * files under `app/` it is ignoring, and fail if any of them is a route.
 */
describe("app routes are committed", () => {
  it("git is not ignoring any route, page or layout under app/", () => {
    const ignored = execFileSync(
      "git",
      ["ls-files", "--others", "--ignored", "--exclude-standard", "--", "app/"],
      { encoding: "utf8" },
    )
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const routeLike = ignored.filter((path) =>
      /(^|\/)(route|page|layout|template|loading|error|not-found|default)\.(ts|tsx|js|jsx)$/.test(
        path,
      ),
    );

    expect(
      routeLike,
      `These files define routes but git is ignoring them, so they do not exist in a deployment:\n` +
        routeLike.map((p) => `  ${p}`).join("\n"),
    ).toEqual([]);
  });

  it("no route segment is named like a file, which is how the last one got ignored", () => {
    const tracked = execFileSync("git", ["ls-files", "--", "app/"], { encoding: "utf8" })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    // A directory in the route tree with a dot in its name is the shape that
    // collides with ignore patterns written for files. Route groups like
    // `(student)` and dynamic segments like `[attemptId]` are fine, and so is a
    // catch-all like `[...removed]` — its dots are Next's syntax, not an
    // extension. A segment that reads like `report.pdf` is the dangerous one.
    const offenders = new Set<string>();
    for (const path of tracked) {
      const segments = path.split("/").slice(0, -1); // directories only
      for (const segment of segments) {
        if (segment.startsWith("[") || segment.startsWith("(")) continue;
        if (segment.includes(".")) offenders.add(segment);
      }
    }

    expect(
      [...offenders],
      `A route directory named like a file is one ignore rule away from vanishing ` +
        `from a deployment. Rename it and rewrite the public URL instead.`,
    ).toEqual([]);
  });
});
