import type { NextConfig } from "next";

/**
 * GitHub Pages demo hosting uses a project subpath.
 * Local `next dev` / default local builds stay at `/`.
 * CI sets GITHUB_PAGES=true for https://svechnikovyaroslav.github.io/mbn_stroy/
 */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoBasePath = "/mbn_stroy";
const publicBasePath = isGithubPages ? repoBasePath : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGithubPages ? repoBasePath : undefined,
  assetPrefix: isGithubPages ? repoBasePath : undefined,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: publicBasePath,
  },
};

export default nextConfig;
