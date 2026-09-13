import { connection } from "next/server";

/** Request-time rendering so Payload calculator settings apply without rebuild. */
export async function ensureCalculatorDynamic() {
  await connection();
}
