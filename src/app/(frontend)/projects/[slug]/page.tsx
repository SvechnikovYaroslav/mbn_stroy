import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ProjectDescription } from "@/components/projects/project-description";
import { ProjectGallery } from "@/components/projects/project-gallery";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { projectTypeLabels, renovationTypeLabels, workTypeLabels } from "@/config/project";
import { brandTitle, siteConfig } from "@/config/site";
import { getProjectBySlug } from "@/lib/projects";
import { ensurePortfolioDynamic } from "@/lib/projects/dynamic";
import { pageMetadata } from "@/config/seo";
import { cn } from "@/lib/utils";
import type { ProjectSectionType } from "@/types/project";

type ProjectPageProps = { params: Promise<{ slug: string }>; searchParams: Promise<{ room?: string | string[] }> };
export const dynamic = "force-dynamic";
export const dynamicParams = true;

function richTextPlainText(value: unknown): string { if (!value || typeof value !== "object") return ""; const node = value as { text?: unknown; children?: unknown }; return `${typeof node.text === "string" ? node.text : ""} ${Array.isArray(node.children) ? node.children.map(richTextPlainText).join(" ") : ""}`.trim(); }

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  await ensurePortfolioDynamic(); const { slug } = await params; const project = await getProjectBySlug(slug);
  if (!project) return { title: brandTitle("Проект не найден") };
  return pageMetadata({ pathname: `/projects/${project.slug}`, title: brandTitle(project.title), description: richTextPlainText(project.description) || `Пример выполненного ремонта ${siteConfig.name} в Туле и Тульской области.`, ...(project.cover?.src ? { imagePath: project.cover.src } : {}) });
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  await ensurePortfolioDynamic(); const { slug } = await params; const { room } = await searchParams; const project = await getProjectBySlug(slug); if (!project) notFound();
  const requestedRoom = typeof room === "string" ? room : undefined;
  const initialRoom = project.sections.some((section) => section.roomType === requestedRoom) ? requestedRoom as ProjectSectionType : undefined;
  return <main><BreadcrumbJsonLd items={[{ name: "Проекты", path: "/projects" }, { name: project.title, path: `/projects/${project.slug}` }]} /><Container className="py-8 md:py-12">
    <Link href="/projects" className="text-small text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">← Все проекты</Link>
    <header className="mt-8"><h1 className="text-h1 text-foreground">{project.title}</h1></header>
    <div className="mt-8 md:mt-10"><ProjectGallery project={project} variant="detail" initialRoom={initialRoom} /></div>
    <section className="mt-10 grid gap-10 border-t border-border pt-10 md:mt-14 md:grid-cols-[minmax(0,1.85fr)_minmax(16rem,1fr)] md:gap-16 lg:gap-24">
      {project.description ? <div><h2 className="text-h2 text-foreground">О проекте</h2><div className="mt-5"><ProjectDescription data={project.description} /></div></div> : null}
      <aside className={project.description ? "" : "md:col-span-2"}><h2 className="text-h2 text-foreground">Объект</h2><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full border border-border px-3 py-1 text-small text-foreground">{projectTypeLabels[project.projectType]}</span>{typeof project.area === "number" ? <span className="rounded-full border border-border px-3 py-1 text-small text-foreground">{project.area} м²</span> : null}{project.renovationType ? <span className="rounded-full border border-border px-3 py-1 text-small text-foreground">{renovationTypeLabels[project.renovationType]}</span> : null}{project.year ? <span className="rounded-full border border-border px-3 py-1 text-small text-foreground">{project.year}</span> : null}</div>{project.location ? <div className="mt-7"><p className="text-caption text-muted-foreground">Адрес</p><p className="mt-2 whitespace-pre-line text-body text-foreground">{project.location}</p></div> : null}</aside>
    </section>
    {project.workTypes.length > 0 ? <section className="mt-12 border-t border-border pt-8 md:mt-16"><h2 className="text-h2 text-foreground">Выполненные работы</h2><ul className="mt-5 flex flex-wrap gap-2">{project.workTypes.map((workType) => <li key={workType}><Link href={`/services/${workType}`} className="inline-flex rounded-full border border-border px-3 py-1 text-small text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{workTypeLabels[workType]}</Link></li>)}</ul></section> : null}
    <section className="mt-20 border-t border-border pt-12 md:mt-24 md:pt-16"><h2 className="text-h2 text-foreground">Хотите похожий ремонт?</h2><p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">Расскажите о задаче — поможем оценить объём работ и предварительную стоимость.</p><Link href={`/contacts?project=${encodeURIComponent(project.slug)}`} className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex h-11 px-5")}>Обсудить ремонт</Link></section>
  </Container></main>;
}
