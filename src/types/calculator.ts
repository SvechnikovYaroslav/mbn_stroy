import type { RenovationType, WorkType } from "@/types/project";

/** Object types supported by the calculator (no `room`). */
export type CalculatorObjectType = "apartment" | "house" | "commercial";

export type PropertyCondition = "new-build" | "secondary" | "rough";

export type WorkPricingMode = "per_m2" | "fixed" | "percent";

export type ApartmentLayout =
  | "studio"
  | "1-room"
  | "2-room"
  | "3-room"
  | "4-plus";

export interface CalculatorBaseRate {
  objectType: CalculatorObjectType;
  renovationType: RenovationType;
  minPricePerM2: number;
  maxPricePerM2: number;
  active: boolean;
}

export interface CalculatorConditionRule {
  condition: PropertyCondition;
  minMultiplier: number;
  maxMultiplier: number;
  active: boolean;
}

export interface CalculatorWorkRule {
  /** Work type slug (domain), not Payload ID. */
  workType: WorkType;
  title: string;
  pricingMode: WorkPricingMode;
  minPrice: number;
  maxPrice: number;
  /** Shown in wizard but does not add separate cost. */
  includedInBase: boolean;
  active: boolean;
}

/**
 * Normalized calculator settings for the pricing engine.
 * No Payload IDs / admin metadata.
 */
export interface CalculatorConfig {
  enabled: boolean;
  minimumPrice: number;
  roundingStep: number;
  baseRates: CalculatorBaseRate[];
  conditionRules: CalculatorConditionRule[];
  workRules: CalculatorWorkRule[];
}

export interface CalculatorInput {
  objectType: CalculatorObjectType;
  area: number;
  renovationType: RenovationType;
  condition: PropertyCondition;
  /** Selected work type slugs. */
  workTypes: WorkType[];
  /** Qualification only — does not affect price. */
  apartmentLayout?: ApartmentLayout;
}

export type CalculatorUnavailableReason =
  | "disabled"
  | "missing-base-rate"
  | "missing-condition"
  | "invalid-input";

export interface CalculatorResult {
  available: true;
  min: number;
  max: number;
  baseMin: number;
  baseMax: number;
  extrasMin: number;
  extrasMax: number;
  input: CalculatorInput;
}

export interface CalculatorUnavailable {
  available: false;
  reason: CalculatorUnavailableReason;
  input: CalculatorInput;
}

export type CalculatorOutcome = CalculatorResult | CalculatorUnavailable;
