/**
 * One-time local schema rename for Project sections:
 *   sections.type (required) → sections.roomType (optional)
 *
 * Shown before applying (Milestone DB safety).
 * Does NOT drop data. Does NOT touch admin users.
 *
 * Usage:
 *   npx tsx src/scripts/migrate-section-room-type.ts
 */
import "dotenv/config";

import pg from "pg";

const statements = [
  // Live collection rows
  `ALTER TYPE enum_projects_sections_type RENAME TO enum_projects_sections_room_type`,
  `ALTER TABLE projects_sections RENAME COLUMN type TO room_type`,
  `ALTER TABLE projects_sections ALTER COLUMN room_type DROP NOT NULL`,

  // Draft/version rows
  `ALTER TYPE enum__projects_v_version_sections_type RENAME TO enum__projects_v_version_sections_room_type`,
  `ALTER TABLE _projects_v_version_sections RENAME COLUMN type TO room_type`,
  `ALTER TABLE _projects_v_version_sections ALTER COLUMN room_type DROP NOT NULL`,
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const check = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'projects_sections'
      AND column_name IN ('type', 'room_type')
  `);
  const names = check.rows.map((r) => r.column_name);

  if (names.includes("room_type") && !names.includes("type")) {
    console.log("Already migrated: projects_sections.room_type exists.");
    await client.end();
    return;
  }

  if (!names.includes("type")) {
    throw new Error(
      "Unexpected schema: projects_sections has neither type nor room_type."
    );
  }

  console.log("Applying section type → roomType rename:");
  for (const sql of statements) {
    console.log(`  ${sql}`);
    await client.query(sql);
  }

  console.log("Done. Next: start Payload / publish script to push section.workTypes tables.");
  await client.end();
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
