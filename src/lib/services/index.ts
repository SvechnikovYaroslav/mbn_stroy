import { demoServices } from "@/data/services";
import { getCms } from "@/lib/cms";
import { mapPayloadWorkTypeToService, sortServices } from "@/lib/services/mapper";
import { isStaticDemoSource } from "@/lib/projects/source";
import type { Service } from "@/types/service";

async function getCmsServices(): Promise<Service[]> {
  try {
    const payload = await getCms();
    const result = await payload.find({
      collection: "work-types",
      depth: 1,
      limit: 100,
      pagination: false,
      overrideAccess: false,
      where: {
        and: [
          { active: { equals: true } },
          { showOnServicesPage: { equals: true } },
        ],
      },
    });

    return sortServices(result.docs.map(mapPayloadWorkTypeToService));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[services] Failed to load: ${message}`);
    throw new Error("Не удалось загрузить услуги. Попробуйте позже.");
  }
}

async function getCmsServiceBySlug(slug: string): Promise<Service | undefined> {
  try {
    const payload = await getCms();
    const result = await payload.find({
      collection: "work-types",
      depth: 1,
      limit: 1,
      overrideAccess: false,
      where: {
        and: [
          { slug: { equals: slug } },
          { active: { equals: true } },
          { showOnServicesPage: { equals: true } },
        ],
      },
    });

    const doc = result.docs[0];
    return doc ? mapPayloadWorkTypeToService(doc) : undefined;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[services] Failed to load by slug: ${message}`);
    throw new Error("Не удалось загрузить услугу. Попробуйте позже.");
  }
}

export async function getServices(): Promise<Service[]> {
  if (isStaticDemoSource()) {
    return sortServices(
      demoServices.filter((service) => service.showOnServicesPage)
    );
  }
  return getCmsServices();
}

export async function getServiceBySlug(
  slug: string
): Promise<Service | undefined> {
  if (isStaticDemoSource()) {
    return demoServices.find(
      (service) => service.slug === slug && service.showOnServicesPage
    );
  }
  return getCmsServiceBySlug(slug);
}

export async function getFeaturedServices(limit = 6): Promise<Service[]> {
  const services = await getServices();
  const featured = services.filter((service) => service.featured);
  if (featured.length > 0) return featured.slice(0, limit);
  return services.slice(0, limit);
}

export async function getServiceSlugs(): Promise<string[]> {
  return (await getServices()).map((service) => service.slug);
}

export { isStaticDemoSource };
