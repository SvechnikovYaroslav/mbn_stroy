import { projects as rawProjects } from "@/data/projects";
import type { CatalogSectionFilter } from "@/config/project";
import type {
  Project,
  ProjectSectionType,
  ProjectType,
  WorkType,
} from "@/types/project";

import {
  filterBySection,
  filterByType,
  filterByWorkType,
  pickFeatured,
  unionWorkTypes,
} from "./filter";

/** Same effective-workTypes normalization as Payload mapper (domain only). */
function normalizeProject(project: Project): Project {
  return {
    ...project,
    workTypes: unionWorkTypes(
      project.workTypes,
      ...project.sections.map((section) => section.workTypes)
    ),
  };
}

const projects = rawProjects.map(normalizeProject);

/** GitHub Pages / static demo source — never touches PostgreSQL. */
export async function getStaticProjects(): Promise<Project[]> {
  return projects;
}

export async function getStaticProjectBySlug(
  slug: string
): Promise<Project | undefined> {
  return projects.find((project) => project.slug === slug);
}

export async function getStaticFeaturedProjects(
  limit = 3
): Promise<Project[]> {
  return pickFeatured(projects, limit);
}

export async function getStaticProjectsByType(
  projectType: ProjectType
): Promise<Project[]> {
  return filterByType(projects, projectType);
}

export async function getStaticProjectsByWorkType(
  workType: WorkType
): Promise<Project[]> {
  return filterByWorkType(projects, workType);
}

export async function getStaticProjectsBySection(
  sectionType: ProjectSectionType | CatalogSectionFilter
): Promise<Project[]> {
  return filterBySection(projects, sectionType);
}

export async function getStaticProjectSlugs(): Promise<string[]> {
  return projects.map((project) => project.slug);
}
