import Link from "next/link";

import { ProjectMediaItem } from "@/components/media/project-media";
import type { ProjectMedia } from "@/types/project";
import type { Service } from "@/types/service";

type ServiceCardProps = {
  service: Service;
  index: number;
  cover: ProjectMedia;
};

export function ServiceCard({ service, index, cover }: ServiceCardProps) {
  const number = String(index + 1).padStart(2, "0");
  const hasImage = Boolean(cover.src);

  return (
    <article className="border-b border-border py-8 md:py-10">
      <Link
        href={`/services/${service.slug}`}
        className="group grid gap-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-12 md:items-end md:gap-8"
      >
        {hasImage ? (
          <div className="md:col-span-5">
            <ProjectMediaItem
              media={cover}
              className="transition-opacity group-hover:opacity-95"
            />
          </div>
        ) : null}
        <div className={hasImage ? "md:col-span-7" : "md:col-span-12"}>
          <p className="text-caption text-muted-foreground">{number}</p>
          <h2 className="mt-3 text-h2 text-foreground">{service.title}</h2>
          {service.shortDescription ? (
            <p className="mt-3 max-w-xl text-body text-muted-foreground">
              {service.shortDescription}
            </p>
          ) : null}
          <span className="mt-5 inline-block text-small text-foreground underline-offset-4 group-hover:underline">
            Подробнее →
          </span>
        </div>
      </Link>
    </article>
  );
}
