import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import type { ProjectMedia } from "@/types/project";

/**
 * Public service page model (mapped from Work Type).
 * No raw Payload document.
 */
export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description?: DefaultTypedEditorState | null;
  cover?: ProjectMedia;
  featured: boolean;
  showOnServicesPage: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export function serviceSeoTitle(service: Service): string {
  return service.seoTitle?.trim() || `${service.title} в Туле — MBN Строй`;
}

export function serviceSeoDescription(service: Service): string {
  if (service.seoDescription?.trim()) return service.seoDescription.trim();
  if (service.shortDescription?.trim()) return service.shortDescription.trim();
  return `${service.title} для квартир и домов в Туле и Тульской области. MBN Строй.`;
}
