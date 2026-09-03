/**
 * Seed / upsert Payload Global `calculator-settings` with demo pricing.
 *
 * Schema note (non-destructive):
 *   + global table calculator_settings (+ array/rels tables)
 *   Does NOT drop projects / media / users.
 *
 * Usage (creates tables if needed):
 *   $env:PAYLOAD_DB_PUSH='true'; npm run seed:calculator
 */
import "dotenv/config";

import { getPayload } from "payload";

import config from "../payload.config";
import { demoCalculatorSettings } from "../data/calculator-settings";

async function resolveWorkTypeIds(
  payload: Awaited<ReturnType<typeof getPayload>>
) {
  const map = new Map<string, number>();
  const result = await payload.find({
    collection: "work-types",
    limit: 100,
    depth: 0,
    overrideAccess: true,
  });

  for (const doc of result.docs) {
    map.set(doc.slug, doc.id);
  }
  return map;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  console.log("Schema change (Payload Global):");
  console.log("  + calculator-settings global");
  console.log("  + baseRates[], conditionRules[], workRules[]");
  console.log("  (no drops of existing collections)");

  const payload = await getPayload({ config });
  const workTypeIds = await resolveWorkTypeIds(payload);

  const missing = demoCalculatorSettings.workRules
    .map((r) => r.workType)
    .filter((slug) => !workTypeIds.has(slug));

  if (missing.length) {
    throw new Error(
      `Missing work-types: ${missing.join(", ")}. Run npm run seed first.`
    );
  }

  await payload.updateGlobal({
    slug: "calculator-settings",
    data: {
      enabled: demoCalculatorSettings.enabled,
      minimumPrice: demoCalculatorSettings.minimumPrice,
      roundingStep: demoCalculatorSettings.roundingStep,
      baseRates: demoCalculatorSettings.baseRates.map((row) => ({
        objectType: row.objectType,
        renovationType: row.renovationType,
        minPricePerM2: row.minPricePerM2,
        maxPricePerM2: row.maxPricePerM2,
        active: row.active,
      })),
      conditionRules: demoCalculatorSettings.conditionRules.map((row) => ({
        condition: row.condition,
        minMultiplier: row.minMultiplier,
        maxMultiplier: row.maxMultiplier,
        active: row.active,
      })),
      workRules: demoCalculatorSettings.workRules.map((row) => ({
        workType: workTypeIds.get(row.workType)!,
        pricingMode: row.pricingMode,
        minPrice: row.minPrice,
        maxPrice: row.maxPrice,
        includedInBase: row.includedInBase,
        active: row.active,
      })),
    },
    overrideAccess: true,
  });

  console.log("Calculator settings seeded.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
