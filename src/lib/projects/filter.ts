import type { ProjectCatalogQuery } from "@/config/project";
import type { CatalogSectionFilter } from "@/config/project";
import type {
  Project,
  ProjectSection,
  ProjectSectionType,
  ProjectType,
  WorkType,
} from "@/types/project";

/** Deduplicated union preserving first-seen order. */
export function unionWorkTypes(...lists: WorkType[][]): WorkType[] {
  const seen = new Set<WorkType>();
  const result: WorkType[] = [];

  for (const list of lists) {
    for (const workType of list) {
      if (seen.has(workType)) continue;
      seen.add(workType);
      result.push(workType);
    }
  }

  return result;
}

/**
 * Effective project work types already live on `project.workTypes`
 * (normalized in mapper / mock data). Kept for clarity at call sites.
 */
export function getEffectiveWorkTypes(project: Project): WorkType[] {
  return project.workTypes;
}

export function getSectionsByWorkType(
  project: Project,
  workType: WorkType
): ProjectSection[] {
  return project.sections.filter((section) =>
    section.workTypes.includes(workType)
  );
}

export function getSectionsByRoomType(
  project: Project,
  roomType: ProjectSectionType
): ProjectSection[] {
  return project.sections.filter((section) => section.roomType === roomType);
}

/**
 * Section matches a work filter:
 * - section.workTypes includes the work, OR
 * - section.workTypes is empty and project-level workTypes include it (legacy fallback)
 */
export function sectionMatchesWorkType(
  section: ProjectSection,
  workType: WorkType,
  projectWorkTypes: WorkType[]
): boolean {
  if (section.workTypes.length > 0) {
    return section.workTypes.includes(workType);
  }
  return projectWorkTypes.includes(workType);
}

/**
 * Combined catalog filter: AND across taxonomy groups.
 *
 * When both workType and roomType filters are set, requires a single section
 * that matches roomType and (section workTypes or empty→project fallback).
 */
export function matchesProjectFilters(
  project: Project,
  query: ProjectCatalogQuery
): boolean {
  if (
    query.projectType &&
    query.projectType !== "all" &&
    project.projectType !== query.projectType
  ) {
    return false;
  }

  const workFilter = query.workType;
  const roomFilter = query.sectionType;

  if (workFilter && roomFilter) {
    return project.sections.some(
      (section) =>
        section.roomType === roomFilter &&
        sectionMatchesWorkType(section, workFilter, project.workTypes)
    );
  }

  if (workFilter && !project.workTypes.includes(workFilter)) {
    return false;
  }

  if (
    roomFilter &&
    !project.sections.some((section) => section.roomType === roomFilter)
  ) {
    return false;
  }

  return true;
}

/**
 * Combined catalog filter: AND across taxonomy groups.
 * Client-safe — no Payload / Node-only imports.
 */
export function filterProjects(
  query: ProjectCatalogQuery,
  source: Project[]
): Project[] {
  return source.filter((project) => matchesProjectFilters(project, query));
}

export function filterByType(
  projects: Project[],
  projectType: ProjectType
): Project[] {
  return projects.filter((project) => project.projectType === projectType);
}

export function filterByWorkType(
  projects: Project[],
  workType: WorkType
): Project[] {
  return projects.filter((project) => project.workTypes.includes(workType));
}

export function filterBySection(
  projects: Project[],
  roomType: ProjectSectionType | CatalogSectionFilter
): Project[] {
  return projects.filter((project) =>
    project.sections.some((section) => section.roomType === roomType)
  );
}

export function pickFeatured(projects: Project[], limit: number): Project[] {
  const preferred = projects.filter((project) => Boolean(project.featured));

  if (preferred.length >= limit) {
    return preferred.slice(0, limit);
  }

  const preferredIds = new Set(preferred.map((project) => project.id));
  const fillers = projects.filter((project) => !preferredIds.has(project.id));
  return [...preferred, ...fillers].slice(0, limit);
}
