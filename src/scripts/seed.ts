/**
 * Seed Work Types + demo Projects into Payload.
 * Does not create admin users — create the first admin via /admin.
 *
 * Usage:
 *   npm run seed
 *
 * Production: use `npm run seed:production` instead (no demo projects/leads).
 *
 * Requires DATABASE_URL + PAYLOAD_SECRET and a running PostgreSQL.
 */
import "dotenv/config";

import { getPayload } from "payload";

import { workTypesSeed } from "../data/work-types";
import { ensureWorkTypes } from "./lib/ensure-work-types";
import config from "../payload.config";

const demoProjects = [
  {
    title: "Квартира 72 м²",
    slug: "kvartira-72",
    location: "Тула",
    area: 72,
    projectType: "apartment" as const,
    renovationType: "turnkey" as const,
    workSlugs: ["finishing", "electrical", "plumbing", "stretch-ceilings", "windows"],
    description:
      "Демонстрационный объект в CMS. Публичный сайт пока читает mock data.",
    sections: [
      { title: "Ванная", roomType: "bathroom" as const },
      { title: "Кухня", roomType: "kitchen" as const },
      { title: "Балкон", roomType: "balcony" as const },
    ],
  },
  {
    title: "Дом 140 м²",
    slug: "dom-140",
    location: "Тульская область",
    area: 140,
    projectType: "house" as const,
    renovationType: "turnkey" as const,
    workSlugs: ["finishing", "electrical", "plumbing", "heating", "windows"],
    description: "Демонстрационный объект дома для проверки taxonomy в admin.",
    sections: [
      { title: "Кухня", roomType: "kitchen" as const },
      { title: "Ванная", roomType: "bathroom" as const },
      { title: "Гостиная", roomType: "living-room" as const },
    ],
  },
  {
    title: "Ванная 8 м²",
    slug: "vannaya-8",
    location: "Тула",
    area: 8,
    projectType: "room" as const,
    workSlugs: ["plumbing", "tiling", "finishing"],
    description: "Демонстрационный объект отдельного помещения.",
    sections: [{ title: "Ванная комната", roomType: "bathroom" as const }],
  },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run seed.");
  }
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error("PAYLOAD_SECRET is required to run seed.");
  }

  if (process.env.SITE_ENV === "production") {
    throw new Error(
      "npm run seed creates demo projects. Use npm run seed:production on production."
    );
  }

  const payload = await getPayload({ config });
  const workTypeIds = await ensureWorkTypes(payload, workTypesSeed);

  for (const project of demoProjects) {
    const existing = await payload.find({
      collection: "projects",
      where: { slug: { equals: project.slug } },
      limit: 1,
      draft: true,
    });

    if (existing.docs[0]) {
      console.log(`Skip existing project: ${project.slug}`);
      continue;
    }

    await payload.create({
      collection: "projects",
      draft: true,
      data: {
        title: project.title,
        slug: project.slug,
        location: project.location,
        area: project.area,
        projectType: project.projectType,
        renovationType: project.renovationType,
        description: project.description,
        featured: false,
        workTypes: project.workSlugs
          .map((slug) => workTypeIds.get(slug))
          .filter((id): id is number => typeof id === "number"),
        sections: project.sections.map((section) => ({
          title: section.title,
          roomType: section.roomType,
          workTypes: [],
          mediaItems: [],
        })),
      },
    });

    console.log(`Created project draft: ${project.slug}`);
  }

  console.log("Seed completed.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
