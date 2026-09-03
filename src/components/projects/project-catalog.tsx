"use client";

import { useMemo, useState } from "react";

import { ProjectCard } from "@/components/projects/project-card";
import {
  catalogProjectFilters,
  catalogSectionFilters,
  type CatalogProjectFilter,
  type CatalogSectionFilter,
} from "@/config/project";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

type CatalogFilter =
  | { kind: "project"; value: CatalogProjectFilter }
  | { kind: "section"; value: CatalogSectionFilter };

type ProjectCatalogProps = {
  projects: Project[];
};

export function ProjectCatalog({ projects }: ProjectCatalogProps) {
  const [filter, setFilter] = useState<CatalogFilter>({
    kind: "project",
    value: "all",
  });

  const filtered = useMemo(() => {
    if (filter.kind === "project") {
      if (filter.value === "all") return projects;
      return projects.filter((project) => project.projectType === filter.value);
    }

    return projects.filter((project) =>
      project.sections.some((section) => section.type === filter.value)
    );
  }, [filter, projects]);

  return (
    <div>
      <div
        className="flex flex-wrap gap-2 border-b border-border pb-6"
        role="group"
        aria-label="Фильтры проектов"
      >
        {catalogProjectFilters.map((item) => {
          const active =
            filter.kind === "project" && filter.value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter({ kind: "project", value: item.id })}
              className={cn(
                "border px-3 py-1.5 text-small transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
              aria-pressed={active}
            >
              {item.label}
            </button>
          );
        })}
        <span className="mx-1 hidden h-8 w-px bg-border sm:block" aria-hidden />
        {catalogSectionFilters.map((item) => {
          const active =
            filter.kind === "section" && filter.value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter({ kind: "section", value: item.id })}
              className={cn(
                "border px-3 py-1.5 text-small transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
              aria-pressed={active}
            >
              {item.label}
            </button>
          );
        })}
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
