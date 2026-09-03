import { connection } from "next/server";

import { isStaticDemoSource } from "@/lib/projects/source";

export async function ensureServicesDynamic() {
  if (isStaticDemoSource()) return;
  await connection();
}
