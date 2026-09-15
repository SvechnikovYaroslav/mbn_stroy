import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "leads"
      ADD COLUMN "privacy_policy_version" varchar,
      ADD COLUMN "consent_source" varchar,
      ADD COLUMN "last_activity_at" timestamp(3) with time zone,
      ADD COLUMN "expires_at" timestamp(3) with time zone,
      ADD COLUMN "contract_concluded" boolean DEFAULT false;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "leads"
      DROP COLUMN "privacy_policy_version",
      DROP COLUMN "consent_source",
      DROP COLUMN "last_activity_at",
      DROP COLUMN "expires_at",
      DROP COLUMN "contract_concluded";
  `);
}
