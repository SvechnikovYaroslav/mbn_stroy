import "dotenv/config";

import { getPayload } from "payload";

import config from "../payload.config";

async function main() {
  const payload = await getPayload({ config });
  console.log(
    "Payload ready:",
    payload.config.collections.map((collection) => collection.slug).join(", ")
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
