import { connection } from "next/server";

export async function ensureSiteSettingsDynamic() {
  await connection();
}
