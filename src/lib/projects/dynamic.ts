/**
 * Opt portfolio routes into request-time rendering so CMS Publish
 * appears without rebuild. Call only from Server Components / route handlers —
 * never from CLI scripts or the projects data layer.
 */
import { connection } from "next/server";

import { isStaticDemoSource } from "@/lib/projects/source";

export async function ensurePortfolioDynamic() {
  if (isStaticDemoSource()) return;
  await connection();
}
