import type {
  Media,
  Project as PayloadProject,
  WorkType as PayloadWorkType,
} from "@/payload-types";
import { formatDuration } from "@/lib/format-duration";
import { buildMediaAltFallback } from "@/lib/media-alt";
import { unionWorkTypes } from "@/lib/projects/filter";
import type {
  DurationUnit,
  Project,
  ProjectSection,
  ProjectSectionType,
  RenovationType,
  WorkType,
} from "@/types/project";

import { mapPayloadCover, mapPayloadMedia } from "./media-mapper";

const KNOWN_WORK_TYPES: ReadonlySet<string> = new Set<WorkType>([
  "finishing",
  "electrical",
  "plumbing",
  "stretch-ceilings",
  "windows",
  "flooring",
  "tiling",
  "painting",
  "demolition",
  "doors",
  "heating",
  "other",
]);

const KNOWN_ROOM_TYPES: ReadonlySet<string> = new Set<ProjectSectionType>([
  "bathroom",
  "kitchen",
  "bedroom",
  "living-room",
  "balcony",
  "hallway",
  "floor",
  "interior",
  "other",
]);

const KNOWN_RENOVATION_TYPES: ReadonlySet<string> = new Set<RenovationType>([
  "cosmetic",
  "capital",
  "turnkey",
]);

const KNOWN_DURATION_UNITS: ReadonlySet<string> = new Set<DurationUnit>([
  "day",
  "month",
  "year",
]);

function isWorkTypeSlug(value: string): value is WorkType {
  return KNOWN_WORK_TYPES.has(value);
}

function isRoomTypeSlug(value: string): value is ProjectSectionType {
  return KNOWN_ROOM_TYPES.has(value);
}

function isRenovationTypeSlug(value: string): value is RenovationType {
  return KNOWN_RENOVATION_TYPES.has(value);
}

function isDurationUnit(value: string): value is DurationUnit {
  return KNOWN_DURATION_UNITS.has(value);
}

function isPopulatedWorkType(
  value: number | PayloadWorkType | null | undefined
): value is PayloadWorkType {
  return typeof value === "object" && value !== null && "slug" in value;
}

function mapWorkTypes(
  values: (number | PayloadWorkType)[] | null | undefined
): WorkType[] {
  if (!values?.length) return [];

  const result: WorkType[] = [];

  for (const value of values) {
    if (!isPopulatedWorkType(value)) continue;
    if (!isWorkTypeSlug(value.slug)) continue;
    result.push(value.slug);
  }

  return result;
}

function mapRoomType(
  value: string | null | undefined
): ProjectSectionType | undefined {
  if (!value || !isRoomTypeSlug(value)) return undefined;
  return value;
}

function mapSections(
  sections: PayloadProject["sections"],
  projectTitle: string
): ProjectSection[] {
  if (!sections?.length) return [];

  return sections.map((section, index) => {
    const fallbackAlt = buildMediaAltFallback({
      sectionTitle: section.title,
      projectTitle,
      kind: "section",
    });

    const media =
      section.mediaItems
        ?.map((item, mediaIndex) =>
          mapPayloadMedia(item.media as number | Media, {
            imageSize: "large",
            idPrefix: `s${section.id ?? index}-m${mediaIndex}`,
            fallbackAlt,
          })
        )
        .filter((item): item is NonNullable<typeof item> => Boolean(item)) ??
      [];

    const roomType = mapRoomType(section.roomType);

    return {
      id: section.id ?? `section-${index}`,
      title: section.title,
      ...(roomType ? { roomType } : {}),
      workTypes: mapWorkTypes(section.workTypes),
      description: section.description ?? undefined,
      media,
    };
  });
}

/**
 * Payload Project document → frontend domain Project.
 * `workTypes` is the effective union of project + section work types (not persisted).
 */
export function mapPayloadProject(doc: PayloadProject): Project {
  const sections = mapSections(doc.sections, doc.title);
  const projectWorkTypes = mapWorkTypes(doc.workTypes);
  const sectionWorkTypes = sections.flatMap((section) => section.workTypes);
  const durationUnit =
    doc.durationUnit && isDurationUnit(doc.durationUnit)
      ? doc.durationUnit
      : undefined;
  const durationValue =
    typeof doc.durationValue === "number" ? doc.durationValue : undefined;

  return {
    id: String(doc.id),
    slug: doc.slug || String(doc.id),
    title: doc.title,
    location: doc.location,
    area: doc.area ?? undefined,
    projectType: doc.projectType,
    workTypes: unionWorkTypes(projectWorkTypes, sectionWorkTypes),
    renovationType:
      doc.renovationType && isRenovationTypeSlug(doc.renovationType)
        ? doc.renovationType
        : undefined,
    status: "completed",
    durationValue,
    durationUnit,
    duration: formatDuration(durationValue, durationUnit),
    year: doc.year ?? undefined,
    description: doc.description ?? undefined,
    featured: Boolean(doc.featured),
    sortOrder:
      typeof doc.sortOrder === "number" ? doc.sortOrder : undefined,
    cover: mapPayloadCover(doc.cover, doc.title),
    sections,
  };
}
