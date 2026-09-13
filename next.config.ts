import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
