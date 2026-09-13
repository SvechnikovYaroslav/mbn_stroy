/**
 * Print Payload users as id + email only.
 * Never logs hashes, salts, tokens, or sessions.
 */
import "dotenv/config";

import { getPayload } from "payload";

import config from "../payload.config";

async function main() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "users",
    limit: 100,
    depth: 0,
    overrideAccess: true,
  });

  const users = result.docs.map((doc) => ({
    id: String(doc.id),
    email: typeof doc.email === "string" ? doc.email : "",
  }));

  for (const user of users) {
    console.log(`${user.id}\t${user.email}`);
  }

  console.log(`count=${users.length}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
