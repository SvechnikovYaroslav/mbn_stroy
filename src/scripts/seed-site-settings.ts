/**
 * Seed / ensure Payload Global `site-settings` with brand defaults.
 * Contact fields left empty — fill in admin when real data exists.
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

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      companyName: demoSiteSettings.companyName,
      slogan: demoSiteSettings.slogan,
      location: demoSiteSettings.location,
      contacts: {},
    },
    overrideAccess: true,
  });

  console.log("site-settings seeded with brand defaults (contacts empty).");
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
