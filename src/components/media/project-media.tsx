import { mediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";
import type { ProjectMedia } from "@/types/project";

type ProjectMediaProps = {
  media: ProjectMedia;
  priority?: boolean;
  className?: string;
};

function orientationClass(orientation?: ProjectMedia["orientation"]) {
  switch (orientation) {
    case "portrait":
      return "mx-auto max-w-md aspect-[3/4]";
    case "square":
      return "mx-auto max-w-xl aspect-square";
    case "landscape":
    default:
      return "w-full aspect-[8/5]";
  }
}

export function ProjectMediaItem({
  media,
  priority = false,
  className,
}: ProjectMediaProps) {
  if (media.type === "video") {
    return (
      <div
        className={cn(
          "overflow-hidden bg-muted",
          orientationClass(media.orientation),
          className
        )}
      >
        <video
          className="h-full w-full object-cover"
          controls
          playsInline
          preload="metadata"
          poster={media.poster ? mediaUrl(media.poster) : undefined}
        >
          <source src={mediaUrl(media.src)} />
          Ваш браузер не поддерживает видео.
        </video>
        {media.caption ? (
          <p className="mt-2 text-small text-muted-foreground">{media.caption}</p>
        ) : null}
      </div>
    );
  }

  if (!media.src) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center border border-border bg-muted/50 text-center",
          orientationClass(media.orientation),
          className
        )}
        role="img"
        aria-label={media.alt ?? "Место для фотографии проекта"}
      >
        <p className="text-caption text-muted-foreground">Project image</p>
        <p className="mt-2 text-small text-muted-foreground">1920 × 1200</p>
      </div>
    );
  }

  return (
    <figure className={cn("w-full", className)}>
      <div
        className={cn(
          "overflow-hidden bg-muted",
          orientationClass(media.orientation)
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaUrl(media.src)}
          alt={media.alt ?? ""}
          className="h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
      {media.caption ? (
        <figcaption className="mt-2 text-small text-muted-foreground">
          {media.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
