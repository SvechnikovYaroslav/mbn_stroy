import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ServiceCard } from "@/components/services/service-card";
import { getProjects } from "@/lib/projects";
import { ensureServicesDynamic } from "@/lib/services/dynamic";
import { getServices } from "@/lib/services";
import {
  getProjectsByWorkType,
  getRelevantServiceMedia,
  resolveServiceCover,
} from "@/lib/services/related";
import type { WorkType } from "@/types/project";

export const metadata: Metadata = {
  title: "Услуги по ремонту в Туле — MBN Строй",
  description:
    "Ремонт и отделочные работы для квартир и домов в Туле и Тульской области.",
};

export default async function ServicesPage() {
  await ensureServicesDynamic();
  const [services, projects] = await Promise.all([
    getServices(),
    getProjects(),
  ]);

  return (
    <main>
      <section className="border-b border-border">
        <Container className="py-12 md:py-16">
          <h1 className="text-h1 text-foreground">Услуги</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">
            Ремонт и отделочные работы для квартир и домов в Туле и Тульской
            области.
          </p>
        </Container>
      </section>

      <section>
        <Container className="py-4 md:py-6">
          {services.length === 0 ? (
            <p className="py-10 text-body text-muted-foreground">
              Список услуг скоро появится.
            </p>
          ) : (
            <ul>
              {services.map((service, index) => {
                const workType = service.slug as WorkType;
                const cover = resolveServiceCover({
                  serviceCover: service.cover,
                  relevantMedia: getRelevantServiceMedia(projects, workType),
                  relatedProjects: getProjectsByWorkType(projects, workType),
                  serviceTitle: service.title,
                });

                return (
                  <li key={service.id}>
                    <ServiceCard
                      service={service}
                      index={index}
                      cover={cover}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </section>
    </main>
  );
}
