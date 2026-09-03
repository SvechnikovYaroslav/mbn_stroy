import type {
  CatalogSectionFilter,
} from "@/config/project";
import type {
  Project,
  ProjectSectionType,
  ProjectType,
  WorkType,
} from "@/types/project";

import {
  getCmsFeaturedProjects,
  getCmsProjectBySlug,
  getCmsProjectSlugs,
  getCmsProjects,
  getCmsProjectsBySection,
  getCmsProjectsByType,
  getCmsProjectsByWorkType,
} from "./cms-source";
import { isStaticDemoSource } from "./source";
import {
  getStaticFeaturedProjects,
  getStaticProjectBySlug,
  getStaticProjectSlugs,
  getStaticProjects,
  getStaticProjectsBySection,
  getStaticProjectsByType,
  getStaticProjectsByWorkType,
} from "./static-source";

/**
 * Public project data access.
 * Source selection lives here — not in React components.
 *
 * - GITHUB_PAGES=true → src/data/projects.ts
 * - otherwise → Payload Local API (published only)
 */
export async function getProjects(): Promise<Project[]> {
  if (isStaticDemoSource()) return getStaticProjects();
  return getCmsProjects();
}

export async function getProjectBySlug(
  slug: string
): Promise<Project | undefined> {
  if (isStaticDemoSource()) return getStaticProjectBySlug(slug);
  return getCmsProjectBySlug(slug);
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  if (isStaticDemoSource()) return getStaticFeaturedProjects(limit);
  return getCmsFeaturedProjects(limit);
}

export async function getProjectsByType(
  projectType: ProjectType
): Promise<Project[]> {
  if (isStaticDemoSource()) return getStaticProjectsByType(projectType);
  return getCmsProjectsByType(projectType);
}

export async function getProjectsByWorkType(
  workType: WorkType
): Promise<Project[]> {
  if (isStaticDemoSource()) return getStaticProjectsByWorkType(workType);
  return getCmsProjectsByWorkType(workType);
}

export async function getProjectsBySection(
  sectionType: ProjectSectionType | CatalogSectionFilter
): Promise<Project[]> {
  if (isStaticDemoSource()) return getStaticProjectsBySection(sectionType);
  return getCmsProjectsBySection(sectionType);
}

export async function getProjectSlugs(): Promise<string[]> {
  if (isStaticDemoSource()) return getStaticProjectSlugs();
  return getCmsProjectSlugs();
}

export { isStaticDemoSource } from "./source";
