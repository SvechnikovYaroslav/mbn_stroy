import type { Project, ProjectMedia, ProjectSection, WorkType } from "@/types/project";
import { getSectionsByWorkType } from "@/lib/projects/filter";

const DEFAULT_MEDIA_LIMIT = 12;
const DEFAULT_PROJECT_LIMIT = 6;

/**
 * Sections that explicitly list this work type (not project-level fallback).
 */
export function getProjectSectionsByWorkType(
  projects: Project[],
  workType: WorkType
): Array<{ project: Project; section: ProjectSection }> {
  const result: Array<{ project: Project; section: ProjectSection }> = [];

  for (const project of projects) {
    for (const section of getSectionsByWorkType(project, workType)) {
      result.push({ project, section });
    }
  }

  return result;
}

/**
 * Deduped media from relevant sections only.
 */
export function getRelevantServiceMedia(
  projects: Project[],
  workType: WorkType,
  limit = DEFAULT_MEDIA_LIMIT
): ProjectMedia[] {
  const seen = new Set<string>();
  const media: ProjectMedia[] = [];

  for (const { section } of getProjectSectionsByWorkType(projects, workType)) {
    for (const item of section.media) {
      if (seen.has(item.id) || seen.has(item.src)) continue;
      seen.add(item.id);
      seen.add(item.src);
      media.push(item);
      if (media.length >= limit) return media;
    }
  }

  return media;
}

/**
 * Published projects whose effective workTypes include the service.
 */
export function getProjectsByWorkType(
  projects: Project[],
  workType: WorkType,
  limit = DEFAULT_PROJECT_LIMIT
): Project[] {
  return projects
    .filter((project) => project.workTypes.includes(workType))
    .slice(0, limit);
}

/**
 * Cover selection for service cards / hero.
 */
export function resolveServiceCover(options: {
  serviceCover?: ProjectMedia;
  relevantMedia: ProjectMedia[];
  relatedProjects: Project[];
  serviceTitle: string;
}): ProjectMedia {
  if (options.serviceCover?.src) {
    return options.serviceCover;
  }

  const firstImage = options.relevantMedia.find(
    (item) => item.type === "image" && Boolean(item.src)
  );
  if (firstImage) return firstImage;

  const projectCover = options.relatedProjects.find(
    (project) => project.cover.src
  )?.cover;
  if (projectCover) return projectCover;

  return {
    id: "service-cover-placeholder",
    type: "image",
    src: "",
    alt: `${options.serviceTitle} — MBN Строй`,
  };
}
