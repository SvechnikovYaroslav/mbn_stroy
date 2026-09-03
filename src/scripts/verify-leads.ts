/**
 * Lead workflow verification (validation + optional DB create).
 *
 * Usage:
 *   npx tsx src/scripts/verify-leads.ts
 */
import "dotenv/config";

import { getPayload } from "payload";

import config from "../payload.config";
import { createLead } from "../lib/leads/create-lead";
import { formatCalculatorSummary } from "../lib/leads/format-snapshot";
import { validateLeadInput } from "../lib/leads/validate";
import type { LeadCalculatorSnapshot, LeadFormInput } from "../types/lead";

const snapshot: LeadCalculatorSnapshot = {
  objectType: "apartment",
  apartmentLayout: "2-room",
  area: 74,
  renovationType: "turnkey",
  condition: "secondary",
  workTypes: [
    { slug: "electrical", title: "Электрика" },
    { slug: "plumbing", title: "Сантехника" },
  ],
  estimateMin: 1_680_000,
  estimateMax: 2_380_000,
  calculatedAt: new Date().toISOString(),
};

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log("=== Lead validation tests ===");

  const phoneOnly = validateLeadInput({
    name: "Тест",
    phone: "+7 999 123-45-67",
    consentAccepted: true,
    source: "contact",
    formMountedAt: Date.now() - 5_000,
  });
  assert(phoneOnly.ok, "name+phone should pass");
  console.log("OK: name + phone");

  const emailOnly = validateLeadInput({
    email: "client@example.com",
    consentAccepted: true,
    source: "contact",
    formMountedAt: Date.now() - 5_000,
  });
  assert(emailOnly.ok, "email-only should pass");
  console.log("OK: email only");

  const noContact = validateLeadInput({
    name: "Тест",
    consentAccepted: true,
    source: "contact",
    formMountedAt: Date.now() - 5_000,
  });
  assert(!noContact.ok, "no phone/email should fail");
  console.log("OK: no phone/email rejected");

  const badEmail = validateLeadInput({
    email: "not-an-email",
    consentAccepted: true,
    source: "contact",
    formMountedAt: Date.now() - 5_000,
  });
  assert(!badEmail.ok, "invalid email should fail");
  console.log("OK: invalid email rejected");

  const noConsent = validateLeadInput({
    phone: "+79991234567",
    consentAccepted: false,
    source: "contact",
    formMountedAt: Date.now() - 5_000,
  });
  assert(!noConsent.ok, "consent false should fail");
  console.log("OK: consent false rejected");

  const calcSnap = validateLeadInput({
    phone: "+79991234567",
    consentAccepted: true,
    source: "calculator",
    calculatorSnapshot: snapshot,
    formMountedAt: Date.now() - 5_000,
  });
  assert(calcSnap.ok, "calculator snapshot should pass");
  console.log("OK: calculator snapshot validated");

  const summary = formatCalculatorSummary(snapshot);
  assert(summary.includes("Квартира"), "summary has object type");
  assert(summary.includes("Электрика"), "summary has work types");
  assert(summary.includes("1"), "summary has estimate digits");
  console.log("OK: calculator summary format");
  console.log("---\n" + summary + "\n---");

  if (!process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET) {
    console.log("Skip DB create tests (DATABASE_URL / PAYLOAD_SECRET missing).");
    console.log("ALL LEAD VALIDATION TESTS PASSED");
    return;
  }

  console.log("\n=== Lead DB create tests ===");
  const payload = await getPayload({ config });

  const before = await payload.find({
    collection: "leads",
    limit: 1,
    overrideAccess: true,
  });
  const beforeCount = before.totalDocs;

  const contactLead: LeadFormInput = {
    name: "Verify Contact",
    phone: "+7 900 000-00-01",
    consentAccepted: true,
    source: "contact",
    formMountedAt: Date.now() - 5_000,
  };
  const createdContact = await createLead(contactLead, {
    rateLimitKey: `verify-contact-${Date.now()}`,
  });
  assert(createdContact.ok, "contact lead create failed");

  const calcLead: LeadFormInput = {
    name: "Verify Calc",
    phone: "+7 900 000-00-02",
    consentAccepted: true,
    source: "calculator",
    calculatorSnapshot: snapshot,
    formMountedAt: Date.now() - 5_000,
  };
  const createdCalc = await createLead(calcLead, {
    rateLimitKey: `verify-calc-${Date.now()}`,
  });
  assert(createdCalc.ok, "calculator lead create failed");

  const honeypot = await createLead(
    {
      ...contactLead,
      phone: "+7 900 000-00-03",
      companyWebsite: "https://spam.example",
      formMountedAt: Date.now() - 5_000,
    },
    { rateLimitKey: `verify-honey-${Date.now()}` }
  );
  assert(honeypot.ok, "honeypot should silently succeed");

  const after = await payload.find({
    collection: "leads",
    limit: 10,
    sort: "-createdAt",
    overrideAccess: true,
  });

  assert(after.totalDocs === beforeCount + 2, "honeypot must not create a lead");

  const calcDoc = after.docs.find((doc) => doc.name === "Verify Calc");
  assert(calcDoc, "calculator lead missing");
  assert(calcDoc?.hasCalculatorSnapshot, "snapshot flag missing");
  assert(
    Boolean(calcDoc?.calculatorSummary?.includes("Квартира")),
    "summary missing on lead"
  );
  assert(
    calcDoc?.calculatorSnapshot?.estimateMin === 1_680_000,
    "estimateMin mismatch"
  );
  console.log("OK: contact + calculator leads created; honeypot skipped");

  console.log("\nALL LEAD SCENARIOS PASSED");
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
