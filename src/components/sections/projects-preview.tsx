import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ProjectCard } from "@/components/projects/project-card";
import { buttonVariants } from "@/components/ui/button";
import { getFeaturedProjects } from "@/lib/projects";
import { ensurePortfolioDynamic } from "@/lib/projects/dynamic";
import { cn } from "@/lib/utils";

export async function ProjectsPreview() {
  await ensurePortfolioDynamic();
  const projects = await getFeaturedProjects(3);

  return (
    <section id="projects" className="scroll-mt-20 border-b border-border">
      <Container className="py-14 md:py-20">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="text-h2 text-foreground">Избранные проекты</h2>
          <p className="max-w-md text-body text-muted-foreground">
            Реализованные ремонты в Туле и Тульской области.
          </p>
        </div>

        {projects.length === 0 ? (
          <p className="mt-10 text-body text-muted-foreground">
            Проекты скоро появятся.
          </p>
        ) : (
          <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {projects.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10">
          <Link
            href="/projects"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}
          >
            Все проекты
          </Link>
        </div>
      </Container>
    </section>
  );
}
