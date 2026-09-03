/**
 * Publish one real test project into Payload for Milestone 05 verification.
 * Uploads local JPGs from public/media/projects/project-001.
 *
 * Usage:
 *   npx tsx src/scripts/publish-test-project.ts
 *
 * Does not delete existing data. Upserts by slug `remont-kvartiry-tula-cms-001`.
 */
import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import { getPayload } from "payload";

import config from "../payload.config";

const SLUG = "remont-kvartiry-tula-cms-001";
const ROOT = path.resolve(process.cwd());

const FILES = {
  cover: "public/media/projects/project-001/cover.jpg",
  bathroom: "public/media/projects/project-001/bathroom/01.jpg",
  living: "public/media/projects/project-001/living-room/01.jpg",
  bedroom: "public/media/projects/project-001/bedroom/01.jpg",
} as const;

async function uploadJpeg(
  payload: Awaited<ReturnType<typeof getPayload>>,
  relativePath: string,
  alt: string
) {
  const absolute = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Missing media file: ${relativePath}`);
  }

  const data = fs.readFileSync(absolute);
  const name = path.basename(absolute);

  return payload.create({
    collection: "media",
    data: {
      alt,
      orientation: "landscape",
    },
    file: {
      data,
      mimetype: "image/jpeg",
      name,
      size: data.length,
    },
    overrideAccess: true,
  });
}

async function resolveWorkTypeIds(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slugs: string[]
) {
  const ids = new Map<string, number>();
  for (const slug of slugs) {
    const found = await payload.find({
      collection: "work-types",
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    });
    const doc = found.docs[0];
    if (!doc) {
      throw new Error(`Work type not found: ${slug}. Run npm run seed first.`);
    }
    ids.set(slug, doc.id);
  }
  return ids;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error("PAYLOAD_SECRET is required.");
  }

  const payload = await getPayload({ config });

  const workTypeBySlug = await resolveWorkTypeIds(payload, [
    "finishing",
    "electrical",
    "plumbing",
    "tiling",
  ]);

  const projectWorkTypes = ["finishing", "electrical", "plumbing"].map(
    (slug) => workTypeBySlug.get(slug)!
  );

  console.log("Uploading media…");
  const cover = await uploadJpeg(payload, FILES.cover, "Гостиная после ремонта");
  const bathroom = await uploadJpeg(
    payload,
    FILES.bathroom,
    "Ванная после ремонта"
  );
  const living = await uploadJpeg(
    payload,
    FILES.living,
    "Гостиная после ремонта"
  );
  const bedroom = await uploadJpeg(
    payload,
    FILES.bedroom,
    "Спальня после ремонта"
  );

  const projectData = {
    title: "Ремонт квартиры 82 м²",
    slug: SLUG,
    location: "Тула",
    area: 82,
    projectType: "apartment" as const,
    renovationType: "turnkey" as const,
    workTypes: projectWorkTypes,
    durationValue: 3,
    durationUnit: "month" as const,
    year: 2025,
    description:
      "Тестовый опубликованный проект из Payload CMS для проверки frontend integration.",
    featured: true,
    cover: cover.id,
    sections: [
      {
        title: "Ванная",
        roomType: "bathroom" as const,
        workTypes: [
          workTypeBySlug.get("plumbing")!,
          workTypeBySlug.get("tiling")!,
          workTypeBySlug.get("electrical")!,
        ],
        description: "Сантехника и отделка.",
        mediaItems: [{ media: bathroom.id }],
      },
      {
        title: "Гостиная",
        roomType: "living-room" as const,
        workTypes: [workTypeBySlug.get("finishing")!],
        mediaItems: [{ media: living.id }],
      },
      {
        title: "Спальня",
        roomType: "bedroom" as const,
        workTypes: [workTypeBySlug.get("finishing")!],
        mediaItems: [{ media: bedroom.id }],
      },
    ],
    _status: "published" as const,
  };

  const existing = await payload.find({
    collection: "projects",
    where: { slug: { equals: SLUG } },
    limit: 1,
    draft: true,
    overrideAccess: true,
  });

  if (existing.docs[0]) {
    const updated = await payload.update({
      collection: "projects",
      id: existing.docs[0].id,
      data: projectData,
      draft: false,
      overrideAccess: true,
    });
    console.log(`Updated published project: ${updated.slug} (id=${updated.id})`);
  } else {
    const created = await payload.create({
      collection: "projects",
      data: projectData,
      draft: false,
      overrideAccess: true,
    });
    console.log(`Created published project: ${created.slug} (id=${created.id})`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
