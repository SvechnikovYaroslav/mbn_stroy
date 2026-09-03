import { connection } from "next/server";

import { isStaticDemoSource } from "@/lib/projects/source";

/** Request-time rendering so Payload calculator settings apply without rebuild. */
export async function ensureCalculatorDynamic() {
  if (isStaticDemoSource()) return;
  await connection();
}
