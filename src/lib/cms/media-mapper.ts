import type { Media } from "@/payload-types";
import type {
  MediaOrientation,
  ProjectMedia,
  ProjectMediaType,
} from "@/types/project";

type MediaSize = "thumbnail" | "card" | "large";

function isPopulatedMedia(
  value: number | Media | null | undefined
): value is Media {
  return typeof value === "object" && value !== null && "id" in value;
}

function mediaKind(mimeType?: string | null): ProjectMediaType {
  if (mimeType?.startsWith("video/")) return "video";
  return "image";
}

function pickImageUrl(media: Media, preferred?: MediaSize): string | undefined {
  if (preferred && media.sizes?.[preferred]?.url) {
    return media.sizes[preferred]?.url ?? undefined;
  }
  return media.url ?? media.thumbnailURL ?? undefined;
}

/**
 * Map Payload Media → frontend ProjectMedia.
 * Payload URLs (/api/media/...) are returned as-is — never prefixed with GitHub Pages basePath.
 */
export function mapPayloadMedia(
  value: number | Media | null | undefined,
  options?: { imageSize?: MediaSize; idPrefix?: string }
): ProjectMedia | null {
  if (!isPopulatedMedia(value)) return null;

  const type = mediaKind(value.mimeType);
  const src =
    type === "video"
      ? (value.url ?? undefined)
      : (pickImageUrl(value, options?.imageSize) ?? value.url ?? undefined);

  if (!src) return null;

  return {
    id: `${options?.idPrefix ?? "media"}-${value.id}`,
    type,
    src,
    alt: value.alt ?? undefined,
    caption: value.caption ?? undefined,
    width: value.width ?? undefined,
    height: value.height ?? undefined,
    orientation: (value.orientation as MediaOrientation | null) ?? undefined,
  };
}

export function mapPayloadCover(
  value: number | Media | null | undefined
): ProjectMedia {
  return (
    mapPayloadMedia(value, { imageSize: "card", idPrefix: "cover" }) ?? {
      id: "cover-placeholder",
      type: "image",
      src: "",
      alt: "Обложка проекта",
    }
  );
}
