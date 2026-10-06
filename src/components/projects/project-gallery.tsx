"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Lightbox, { type Slide } from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import { sectionTypeLabels } from "@/config/project";
import { mediaUrl } from "@/lib/media-url";
import { projectMediaSequence } from "@/lib/projects/media";
import { cn } from "@/lib/utils";
import type { Project, ProjectMedia, ProjectSectionType } from "@/types/project";

type ProjectGalleryProps = {
  project: Project;
  variant?: "card" | "detail";
  initialRoom?: ProjectSectionType;
};

function mediaLabel(media: ProjectMedia, index: number) {
  return media.type === "video" ? `Видео ${index + 1}` : `Фото ${index + 1}`;
}

function toLightboxSlides(media: ProjectMedia[]): Slide[] {
  return media.map((item) =>
    item.type === "video"
      ? { type: "video", ...(item.poster ? { poster: mediaUrl(item.poster) } : {}), ...(item.width ? { width: item.width } : {}), ...(item.height ? { height: item.height } : {}), controls: true, playsInline: true, preload: "metadata", sources: [{ src: mediaUrl(item.src), type: item.src.endsWith(".webm") ? "video/webm" : "video/mp4" }] }
      : { src: mediaUrl(item.src), alt: item.alt ?? "", ...(item.width ? { width: item.width } : {}), ...(item.height ? { height: item.height } : {}) }
  );
}

function GalleryImage({ media, alt, eager = false, thumbnail = false }: { media: ProjectMedia; alt: string; eager?: boolean; thumbnail?: boolean }) {
  if (!media.src) return <div className="flex h-full w-full items-center justify-center bg-muted/50 text-caption text-muted-foreground">Изображение проекта</div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={mediaUrl(thumbnail ? media.thumbnailSrc ?? media.poster ?? media.src : media.poster ?? media.src)} alt={alt} className="h-full w-full object-cover" loading={eager ? "eager" : "lazy"} decoding="async" />;
}

function PlayBadge() {
  return <span className="absolute inset-0 flex items-center justify-center bg-black/10 text-white"><span className="flex size-11 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm"><Play className="size-4 fill-current" aria-hidden="true" /></span></span>;
}

function EmptyGallery() {
  return <div className="flex aspect-[8/5] items-center justify-center bg-muted text-small text-muted-foreground">Фотографии проекта скоро появятся</div>;
}

