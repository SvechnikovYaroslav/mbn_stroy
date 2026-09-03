import type { CatalogSectionFilter } from "@/config/project";
import { getCms } from "@/lib/cms";
import { mapPayloadProject } from "@/lib/cms/project-mapper";
import type { Project as PayloadProject } from "@/payload-types";
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
} from "./filter";

const PROJECT_DEPTH = 3;

function sortPayloadProjects(docs: PayloadProject[]): PayloadProject[] {
  return [...docs].sort((a, b) => {
    const aHasOrder = typeof a.sortOrder === "number";
    const bHasOrder = typeof b.sortOrder === "number";

    if (aHasOrder && bHasOrder && a.sortOrder !== b.sortOrder) {
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    }

    if (aHasOrder !== bHasOrder) {
      return aHasOrder ? -1 : 1;
    }

    const featuredA = a.featured ? 1 : 0;
    const featuredB = b.featured ? 1 : 0;
    if (featuredA !== featuredB) return featuredB - featuredA;

    // Default: newest published / created first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function logCmsError(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`[projects:cms] ${context}: ${message}`);
}

async function findPublishedProjects(): Promise<PayloadProject[]> {
  try {
    const payload = await getCms();
    const result = await payload.find({
      collection: "projects",
      depth: PROJECT_DEPTH,
      limit: 200,
      pagination: false,
      overrideAccess: false,
      where: {
        _status: {
          equals: "published",
        },
      },
    });

    return sortPayloadProjects(result.docs);
  } catch (error) {
    logCmsError("findPublishedProjects", error);
    throw new Error("Не удалось загрузить проекты. Попробуйте позже.");
  }
}

/** Payload Local API source for normal / server runtime. */
export async function getCmsProjects(): Promise<Project[]> {
  const docs = await findPublishedProjects();
  return docs.map(mapPayloadProject);
}

export async function getCmsProjectBySlug(
  slug: string
): Promise<Project | undefined> {
  try {
    const payload = await getCms();
    const result = await payload.find({
      collection: "projects",
      depth: PROJECT_DEPTH,
      limit: 1,
      overrideAccess: false,
      where: {
        and: [
          { slug: { equals: slug } },
          { _status: { equals: "published" } },
        ],
      },
    });

    const doc = result.docs[0];
    return doc ? mapPayloadProject(doc) : undefined;
  } catch (error) {
    logCmsError("getCmsProjectBySlug", error);
    throw new Error("Не удалось загрузить проект. Попробуйте позже.");
  }
}

export async function getCmsFeaturedProjects(limit = 3): Promise<Project[]> {
  const projects = await getCmsProjects();
  return pickFeatured(projects, limit);
}

export async function getCmsProjectsByType(
  projectType: ProjectType
): Promise<Project[]> {
  return filterByType(await getCmsProjects(), projectType);
}

export async function getCmsProjectsByWorkType(
  workType: WorkType
): Promise<Project[]> {
  return filterByWorkType(await getCmsProjects(), workType);
}

export async function getCmsProjectsBySection(
  sectionType: ProjectSectionType | CatalogSectionFilter
): Promise<Project[]> {
  return filterBySection(await getCmsProjects(), sectionType);
}

export async function getCmsProjectSlugs(): Promise<string[]> {
  return (await getCmsProjects()).map((project) => project.slug);
}
