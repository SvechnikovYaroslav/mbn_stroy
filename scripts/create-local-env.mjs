import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.cwd(), ".env");

if (existsSync(envPath)) {
  console.log(".env already exists — leaving it unchanged.");
  process.exit(0);
}

const secret = randomBytes(48).toString("hex");

const contents = `# Generated for local MBN Stroy development.
# Replace DATABASE_URL with your PostgreSQL credentials if needed.

DATABASE_URL=postgresql://mbn_stroy:mbn_stroy_local_dev@127.0.0.1:5432/mbn_stroy
PAYLOAD_SECRET=${secret}
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SITE_ENV=development
`;

writeFileSync(envPath, contents, "utf8");
console.log("Created .env with a random PAYLOAD_SECRET.");
console.log("Update DATABASE_URL if you are not using docker compose defaults.");
