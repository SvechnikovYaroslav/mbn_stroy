export type ProjectType = "apartment" | "house" | "commercial" | "room";

export type RenovationType = "cosmetic" | "capital" | "turnkey";

/**
 * Work performed on the object (independent from rooms / object type).
 * Later may become a CMS collection instead of a fixed enum.
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
  /** Public path starting with `/media/...` (without site basePath). */
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
  type: ProjectSectionType;
  title: string;
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
   * Demo taxonomy for Milestone 03.
   * Not verified against actual scope of works for real-photo objects.
   */
  workTypes: WorkType[];
  renovationType?: RenovationType;
  status: "completed";
  duration?: string;
  year?: number;
  description?: string;
  cover: ProjectMedia;
  sections: ProjectSection[];
  /** Demo placeholder without real photography. */
  isPlaceholder?: boolean;
}
