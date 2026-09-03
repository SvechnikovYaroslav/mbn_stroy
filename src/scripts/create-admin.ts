/**
 * Creates the first admin user if none exists.
 * Password comes from ADMIN_PASSWORD env (never commit it).
 */
import "dotenv/config";

import { getPayload } from "payload";

import config from "../payload.config";

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@mbn-stroy.local";
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "MBN Admin";

  if (!password || password.length < 12) {
    throw new Error(
      "Set ADMIN_PASSWORD (min 12 chars) in the environment to create an admin user."
    );
  }

  const payload = await getPayload({ config });
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
  });

  if (existing.docs[0]) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  await payload.create({
    collection: "users",
    data: {
      email,
      password,
      name,
      role: "admin",
    },
  });

  console.log(`Created admin user: ${email}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
