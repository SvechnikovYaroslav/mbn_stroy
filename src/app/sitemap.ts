import type { MetadataRoute } from "next";

import { getProjects } from "@/lib/projects";
import { ensurePortfolioDynamic } from "@/lib/projects/dynamic";
import { getServices } from "@/lib/services";
import { ensureServicesDynamic } from "@/lib/services/dynamic";
import { absoluteUrl, isIndexingAllowed } from "@/lib/site-env";
import { isStaticDemoSource } from "@/lib/projects/source";

/** Required for `output: export` (GitHub Pages). */
export const dynamic = "force-static";

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
  if (!url) {
    // Without NEXT_PUBLIC_SITE_URL still emit path-relative for static demo tooling
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    return {
      url: `${basePath}${pathname === "/" ? "/" : pathname}`,
      ...(lastModified ? { lastModified } : {}),
    };
  }
  return {
    url,
    ...(lastModified ? { lastModified } : {}),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Staging / GitHub Pages: empty sitemap (robots already Disallow: /)
  if (!isIndexingAllowed() && !isStaticDemoSource()) {
    return [];
  }

  await Promise.all([ensurePortfolioDynamic(), ensureServicesDynamic()]);

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
}
