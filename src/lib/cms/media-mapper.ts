import type { Media } from "@/payload-types";
import { buildMediaAltFallback } from "@/lib/media-alt";
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

function isOrientation(
  value: string | null | undefined
): value is MediaOrientation {
  return value === "landscape" || value === "portrait" || value === "square";
}

/**
 * Map Payload Media → frontend ProjectMedia.
 * Payload URLs (/api/media/...) are returned as-is — never prefixed with GitHub Pages basePath.
 */
export function mapPayloadMedia(
  value: number | Media | null | undefined,
  options?: {
    imageSize?: MediaSize;
    idPrefix?: string;
    fallbackAlt?: string;
  }
): ProjectMedia | null {
  if (!isPopulatedMedia(value)) return null;

  const type = mediaKind(value.mimeType);
  const src =
    type === "video"
      ? (value.url ?? undefined)
      : (pickImageUrl(value, options?.imageSize) ?? value.url ?? undefined);

  if (!src) return null;

  const manualAlt = value.alt?.trim();

  return {
    id: `${options?.idPrefix ?? "media"}-${value.id}`,
    type,
    src,
    alt: manualAlt || options?.fallbackAlt,
    caption: value.caption ?? undefined,
    width: value.width ?? undefined,
    height: value.height ?? undefined,
    orientation: isOrientation(value.orientation)
      ? value.orientation
      : undefined,
  };
}

export function mapPayloadCover(
  value: number | Media | null | undefined,
  projectTitle: string
): ProjectMedia {
  return (
    mapPayloadMedia(value, {
      imageSize: "card",
      idPrefix: "cover",
      fallbackAlt: buildMediaAltFallback({
        projectTitle,
        kind: "cover",
      }),
    }) ?? {
      id: "cover-placeholder",
      type: "image",
      src: "",
      alt: buildMediaAltFallback({ projectTitle, kind: "cover" }),
    }
  );
}
