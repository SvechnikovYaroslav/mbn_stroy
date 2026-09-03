import Link from "next/link";

import { ProjectMediaItem } from "@/components/media/project-media";
import { projectTypeLabels } from "@/config/project";
import type { Project } from "@/types/project";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group">
      <Link
        href={`/projects/${project.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ProjectMediaItem
          media={project.cover}
          className="transition-opacity group-hover:opacity-95"
        />
        <div className="mt-4 border-t border-border pt-4">
          <h3 className="text-h3 text-foreground">{project.title}</h3>
          <p className="mt-1 text-small text-muted-foreground">
            {project.location}
          </p>
          <p className="mt-3 text-caption text-muted-foreground">
            {projectTypeLabels[project.projectType]}
            {typeof project.area === "number" ? ` · ${project.area} м²` : ""}
          </p>
        </div>
      </Link>
    </article>
  );
}
