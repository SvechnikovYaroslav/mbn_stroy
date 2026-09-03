/**
 * Extend site-settings with legal operator fields (non-destructive).
 *
 * Schema diff:
 *   + site_settings.legal_legal_name
 *   + site_settings.legal_legal_form
 *   + site_settings.legal_inn
 *   + site_settings.legal_ogrn_or_ogrnip
 *   + site_settings.legal_legal_address
 *   + site_settings.legal_privacy_email
 *   (no drops; contacts / brand untouched)
 *
 * Apply:
 *   $env:PAYLOAD_DB_PUSH='true'; npm run migrate:site-legal
 */
import "dotenv/config";

import { getPayload } from "payload";

import config from "../payload.config";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  console.log("Migration plan (site-settings legal fields):");
  console.log("  + legal.legalName, legalForm, inn, ogrnOrOgrnip");
  console.log("  + legal.legalAddress, privacyEmail");
  console.log("  (no drops of leads / projects / calculator)");

  if (process.env.PAYLOAD_DB_PUSH !== "true") {
    console.log("");
    console.log("Dry check only. To apply schema:");
    console.log("  $env:PAYLOAD_DB_PUSH='true'; npm run migrate:site-legal");
    process.exit(0);
  }

  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({
    slug: "site-settings",
    depth: 0,
    overrideAccess: true,
  });

  // Touch global so drizzle push creates columns; keep existing values.
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      companyName: doc.companyName || "MBN Строй",
      slogan: doc.slogan || "Решаем задачи — меняем пространство",
      location: doc.location || "Тула и Тульская область",
      legal: doc.legal || {},
    },
    overrideAccess: true,
  });

  console.log("site-settings legal fields ready (values left empty unless set).");
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
