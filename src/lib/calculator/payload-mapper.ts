import type { CalculatorSetting } from "@/payload-types";
import type {
  CalculatorConfig,
  CalculatorObjectType,
  PropertyCondition,
  WorkPricingMode,
} from "@/types/calculator";
import type { RenovationType, WorkType } from "@/types/project";

const OBJECT_TYPES = new Set<CalculatorObjectType>([
  "apartment",
  "house",
  "commercial",
]);

const RENOVATION_TYPES = new Set<RenovationType>([
  "cosmetic",
  "capital",
  "turnkey",
]);

const CONDITIONS = new Set<PropertyCondition>([
  "new-build",
  "secondary",
  "rough",
]);

const PRICING_MODES = new Set<WorkPricingMode>([
  "per_m2",
  "fixed",
  "percent",
]);

const WORK_TYPES = new Set<WorkType>([
  "finishing",
  "electrical",
  "plumbing",
  "stretch-ceilings",
  "windows",
  "flooring",
  "tiling",
  "painting",
  "demolition",
  "doors",
  "heating",
  "other",
]);

function isObjectType(value: string): value is CalculatorObjectType {
  return OBJECT_TYPES.has(value as CalculatorObjectType);
}

function isRenovationType(value: string): value is RenovationType {
  return RENOVATION_TYPES.has(value as RenovationType);
}

function isCondition(value: string): value is PropertyCondition {
  return CONDITIONS.has(value as PropertyCondition);
}

function isPricingMode(value: string): value is WorkPricingMode {
  return PRICING_MODES.has(value as WorkPricingMode);
}

function isWorkType(value: string): value is WorkType {
  return WORK_TYPES.has(value as WorkType);
}

/**
 * Payload Global → domain CalculatorConfig.
 * Drops IDs and inactive-only noise; keeps only engine-safe fields.
 */
export function mapPayloadCalculatorSettings(
  doc: CalculatorSetting
): CalculatorConfig {
  const baseRates =
    doc.baseRates
      ?.filter(
        (row) =>
          isObjectType(row.objectType) &&
          isRenovationType(row.renovationType) &&
          typeof row.minPricePerM2 === "number" &&
          typeof row.maxPricePerM2 === "number"
      )
      .map((row) => ({
        objectType: row.objectType as CalculatorObjectType,
        renovationType: row.renovationType as RenovationType,
        minPricePerM2: row.minPricePerM2,
        maxPricePerM2: row.maxPricePerM2,
        active: Boolean(row.active),
      })) ?? [];

  const conditionRules =
    doc.conditionRules
      ?.filter(
        (row) =>
          isCondition(row.condition) &&
          typeof row.minMultiplier === "number" &&
          typeof row.maxMultiplier === "number"
      )
      .map((row) => ({
        condition: row.condition as PropertyCondition,
        minMultiplier: row.minMultiplier,
        maxMultiplier: row.maxMultiplier,
        active: Boolean(row.active),
      })) ?? [];

  const workRules: CalculatorConfig["workRules"] = [];

  for (const row of doc.workRules ?? []) {
    if (!isPricingMode(row.pricingMode)) continue;
    if (typeof row.minPrice !== "number" || typeof row.maxPrice !== "number") {
      continue;
    }

    const relation = row.workType;
    if (typeof relation !== "object" || relation === null || !("slug" in relation)) {
      continue;
    }

    const slug = relation.slug;
    if (!isWorkType(slug)) continue;

    workRules.push({
      workType: slug,
      title: relation.title || slug,
      pricingMode: row.pricingMode,
      minPrice: row.minPrice,
      maxPrice: row.maxPrice,
      includedInBase: Boolean(row.includedInBase),
      active: Boolean(row.active),
    });
  }

  return {
    enabled: doc.enabled !== false,
    minimumPrice:
      typeof doc.minimumPrice === "number" ? doc.minimumPrice : 300_000,
    roundingStep:
      typeof doc.roundingStep === "number" && doc.roundingStep > 0
        ? doc.roundingStep
        : 10_000,
    baseRates,
    conditionRules,
    workRules,
  };
}
