#!/usr/bin/env node
/**
 * Read-only audit of a Yandex Object Storage bucket.
 * Lists all objects (Key, Size, LastModified), groups Payload originals vs
 * generated size variants (-WxH suffix), and downloads one smallest variant
 * per group for a contact sheet. Writes manifest JSON to /out.
 *
 * Usage (inside a container with @aws-sdk/client-s3):
 *   node audit-s3-media.mjs <bucket> <outDir>
 * Env: S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const [bucket, outDir] = process.argv.slice(2);
if (!bucket || !outDir) {
  console.error("usage: node audit-s3-media.mjs <bucket> <outDir>");
  process.exit(1);
}

const client = new S3Client({
  region: process.env.S3_REGION || "ru-central1",
  endpoint: process.env.S3_ENDPOINT || "https://storage.yandexcloud.net",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const SIZE_RE = /-(\d{2,5})x(\d{2,5})(\.[a-z0-9]+)$/i;

async function listAll() {
  const objects = [];
  let token;
  do {
    const r = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: token,
        MaxKeys: 1000,
      })
    );
    for (const o of r.Contents || []) objects.push(o);
    token = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (token);
  return objects;
}

const objects = await listAll();

// group: strip -WxH suffix -> base key (original)
const groups = new Map();
for (const o of objects) {
  const isVariant = SIZE_RE.test(o.Key);
  const base = isVariant ? o.Key.replace(SIZE_RE, "$3") : o.Key;
  if (!groups.has(base)) groups.set(base, { base, variants: [], original: null });
  const g = groups.get(base);
  if (isVariant) g.variants.push(o);
  else g.original = o;
}

// pick smallest file per group for the contact sheet
const picks = [];
for (const g of groups.values()) {
  const all = [g.original, ...g.variants].filter(Boolean);
  all.sort((a, b) => a.Size - b.Size);
  picks.push(all[0]);
}

mkdirSync(outDir, { recursive: true });
for (const p of picks) {
  const resp = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: p.Key })
  );
  const buf = Buffer.from(await resp.Body.transformToByteArray());
  const safe = p.Key.replace(/[^a-zA-Z0-9._-]/g, "_");
  writeFileSync(join(outDir, safe), buf);
}

const manifest = {
  bucket,
  auditedAt: new Date().toISOString(),
  totalObjects: objects.length,
  groupCount: groups.size,
  groups: [...groups.values()].map((g) => ({
    base: g.base,
    original: g.original && {
      key: g.original.Key,
      size: g.original.Size,
      lastModified: g.original.LastModified,
    },
    variants: g.variants
      .sort((a, b) => a.Size - b.Size)
      .map((v) => ({
        key: v.Key,
        size: v.Size,
        lastModified: v.LastModified,
      })),
    previewFile: (() => {
      const all = [g.original, ...g.variants].filter(Boolean).sort(
        (a, b) => a.Size - b.Size
      );
      return all[0] ? all[0].Key.replace(/[^a-zA-Z0-9._-]/g, "_") : null;
    })(),
  })),
};

writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(
  `objects=${objects.length} groups=${groups.size} previews=${picks.length}`
);
