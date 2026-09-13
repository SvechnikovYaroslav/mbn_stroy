import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin');
  CREATE TYPE "public"."enum_media_orientation" AS ENUM('landscape', 'portrait', 'square');
  CREATE TYPE "public"."enum_projects_sections_room_type" AS ENUM('bathroom', 'kitchen', 'bedroom', 'living-room', 'balcony', 'hallway', 'floor', 'interior', 'other');
  CREATE TYPE "public"."enum_projects_project_type" AS ENUM('apartment', 'house', 'commercial', 'room');
  CREATE TYPE "public"."enum_projects_renovation_type" AS ENUM('cosmetic', 'capital', 'turnkey');
  CREATE TYPE "public"."enum_projects_duration_unit" AS ENUM('day', 'month', 'year');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_sections_room_type" AS ENUM('bathroom', 'kitchen', 'bedroom', 'living-room', 'balcony', 'hallway', 'floor', 'interior', 'other');
  CREATE TYPE "public"."enum__projects_v_version_project_type" AS ENUM('apartment', 'house', 'commercial', 'room');
  CREATE TYPE "public"."enum__projects_v_version_renovation_type" AS ENUM('cosmetic', 'capital', 'turnkey');
  CREATE TYPE "public"."enum__projects_v_version_duration_unit" AS ENUM('day', 'month', 'year');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_leads_preferred_contact" AS ENUM('phone', 'telegram', 'whatsapp', 'email');
  CREATE TYPE "public"."enum_leads_source" AS ENUM('contact', 'calculator', 'project', 'service', 'other');
  CREATE TYPE "public"."enum_leads_context_type" AS ENUM('project', 'service');
  CREATE TYPE "public"."enum_leads_calculator_snapshot_object_type" AS ENUM('apartment', 'house', 'commercial');
  CREATE TYPE "public"."enum_leads_calculator_snapshot_apartment_layout" AS ENUM('studio', '1-room', '2-room', '3-room', '4-plus');
  CREATE TYPE "public"."enum_leads_calculator_snapshot_renovation_type" AS ENUM('cosmetic', 'capital', 'turnkey');
  CREATE TYPE "public"."enum_leads_calculator_snapshot_condition" AS ENUM('new-build', 'secondary', 'rough');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'in-progress', 'contacted', 'completed', 'spam');
  CREATE TYPE "public"."enum_calculator_settings_base_rates_object_type" AS ENUM('apartment', 'house', 'commercial');
  CREATE TYPE "public"."enum_calculator_settings_base_rates_renovation_type" AS ENUM('cosmetic', 'capital', 'turnkey');
  CREATE TYPE "public"."enum_calculator_settings_condition_rules_condition" AS ENUM('new-build', 'secondary', 'rough');
  CREATE TYPE "public"."enum_calculator_settings_work_rules_pricing_mode" AS ENUM('per_m2', 'fixed', 'percent');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'admin' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "work_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"short_description" varchar,
  	"description" jsonb,
  	"cover_id" integer,
  	"show_on_services_page" boolean DEFAULT true,
  	"featured" boolean DEFAULT false,
  	"active" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"sort_order" numeric DEFAULT 0,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" varchar,
  	"orientation" "enum_media_orientation",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "projects_sections_media_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "projects_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"room_type" "enum_projects_sections_room_type",
  	"description" varchar
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"location" varchar,
  	"area" numeric,
  	"project_type" "enum_projects_project_type",
  	"renovation_type" "enum_projects_renovation_type",
  	"duration_value" numeric,
  	"duration_unit" "enum_projects_duration_unit",
  	"year" numeric,
  	"description" varchar,
  	"cover_id" integer,
  	"featured" boolean DEFAULT false,
  	"slug" varchar,
  	"sort_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"work_types_id" integer
  );
  
  CREATE TABLE "_projects_v_version_sections_media_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"room_type" "enum__projects_v_version_sections_room_type",
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_location" varchar,
  	"version_area" numeric,
  	"version_project_type" "enum__projects_v_version_project_type",
  	"version_renovation_type" "enum__projects_v_version_renovation_type",
  	"version_duration_value" numeric,
  	"version_duration_unit" "enum__projects_v_version_duration_unit",
  	"version_year" numeric,
  	"version_description" varchar,
  	"version_cover_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_slug" varchar,
  	"version_sort_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"work_types_id" integer
  );
  
  CREATE TABLE "leads_calculator_snapshot_work_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_title" varchar,
  	"name" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"preferred_contact" "enum_leads_preferred_contact",
  	"comment" varchar,
  	"source" "enum_leads_source" DEFAULT 'other' NOT NULL,
  	"context_type" "enum_leads_context_type",
  	"context_slug" varchar,
  	"has_calculator_snapshot" boolean DEFAULT false,
  	"calculator_summary" varchar,
  	"calculator_snapshot_object_type" "enum_leads_calculator_snapshot_object_type",
  	"calculator_snapshot_apartment_layout" "enum_leads_calculator_snapshot_apartment_layout",
  	"calculator_snapshot_area" numeric,
  	"calculator_snapshot_renovation_type" "enum_leads_calculator_snapshot_renovation_type",
  	"calculator_snapshot_condition" "enum_leads_calculator_snapshot_condition",
  	"calculator_snapshot_estimate_min" numeric,
  	"calculator_snapshot_estimate_max" numeric,
  	"calculator_snapshot_calculated_at" timestamp(3) with time zone,
  	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
  	"consent_accepted" boolean DEFAULT false NOT NULL,
  	"consent_accepted_at" timestamp(3) with time zone,
  	"consent_version" varchar DEFAULT 'v1',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"work_types_id" integer,
  	"media_id" integer,
  	"projects_id" integer,
  	"leads_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"company_name" varchar DEFAULT 'Отделка 360',
  	"slogan" varchar DEFAULT 'Решаем задачи — меняем пространство',
  	"location" varchar DEFAULT 'Тула и Тульская область',
  	"contacts_phone" varchar,
  	"contacts_email" varchar,
  	"contacts_telegram" varchar,
  	"contacts_whatsapp" varchar,
  	"contacts_working_hours" varchar,
  	"legal_legal_name" varchar,
  	"legal_legal_form" varchar,
  	"legal_inn" varchar,
  	"legal_ogrn_or_ogrnip" varchar,
  	"legal_legal_address" varchar,
  	"legal_privacy_email" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "calculator_settings_base_rates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"object_type" "enum_calculator_settings_base_rates_object_type" NOT NULL,
  	"renovation_type" "enum_calculator_settings_base_rates_renovation_type" NOT NULL,
  	"active" boolean DEFAULT true,
  	"min_price_per_m2" numeric NOT NULL,
  	"max_price_per_m2" numeric NOT NULL
  );
  
  CREATE TABLE "calculator_settings_condition_rules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"condition" "enum_calculator_settings_condition_rules_condition" NOT NULL,
  	"active" boolean DEFAULT true,
  	"min_multiplier" numeric NOT NULL,
  	"max_multiplier" numeric NOT NULL
  );
  
  CREATE TABLE "calculator_settings_work_rules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"work_type_id" integer NOT NULL,
  	"pricing_mode" "enum_calculator_settings_work_rules_pricing_mode" DEFAULT 'per_m2' NOT NULL,
  	"included_in_base" boolean DEFAULT false,
  	"active" boolean DEFAULT true,
  	"min_price" numeric NOT NULL,
  	"max_price" numeric NOT NULL
  );
  
  CREATE TABLE "calculator_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"minimum_price" numeric DEFAULT 300000 NOT NULL,
  	"rounding_step" numeric DEFAULT 10000 NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_types" ADD CONSTRAINT "work_types_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_sections_media_items" ADD CONSTRAINT "projects_sections_media_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_sections_media_items" ADD CONSTRAINT "projects_sections_media_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_sections" ADD CONSTRAINT "projects_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_work_types_fk" FOREIGN KEY ("work_types_id") REFERENCES "public"."work_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_sections_media_items" ADD CONSTRAINT "_projects_v_version_sections_media_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_sections_media_items" ADD CONSTRAINT "_projects_v_version_sections_media_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_sections" ADD CONSTRAINT "_projects_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_work_types_fk" FOREIGN KEY ("work_types_id") REFERENCES "public"."work_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads_calculator_snapshot_work_types" ADD CONSTRAINT "leads_calculator_snapshot_work_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_work_types_fk" FOREIGN KEY ("work_types_id") REFERENCES "public"."work_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "calculator_settings_base_rates" ADD CONSTRAINT "calculator_settings_base_rates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."calculator_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "calculator_settings_condition_rules" ADD CONSTRAINT "calculator_settings_condition_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."calculator_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "calculator_settings_work_rules" ADD CONSTRAINT "calculator_settings_work_rules_work_type_id_work_types_id_fk" FOREIGN KEY ("work_type_id") REFERENCES "public"."work_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "calculator_settings_work_rules" ADD CONSTRAINT "calculator_settings_work_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."calculator_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "work_types_cover_idx" ON "work_types" USING btree ("cover_id");
  CREATE UNIQUE INDEX "work_types_slug_idx" ON "work_types" USING btree ("slug");
  CREATE INDEX "work_types_updated_at_idx" ON "work_types" USING btree ("updated_at");
  CREATE INDEX "work_types_created_at_idx" ON "work_types" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "projects_sections_media_items_order_idx" ON "projects_sections_media_items" USING btree ("_order");
  CREATE INDEX "projects_sections_media_items_parent_id_idx" ON "projects_sections_media_items" USING btree ("_parent_id");
  CREATE INDEX "projects_sections_media_items_media_idx" ON "projects_sections_media_items" USING btree ("media_id");
  CREATE INDEX "projects_sections_order_idx" ON "projects_sections" USING btree ("_order");
  CREATE INDEX "projects_sections_parent_id_idx" ON "projects_sections" USING btree ("_parent_id");
  CREATE INDEX "projects_cover_idx" ON "projects" USING btree ("cover_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_work_types_id_idx" ON "projects_rels" USING btree ("work_types_id");
  CREATE INDEX "_projects_v_version_sections_media_items_order_idx" ON "_projects_v_version_sections_media_items" USING btree ("_order");
  CREATE INDEX "_projects_v_version_sections_media_items_parent_id_idx" ON "_projects_v_version_sections_media_items" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_sections_media_items_media_idx" ON "_projects_v_version_sections_media_items" USING btree ("media_id");
  CREATE INDEX "_projects_v_version_sections_order_idx" ON "_projects_v_version_sections" USING btree ("_order");
  CREATE INDEX "_projects_v_version_sections_parent_id_idx" ON "_projects_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_cover_idx" ON "_projects_v" USING btree ("version_cover_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_work_types_id_idx" ON "_projects_v_rels" USING btree ("work_types_id");
  CREATE INDEX "leads_calculator_snapshot_work_types_order_idx" ON "leads_calculator_snapshot_work_types" USING btree ("_order");
  CREATE INDEX "leads_calculator_snapshot_work_types_parent_id_idx" ON "leads_calculator_snapshot_work_types" USING btree ("_parent_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_work_types_id_idx" ON "payload_locked_documents_rels" USING btree ("work_types_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "calculator_settings_base_rates_order_idx" ON "calculator_settings_base_rates" USING btree ("_order");
  CREATE INDEX "calculator_settings_base_rates_parent_id_idx" ON "calculator_settings_base_rates" USING btree ("_parent_id");
  CREATE INDEX "calculator_settings_condition_rules_order_idx" ON "calculator_settings_condition_rules" USING btree ("_order");
  CREATE INDEX "calculator_settings_condition_rules_parent_id_idx" ON "calculator_settings_condition_rules" USING btree ("_parent_id");
  CREATE INDEX "calculator_settings_work_rules_order_idx" ON "calculator_settings_work_rules" USING btree ("_order");
  CREATE INDEX "calculator_settings_work_rules_parent_id_idx" ON "calculator_settings_work_rules" USING btree ("_parent_id");
  CREATE INDEX "calculator_settings_work_rules_work_type_idx" ON "calculator_settings_work_rules" USING btree ("work_type_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "work_types" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "projects_sections_media_items" CASCADE;
  DROP TABLE "projects_sections" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_version_sections_media_items" CASCADE;
  DROP TABLE "_projects_v_version_sections" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "leads_calculator_snapshot_work_types" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "calculator_settings_base_rates" CASCADE;
  DROP TABLE "calculator_settings_condition_rules" CASCADE;
  DROP TABLE "calculator_settings_work_rules" CASCADE;
  DROP TABLE "calculator_settings" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_media_orientation";
  DROP TYPE "public"."enum_projects_sections_room_type";
  DROP TYPE "public"."enum_projects_project_type";
  DROP TYPE "public"."enum_projects_renovation_type";
  DROP TYPE "public"."enum_projects_duration_unit";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_sections_room_type";
  DROP TYPE "public"."enum__projects_v_version_project_type";
  DROP TYPE "public"."enum__projects_v_version_renovation_type";
  DROP TYPE "public"."enum__projects_v_version_duration_unit";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum_leads_preferred_contact";
  DROP TYPE "public"."enum_leads_source";
  DROP TYPE "public"."enum_leads_context_type";
  DROP TYPE "public"."enum_leads_calculator_snapshot_object_type";
  DROP TYPE "public"."enum_leads_calculator_snapshot_apartment_layout";
  DROP TYPE "public"."enum_leads_calculator_snapshot_renovation_type";
  DROP TYPE "public"."enum_leads_calculator_snapshot_condition";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_calculator_settings_base_rates_object_type";
  DROP TYPE "public"."enum_calculator_settings_base_rates_renovation_type";
  DROP TYPE "public"."enum_calculator_settings_condition_rules_condition";
  DROP TYPE "public"."enum_calculator_settings_work_rules_pricing_mode";`)
}
