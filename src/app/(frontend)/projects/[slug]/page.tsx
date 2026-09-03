import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { MediaGallery } from "@/components/media/media-gallery";
import { ProjectMediaItem } from "@/components/media/project-media";
import { buttonVariants } from "@/components/ui/button";
import {
  projectTypeLabels,
  renovationTypeLabels,
  workTypeLabels,
} from "@/config/project";
import { getProjectBySlug, getProjectSlugs } from "@/lib/projects";
import { ensurePortfolioDynamic } from "@/lib/projects/dynamic";
import { cn } from "@/lib/utils";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  await ensurePortfolioDynamic();
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Проект не найден — MBN Строй" };
  }

  return {
    title: `${project.title} — MBN Строй`,
    description:
      project.description ??
      `${project.title}. ${project.location}. Ремонт от MBN Строй.`,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  await ensurePortfolioDynamic();
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main>
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

        <div className="mt-10">
          <ProjectMediaItem media={project.cover} priority />
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

        <div className="mt-16 space-y-16 md:mt-20 md:space-y-20">
          {project.sections.map((section) => (
            <section key={section.id} className="border-t border-border pt-10">
              <h2 className="text-h2 text-foreground">{section.title}</h2>
              {section.description ? (
                <p className="mt-3 max-w-2xl text-body text-muted-foreground">
                  {section.description}
                </p>
              ) : null}
              {section.workTypes.length > 0 ? (
                <p className="mt-3 text-small text-muted-foreground">
                  Виды работ:{" "}
                  {section.workTypes
                    .map((workType) => workTypeLabels[workType])
                    .join(" · ")}
                </p>
              ) : null}
              <div className="mt-8">
                <MediaGallery items={section.media} />
              </div>
            </section>
          ))}
        </div>

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
