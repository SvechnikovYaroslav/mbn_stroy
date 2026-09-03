/**
 * Seed short content for key Work Types used as public services.
 * Non-destructive — updates finishing & plumbing for content test.
 */
import "dotenv/config";

import { getPayload } from "payload";

import config from "../payload.config";

function lexicalParagraph(text: string) {
  return {
    root: {
      type: "root" as const,
      format: "" as const,
      indent: 0,
      version: 1,
      children: [
        {
          type: "paragraph" as const,
          format: "" as const,
          indent: 0,
          version: 1,
          children: [
            {
              type: "text" as const,
              detail: 0,
              format: 0,
              mode: "normal" as const,
              style: "",
              text,
              version: 1,
            },
          ],
          direction: "ltr" as const,
          textStyle: "",
          textFormat: 0,
        },
      ],
      direction: "ltr" as const,
    },
  };
}

const updates = [
  {
    slug: "finishing",
    shortDescription: "Отделочные работы в квартирах и домах.",
    descriptionText:
      "Выполняем отделочные работы в рамках ремонта квартир и домов в Туле и Тульской области. Объём и состав работ уточняются после осмотра объекта.",
    featured: true,
    showOnServicesPage: true,
  },
  {
    slug: "plumbing",
    shortDescription: "Сантехнические работы и инженерные решения.",
    descriptionText:
      "Сантехнические работы при ремонте: разводка, замена и монтаж оборудования. Точный состав работ определяется после осмотра.",
    featured: true,
    showOnServicesPage: true,
  },
] as const;

async function main() {
  const payload = await getPayload({ config });

  for (const item of updates) {
    const found = await payload.find({
      collection: "work-types",
      where: { slug: { equals: item.slug } },
      limit: 1,
      overrideAccess: true,
    });
    const doc = found.docs[0];
    if (!doc) {
      console.log(`Skip missing work type: ${item.slug}`);
      continue;
    }

    await payload.update({
      collection: "work-types",
      id: doc.id,
      data: {
        shortDescription: item.shortDescription,
        description: lexicalParagraph(item.descriptionText),
        featured: item.featured,
        showOnServicesPage: item.showOnServicesPage,
        active: true,
      },
      overrideAccess: true,
    });
    console.log(`Updated service content: ${item.slug}`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
