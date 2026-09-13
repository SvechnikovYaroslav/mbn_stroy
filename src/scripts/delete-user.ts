/**
 * Delete a Payload user by email after explicit confirmation.
 * Use only for clearly-test accounts. Never prints hashes or tokens.
 *
 * DELETE_USER_EMAIL=... CONFIRM_DELETE=yes
 */
import "dotenv/config";

import { getPayload } from "payload";

import config from "../payload.config";

async function main() {
  const email = process.env.DELETE_USER_EMAIL?.trim();
  const confirm = process.env.CONFIRM_DELETE?.trim();

  if (!email) {
    throw new Error("Set DELETE_USER_EMAIL");
  }
  if (confirm !== "yes") {
    throw new Error("Set CONFIRM_DELETE=yes to delete a user");
  }

  const payload = await getPayload({ config });
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const doc = existing.docs[0];
  if (!doc) {
    console.log(`not-found ${email}`);
    process.exit(0);
  }

  await payload.delete({
    collection: "users",
    id: doc.id,
  });

  console.log(`deleted id=${doc.id} email=${email}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
