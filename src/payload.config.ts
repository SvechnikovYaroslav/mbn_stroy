import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { ru } from "@payloadcms/translations/languages/ru";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Media } from "./collections/Media";
import { Projects } from "./collections/Projects";
import { Users } from "./collections/Users";
import { WorkTypes } from "./collections/WorkTypes";
import { Leads } from "./collections/Leads";
import { siteConfig } from "./config/site";
import { CalculatorSettings } from "./globals/CalculatorSettings";
import { SiteSettings } from "./globals/SiteSettings";
import {
  getS3Bucket,
  getS3Endpoint,
  getS3Region,
  isS3Enabled,
} from "./lib/storage/s3";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const s3Enabled = isS3Enabled();

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: `— ${siteConfig.name}`,
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    supportedLanguages: { ru },
    fallbackLanguage: "ru",
  },
  collections: [Users, WorkTypes, Media, Projects, Leads],
  globals: [SiteSettings, CalculatorSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
    migrationDir: path.resolve(dirname, "migrations"),
    /**
     * Interactive drizzle `push` hangs on Windows rename prompts → admin "Failed to fetch".
     * Opt-in for local/dev only: PAYLOAD_DB_PUSH=true.
     * Production always uses migrations (`npm run migrate`) — never push.
     */
    push:
      process.env.NODE_ENV === "production"
        ? false
        : process.env.PAYLOAD_DB_PUSH === "true",
  }),
  sharp,
  plugins: s3Enabled
    ? [
        s3Storage({
          collections: {
            media: {
              prefix: "media",
            },
          },
          bucket: getS3Bucket(),
          config: {
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
            },
            region: getS3Region(),
            endpoint: getS3Endpoint(),
            forcePathStyle: true,
          },
        }),
      ]
    : [],
});
