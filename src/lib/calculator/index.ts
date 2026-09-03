import { demoCalculatorSettings } from "@/data/calculator-settings";
import { getCms } from "@/lib/cms";
import { mapPayloadCalculatorSettings } from "@/lib/calculator/payload-mapper";
import { isStaticDemoSource } from "@/lib/projects/source";
import type { CalculatorConfig } from "@/types/calculator";

async function getCmsCalculatorConfig(): Promise<CalculatorConfig> {
  try {
    const payload = await getCms();
    const doc = await payload.findGlobal({
      slug: "calculator-settings",
      depth: 2,
      overrideAccess: false,
    });
    return mapPayloadCalculatorSettings(doc);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[calculator] Failed to load settings: ${message}`);
    throw new Error("Не удалось загрузить настройки калькулятора.");
  }
}

/**
 * Public calculator config access.
 * GITHUB_PAGES → static demo; otherwise Payload Global via Local API.
 */
export async function getCalculatorConfig(): Promise<CalculatorConfig> {
  if (isStaticDemoSource()) {
    return demoCalculatorSettings;
  }
  return getCmsCalculatorConfig();
}

export { isStaticDemoSource };
