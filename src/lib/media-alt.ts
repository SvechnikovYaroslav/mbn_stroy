/** Russian fallback alt when CMS alt is empty. */
export function buildMediaAltFallback(options: {
  sectionTitle?: string;
  projectTitle: string;
  kind?: "cover" | "section";
}): string {
  const projectTitle = options.projectTitle.trim();
  const sectionTitle = options.sectionTitle?.trim();

  if (options.kind === "cover" || !sectionTitle) {
    return projectTitle ? `Обложка — ${projectTitle}` : "Обложка проекта";
  }

  return `${sectionTitle} после ремонта — ${projectTitle}`;
}
