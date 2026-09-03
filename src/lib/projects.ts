import { projects } from "@/data/projects";
import type { CatalogSectionFilter } from "@/config/project";
import type { Project, ProjectSectionType, ProjectType } from "@/types/project";

export function getProjects(): Project[] {
  return projects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getProjectsByType(projectType: ProjectType): Project[] {
  return projects.filter((project) => project.projectType === projectType);
}

export function getProjectsBySection(
  sectionType: ProjectSectionType | CatalogSectionFilter
): Project[] {
  return projects.filter((project) =>
    project.sections.some((section) => section.type === sectionType)
  );
}

export function getFeaturedProjects(limit = 3): Project[] {
  return projects.slice(0, limit);
}

export function getProjectSlugs(): string[] {
  return projects.map((project) => project.slug);
}
