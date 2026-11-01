#!/usr/bin/env node
/**
 * Upload a local file to S3-compatible storage (Yandex Object Storage).
 * Usage: node scripts/upload-s3.mjs <file> <object-key>
 * Never logs access keys.
 */
import { readFileSync, statSync } from "node:fs";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const [filePath, key] = process.argv.slice(2);

if (!filePath || !key) {
  console.error("Usage: node scripts/upload-s3.mjs <file> <object-key>");
  process.exit(1);
}

const bucket = process.env.S3_BUCKET?.trim();
const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
const endpoint =
  process.env.S3_ENDPOINT?.trim() || "https://storage.yandexcloud.net";
const region = process.env.S3_REGION?.trim() || "ru-central1";

if (!bucket || !accessKeyId || !secretAccessKey) {
  console.error(
    "S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are required."
  );
  process.exit(1);
}

const client = new S3Client({
  region,
  endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
});

const body = readFileSync(filePath);

await client.send(
  new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: "application/gzip",
  })
);

const head = await client.send(
  new HeadObjectCommand({ Bucket: bucket, Key: key })
);

const expected = statSync(filePath).size;
if (head.ContentLength !== expected) {
  console.error(
    `Verification failed: s3://${bucket}/${key} size ${head.ContentLength} != local ${expected}`
  );
  process.exit(1);
}

console.log(`Uploaded and verified s3://${bucket}/${key} (${expected} bytes)`);
