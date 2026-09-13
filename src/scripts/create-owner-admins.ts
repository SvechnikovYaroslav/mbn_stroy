/**
 * Create two Payload owner admins from environment variables.
 * Never print or persist passwords. Credentials stay in the invoking env.
 *
 * OWNER1_EMAIL OWNER1_PASSWORD OWNER1_NAME
 * OWNER2_EMAIL OWNER2_PASSWORD OWNER2_NAME
 */
import "dotenv/config";

import { getPayload } from "payload";

import config from "../payload.config";

type OwnerInput = {
  key: string;
  email: string;
  password: string;
  name: string;
};

function readOwner(index: 1 | 2): OwnerInput {
  const email = process.env[`OWNER${index}_EMAIL`]?.trim();
  const password = process.env[`OWNER${index}_PASSWORD`];
  const name = process.env[`OWNER${index}_NAME`]?.trim() || `Owner ${index}`;

  if (!email || !email.includes("@")) {
    throw new Error(`OWNER${index}_EMAIL is required`);
  }
  if (!password || password.length < 24) {
    throw new Error(`OWNER${index}_PASSWORD must be at least 24 characters`);
  }

  return { key: `owner${index}`, email, password, name };
}

async function ensureOwner(
  payload: Awaited<ReturnType<typeof getPayload>>,
  owner: OwnerInput
) {
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: owner.email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  if (existing.docs[0]) {
    console.log(`exists ${owner.email} id=${existing.docs[0].id}`);
    return existing.docs[0].id;
  }

  const created = await payload.create({
    collection: "users",
    data: {
      email: owner.email,
      password: owner.password,
      name: owner.name,
      role: "admin",
    },
  });

  console.log(`created ${owner.email} id=${created.id}`);
  return created.id;
}

async function verifyLogin(
  payload: Awaited<ReturnType<typeof getPayload>>,
  owner: OwnerInput
) {
  const result = await payload.login({
    collection: "users",
    data: {
      email: owner.email,
      password: owner.password,
    },
  });

  if (!result?.user) {
    throw new Error(`login failed for ${owner.email}`);
  }

  const loginEmail =
    typeof result.user.email === "string" ? result.user.email : "";
  if (loginEmail !== owner.email) {
    throw new Error(`login email mismatch for ${owner.email}`);
  }

  console.log(`verified ${owner.email}`);
}

async function main() {
  const owner1 = readOwner(1);
  const owner2 = readOwner(2);

  if (owner1.email === owner2.email) {
    throw new Error("Owner emails must be different");
  }
  if (owner1.password === owner2.password) {
    throw new Error("Owner passwords must be different");
  }

  const payload = await getPayload({ config });
  await ensureOwner(payload, owner1);
  await ensureOwner(payload, owner2);
  await verifyLogin(payload, owner1);
  await verifyLogin(payload, owner2);
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
