import type {
  ProjectSectionType,
  ProjectType,
  RenovationType,
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

export type CatalogProjectFilter = "all" | ProjectType;
export type CatalogSectionFilter = "bathroom" | "kitchen" | "balcony";

export const catalogProjectFilters: {
  id: CatalogProjectFilter;
  label: string;
}[] = [
  { id: "all", label: "Все" },
  { id: "apartment", label: "Квартиры" },
  { id: "house", label: "Дома" },
];

export const catalogSectionFilters: {
  id: CatalogSectionFilter;
  label: string;
}[] = [
  { id: "bathroom", label: "Ванные" },
  { id: "kitchen", label: "Кухни" },
  { id: "balcony", label: "Балконы" },
];
