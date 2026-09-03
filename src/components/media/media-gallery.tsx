import { ProjectMediaItem } from "@/components/media/project-media";
import { cn } from "@/lib/utils";
import type { ProjectMedia } from "@/types/project";

type MediaGalleryProps = {
  items: ProjectMedia[];
  className?: string;
};

function itemSpan(media: ProjectMedia, index: number): string {
  if (media.orientation === "portrait") {
    return "md:col-span-1";
  }
  if (media.orientation === "square") {
    return "md:col-span-1";
  }
  // Alternate wide rhythm for landscapes / unspecified
  return index % 3 === 0 ? "md:col-span-2" : "md:col-span-1";
}

export function MediaGallery({ items, className }: MediaGalleryProps) {
  if (items.length === 0) {
    return (
      <div className="border border-border bg-muted/40 px-4 py-10 text-center">
        <p className="text-caption text-muted-foreground">Project image</p>
        <p className="mt-2 text-small text-muted-foreground">
          Фотографии появятся позже
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5",
        className
      )}
    >
      {items.map((item, index) => (
        <div key={item.id} className={itemSpan(item, index)}>
          <ProjectMediaItem media={item} priority={index === 0} />
        </div>
      ))}
    </div>
  );
}
