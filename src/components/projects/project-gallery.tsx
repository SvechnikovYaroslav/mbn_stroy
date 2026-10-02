"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Lightbox, { type Slide } from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import { projectMediaSequence } from "@/lib/projects/media";
import { mediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";
import type { Project, ProjectMedia } from "@/types/project";

type ProjectGalleryProps = {
  project: Project;
};

function mediaLabel(media: ProjectMedia, index: number) {
  return media.type === "video" ? `видео ${index + 1}` : `фото ${index + 1}`;
}

function toLightboxSlides(media: ProjectMedia[]): Slide[] {
  return media.map((item) => {
    if (item.type === "video") {
      return {
        type: "video",
        ...(item.poster ? { poster: mediaUrl(item.poster) } : {}),
        ...(item.width ? { width: item.width } : {}),
        ...(item.height ? { height: item.height } : {}),
        controls: true,
        playsInline: true,
        preload: "metadata",
        sources: [
          {
            src: mediaUrl(item.src),
            type: item.src.endsWith(".webm") ? "video/webm" : "video/mp4",
          },
        ],
      };
    }

    return {
      src: mediaUrl(item.src),
      alt: item.alt ?? "",
      ...(item.width ? { width: item.width } : {}),
      ...(item.height ? { height: item.height } : {}),
    };
  });
}

function GalleryImage({
  media,
  alt,
  thumbnail = false,
}: {
  media: ProjectMedia;
  alt: string;
  thumbnail?: boolean;
}) {
  if (!media.src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/50 text-caption text-muted-foreground">
        Project image
      </div>
    );
  }

  return (
    // Payload URLs and static media paths share the existing mediaUrl helper.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={mediaUrl(thumbnail ? media.thumbnailSrc ?? media.src : media.src)}
      alt={alt}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
    />
  );
}

export function ProjectGallery({ project }: ProjectGalleryProps) {
  const media = useMemo(() => projectMediaSequence(project), [project]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxScrollY = useRef(0);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: media.length > 1,
  });

  const selectSlide = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      setSelectedIndex(index);
      setPlayingIndex(null);
    },
    [emblaApi]
  );

  const openLightbox = useCallback(() => {
    lightboxScrollY.current = window.scrollY;
    setLightboxOpen(true);
  }, []);

  const restoreLightboxScroll = useCallback(() => {
    // The lightbox restores focus after its exit animation. Browsers may scroll
    // the focused trigger into view, so restore the viewport on the next frame.
    requestAnimationFrame(() => {
      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;

      root.style.scrollBehavior = "auto";
      window.scrollTo(0, lightboxScrollY.current);
      root.style.scrollBehavior = previousScrollBehavior;
    });
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setPlayingIndex(null);
    };

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  const hasMultipleMedia = media.length > 1;
  const previewMedia = media.slice(0, 3);
  const lightboxSlides = useMemo(() => toLightboxSlides(media), [media]);

  return (
    <div className="group/gallery">
      <div className="relative aspect-[8/5] overflow-hidden bg-muted" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {media.map((item, index) => {
            const isVideo = item.type === "video";
            const isPlaying = playingIndex === index;

            return (
              <div className="min-w-0 flex-[0_0_100%]" key={item.id}>
                {isVideo && isPlaying ? (
                  <video
                    className="h-full w-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                    poster={item.poster ? mediaUrl(item.poster) : undefined}
                  >
                    <source
                      src={mediaUrl(item.src)}
                      type={item.src.endsWith(".webm") ? "video/webm" : "video/mp4"}
                    />
                    Ваш браузер не поддерживает видео.
                  </video>
                ) : isVideo ? (
                  <div className="relative h-full w-full bg-surface">
                    {item.poster ? (
                      <GalleryImage media={{ ...item, src: item.poster }} alt="" />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setPlayingIndex(index)}
                      className="absolute inset-0 flex items-center justify-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                      aria-label="Воспроизвести видео"
                    >
                      <span className="flex size-11 items-center justify-center rounded-full border border-border bg-background/80 transition-colors hover:border-primary hover:text-primary">
                        <Play className="size-4 fill-current" aria-hidden="true" />
                      </span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openLightbox}
                    className="group/main h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    aria-label={`Открыть галерею, ${mediaLabel(item, index)}`}
                  >
                    <span className="block h-full w-full overflow-hidden">
                      <span className="block h-full w-full transition-transform duration-300 ease-out group-hover/main:scale-[1.02] motion-reduce:transform-none">
                        <GalleryImage media={item} alt={item.alt ?? ""} />
                      </span>
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {hasMultipleMedia ? (
          <>
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute top-1/2 left-3 flex size-8 -translate-y-1/2 items-center justify-center border border-border bg-background/75 text-foreground opacity-0 transition-[border-color,color,opacity] duration-200 hover:border-primary hover:text-primary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/gallery:opacity-100"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center border border-border bg-background/75 text-foreground opacity-0 transition-[border-color,color,opacity] duration-200 hover:border-primary hover:text-primary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/gallery:opacity-100"
              aria-label="Следующее фото"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
            <span className="absolute right-3 bottom-3 bg-background/75 px-2 py-1 text-[0.6875rem] tabular-nums text-foreground">
              {selectedIndex + 1} / {media.length}
            </span>
          </>
        ) : null}
      </div>

      {hasMultipleMedia ? (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {previewMedia.map((item, index) => {
            const remaining = media.length - 2;
            const isMorePreview = media.length > 3 && index === 2;
            const isActive = selectedIndex === index;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  if (isMorePreview) {
                    selectSlide(index);
                    openLightbox();
                  } else {
                    selectSlide(index);
                  }
                }}
                className={cn(
                  "relative h-[4.25rem] overflow-hidden border bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive && !isMorePreview ? "border-primary" : "border-border hover:border-primary"
                )}
                aria-label={
                  isMorePreview
                    ? `Открыть ещё ${remaining} фото`
                    : `Открыть ${mediaLabel(item, index)}`
                }
              >
                {item.type === "video" && !item.poster ? (
                  <span className="flex h-full w-full items-center justify-center bg-surface text-muted-foreground">
                    <Play className="size-4" aria-hidden="true" />
                  </span>
                ) : (
                  <GalleryImage
                    media={item.poster ? { ...item, src: item.poster } : item}
                    alt=""
                    thumbnail
                  />
                )}
                {item.type === "video" && item.poster ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-background/25 text-foreground">
                    <Play className="size-4 fill-current" aria-hidden="true" />
                  </span>
                ) : null}
                {isMorePreview ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-background/65 text-small font-semibold text-foreground">
                    +{remaining}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={selectedIndex}
        slides={lightboxSlides}
        plugins={[Fullscreen, Video, Zoom]}
        carousel={{ finite: false, preload: 1 }}
        video={{ autoPlay: false, controls: true, playsInline: true, preload: "metadata" }}
        labels={{
          Previous: "Предыдущее",
          Next: "Следующее",
          Close: "Закрыть",
          Lightbox: "Галерея проекта",
        }}
        on={{
          view: ({ index }) => setSelectedIndex(index),
          exited: restoreLightboxScroll,
        }}
      />
    </div>
  );
}
