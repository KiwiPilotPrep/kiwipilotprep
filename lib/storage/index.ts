import "server-only";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Private file storage (§6, §7).
 *
 * Files never go into Postgres — the database holds metadata and a storage
 * key. The driver is chosen by environment: local disk when nothing else is
 * configured, and an S3-compatible bucket (Cloudflare R2, S3, anything
 * speaking the same API) as soon as `S3_BUCKET` is set.
 *
 * The bucket driver is not an optimisation. A serverless host has no
 * persistent disk — the filesystem is read-only apart from a per-invocation
 * `/tmp` — so there the disk driver cannot store an upload at all, and cannot
 * read back one written by an earlier deploy. Lesson diagrams, question
 * images, thumbnails and guarantee-claim documents are all served through this
 * module, so on such a host the bucket is the only working configuration.
 *
 * Nothing here is web-reachable under either driver. The bucket stays private
 * — no public access, no custom domain — and the only way to read a file is
 * through an authenticated route that checks ownership and verifies a
 * short-lived signed token.
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

/* -------------------------------------------------------------- drivers ---- */

type Driver = {
  put(key: string, body: Buffer, mimeType: string): Promise<void>;
  get(key: string): Promise<Buffer>;
  remove(key: string): Promise<void>;
};

function diskRoot(): string {
  // Deliberately not under public/ — a file placed there would be world-readable.
  return process.env.MEDIA_DIR ?? "./.dev/media";
}

const diskDriver: Driver = {
  async put(key, body) {
    const target = path.join(diskRoot(), key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, body);
  },

  async get(key) {
    return fs.readFile(path.join(diskRoot(), key));
  },

  async remove(key) {
    await fs.unlink(path.join(diskRoot(), key)).catch(() => undefined);
  },
};

type S3Config = {
  bucket: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
};

/** `null` when no bucket is configured, which selects the disk driver. */
function s3Config(): S3Config | null {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) return null;

  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  // Half-configured is worse than unconfigured: quietly falling back to a disk
  // the host does not have would accept uploads and then lose them. Name what
  // is missing and refuse instead.
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    const missing = [
      ["S3_ENDPOINT", endpoint],
      ["S3_ACCESS_KEY_ID", accessKeyId],
      ["S3_SECRET_ACCESS_KEY", secretAccessKey],
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name);

    throw new StorageError(
      `S3_BUCKET is set but ${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} not.`,
    );
  }

  return {
    bucket,
    endpoint,
    // R2 requires a region to be present and ignores its value. A provider
    // that does care about it — S3, Supabase Storage — needs the real one.
    region: process.env.S3_REGION ?? "auto",
    accessKeyId,
    secretAccessKey,
    // Whether the bucket goes in the URL path rather than the hostname.
    // R2 and S3 are happy with virtual-hosted style, which is the SDK default;
    // Supabase Storage only answers to path style. Getting it wrong fails at
    // DNS or with a 404, not with anything that names the cause.
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  };
}

// The SDK is loaded on demand, so a disk-only deployment never pays to bundle
// it, and the client is cached because building one per request would rebuild
// the request signer every time.
let clientPromise: Promise<import("@aws-sdk/client-s3").S3Client> | null = null;

function s3Client(config: S3Config) {
  if (!clientPromise) {
    clientPromise = import("@aws-sdk/client-s3").then(
      ({ S3Client }) =>
        new S3Client({
          region: config.region,
          endpoint: config.endpoint,
          forcePathStyle: config.forcePathStyle,
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          },
        }),
    );
  }
  return clientPromise;
}

function s3Driver(config: S3Config): Driver {
  return {
    async put(key, body, mimeType) {
      const [client, { PutObjectCommand }] = await Promise.all([
        s3Client(config),
        import("@aws-sdk/client-s3"),
      ]);

      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: body,
          ContentType: mimeType,
        }),
      );
    },

    async get(key) {
      const [client, { GetObjectCommand }] = await Promise.all([
        s3Client(config),
        import("@aws-sdk/client-s3"),
      ]);

      const response = await client.send(
        new GetObjectCommand({ Bucket: config.bucket, Key: key }),
      );

      // Uploads are capped at MAX_UPLOAD_BYTES, so reading a whole object into
      // memory is bounded. Callers hand the bytes straight to a response.
      if (!response.Body) throw new StorageError("Stored object has no body.");
      return Buffer.from(await response.Body.transformToByteArray());
    },

    async remove(key) {
      try {
        const [client, { DeleteObjectCommand }] = await Promise.all([
          s3Client(config),
          import("@aws-sdk/client-s3"),
        ]);

        await client.send(
          new DeleteObjectCommand({ Bucket: config.bucket, Key: key }),
        );
      } catch {
        // Same contract as the disk driver: deleting what has already gone, or
        // failing to, must not break the cleanup the caller is in the middle of.
      }
    },
  };
}

function driver(): Driver {
  const config = s3Config();
  return config ? s3Driver(config) : diskDriver;
}

/* -------------------------------------------------------------- uploads ---- */

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
  const mimeType = file.type || "application/octet-stream";

  await driver().put(storageKey, Buffer.from(await file.arrayBuffer()), mimeType);

  return {
    storageKey,
    // Store the original name for display only; it is never used as a path.
    filename: path.basename(file.name).slice(0, 200),
    mimeType,
    sizeBytes: file.size,
  };
}

export async function readFile(storageKey: string): Promise<Buffer> {
  // Guard against traversal even though keys are generated.
  if (storageKey.includes("..") || path.isAbsolute(storageKey)) {
    throw new StorageError("Invalid storage key.");
  }
  return driver().get(storageKey);
}

export async function deleteFile(storageKey: string): Promise<void> {
  await driver().remove(storageKey);
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
