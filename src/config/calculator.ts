import type {
  ApartmentLayout,
  CalculatorObjectType,
  PropertyCondition,
} from "@/types/calculator";
import type { RenovationType } from "@/types/project";

export const calculatorObjectTypeLabels: Record<
  CalculatorObjectType,
  string
> = {
  apartment: "Квартира",
  house: "Дом",
  commercial: "Коммерческое помещение",
};

export const calculatorRenovationDescriptions: Record<
  RenovationType,
  string
> = {
  cosmetic: "Обновление отделки без капитальной перепланировки.",
  capital: "Серьёзный ремонт с заменой отделки и инженерных решений.",
  turnkey: "Комплексный ремонт «под ключ» с полным циклом работ.",
};

export const propertyConditionLabels: Record<PropertyCondition, string> = {
  "new-build": "Новостройка",
  secondary: "Вторичное жильё",
  rough: "Черновая отделка",
};

export const apartmentLayoutLabels: Record<ApartmentLayout, string> = {
  studio: "Студия",
  "1-room": "1-комнатная",
  "2-room": "2-комнатная",
  "3-room": "3-комнатная",
  "4-plus": "4+ комнат",
};

export const AREA_DEFAULT = 60;
export const AREA_SLIDER_MIN = 20;
export const AREA_SLIDER_MAX = 300;
export const AREA_HARD_MAX = 1000;
