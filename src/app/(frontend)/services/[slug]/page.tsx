import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { MediaGallery } from "@/components/media/media-gallery";
import { ProjectMediaItem } from "@/components/media/project-media";
import { ProjectCard } from "@/components/projects/project-card";
import { ServiceDescription } from "@/components/services/service-description";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getProjects } from "@/lib/projects";
import {
  getRelevantServiceMedia,
  getProjectsByWorkType,
  resolveServiceCover,
} from "@/lib/services/related";
import { ensureServicesDynamic } from "@/lib/services/dynamic";
import {
  getServiceBySlug,
  getServiceSlugs,
} from "@/lib/services";
import {
  serviceSeoDescription,
  serviceSeoTitle,
} from "@/types/service";
import type { WorkType } from "@/types/project";
import { cn } from "@/lib/utils";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  await ensureServicesDynamic();
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return { title: "Услуга не найдена — MBN Строй" };
  }

  return {
    title: serviceSeoTitle(service),
    description: serviceSeoDescription(service),
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  await ensureServicesDynamic();
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const workType = service.slug as WorkType;
  const projects = await getProjects();
  const relevantMedia = getRelevantServiceMedia(projects, workType);
  const relatedProjects = getProjectsByWorkType(projects, workType);
  const cover = resolveServiceCover({
    serviceCover: service.cover,
    relevantMedia,
    relatedProjects,
    serviceTitle: service.title,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: serviceSeoDescription(service),
    provider: {
      "@type": "LocalBusiness",
      name: siteConfig.name,
    },
    areaServed: siteConfig.location,
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="py-8 md:py-12">
        <Link
          href="/services"
          className="text-small text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← Все услуги
        </Link>

        <header className="mt-8 max-w-3xl">
          <h1 className="text-h1 text-foreground">{service.title}</h1>
          {service.shortDescription ? (
            <p className="mt-4 text-body-lg text-muted-foreground">
              {service.shortDescription}
            </p>
          ) : null}
        </header>

        {cover.src ? (
          <div className="mt-10">
            <ProjectMediaItem media={cover} priority />
          </div>
        ) : null}

        {service.description ? (
          <div className="mt-12">
            <ServiceDescription data={service.description} />
          </div>
        ) : null}

        {relevantMedia.length > 0 ? (
          <section className="mt-16 border-t border-border pt-12 md:mt-20">
            <h2 className="text-h2 text-foreground">Наши работы</h2>
            <p className="mt-3 max-w-2xl text-body text-muted-foreground">
              Фотографии и видео из разделов проектов, связанных с этой работой.
            </p>
            <div className="mt-8">
              <MediaGallery items={relevantMedia} />
            </div>
          </section>
        ) : null}

        {relatedProjects.length > 0 ? (
          <section className="mt-16 border-t border-border pt-12 md:mt-20">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h2 className="text-h2 text-foreground">
                Проекты, где выполняли эту работу
              </h2>
              <Link
                href="/projects"
                className="text-small text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Все проекты
              </Link>
            </div>
            <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {relatedProjects.map((project) => (
                <li key={project.id}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-20 border-t border-border pt-12 md:mt-24 md:pt-16">
          <h2 className="text-h2 text-foreground">
            Нужна консультация по ремонту?
          </h2>
          <p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">
            Расскажите о задаче — поможем оценить объём работ и предварительную
            стоимость.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/calculator"
              className={cn(buttonVariants({ size: "lg" }), "inline-flex")}
            >
              Рассчитать стоимость
            </Link>
            <a
              href={siteConfig.cta.href}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "inline-flex"
              )}
            >
              Обсудить проект
            </a>
          </div>
        </section>
      </Container>
    </main>
  );
}
