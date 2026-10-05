import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { ProjectGallery } from "@/components/projects/project-gallery";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import {
  projectTypeLabels,
  renovationTypeLabels,
  workTypeLabels,
} from "@/config/project";
import { brandTitle, siteConfig } from "@/config/site";
import { getProjectBySlug } from "@/lib/projects";
import { ensurePortfolioDynamic } from "@/lib/projects/dynamic";
import { pageMetadata } from "@/config/seo";
import { cn } from "@/lib/utils";
import type { ProjectSectionType } from "@/types/project";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ room?: string | string[] }>;
};

/**
 * Same DYNAMIC_SERVER_USAGE trap as /services/[slug]: force request-time
 * rendering so Payload queries are allowed.
 */
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  await ensurePortfolioDynamic();
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: brandTitle("Проект не найден") };
  }

  return pageMetadata({
    pathname: `/projects/${project.slug}`,
    title: brandTitle(project.title),
    description: project.description?.trim() || `Пример выполненного ремонта ${siteConfig.name} в Туле и Тульской области.`,
    ...(project.cover?.src ? { imagePath: project.cover.src } : {}),
  });
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  await ensurePortfolioDynamic();
  const { slug } = await params;
  const { room } = await searchParams;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const requestedRoom = typeof room === "string" ? room : undefined;
  const initialRoom = project.sections.some(
    (section) => section.roomType === requestedRoom
  )
    ? (requestedRoom as ProjectSectionType)
    : undefined;

  return (
    <main>
      <BreadcrumbJsonLd
        items={[
          { name: "Проекты", path: "/projects" },
          { name: project.title, path: `/projects/${project.slug}` },
        ]}
      />
      <Container className="py-8 md:py-12">
        <Link
          href="/projects"
          className="text-small text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← Все проекты
        </Link>

        <header className="mt-8 max-w-3xl">
          <h1 className="text-h1 text-foreground">{project.title}</h1>
          <p className="mt-3 text-body-lg text-muted-foreground">
            {project.location}
          </p>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-small">
            <div>
              <dt className="text-caption text-muted-foreground">Тип</dt>
              <dd className="mt-1 text-foreground">
                {projectTypeLabels[project.projectType]}
              </dd>
            </div>
            {typeof project.area === "number" ? (
              <div>
                <dt className="text-caption text-muted-foreground">Площадь</dt>
                <dd className="mt-1 text-foreground">{project.area} м²</dd>
              </div>
            ) : null}
            {project.renovationType ? (
              <div>
                <dt className="text-caption text-muted-foreground">Ремонт</dt>
                <dd className="mt-1 text-foreground">
                  {renovationTypeLabels[project.renovationType]}
                </dd>
              </div>
            ) : null}
            {project.duration ? (
              <div>
                <dt className="text-caption text-muted-foreground">Срок</dt>
                <dd className="mt-1 text-foreground">{project.duration}</dd>
              </div>
            ) : null}
            {project.year ? (
              <div>
                <dt className="text-caption text-muted-foreground">Год</dt>
                <dd className="mt-1 text-foreground">{project.year}</dd>
              </div>
            ) : null}
          </dl>
        </header>

        <div className="mt-10 md:mt-12">
          <ProjectGallery project={project} variant="detail" initialRoom={initialRoom} />
        </div>

        {project.description ? (
          <p className="mt-8 max-w-2xl text-body-lg text-muted-foreground">
            {project.description}
          </p>
        ) : null}

        {project.workTypes.length > 0 ? (
          <section className="mt-12 max-w-2xl border-t border-border pt-8">
            <h2 className="text-caption text-muted-foreground">
              Выполненные работы
            </h2>
            <ul className="mt-4 space-y-2">
              {project.workTypes.map((workType) => (
                <li key={workType} className="text-body text-foreground">
                  {workTypeLabels[workType]}
                </li>
              ))}
            </ul>
          </section>
        ) : null}


        <section className="mt-20 border-t border-border pt-12 md:mt-24 md:pt-16">
          <h2 className="text-h2 text-foreground">Хотите похожий ремонт?</h2>
          <p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">
            Расскажите о задаче — поможем оценить объём работ и предварительную
            стоимость.
          </p>
          <Link
            href={`/contacts?project=${encodeURIComponent(project.slug)}`}
            className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex h-11 px-5")}
          >
            Обсудить ремонт
          </Link>
        </section>
      </Container>
    </main>
  );
}
