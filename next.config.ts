import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  async headers() {
    const siteEnv = (process.env.SITE_ENV || "").trim().toLowerCase();
    if (siteEnv === "production") return [];
    return [{
      source: "/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" }],
    }];
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
