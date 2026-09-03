import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import { mapPayloadMedia } from "@/lib/cms/media-mapper";
import type { Media, WorkType as PayloadWorkType } from "@/payload-types";
import type { Service } from "@/types/service";

function isEditorState(
  value: unknown
): value is DefaultTypedEditorState {
  return (
    typeof value === "object" &&
    value !== null &&
    "root" in value &&
    typeof (value as { root?: unknown }).root === "object"
  );
}

/**
 * Payload WorkType → public Service domain model.
 */
export function mapPayloadWorkTypeToService(doc: PayloadWorkType): Service {
  const cover = mapPayloadMedia(doc.cover as number | Media | null | undefined, {
    imageSize: "card",
    idPrefix: `service-${doc.id}-cover`,
    fallbackAlt: `${doc.title} — MBN Строй`,
  });

  return {
    id: String(doc.id),
    slug: doc.slug,
    title: doc.title,
    shortDescription: doc.shortDescription ?? undefined,
    description: isEditorState(doc.description) ? doc.description : null,
    ...(cover ? { cover } : {}),
    featured: Boolean(doc.featured),
    showOnServicesPage: doc.showOnServicesPage !== false,
    sortOrder: typeof doc.sortOrder === "number" ? doc.sortOrder : undefined,
    seoTitle: doc.seoTitle ?? undefined,
    seoDescription: doc.seoDescription ?? undefined,
  };
}

export function sortServices(services: Service[]): Service[] {
  return [...services].sort((a, b) => {
    const featuredA = a.featured ? 1 : 0;
    const featuredB = b.featured ? 1 : 0;
    if (featuredA !== featuredB) return featuredB - featuredA;

    const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;

    return a.title.localeCompare(b.title, "ru");
  });
}
