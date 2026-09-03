/**
 * Safe migration: projects.duration (text) → duration_value + duration_unit.
 *
 * Schema change (no data loss of projects/media/users):
 *
 *   projects.duration           text      → DROP after copy
 *   projects.duration_value     numeric   NEW (nullable)
 *   projects.duration_unit      enum      NEW (day|month|year, nullable)
 *   projects.sort_order         keep; clear default 0 → NULL for "unset"
 *
 *   Same for draft versions table `_projects_v`.
 *
 * Best-effort parse of existing duration strings, e.g.:
 *   "3 месяца" → 3 + month
 *   "1 год"    → 1 + year
 *   "14 дней"  → 14 + day
 *
 * Usage:
 *   npx tsx src/scripts/migrate-duration-fields.ts
 */
import "dotenv/config";

import pg from "pg";

function parseDuration(
  raw: string | null
): { value: number; unit: "day" | "month" | "year" } | null {
  if (!raw) return null;
  const text = raw.trim().toLowerCase();
  const match = text.match(/(\d+)\s*(день|дня|дней|месяц|месяца|месяцев|год|года|лет)/i);
  if (!match) return null;

  const value = Number(match[1]);
  const unitRaw = match[2];
  if (!Number.isFinite(value) || value <= 0) return null;

  if (unitRaw.startsWith("д")) return { value, unit: "day" };
  if (unitRaw.startsWith("м")) return { value, unit: "month" };
  return { value, unit: "year" };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Migration plan:");
  console.log("  + projects.duration_value (numeric, nullable)");
  console.log("  + projects.duration_unit (enum day|month|year, nullable)");
  console.log("  ~ copy/parse projects.duration → new columns");
  console.log("  - projects.duration");
  console.log("  ~ same for _projects_v");
  console.log("  ~ sort_order: unset default 0 values → NULL");

  await client.query("BEGIN");

  try {
    // Live projects table
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE enum_projects_duration_unit AS ENUM ('day', 'month', 'year');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await client.query(`
      ALTER TABLE projects
        ADD COLUMN IF NOT EXISTS duration_value numeric,
        ADD COLUMN IF NOT EXISTS duration_unit enum_projects_duration_unit
    `);

    const hasDuration = await client.query(`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'projects' AND column_name = 'duration'
      LIMIT 1
    `);

    if (hasDuration.rowCount) {
      const rows = await client.query<{ id: number; duration: string | null }>(
        `SELECT id, duration FROM projects`
      );

      for (const row of rows.rows) {
        const parsed = parseDuration(row.duration);
        if (!parsed) continue;
        await client.query(
          `UPDATE projects
           SET duration_value = $1, duration_unit = $2::enum_projects_duration_unit
           WHERE id = $3`,
          [parsed.value, parsed.unit, row.id]
        );
      }

      await client.query(`ALTER TABLE projects DROP COLUMN IF EXISTS duration`);
      console.log(`Parsed duration for ${rows.rows.length} project row(s).`);
    } else {
      console.log("projects.duration already removed.");
    }

    // Versions table (_projects_v stores version JSON-ish columns with prefix)
    const versionCols = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = '_projects_v'
        AND column_name IN ('version_duration', 'version_duration_value', 'version_duration_unit')
    `);
    const versionNames = new Set(
      versionCols.rows.map((r) => r.column_name as string)
    );

    if (versionNames.size > 0 || true) {
      await client.query(`
        DO $$ BEGIN
          CREATE TYPE enum__projects_v_version_duration_unit AS ENUM ('day', 'month', 'year');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `);

      // Payload versions typically use version_ prefix
      const vTableExists = await client.query(`
        SELECT 1 FROM information_schema.tables WHERE table_name = '_projects_v' LIMIT 1
      `);

      if (vTableExists.rowCount) {
        await client.query(`
          ALTER TABLE _projects_v
            ADD COLUMN IF NOT EXISTS version_duration_value numeric,
            ADD COLUMN IF NOT EXISTS version_duration_unit enum__projects_v_version_duration_unit
        `);

        if (versionNames.has("version_duration")) {
          const vRows = await client.query<{
            id: number;
            version_duration: string | null;
          }>(`SELECT id, version_duration FROM _projects_v`);

          for (const row of vRows.rows) {
            const parsed = parseDuration(row.version_duration);
            if (!parsed) continue;
            await client.query(
              `UPDATE _projects_v
               SET version_duration_value = $1,
                   version_duration_unit = $2::enum__projects_v_version_duration_unit
               WHERE id = $3`,
              [parsed.value, parsed.unit, row.id]
            );
          }

          await client.query(
            `ALTER TABLE _projects_v DROP COLUMN IF EXISTS version_duration`
          );
        }
      }
    }

    // Treat explicit default 0 as "unset" so date sorting applies
    await client.query(`
      UPDATE projects SET sort_order = NULL WHERE sort_order = 0
    `);
    await client.query(`
      UPDATE _projects_v SET version_sort_order = NULL WHERE version_sort_order = 0
    `).catch(() => undefined);

    await client.query("COMMIT");
    console.log("Migration applied successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
