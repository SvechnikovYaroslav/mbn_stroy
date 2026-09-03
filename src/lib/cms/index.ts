import { getPayload } from "payload";

import config from "@payload-config";

/** Payload Local API entrypoint for Server Components / scripts. */
export async function getCms() {
  return getPayload({ config });
}
