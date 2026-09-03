import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProjectCatalog } from "@/components/projects/project-catalog";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Проекты — MBN Строй",
  description:
    "Реализованные ремонты квартир, домов и отдельных помещений в Туле и Тульской области.",
};

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <main>
      <section className="border-b border-border">
        <Container className="py-12 md:py-16">
          <h1 className="text-h1 text-foreground">Проекты</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">
            Реализованные ремонты квартир, домов и отдельных помещений в Туле и
            Тульской области.
          </p>
        </Container>
      </section>

      <section>
        <Container className="py-10 md:py-14">
          <ProjectCatalog projects={projects} />
        </Container>
      </section>
    </main>
  );
}
