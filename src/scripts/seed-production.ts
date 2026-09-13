/**
 * Idempotent production seed. Does not create demo Projects or Leads.
 *
 * Safe to re-run:
 * - Work Types: insert missing slugs only
 * - Calculator settings: fill only if base rates are empty
 * - Site settings: fill empty brand fields / replace legacy "MBN Строй"
 *
 * Usage (after migrations):
 *   docker compose -f docker-compose.prod.yml run --rm app npm run seed:production
 */
import "dotenv/config";

import { getPayload } from "payload";

import { demoCalculatorSettings } from "../data/calculator-settings";
import { demoSiteSettings } from "../data/site-settings";
import { workTypesSeed } from "../data/work-types";
import config from "../payload.config";
import { ensureWorkTypes } from "./lib/ensure-work-types";

const LEGACY_BRAND = "MBN Строй";

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

async function seedCalculatorIfEmpty(
  payload: Awaited<ReturnType<typeof getPayload>>
) {
  const current = await payload.findGlobal({
    slug: "calculator-settings",
    depth: 0,
    overrideAccess: true,
  });

  if (current.baseRates && current.baseRates.length > 0) {
    console.log("Skip calculator settings — already configured.");
    return;
  }

  const workTypeIds = await resolveWorkTypeIds(payload);
  const missing = demoCalculatorSettings.workRules
    .map((rule) => rule.workType)
    .filter((slug) => !workTypeIds.has(slug));

  if (missing.length) {
    throw new Error(
      `Missing work-types: ${missing.join(", ")}. Work types should be seeded first.`
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

  console.log("Calculator settings seeded (was empty).");
}

async function seedSiteSettingsDefaults(
  payload: Awaited<ReturnType<typeof getPayload>>
) {
  const current = await payload.findGlobal({
    slug: "site-settings",
    depth: 0,
    overrideAccess: true,
  });

  const data: {
    companyName?: string;
    slogan?: string;
    location?: string;
  } = {};

  if (!current.companyName?.trim() || current.companyName.trim() === LEGACY_BRAND) {
    data.companyName = demoSiteSettings.companyName;
  }
  if (!current.slogan?.trim()) {
    data.slogan = demoSiteSettings.slogan;
  }
  if (!current.location?.trim()) {
    data.location = demoSiteSettings.location;
  }

  if (Object.keys(data).length === 0) {
    console.log("Skip site settings — brand fields already set.");
    return;
  }

  await payload.updateGlobal({
    slug: "site-settings",
    data,
    overrideAccess: true,
  });

  console.log(
    `Site settings defaults applied: ${Object.keys(data).join(", ")}.`
  );
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error("PAYLOAD_SECRET is required.");
  }

  const payload = await getPayload({ config });
  await ensureWorkTypes(payload, workTypesSeed);
  await seedCalculatorIfEmpty(payload);
  await seedSiteSettingsDefaults(payload);

  console.log("Production seed completed (no projects/leads).");
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
