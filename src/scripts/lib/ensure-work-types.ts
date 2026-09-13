import type { Payload } from "payload";

type WorkTypeSeed = {
  title: string;
  slug: string;
  sortOrder: number;
};

/**
 * Insert missing work types only. Never updates existing CMS rows.
 */
export async function ensureWorkTypes(
  payload: Payload,
  items: readonly WorkTypeSeed[]
): Promise<Map<string, number | string>> {
  const workTypeIds = new Map<string, number | string>();

  for (const item of items) {
    const existing = await payload.find({
      collection: "work-types",
      where: { slug: { equals: item.slug } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs[0]) {
      workTypeIds.set(item.slug, existing.docs[0].id);
      continue;
    }

    const created = await payload.create({
      collection: "work-types",
      overrideAccess: true,
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

  return workTypeIds;
}
