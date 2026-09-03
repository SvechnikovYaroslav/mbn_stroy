export type ProjectType = "apartment" | "house" | "commercial" | "room";

export type RenovationType = "cosmetic" | "capital" | "turnkey";

/**
 * Work performed on the object (independent from rooms / object type).
 */
export type WorkType =
  | "finishing"
  | "electrical"
  | "plumbing"
  | "stretch-ceilings"
  | "windows"
  | "flooring"
  | "tiling"
  | "painting"
  | "demolition"
  | "doors"
  | "heating"
  | "other";

/**
 * Rooms / zones shown in media.
 * `interior` = general object photos without a specific room.
 */
export type ProjectSectionType =
  | "bathroom"
  | "kitchen"
  | "bedroom"
  | "living-room"
  | "balcony"
  | "hallway"
  | "floor"
  | "interior"
  | "other";

export type MediaOrientation = "landscape" | "portrait" | "square";

export type ProjectMediaType = "image" | "video";

export interface ProjectMedia {
  id: string;
  type: ProjectMediaType;
  /**
   * Final media URL or path.
   * Static demo: `/media/...` (resolved via mediaUrl / basePath).
   * Payload: `/api/media/file/...` or absolute URL — never GitHub Pages-prefixed.
   */
  src: string;
  alt?: string;
  caption?: string;
  /** Public path for video poster (without site basePath). */
  poster?: string;
  width?: number;
  height?: number;
  orientation?: MediaOrientation;
}

export interface ProjectSection {
  id: string;
  title: string;
  /** Optional room / zone. Omit for work-focused sections (e.g. stretch ceilings). */
  roomType?: ProjectSectionType;
  /** Works shown in this section (media ↔ work type link). */
  workTypes: WorkType[];
  description?: string;
  media: ProjectMedia[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  location: string;
  area?: number;
  projectType: ProjectType;
  /**
   * Effective work types for the project (domain-normalized):
   * union of Project.workTypes and all Section.workTypes.
   */
  workTypes: WorkType[];
  renovationType?: RenovationType;
  status: "completed";
  duration?: string;
  year?: number;
  description?: string;
  /** CMS featured flag; used for homepage selection. */
  featured?: boolean;
  cover: ProjectMedia;
  sections: ProjectSection[];
  /** Demo placeholder without real photography. */
  isPlaceholder?: boolean;
}
