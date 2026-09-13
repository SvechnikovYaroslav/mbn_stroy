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

/**
 * Public project data access — Payload Local API, published only.
 * Demo snapshot in src/data/projects.ts is used by seed, not this layer.
 */
export async function getProjects(): Promise<Project[]> {
  return getCmsProjects();
}

export async function getProjectBySlug(
  slug: string
): Promise<Project | undefined> {
  return getCmsProjectBySlug(slug);
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  return getCmsFeaturedProjects(limit);
}

export async function getProjectsByType(
  projectType: ProjectType
): Promise<Project[]> {
  return getCmsProjectsByType(projectType);
}

export async function getProjectsByWorkType(
  workType: WorkType
): Promise<Project[]> {
  return getCmsProjectsByWorkType(workType);
}

export async function getProjectsBySection(
  sectionType: ProjectSectionType | CatalogSectionFilter
): Promise<Project[]> {
  return getCmsProjectsBySection(sectionType);
}

export async function getProjectSlugs(): Promise<string[]> {
  return getCmsProjectSlugs();
}
