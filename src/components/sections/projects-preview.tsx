import { Container } from "@/components/layout/container";
import { demoProjects } from "@/data/demo-projects";

export function ProjectsPreview() {
  return (
    <section id="projects" className="scroll-mt-20 border-b border-border">
      <Container className="py-14 md:py-20">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="text-h2 text-foreground">Избранные проекты</h2>
          <p className="max-w-md text-small text-muted-foreground">
            Демонстрационные placeholder-данные. Реальные объекты появятся
            позже.
          </p>
        </div>

        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {demoProjects.map((project) => (
            <li key={project.id} className="group">
              <div
                className="flex aspect-[8/5] w-full flex-col items-center justify-center border border-border bg-muted/50 text-center transition-colors group-hover:bg-muted"
                role="img"
                aria-label={`Placeholder фото: ${project.type}, ${project.city}`}
              >
                <p className="text-caption text-muted-foreground">
                  {project.imageLabel}
                </p>
                <p className="mt-2 text-small text-muted-foreground">
                  {project.imageSize}
                </p>
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-border pt-4">
                <div>
                  <p className="text-h3 text-foreground">{project.type}</p>
                  <p className="mt-1 text-small text-muted-foreground">
                    {project.city}
                  </p>
                </div>
                <p className="text-small text-foreground">{project.area}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
