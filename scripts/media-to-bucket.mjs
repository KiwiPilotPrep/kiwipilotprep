#!/usr/bin/env node
/**
 * Copies MEDIA_DIR into the S3-compatible bucket that lib/storage reads from
 * when S3_BUCKET is set.
 *
 * Needed because a serverless host has no persistent disk: the bytes behind
 * every MediaAsset, guarantee-claim document and contact attachment live on a
 * local disk in development and must be moved before the app runs anywhere
 * without one.
 *
 * Storage keys are preserved exactly. The database stores a key, not a path,
 * so nothing in Postgres changes and nothing needs re-importing — the same key
 * that resolved to a file on disk resolves to an object in the bucket.
 *
 * Safe to re-run. An object already present at its full size is skipped, so an
 * interrupted run resumes instead of starting over.
 *
 *   node scripts/media-to-bucket.mjs [--dry-run] [--concurrency N]
 *
 * Reads S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY,
 * S3_REGION (default "auto") and MEDIA_DIR from the environment. Pass them with
 * `node --env-file=.env.bucket scripts/media-to-bucket.mjs` rather than
 * exporting credentials into your shell history.
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const concurrency = Number(
  argv[argv.indexOf("--concurrency") + 1] ?? (argv.includes("--concurrency") ? NaN : 8),
);

if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 64) {
  fail("--concurrency must be an integer between 1 and 64.");
}

const CONTENT_TYPES = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

function required(name) {
  const value = process.env[name];
  if (!value) fail(`${name} is not set.`);
  return value;
}

const bucket = required("S3_BUCKET");
const mediaDir = process.env.MEDIA_DIR ?? "./.dev/media";

const s3 = new S3Client({
  // R2 requires a region to be present and ignores its value. A provider that
  // does care about it — S3, Supabase Storage — needs the real one.
  region: process.env.S3_REGION ?? "auto",
  endpoint: required("S3_ENDPOINT"),
  // R2 and S3 take the SDK default of virtual-hosted style; Supabase Storage
  // only answers to path style. Must match what lib/storage uses.
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  credentials: {
    accessKeyId: required("S3_ACCESS_KEY_ID"),
    secretAccessKey: required("S3_SECRET_ACCESS_KEY"),
  },
});

/** Every file under `dir`, as storage keys relative to it. */
async function walk(dir, prefix = "") {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") fail(`MEDIA_DIR does not exist: ${dir}`);
    throw error;
  }

  const found = [];
  for (const entry of entries) {
    // Keys always use forward slashes; path.join would produce backslashes on
    // Windows and write objects the app could never look up.
    const key = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      found.push(...(await walk(path.join(dir, entry.name), key)));
    } else if (entry.isFile()) {
      found.push(key);
    }
  }
  return found;
}

/** `true` when the object is already there at the same size. */
async function alreadyUploaded(key, sizeBytes) {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return head.ContentLength === sizeBytes;
  } catch (error) {
    const status = error?.$metadata?.httpStatusCode;
    if (status === 404 || error?.name === "NotFound") return false;
    throw error;
  }
}

async function main() {
  console.log(`\n  Source : ${path.resolve(mediaDir)}`);
  console.log(`  Bucket : ${bucket}`);
  if (dryRun) console.log("  Mode   : DRY RUN — nothing will be written");

  const keys = await walk(mediaDir);
  if (keys.length === 0) fail(`No files found under ${mediaDir}.`);

  const sizes = new Map();
  let totalBytes = 0;
  for (const key of keys) {
    const { size } = await fs.stat(path.join(mediaDir, key));
    sizes.set(key, size);
    totalBytes += size;
  }

  console.log(
    `  Files  : ${keys.length} (${(totalBytes / 1024 / 1024).toFixed(0)} MB)\n`,
  );

  const counts = { uploaded: 0, skipped: 0, failed: 0 };
  const failures = [];
  let next = 0;
  let done = 0;

  async function worker() {
    while (next < keys.length) {
      const key = keys[next++];
      const size = sizes.get(key);

      try {
        if (await alreadyUploaded(key, size)) {
          counts.skipped++;
        } else if (dryRun) {
          counts.uploaded++;
        } else {
          await s3.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: key,
              Body: await fs.readFile(path.join(mediaDir, key)),
              ContentType:
                CONTENT_TYPES[path.extname(key).toLowerCase()] ??
                "application/octet-stream",
            }),
          );
          counts.uploaded++;
        }
      } catch (error) {
        counts.failed++;
        failures.push(`${key} — ${error.message}`);
      }

      done++;
      if (done % 50 === 0 || done === keys.length) {
        process.stdout.write(`\r  ${done}/${keys.length} processed`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  console.log(
    `\n\n  uploaded ${counts.uploaded}   skipped ${counts.skipped}   failed ${counts.failed}`,
  );

  if (failures.length > 0) {
    console.error("\n  Failures:");
    for (const line of failures.slice(0, 20)) console.error(`    ${line}`);
    if (failures.length > 20) {
      console.error(`    ... and ${failures.length - 20} more`);
    }
  }

  await reconcileWithDatabase();

  if (counts.failed > 0) {
    fail("Some files did not upload. Re-run to retry only those.");
  }
  console.log("\n  Done.\n");
}

/**
 * Every MediaAsset row points at a key the app will try to read. A row whose
 * object is missing is a broken diagram on a live page, so it is worth knowing
 * now rather than from a student.
 */
async function reconcileWithDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log("\n  DATABASE_URL not set — skipping the MediaAsset check.");
    return;
  }

  const { PrismaClient } = await import("@prisma/client");
  const db = new PrismaClient();

  try {
    const assets = await db.mediaAsset.findMany({ select: { storageKey: true } });
    const missing = [];

    for (const { storageKey } of assets) {
      try {
        await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: storageKey }));
      } catch {
        missing.push(storageKey);
      }
    }

    if (missing.length === 0) {
      console.log(`\n  All ${assets.length} MediaAsset rows resolve in the bucket.`);
    } else {
      console.error(
        `\n  ${missing.length} of ${assets.length} MediaAsset rows have no object:`,
      );
      for (const key of missing.slice(0, 20)) console.error(`    ${key}`);
      if (missing.length > 20) console.error(`    ... and ${missing.length - 20} more`);
    }
  } finally {
    await db.$disconnect();
  }
}

await main();
