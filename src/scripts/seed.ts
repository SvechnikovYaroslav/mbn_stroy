/**
 * Seed Work Types + demo Projects into Payload.
 * Does not create admin users — create the first admin via /admin.
 *
 * Usage:
 *   npm run seed
 *
 * Requires DATABASE_URL + PAYLOAD_SECRET and a running PostgreSQL.
 */
import "dotenv/config";

import { getPayload } from "payload";

import config from "../payload.config";

const workTypesSeed = [
  { title: "Отделка", slug: "finishing", sortOrder: 10 },
  { title: "Электрика", slug: "electrical", sortOrder: 20 },
  { title: "Сантехника", slug: "plumbing", sortOrder: 30 },
  { title: "Натяжные потолки", slug: "stretch-ceilings", sortOrder: 40 },
  { title: "Окна", slug: "windows", sortOrder: 50 },
  { title: "Полы", slug: "flooring", sortOrder: 60 },
  { title: "Плиточные работы", slug: "tiling", sortOrder: 70 },
  { title: "Малярные работы", slug: "painting", sortOrder: 80 },
  { title: "Демонтаж", slug: "demolition", sortOrder: 90 },
  { title: "Двери", slug: "doors", sortOrder: 100 },
  { title: "Отопление", slug: "heating", sortOrder: 110 },
  { title: "Другие работы", slug: "other", sortOrder: 120 },
] as const;

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

  const payload = await getPayload({ config });

  const workTypeIds = new Map<string, number | string>();

  for (const item of workTypesSeed) {
    const existing = await payload.find({
      collection: "work-types",
      where: { slug: { equals: item.slug } },
      limit: 1,
    });

    if (existing.docs[0]) {
      workTypeIds.set(item.slug, existing.docs[0].id);
      continue;
    }

    const created = await payload.create({
      collection: "work-types",
      data: {
        title: item.title,
        slug: item.slug,
        sortOrder: item.sortOrder,
        active: true,
      },
    });

    workTypeIds.set(item.slug, created.id);
    console.log(`Created work type: ${item.slug}`);
  }

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
        sortOrder: 0,
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
