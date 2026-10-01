import type { Project, ProjectMedia } from "@/types/project";

/**
 * Builds the compact gallery sequence used by project cards.
 * The CMS stores a cover separately from ordered section media, so this keeps
 * the cover first while preventing the same uploaded file from appearing twice.
 */
export function projectMediaSequence(project: Project): ProjectMedia[] {
  const candidates = [project.cover, ...project.sections.flatMap((section) => section.media)];
  const seen = new Set<string>();
  const media: ProjectMedia[] = [];

  for (const item of candidates) {
    if (!item.src) continue;

    const key = `${item.type}:${item.src}`;
    if (seen.has(key)) continue;

    seen.add(key);
    media.push(item);
  }

  // Preserve the established empty-state card when a project has no media.
  return media.length > 0 ? media : [project.cover];
}
