import type {
  CalculatorConfig,
  CalculatorInput,
  CalculatorOutcome,
  CalculatorWorkRule,
} from "@/types/calculator";

/**
 * Pricing formula (admins edit numbers, not this logic):
 *
 * 1. BASE = area × baseRate (min/max ₽/m²)
 * 2. CONDITION = BASE × conditionMultiplier
 * 3. EXTRAS from selected work rules where includedInBase = false:
 *    - per_m2  → area × price
 *    - fixed   → price
 *    - percent → CONDITION × (price / 100)
 *      Percent applies to condition-adjusted base, before minimumPrice clamp.
 * 4. TOTAL = CONDITION + EXTRAS
 * 5. Apply minimumPrice floor to both ends
 * 6. Round each end to roundingStep
 * 7. Ensure min ≤ max
 */

function roundToStep(value: number, step: number): number {
  if (step <= 0) return Math.round(value);
  return Math.round(value / step) * step;
}

function applyMinimum(value: number, minimumPrice: number): number {
  return Math.max(value, minimumPrice);
}

function extrasForRule(
  rule: CalculatorWorkRule,
  area: number,
  conditionBaseMin: number,
  conditionBaseMax: number
): { min: number; max: number } {
  switch (rule.pricingMode) {
    case "per_m2":
      return {
        min: area * rule.minPrice,
        max: area * rule.maxPrice,
      };
    case "fixed":
      return {
        min: rule.minPrice,
        max: rule.maxPrice,
      };
    case "percent":
      return {
        min: conditionBaseMin * (rule.minPrice / 100),
        max: conditionBaseMax * (rule.maxPrice / 100),
      };
    default:
      return { min: 0, max: 0 };
  }
}

export function calculateRenovation(
  input: CalculatorInput,
  config: CalculatorConfig
): CalculatorOutcome {
  if (!config.enabled) {
    return { available: false, reason: "disabled", input };
  }

  if (
    !Number.isFinite(input.area) ||
    input.area <= 0 ||
    input.area > 1000
  ) {
    return { available: false, reason: "invalid-input", input };
  }

  const baseRate = config.baseRates.find(
    (row) =>
      row.active &&
      row.objectType === input.objectType &&
      row.renovationType === input.renovationType
  );

  if (!baseRate) {
    return { available: false, reason: "missing-base-rate", input };
  }

  const conditionRule = config.conditionRules.find(
    (row) => row.active && row.condition === input.condition
  );

  if (!conditionRule) {
    return { available: false, reason: "missing-condition", input };
  }

  const baseMin = input.area * baseRate.minPricePerM2;
  const baseMax = input.area * baseRate.maxPricePerM2;

  const conditionBaseMin = baseMin * conditionRule.minMultiplier;
  const conditionBaseMax = baseMax * conditionRule.maxMultiplier;

  let extrasMin = 0;
  let extrasMax = 0;

  for (const slug of input.workTypes) {
    const rule = config.workRules.find(
      (row) => row.active && row.workType === slug
    );
    if (!rule || rule.includedInBase) continue;

    const extra = extrasForRule(
      rule,
      input.area,
      conditionBaseMin,
      conditionBaseMax
    );
    extrasMin += extra.min;
    extrasMax += extra.max;
  }

  let totalMin = conditionBaseMin + extrasMin;
  let totalMax = conditionBaseMax + extrasMax;

  totalMin = applyMinimum(totalMin, config.minimumPrice);
  totalMax = applyMinimum(totalMax, config.minimumPrice);

  totalMin = roundToStep(totalMin, config.roundingStep);
  totalMax = roundToStep(totalMax, config.roundingStep);

  if (totalMin > totalMax) {
    const mid = totalMax;
    totalMax = totalMin;
    totalMin = mid;
  }

  return {
    available: true,
    min: totalMin,
    max: totalMax,
    baseMin: roundToStep(
      applyMinimum(conditionBaseMin, 0),
      config.roundingStep
    ),
    baseMax: roundToStep(
      applyMinimum(conditionBaseMax, 0),
      config.roundingStep
    ),
    extrasMin: roundToStep(extrasMin, config.roundingStep),
    extrasMax: roundToStep(extrasMax, config.roundingStep),
    input,
  };
}

/** Active object types that have at least one active base rate. */
export function getAvailableObjectTypes(config: CalculatorConfig) {
  const set = new Set(
    config.baseRates.filter((r) => r.active).map((r) => r.objectType)
  );
  return [...set];
}

export function getAvailableRenovationTypes(
  config: CalculatorConfig,
  objectType: CalculatorInput["objectType"]
) {
  const set = new Set(
    config.baseRates
      .filter((r) => r.active && r.objectType === objectType)
      .map((r) => r.renovationType)
  );
  return [...set];
}

export function getAvailableConditions(config: CalculatorConfig) {
  return config.conditionRules
    .filter((r) => r.active)
    .map((r) => r.condition);
}

export function getAvailableWorkRules(config: CalculatorConfig) {
  return config.workRules.filter((r) => r.active);
}
