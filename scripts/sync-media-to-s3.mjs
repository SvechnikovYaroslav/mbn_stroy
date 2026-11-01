#!/usr/bin/env node
/**
 * Upload local media volume files to the S3 bucket under `media/` prefix
 * so that existing /api/media/file/* URLs keep working after s3Storage is
 * enabled. NEVER overwrites existing objects (HeadObject first).
 *
 * Usage (inside app container, or via `compose run`):
 *   node scripts/sync-media-to-s3.mjs [--apply]
 * Default is --dry-run: prints planned uploads only.
 *
 * Env: S3_BUCKET, S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
 * Local dir: MEDIA_DIR (default /app/media)
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const APPLY = process.argv.includes("--apply");
const MEDIA_DIR = process.env.MEDIA_DIR || "/app/media";
const bucket = process.env.S3_BUCKET?.trim();
if (!bucket) {
  console.error("S3_BUCKET is required");
  process.exit(1);
}

const client = new S3Client({
  region: process.env.S3_REGION?.trim() || "ru-central1",
  endpoint:
    process.env.S3_ENDPOINT?.trim() || "https://storage.yandexcloud.net",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const md5 = (buf) => createHash("md5").update(buf).digest("hex");

const files = readdirSync(MEDIA_DIR).filter((f) =>
  statSync(join(MEDIA_DIR, f)).isFile()
);
console.log(
  `${APPLY ? "APPLY" : "DRY-RUN"}: ${files.length} local files in ${MEDIA_DIR}`
);

let uploaded = 0;
let skipped = 0;
let mismatched = 0;
for (const f of files) {
  const key = `media/${f}`;
  const body = readFileSync(join(MEDIA_DIR, f));
  try {
    const head = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key })
    );
    const same =
      head.ContentLength === body.length &&
      (!head.ETag || head.ETag.replace(/"/g, "") === md5(body));
    if (same) {
      skipped++;
      console.log(`SKIP  ${key} (exists, identical)`);
    } else {
      mismatched++;
      console.log(
        `WARN  ${key} exists but differs (remote ${head.ContentLength}B vs local ${body.length}B) — NOT overwriting`
      );
    }
  } catch {
    if (APPLY) {
      await client.send(
        new PutObjectCommand({ Bucket: bucket, Key: key, Body: body })
      );
      console.log(`PUT   ${key} (${body.length}B)`);
      uploaded++;
    } else {
      console.log(`PLAN  ${key} (${body.length}B)`);
      uploaded++;
    }
  }
}

console.log(
  `done: ${uploaded} ${APPLY ? "uploaded" : "to upload"}, ${skipped} already present, ${mismatched} conflicts`
);
if (mismatched) process.exit(2);
