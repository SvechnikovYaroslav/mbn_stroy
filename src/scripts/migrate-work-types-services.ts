/**
 * Non-destructive Work Types → public Services fields.
 *
 * Schema diff:
 *   + work_types.short_description (varchar, nullable)
 *   + work_types.cover_id (int FK media, nullable)
 *   + work_types.show_on_services_page (bool, default true)
 *   + work_types.featured (bool, default false)
 *   + work_types.seo_title (varchar, nullable)
 *   + work_types.seo_description (varchar, nullable)
 *   ~ work_types.description: text → jsonb (lexical)
 *       existing plain text wrapped into minimal Lexical doc
 *
 * Preserves: id, slug, title, active, sort_order, all relationships.
 *
 * Usage:
 *   npx tsx src/scripts/migrate-work-types-services.ts
 */
import "dotenv/config";

import pg from "pg";

function lexicalFromPlainText(text: string) {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      children: [
        {
          type: "paragraph",
          format: "",
          indent: 0,
          version: 1,
          children: [
            {
              type: "text",
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text,
              version: 1,
            },
          ],
          direction: "ltr",
          textStyle: "",
          textFormat: 0,
        },
      ],
      direction: "ltr",
    },
  };
}

const MAIN_SERVICE_SLUGS = [
  "finishing",
  "electrical",
  "plumbing",
  "stretch-ceilings",
  "windows",
  "flooring",
  "tiling",
  "painting",
  "demolition",
  "doors",
  "heating",
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  console.log("Migration plan (work_types → services fields):");
  console.log("  + short_description, cover_id, show_on_services_page, featured");
  console.log("  + seo_title, seo_description");
  console.log("  ~ description text → jsonb (Lexical), preserving plain text");
  console.log("  ~ showOnServicesPage=true for main slugs; other=false");
  console.log("  (no drops of projects / calculator relations)");

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query("BEGIN");

  try {
    await client.query(`
      ALTER TABLE work_types
        ADD COLUMN IF NOT EXISTS short_description varchar,
        ADD COLUMN IF NOT EXISTS cover_id integer,
        ADD COLUMN IF NOT EXISTS show_on_services_page boolean DEFAULT true,
        ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS seo_title varchar,
        ADD COLUMN IF NOT EXISTS seo_description varchar
    `);

    // FK for cover if missing
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE work_types
          ADD CONSTRAINT work_types_cover_id_media_id_fk
          FOREIGN KEY (cover_id) REFERENCES media(id) ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    const descType = await client.query(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_name = 'work_types' AND column_name = 'description'
    `);
    const dataType = descType.rows[0]?.data_type as string | undefined;

    if (dataType === "character varying" || dataType === "text") {
      await client.query(
        `ALTER TABLE work_types ADD COLUMN IF NOT EXISTS description_rich jsonb`
      );

      const rows = await client.query<{ id: number; description: string | null }>(
        `SELECT id, description FROM work_types`
      );

      for (const row of rows.rows) {
        if (!row.description?.trim()) {
          await client.query(
            `UPDATE work_types SET description_rich = NULL WHERE id = $1`,
            [row.id]
          );
          continue;
        }
        await client.query(
          `UPDATE work_types SET description_rich = $1::jsonb WHERE id = $2`,
          [JSON.stringify(lexicalFromPlainText(row.description.trim())), row.id]
        );
      }

      await client.query(`ALTER TABLE work_types DROP COLUMN description`);
      await client.query(
        `ALTER TABLE work_types RENAME COLUMN description_rich TO description`
      );
      console.log("Converted description text → Lexical jsonb.");
    } else if (dataType === "jsonb") {
      console.log("description already jsonb.");
    } else {
      await client.query(
        `ALTER TABLE work_types ADD COLUMN IF NOT EXISTS description jsonb`
      );
      console.log(`description type was ${dataType ?? "missing"}; ensured jsonb.`);
    }

    await client.query(
      `
      UPDATE work_types
      SET show_on_services_page = CASE
        WHEN slug = ANY($1::text[]) THEN true
        ELSE false
      END
      WHERE show_on_services_page IS NULL
         OR slug = 'other'
         OR slug = ANY($1::text[])
      `,
      [MAIN_SERVICE_SLUGS]
    );

    // Explicit: other off; main on
    await client.query(
      `UPDATE work_types SET show_on_services_page = false WHERE slug = 'other'`
    );
    await client.query(
      `UPDATE work_types SET show_on_services_page = true WHERE slug = ANY($1::text[])`,
      [MAIN_SERVICE_SLUGS]
    );

    // Feature a few core services for homepage
    await client.query(
      `
      UPDATE work_types
      SET featured = true
      WHERE slug = ANY($1::text[])
      `,
      [["finishing", "electrical", "plumbing", "stretch-ceilings"]]
    );

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
