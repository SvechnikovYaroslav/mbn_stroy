import { connection } from "next/server";

export async function ensureServicesDynamic() {
  await connection();
}
