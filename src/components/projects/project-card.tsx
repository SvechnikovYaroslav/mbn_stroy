import Link from "next/link";

import { ProjectGallery } from "@/components/projects/project-gallery";
import { projectTypeLabels } from "@/config/project";
import type { Project } from "@/types/project";

type ProjectCardProps = {
  project: Project;
  room?: string;
};

export function ProjectCard({ project, room }: ProjectCardProps) {
  return (
    <article>
      <ProjectGallery project={project} variant="card" />
      <Link
        href={`/projects/${project.slug}${room ? `?room=${encodeURIComponent(room)}` : ""}`}
        className="project-card-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="mt-4 pt-4">
          <h3 className="project-card-title text-h3 text-foreground">{project.title}<span aria-hidden="true" className="project-card-arrow ml-2 inline-block text-muted-foreground">→</span></h3>
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
