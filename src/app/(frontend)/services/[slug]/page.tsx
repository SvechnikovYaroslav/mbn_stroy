import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { ProjectMediaItem } from "@/components/media/project-media";
import { ProjectCard } from "@/components/projects/project-card";
import { ServiceDescription } from "@/components/services/service-description";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { brandTitle, siteConfig } from "@/config/site";
import { pageMetadata } from "@/config/seo";
import { getProjects } from "@/lib/projects";
import { ensureServicesDynamic } from "@/lib/services/dynamic";
import { getServiceBySlug } from "@/lib/services";
import { getProjectsByWorkType, getRelevantServiceMedia, isKnownWorkType, resolveServiceCover } from "@/lib/services/related";
import { cn } from "@/lib/utils";
import { serviceSeoDescription, serviceSeoTitle } from "@/types/service";

type ServicePageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  await ensureServicesDynamic();
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) return { title: brandTitle("Услуга не найдена") };

  return pageMetadata({
    pathname: `/services/${service.slug}`,
    title: serviceSeoTitle(service),
    description: serviceSeoDescription(service),
    ...(service.cover?.src ? { imagePath: service.cover.src } : {}),
  });
}

export default async function ServicePage({ params }: ServicePageProps) {
  await ensureServicesDynamic();
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) notFound();

  const workType = isKnownWorkType(service.slug) ? service.slug : null;
  const projects = await getProjects();
  const relevantMedia = workType ? getRelevantServiceMedia(projects, workType) : [];
  const relatedProjects = workType ? getProjectsByWorkType(projects, workType, 3) : [];
  const cover = resolveServiceCover({ serviceCover: service.cover, relevantMedia, relatedProjects, serviceTitle: service.title });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: serviceSeoDescription(service),
    provider: { "@type": "LocalBusiness", name: siteConfig.name },
    areaServed: siteConfig.location,
  };

  return (
    <main>
      <BreadcrumbJsonLd items={[{ name: "Услуги", path: "/services" }, { name: service.title, path: `/services/${service.slug}` }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Container className="py-8 md:py-12 lg:py-14">
        <Link href="/services" className="accent-link text-small text-muted-foreground">← Все услуги</Link>

        <section className="mt-6 overflow-hidden border border-border bg-card lg:grid lg:h-[clamp(360px,29vw,440px)] lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12">
            <h1 className="text-h1 text-foreground">{service.title}</h1>
            {service.shortDescription ? <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">{service.shortDescription}</p> : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/calculator" className={cn(buttonVariants({ size: "lg" }), "inline-flex")}>Рассчитать стоимость</Link>
              <Link href={`/contacts?service=${encodeURIComponent(service.slug)}`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "inline-flex")}>Связаться</Link>
            </div>
          </div>

          <div className="min-h-72 bg-muted lg:min-h-0">
            <ProjectMediaItem media={cover} priority className="h-full [&>div]:h-full [&>div]:max-w-none [&>div]:aspect-auto [&_img]:h-full [&_img]:object-[center_58%]" />
          </div>
        </section>

        {service.description ? <section className="max-w-3xl py-12 md:py-16"><ServiceDescription data={service.description} /></section> : null}

        {relatedProjects.length > 0 ? (
          <section className="border-t border-border py-12 md:py-16">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-h2 text-foreground">Реализованные проекты</h2>
                <p className="mt-3 max-w-2xl text-body text-muted-foreground">Объекты, где выполнялись работы этого типа.</p>
              </div>
              <Link href="/projects" className="accent-link text-small text-muted-foreground">Все проекты</Link>
            </div>
            <ul className="mt-10 grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {relatedProjects.map((project) => <li key={project.id}><ProjectCard project={project} /></li>)}
            </ul>
          </section>
        ) : null}
      </Container>
    </main>
  );
}
