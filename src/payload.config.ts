import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { ru } from "@payloadcms/translations/languages/ru";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Media } from "./collections/Media";
import { Projects } from "./collections/Projects";
import { Users } from "./collections/Users";
import { WorkTypes } from "./collections/WorkTypes";
import { CalculatorSettings } from "./globals/CalculatorSettings";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: "— MBN Строй",
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    supportedLanguages: { ru },
    fallbackLanguage: "ru",
  },
  collections: [Users, WorkTypes, Media, Projects],
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
    /**
     * Interactive drizzle `push` hangs on Windows rename prompts → admin "Failed to fetch".
     * Opt-in: PAYLOAD_DB_PUSH=true (use for new globals/collections once).
     */
    push: process.env.PAYLOAD_DB_PUSH === "true",
  }),
  sharp,
  plugins: [],
});
