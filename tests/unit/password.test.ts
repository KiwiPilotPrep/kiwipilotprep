import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";

/**
 * Exercises the hashing contract lib/auth.ts relies on. That module imports
 * next/headers, so the primitives are tested here directly rather than
 * dragging a request context into a unit run.
 */
const COST = 12;
const hash = (plain: string) => bcrypt.hash(plain, COST);
const verify = (plain: string, digest: string) => bcrypt.compare(plain, digest);

describe("password hashing", () => {
  it("accepts the correct password", async () => {
    const digest = await hash("student12345");
    expect(await verify("student12345", digest)).toBe(true);
  });

  it("rejects the wrong password", async () => {
    const digest = await hash("student12345");
    expect(await verify("student12346", digest)).toBe(false);
  });

  it("is case sensitive", async () => {
    const digest = await hash("Correct Horse");
    expect(await verify("correct horse", digest)).toBe(false);
  });

  it("never stores the plaintext", async () => {
    const digest = await hash("hunter2hunter2");
    expect(digest).not.toContain("hunter2");
  });

  it("salts — the same password hashes differently every time", async () => {
    const [a, b] = await Promise.all([hash("same-password"), hash("same-password")]);
    expect(a).not.toBe(b);
    // ...and both still verify
    expect(await verify("same-password", a)).toBe(true);
    expect(await verify("same-password", b)).toBe(true);
  });

  it("uses cost factor 12", async () => {
    const digest = await hash("whatever");
    expect(digest.split("$")[2]).toBe(String(COST));
  });

  it("rejects an empty password against a real hash", async () => {
    const digest = await hash("not-empty");
    expect(await verify("", digest)).toBe(false);
  });

  it("handles unicode passwords", async () => {
    const digest = await hash("pāhī-kaiārahi-🛩");
    expect(await verify("pāhī-kaiārahi-🛩", digest)).toBe(true);
  });
});
