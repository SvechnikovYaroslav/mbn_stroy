import type {
  ProjectSectionType,
  ProjectType,
  RenovationType,
  WorkType,
} from "@/types/project";

export const projectTypeLabels: Record<ProjectType, string> = {
  apartment: "Квартира",
  house: "Дом",
  commercial: "Коммерция",
  room: "Помещение",
};

export const renovationTypeLabels: Record<RenovationType, string> = {
  cosmetic: "Косметический",
  capital: "Капитальный",
  turnkey: "Под ключ",
};

export const workTypeLabels: Record<WorkType, string> = {
  finishing: "Отделка",
  electrical: "Электрика",
  plumbing: "Сантехника",
  "stretch-ceilings": "Натяжные потолки",
  windows: "Окна",
  flooring: "Полы",
  tiling: "Плиточные работы",
  painting: "Малярные работы",
  demolition: "Демонтаж",
  doors: "Двери",
  heating: "Отопление",
  other: "Другие работы",
};

export const sectionTypeLabels: Record<ProjectSectionType, string> = {
  bathroom: "Ванная",
  kitchen: "Кухня",
  bedroom: "Спальня",
  "living-room": "Гостиная",
  balcony: "Балкон",
  hallway: "Прихожая",
  floor: "Этаж",
  interior: "Интерьер",
  other: "Другое",
};

/** Object type filters shown in catalog UI. */
export type CatalogProjectTypeFilter = "all" | "apartment" | "house";

/** Work filters shown in catalog UI (subset of WorkType). */
export type CatalogWorkTypeFilter =
  | "finishing"
  | "electrical"
  | "plumbing"
  | "stretch-ceilings"
  | "windows";

/** Room / zone filters shown in catalog UI. */
export type CatalogSectionFilter = "bathroom" | "kitchen" | "balcony";

export const catalogProjectTypeFilters: {
  id: CatalogProjectTypeFilter;
  label: string;
}[] = [
  { id: "all", label: "Все" },
  { id: "apartment", label: "Квартиры" },
  { id: "house", label: "Дома" },
];

export const catalogWorkTypeFilters: {
  id: CatalogWorkTypeFilter;
  label: string;
}[] = [
  { id: "finishing", label: workTypeLabels.finishing },
  { id: "electrical", label: workTypeLabels.electrical },
  { id: "plumbing", label: workTypeLabels.plumbing },
  { id: "stretch-ceilings", label: workTypeLabels["stretch-ceilings"] },
  { id: "windows", label: workTypeLabels.windows },
];

export const catalogSectionFilters: {
  id: CatalogSectionFilter;
  label: string;
}[] = [
  { id: "bathroom", label: "Ванные" },
  { id: "kitchen", label: "Кухни" },
  { id: "balcony", label: "Балконы" },
];

export type ProjectCatalogQuery = {
  projectType?: CatalogProjectTypeFilter;
  workType?: CatalogWorkTypeFilter;
  sectionType?: CatalogSectionFilter;
};
