import { describe, it, expect } from "vitest";
import { SignJWT, jwtVerify } from "jose";

/**
 * The session token contract from lib/auth.ts: HS256, a user id in `sub`, and
 * an expiry the server enforces. A token that fails any of these must be
 * rejected rather than treated as an anonymous-but-valid request.
 */
const SECRET = new TextEncoder().encode("a".repeat(48));
const OTHER = new TextEncoder().encode("b".repeat(48));

async function issue(userId: string, expires = "7d", key = SECRET) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(key);
}

describe("session tokens", () => {
  it("round-trips the user id", async () => {
    const token = await issue("user_123");
    const { payload } = await jwtVerify(token, SECRET);
    expect(payload.sub).toBe("user_123");
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await issue("user_123", "7d", OTHER);
    await expect(jwtVerify(token, SECRET)).rejects.toThrow();
  });

  it("rejects a tampered payload", async () => {
    const token = await issue("user_123");
    const [header, , signature] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "user_admin" }))
      .toString("base64url");
    await expect(jwtVerify(`${header}.${forged}.${signature}`, SECRET)).rejects.toThrow();
  });

  it("rejects an expired token", async () => {
    const token = await issue("user_123", "-1s");
    await expect(jwtVerify(token, SECRET)).rejects.toThrow();
  });

  it("rejects a structurally invalid token", async () => {
    await expect(jwtVerify("not-a-jwt", SECRET)).rejects.toThrow();
  });

  it("declares HS256 in the header", async () => {
    const token = await issue("user_123");
    const { protectedHeader } = await jwtVerify(token, SECRET);
    expect(protectedHeader.alg).toBe("HS256");
  });

  it("refuses an alg:none token, so the signature cannot be stripped", async () => {
    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ sub: "user_admin" })).toString("base64url");
    await expect(jwtVerify(`${header}.${payload}.`, SECRET)).rejects.toThrow();
  });

  it("carries an expiry claim", async () => {
    const token = await issue("user_123");
    const { payload } = await jwtVerify(token, SECRET);
    expect(typeof payload.exp).toBe("number");
    expect(payload.exp! * 1000).toBeGreaterThan(Date.now());
  });
});
