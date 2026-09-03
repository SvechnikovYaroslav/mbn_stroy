/**
 * Ensure Payload Collection `leads` exists (non-destructive).
 *
 * Schema diff:
 *   + collection leads
 *   + contact fields (name, phone, email, preferredContact, comment)
 *   + source / status / context
 *   + calculatorSnapshot group + calculatorSummary
 *   + consentAccepted / consentAcceptedAt / consentVersion
 *   (no drops of projects / work-types / globals)
 *
 * First run (creates tables):
 *   $env:PAYLOAD_DB_PUSH='true'; npm run migrate:leads
 */
import "dotenv/config";

import { getPayload } from "payload";

import config from "../payload.config";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  console.log("Migration plan (Leads collection):");
  console.log("  + leads table");
  console.log("  + name, phone, email, preferred_contact, comment");
  console.log("  + source, status, context_type, context_slug");
  console.log("  + calculator_summary + calculator_snapshot.*");
  console.log("  + consent_accepted, consent_accepted_at, consent_version");
  console.log("  (no drops of existing collections / globals)");

  if (process.env.PAYLOAD_DB_PUSH !== "true") {
    console.log("");
    console.log("Dry check only. To apply schema:");
    console.log("  $env:PAYLOAD_DB_PUSH='true'; npm run migrate:leads");
    process.exit(0);
  }

  const payload = await getPayload({ config });

  // Touch collection — drizzle push runs on init when PAYLOAD_DB_PUSH=true
  const result = await payload.find({
    collection: "leads",
    limit: 1,
    overrideAccess: true,
  });

  console.log(`Leads collection ready (docs: ${result.totalDocs}).`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
