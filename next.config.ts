import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

/**
 * GitHub Pages demo hosting uses a project subpath + static export.
 * Local / future production runs a full Next.js + Payload server (no export).
 * CI sets GITHUB_PAGES=true for https://svechnikovyaroslav.github.io/mbn_stroy/
 *
 * Payload routes under src/app/(payload) are removed for Pages builds via
 * scripts/build-github-pages.mjs — they cannot be statically exported.
 */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoBasePath = "/mbn_stroy";
const publicBasePath = isGithubPages ? repoBasePath : "";

const nextConfig: NextConfig = {
  ...(isGithubPages ? { output: "export" as const } : {}),
  basePath: isGithubPages ? repoBasePath : undefined,
  assetPrefix: isGithubPages ? repoBasePath : undefined,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: publicBasePath,
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
