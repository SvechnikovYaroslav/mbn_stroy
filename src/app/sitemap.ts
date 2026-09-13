import type { MetadataRoute } from "next";

import { getProjects } from "@/lib/projects";
import { getServices } from "@/lib/services";
import { absoluteUrl, isIndexingAllowed } from "@/lib/site-env";

const STATIC_PATHS = [
  "/",
  "/projects",
  "/services",
  "/calculator",
  "/about",
  "/contacts",
  "/privacy",
  "/personal-data-consent",
] as const;

function entry(
  pathname: string,
  lastModified?: Date
): MetadataRoute.Sitemap[number] | null {
  const url = absoluteUrl(pathname);
  if (!url) return null;
  return {
    url,
    ...(lastModified ? { lastModified } : {}),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexingAllowed()) {
    return [];
  }

  try {
    const [projects, services] = await Promise.all([
      getProjects(),
      getServices(),
    ]);

    const items: MetadataRoute.Sitemap = [];

    for (const path of STATIC_PATHS) {
      const row = entry(path);
      if (row) items.push(row);
    }

    for (const project of projects) {
      const row = entry(`/projects/${project.slug}`);
      if (row) items.push(row);
    }

    for (const service of services) {
      if (!service.showOnServicesPage) continue;
      const row = entry(`/services/${service.slug}`);
      if (row) items.push(row);
    }

    return items;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[sitemap] Falling back to static paths: ${message}`);
    const items: MetadataRoute.Sitemap = [];
    for (const path of STATIC_PATHS) {
      const row = entry(path);
      if (row) items.push(row);
    }
    return items;
  }
}
