/**
 * Seed / ensure Payload Global `site-settings` with brand defaults.
 * Contact fields left empty — fill in admin when real data exists.
 *
 * Does not overwrite filled brand fields. Replaces legacy "MBN Строй" only.
 * Force overwrite brand fields: FORCE_SEED=true
 *
 * Schema note:
 *   + global table site_settings
 *   Does NOT drop projects / work-types / calculator.
 *
 * First run (creates table if needed):
 *   $env:PAYLOAD_DB_PUSH='true'; npm run seed:site-settings
 */
import "dotenv/config";

import { getPayload } from "payload";

import config from "../payload.config";
import { demoSiteSettings } from "../data/site-settings";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  console.log("Schema change (Payload Global):");
  console.log("  + site-settings (companyName, slogan, location, contacts.*)");
  console.log("  (no drops of existing collections / calculator)");

  const payload = await getPayload({ config });
  const current = await payload.findGlobal({
    slug: "site-settings",
    depth: 0,
    overrideAccess: true,
  });

  const force = process.env.FORCE_SEED === "true";
  const data: {
    companyName?: string;
    slogan?: string;
    location?: string;
    contacts?: Record<string, never>;
  } = {};

  if (
    force ||
    !current.companyName?.trim() ||
    current.companyName.trim() === "MBN Строй"
  ) {
    data.companyName = demoSiteSettings.companyName;
  }
  if (force || !current.slogan?.trim()) {
    data.slogan = demoSiteSettings.slogan;
  }
  if (force || !current.location?.trim()) {
    data.location = demoSiteSettings.location;
  }

  if (Object.keys(data).length === 0) {
    console.log("site-settings already has brand values — skip.");
    process.exit(0);
  }

  await payload.updateGlobal({
    slug: "site-settings",
    data,
    overrideAccess: true,
  });

  console.log(
    `site-settings defaults applied: ${Object.keys(data).join(", ")} (contacts untouched).`
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
