/**
 * Programmatic calculator scenario checks (no Jest).
 */
import { demoCalculatorSettings } from "../data/calculator-settings";
import { calculateRenovation } from "../lib/calculator/calculate-renovation";
import { formatRubRange } from "../lib/calculator/format-money";
import type { CalculatorConfig, CalculatorInput } from "../types/calculator";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function run(label: string, input: CalculatorInput, config = demoCalculatorSettings) {
  const result = calculateRenovation(input, config);
  console.log(`\n${label}`);
  console.log("  input:", JSON.stringify(input));
  if (!result.available) {
    console.log("  unavailable:", result.reason);
    return result;
  }
  console.log("  range:", formatRubRange(result.min, result.max));
  console.log(
    `  base ${result.baseMin}–${result.baseMax}; extras ${result.extrasMin}–${result.extrasMax}`
  );
  return result;
}

const scenarioA = run("Scenario A — apartment 60 turnkey new-build no extras", {
  objectType: "apartment",
  area: 60,
  renovationType: "turnkey",
  condition: "new-build",
  workTypes: [],
});

assert(scenarioA.available, "A available");
assert(scenarioA.min <= scenarioA.max, "A min<=max");
// 60*18000*1.00 = 1_080_000 → round 1_080_000; max 60*23000*1.05 = 1_449_000 → 1_450_000
assert(scenarioA.min === 1_080_000, `A min got ${scenarioA.min}`);
assert(scenarioA.max === 1_450_000, `A max got ${scenarioA.max}`);

const scenarioB = run(
  "Scenario B — apartment 74 turnkey secondary electrical+plumbing",
  {
    objectType: "apartment",
    area: 74,
    renovationType: "turnkey",
    condition: "secondary",
    workTypes: ["electrical", "plumbing"],
  }
);
assert(scenarioB.available, "B available");
assert(scenarioB.extrasMin > 0 && scenarioB.extrasMax > 0, "B extras");

const scenarioC = run("Scenario C — house 150 capital rough", {
  objectType: "house",
  area: 150,
  renovationType: "capital",
  condition: "rough",
  workTypes: ["finishing"],
});
assert(scenarioC.available, "C available");
// finishing includedInBase → extras 0
assert(scenarioC.extrasMin === 0 && scenarioC.extrasMax === 0, "C no extras");

const tinyConfig: CalculatorConfig = {
  ...demoCalculatorSettings,
  minimumPrice: 5_000_000,
};
const scenarioD = run(
  "Scenario D — minimumPrice clamp",
  {
    objectType: "apartment",
    area: 20,
    renovationType: "cosmetic",
    condition: "rough",
    workTypes: [],
  },
  tinyConfig
);
assert(scenarioD.available, "D available");
assert(scenarioD.min >= 5_000_000 && scenarioD.max >= 5_000_000, "D clamp");

const scenarioE = run("Scenario E — percent work rule (heating)", {
  objectType: "apartment",
  area: 60,
  renovationType: "turnkey",
  condition: "new-build",
  workTypes: ["heating"],
});
assert(scenarioE.available, "E available");
assert(scenarioE.extrasMin > 0, "E percent extras");

const emptyConfig: CalculatorConfig = {
  ...demoCalculatorSettings,
  baseRates: [],
};
const scenarioF = run(
  "Scenario F — missing config",
  {
    objectType: "apartment",
    area: 60,
    renovationType: "turnkey",
    condition: "new-build",
    workTypes: [],
  },
  emptyConfig
);
assert(!scenarioF.available && scenarioF.reason === "missing-base-rate", "F");

console.log("\nALL CALCULATOR SCENARIOS PASSED");
process.exit(0);
