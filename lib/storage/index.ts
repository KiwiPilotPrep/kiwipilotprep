import "server-only";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Private file storage (§6, §7).
 *
 * Files never go into Postgres — the database holds metadata and a storage
 * key. The driver is chosen by environment: a local disk driver for
 * development, with the interface shaped so S3 or R2 slots in without callers
 * changing.
 *
 * Nothing here is web-reachable. The storage root sits outside `public/`, and
 * the only way to read a file is through an authenticated route that checks
 * ownership and verifies a short-lived signed token.
 */

export type StoredFile = {
  storageKey: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
};

export const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"] as const;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export class StorageError extends Error {}

function root(): string {
  // Deliberately not under public/ — a file placed there would be world-readable.
  return process.env.MEDIA_DIR ?? "./.dev/media";
}

function signingSecret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new StorageError("AUTH_SECRET is required to sign document URLs.");
  return value;
}

/** Rejects anything that is not a permitted document (§7). */
export function validateUpload(file: { type: string; size: number; name: string }): string | null {
  if (file.size === 0) return "That file is empty.";
  if (file.size > MAX_UPLOAD_BYTES) return "Files must be 10 MB or smaller.";

  const byMime = (ALLOWED_MIME as readonly string[]).includes(file.type);
  const byExtension = /\.(pdf|jpe?g|png)$/i.test(file.name);
  if (!byMime && !byExtension) return "Only PDF, JPG or PNG files are accepted.";

  return null;
}

/** Storage keys are generated, never derived from the uploaded filename. */
function newKey(prefix: string, filename: string): string {
  const ext = path.extname(filename).toLowerCase().slice(0, 8).replace(/[^.a-z0-9]/g, "");
  return `${prefix}/${crypto.randomBytes(16).toString("hex")}${ext}`;
}

export async function putFile(
  prefix: string,
  file: { name: string; type: string; size: number; arrayBuffer(): Promise<ArrayBuffer> },
): Promise<StoredFile> {
  const problem = validateUpload(file);
  if (problem) throw new StorageError(problem);

  const storageKey = newKey(prefix, file.name);
  const target = path.join(root(), storageKey);

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, Buffer.from(await file.arrayBuffer()));

  return {
    storageKey,
    // Store the original name for display only; it is never used as a path.
    filename: path.basename(file.name).slice(0, 200),
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  };
}

export async function readFile(storageKey: string): Promise<Buffer> {
  // Guard against traversal even though keys are generated.
  if (storageKey.includes("..") || path.isAbsolute(storageKey)) {
    throw new StorageError("Invalid storage key.");
  }
  return fs.readFile(path.join(root(), storageKey));
}

export async function deleteFile(storageKey: string): Promise<void> {
  await fs.unlink(path.join(root(), storageKey)).catch(() => undefined);
}

/* ------------------------------------------------------- signed access ---- */

/**
 * Short-lived token authorising one viewer to read one document.
 *
 * The viewer id is inside the signature, so a link copied out of one person's
 * browser is useless in another's — the route re-checks that the session
 * matches the token as well as verifying the signature.
 */
export function signAccessToken(args: {
  documentId: string;
  viewerId: string;
  ttlSeconds?: number;
}): string {
  const expires = Date.now() + (args.ttlSeconds ?? 300) * 1000;
  const payload = `${args.documentId}.${args.viewerId}.${expires}`;
  const signature = crypto
    .createHmac("sha256", signingSecret())
    .update(payload)
    .digest("hex");
  return `${expires}.${signature}`;
}

export function verifyAccessToken(args: {
  token: string;
  documentId: string;
  viewerId: string;
}): boolean {
  const [expiresRaw, signature] = args.token.split(".");
  if (!expiresRaw || !signature) return false;

  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;

  const expected = crypto
    .createHmac("sha256", signingSecret())
    .update(`${args.documentId}.${args.viewerId}.${expires}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
