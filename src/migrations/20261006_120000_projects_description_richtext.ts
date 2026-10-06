import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "projects" ADD COLUMN "description_rich" jsonb;
    UPDATE "projects" SET "description_rich" = CASE WHEN "description" IS NULL OR btrim("description") = '' THEN NULL ELSE jsonb_build_object('root', jsonb_build_object('type','root','format','','indent',0,'version',1,'direction','ltr','children',(SELECT jsonb_agg(jsonb_build_object('type','paragraph','format','','indent',0,'version',1,'direction','ltr','textStyle','','textFormat',0,'children',jsonb_build_array(jsonb_build_object('type','text','detail',0,'format',0,'mode','normal','style','','text',part,'version',1)))) FROM regexp_split_to_table("description", E'\\n\\s*\\n+') AS part WHERE btrim(part) <> ''))) END;
    ALTER TABLE "projects" DROP COLUMN "description";
    ALTER TABLE "projects" RENAME COLUMN "description_rich" TO "description";
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "projects" ADD COLUMN "description_text" varchar; UPDATE "projects" SET "description_text" = COALESCE("description" #>> '{root,children,0,children,0,text}', ''); ALTER TABLE "projects" DROP COLUMN "description"; ALTER TABLE "projects" RENAME COLUMN "description_text" TO "description";`);
}
