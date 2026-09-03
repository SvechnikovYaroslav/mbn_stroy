import { getPayload } from "payload";

import config from "@payload-config";

/**
 * Future Local API entrypoint for reading CMS data in Server Components.
 * Public frontend routes still use src/data/projects.ts in Milestone 04.
 */
export async function getCms() {
  return getPayload({ config });
}
