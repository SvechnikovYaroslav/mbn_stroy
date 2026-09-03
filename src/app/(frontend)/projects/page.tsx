import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProjectCatalog } from "@/components/projects/project-catalog";
import { ensurePortfolioDynamic } from "@/lib/projects/dynamic";
import { getProjects } from "@/lib/projects";
import { absoluteUrl, isIndexingAllowed } from "@/lib/site-env";

const title = "Проекты — MBN Строй";
const description =
  "Реализованные ремонты квартир, домов и отдельных помещений в Туле и Тульской области.";
const canonical = absoluteUrl("/projects");

export const metadata: Metadata = {
  title,
  description,
  ...(canonical ? { alternates: { canonical } } : {}),
  ...(!isIndexingAllowed()
    ? { robots: { index: false, follow: false } }
    : {}),
  openGraph: {
    title,
    description,
    type: "website",
    ...(canonical ? { url: canonical } : {}),
  },
};

export default async function ProjectsPage() {
  await ensurePortfolioDynamic();
  const projects = await getProjects();

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
          {projects.length === 0 ? (
            <p className="text-body text-muted-foreground">
              Проекты скоро появятся.
            </p>
          ) : (
            <ProjectCatalog projects={projects} />
          )}
        </Container>
      </section>
    </main>
  );
}
