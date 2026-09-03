"use client";

import { useMemo, useState } from "react";

import { ProjectCard } from "@/components/projects/project-card";
import {
  catalogProjectTypeFilters,
  catalogSectionFilters,
  catalogWorkTypeFilters,
  type CatalogProjectTypeFilter,
  type CatalogSectionFilter,
  type CatalogWorkTypeFilter,
} from "@/config/project";
import { filterProjects } from "@/lib/projects/filter";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

type ProjectCatalogProps = {
  projects: Project[];
};

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border px-3 py-1.5 text-small transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground"
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

export function ProjectCatalog({ projects }: ProjectCatalogProps) {
  const [projectType, setProjectType] =
    useState<CatalogProjectTypeFilter>("all");
  const [workType, setWorkType] = useState<CatalogWorkTypeFilter | null>(null);
  const [sectionType, setSectionType] =
    useState<CatalogSectionFilter | null>(null);

  const filtered = useMemo(
    () =>
      filterProjects(
        {
          projectType,
          workType: workType ?? undefined,
          sectionType: sectionType ?? undefined,
        },
        projects
      ),
    [projectType, workType, sectionType, projects]
  );

  return (
    <div>
      <div className="space-y-6 border-b border-border pb-8">
        <div>
          <p className="text-caption text-muted-foreground">Тип объекта</p>
          <div
            className="mt-3 flex flex-wrap gap-2"
            role="group"
            aria-label="Тип объекта"
          >
            {catalogProjectTypeFilters.map((item) => (
              <FilterButton
                key={item.id}
                label={item.label}
                active={projectType === item.id}
                onClick={() => setProjectType(item.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-caption text-muted-foreground">Виды работ</p>
          <div
            className="mt-3 flex flex-wrap gap-2"
            role="group"
            aria-label="Виды работ"
          >
            {catalogWorkTypeFilters.map((item) => (
              <FilterButton
                key={item.id}
                label={item.label}
                active={workType === item.id}
                onClick={() =>
                  setWorkType((current) =>
                    current === item.id ? null : item.id
                  )
                }
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-caption text-muted-foreground">Помещения</p>
          <div
            className="mt-3 flex flex-wrap gap-2"
            role="group"
            aria-label="Помещения"
          >
            {catalogSectionFilters.map((item) => (
              <FilterButton
                key={item.id}
                label={item.label}
                active={sectionType === item.id}
                onClick={() =>
                  setSectionType((current) =>
                    current === item.id ? null : item.id
                  )
                }
              />
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-body text-muted-foreground">
          Пока нет проектов в этой категории.
        </p>
      ) : (
        <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
          {filtered.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