function GalleryTile({ media, index, onOpen, className, eager = false, more }: { media: ProjectMedia; index: number; onOpen: (index: number) => void; className?: string; eager?: boolean; more?: number }) {
  return <button type="button" onClick={() => onOpen(index)} className={cn("group/tile relative block min-h-0 overflow-hidden bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset", className)} aria-label={media.type === "video" ? "Воспроизвести видео" : `Открыть ${mediaLabel(media, index)}`}>
    <span className="block h-full w-full transition-transform duration-300 ease-out motion-reduce:transform-none lg:group-hover/tile:scale-[1.018]">{media.type === "video" && !media.poster ? <span className="block h-full w-full bg-surface" /> : <GalleryImage media={media} alt={media.alt ?? ""} eager={eager} />}</span>
    {media.type === "video" ? <PlayBadge /> : null}
    {more && more > 0 ? <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-body-lg font-medium text-white">+{more} фото</span> : null}
  </button>;
}

function DetailMosaic({ media, onOpen }: { media: ProjectMedia[]; onOpen: (index: number) => void }) {
  if (media.length === 0) return <EmptyGallery />;
  if (media.length === 1) return <GalleryTile media={media[0]} index={0} onOpen={onOpen} eager className="h-[clamp(22rem,42vw,38.75rem)]" />;
  if (media.length === 2) return <div className="grid h-[clamp(22rem,42vw,38.75rem)] grid-cols-3 gap-1.5"><GalleryTile media={media[0]} index={0} onOpen={onOpen} eager className="col-span-2" /><GalleryTile media={media[1]} index={1} onOpen={onOpen} className="col-span-1" /></div>;
  return <div className="grid h-[clamp(22rem,42vw,38.75rem)] grid-cols-[minmax(0,2fr)_minmax(14rem,1fr)] grid-rows-2 gap-1.5"><GalleryTile media={media[0]} index={0} onOpen={onOpen} eager className="row-span-2" /><GalleryTile media={media[1]} index={1} onOpen={onOpen} /><GalleryTile media={media[2]} index={2} onOpen={onOpen} more={media.length - 3} /></div>;
}

function MobileCarousel({ media, selectedIndex, emblaRef, emblaApi, onOpen }: { media: ProjectMedia[]; selectedIndex: number; emblaRef: ReturnType<typeof useEmblaCarousel>[0]; emblaApi: ReturnType<typeof useEmblaCarousel>[1]; onOpen: (index: number) => void }) {
  if (media.length === 0) return <EmptyGallery />;
  return <div className="group/mobile-gallery relative aspect-[8/5] overflow-hidden bg-muted" ref={emblaRef}><div className="flex h-full touch-pan-y">{media.map((item, index) => <div className="min-w-0 flex-[0_0_100%]" key={item.id}><GalleryTile media={item} index={index} onOpen={onOpen} eager={index === 0} className="h-full w-full" /></div>)}</div>{media.length > 1 ? <><button type="button" onClick={() => emblaApi?.scrollPrev()} className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Предыдущее медиа"><ChevronLeft className="size-4" aria-hidden="true" /></button><button type="button" onClick={() => emblaApi?.scrollNext()} className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Следующее медиа"><ChevronRight className="size-4" aria-hidden="true" /></button><span className="absolute right-3 bottom-3 rounded-sm bg-background/85 px-2 py-1 text-caption tabular-nums text-foreground">{selectedIndex + 1} / {media.length}</span></> : null}</div>;
}

function CardGallery({ media, selectedIndex, emblaRef, emblaApi, onOpen, onSelect }: { media: ProjectMedia[]; selectedIndex: number; emblaRef: ReturnType<typeof useEmblaCarousel>[0]; emblaApi: ReturnType<typeof useEmblaCarousel>[1]; onOpen: (index: number) => void; onSelect: (index: number) => void }) {
  if (media.length === 0) return <EmptyGallery />;
  const hasMultipleMedia = media.length > 1;
  const previews = media.slice(0, 3);

  return <div className="group/card-gallery">
    <div className="relative aspect-[8/5] overflow-hidden bg-muted" ref={emblaRef}>
      <div className="flex h-full touch-pan-y">
        {media.map((item, index) => <div className="min-w-0 flex-[0_0_100%]" key={item.id}><GalleryTile media={item} index={index} onOpen={onOpen} eager={index === 0} className="h-full w-full" /></div>)}
      </div>
      {hasMultipleMedia ? <>
        <button type="button" onClick={() => emblaApi?.scrollPrev()} className="absolute top-1/2 left-3 flex size-8 -translate-y-1/2 items-center justify-center border border-border bg-background/75 text-foreground opacity-0 transition-[border-color,color,opacity] duration-200 hover:border-primary hover:text-primary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/card-gallery:opacity-100" aria-label="Предыдущее фото"><ChevronLeft className="size-4" aria-hidden="true" /></button>
        <button type="button" onClick={() => emblaApi?.scrollNext()} className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center border border-border bg-background/75 text-foreground opacity-0 transition-[border-color,color,opacity] duration-200 hover:border-primary hover:text-primary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/card-gallery:opacity-100" aria-label="Следующее фото"><ChevronRight className="size-4" aria-hidden="true" /></button>
        <span className="absolute right-3 bottom-3 bg-background/75 px-2 py-1 text-[0.6875rem] tabular-nums text-foreground">{selectedIndex + 1} / {media.length}</span>
      </> : null}
    </div>
    {hasMultipleMedia ? <div className="mt-2 grid grid-cols-3 gap-2">
      {previews.map((item, index) => {
        const isMorePreview = media.length > 3 && index === 2;
        const isActive = selectedIndex === index;
        const remaining = media.length - 2;
        return <button type="button" key={item.id} onClick={() => isMorePreview ? onOpen(index) : onSelect(index)} className={cn("relative h-[4.25rem] overflow-hidden border bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", isActive && !isMorePreview ? "border-primary" : "border-border hover:border-primary")} aria-label={isMorePreview ? "Открыть остальные материалы проекта" : `Показать ${mediaLabel(item, index)}`}>
          {item.type === "video" && !item.poster ? <span className="flex h-full w-full items-center justify-center bg-surface text-muted-foreground"><Play className="size-4" aria-hidden="true" /></span> : <GalleryImage media={item} alt="" thumbnail />}
          {item.type === "video" && item.poster ? <span className="absolute inset-0 flex items-center justify-center bg-black/10 text-white"><Play className="size-4 fill-current" aria-hidden="true" /></span> : null}
          {isMorePreview ? <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-small font-semibold text-white">+{remaining}</span> : null}
        </button>;
      })}
    </div> : null}
  </div>;
}

export function ProjectGallery({ project, variant = "card", initialRoom }: ProjectGalleryProps) {
  const allMedia = useMemo(() => projectMediaSequence(project), [project]);
  const rooms = useMemo(() => Array.from(new Set(project.sections.flatMap((section) => section.roomType ? [section.roomType] : []))), [project.sections]);
  const [activeRoom, setActiveRoom] = useState<ProjectSectionType | undefined>(() => initialRoom && rooms.includes(initialRoom) ? initialRoom : undefined);
  const media = useMemo(() => {
    if (!activeRoom) return allMedia;
    const seen = new Set<string>();
    return project.sections.filter((section) => section.roomType === activeRoom).flatMap((section) => section.media).filter((item) => item.src && !seen.has(`${item.type}:${item.src}`) && Boolean(seen.add(`${item.type}:${item.src}`)));
  }, [activeRoom, allMedia, project.sections]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxScrollY = useRef(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: media.length > 1 });

  useEffect(() => { if (!emblaApi) return; const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap()); onSelect(); emblaApi.on("select", onSelect); emblaApi.on("reInit", onSelect); return () => { emblaApi.off("select", onSelect); emblaApi.off("reInit", onSelect); }; }, [emblaApi]);
  const selectRoom = (room: ProjectSectionType | undefined) => { setSelectedIndex(0); setActiveRoom(room); emblaApi?.scrollTo(0, true); };
  const selectMedia = useCallback((index: number) => { emblaApi?.scrollTo(index); setSelectedIndex(index); }, [emblaApi]);
  const openLightbox = useCallback((index: number) => { setSelectedIndex(index); lightboxScrollY.current = window.scrollY; setLightboxOpen(true); }, []);
  const restoreLightboxScroll = useCallback(() => { requestAnimationFrame(() => { const root = document.documentElement; const previous = root.style.scrollBehavior; root.style.scrollBehavior = "auto"; window.scrollTo(0, lightboxScrollY.current); root.style.scrollBehavior = previous; }); }, []);
  const slides = useMemo(() => toLightboxSlides(media), [media]);

  if (variant === "card") return <>
    <CardGallery media={media} selectedIndex={selectedIndex} emblaRef={emblaRef} emblaApi={emblaApi} onOpen={openLightbox} onSelect={selectMedia} />
    <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} index={selectedIndex} slides={slides} plugins={[Fullscreen, Video, Zoom]} carousel={{ finite: false, preload: 1 }} video={{ autoPlay: false, controls: true, playsInline: true, preload: "metadata" }} labels={{ Previous: "Предыдущее", Next: "Следующее", Close: "Закрыть", Lightbox: "Галерея проекта" }} on={{ view: ({ index }) => setSelectedIndex(index), exited: restoreLightboxScroll }} />
  </>;

  return <section aria-label="Галерея проекта">
    {rooms.length > 0 ? <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:mb-6" role="group" aria-label="Помещения"><button type="button" onClick={() => selectRoom(undefined)} aria-pressed={!activeRoom} className={cn("h-10 shrink-0 rounded-md border px-4 text-small font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", !activeRoom ? "border-primary bg-primary text-primary-foreground" : "border-border bg-transparent text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground")}>Все</button>{rooms.map((room) => <button type="button" key={room} onClick={() => selectRoom(room)} aria-pressed={activeRoom === room} className={cn("h-10 shrink-0 rounded-md border px-4 text-small font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", activeRoom === room ? "border-primary bg-primary text-primary-foreground" : "border-border bg-transparent text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground")}>{sectionTypeLabels[room]}</button>)}</div> : null}
    <div className="hidden lg:block"><DetailMosaic media={media} onOpen={openLightbox} /></div>
    <div className="lg:hidden"><MobileCarousel media={media} selectedIndex={selectedIndex} emblaRef={emblaRef} emblaApi={emblaApi} onOpen={openLightbox} /></div>
    <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} index={selectedIndex} slides={slides} plugins={[Fullscreen, Video, Zoom]} carousel={{ finite: false, preload: 1 }} video={{ autoPlay: false, controls: true, playsInline: true, preload: "metadata" }} labels={{ Previous: "Предыдущее", Next: "Следующее", Close: "Закрыть", Lightbox: "Галерея проекта" }} on={{ view: ({ index }) => setSelectedIndex(index), exited: restoreLightboxScroll }} />
  </section>;
}
