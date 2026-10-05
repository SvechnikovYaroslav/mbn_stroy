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
      <ProjectGallery project={project} />
      <Link
        href={`/projects/${project.slug}${room ? `?room=${encodeURIComponent(room)}` : ""}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
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
