import type { MetadataRoute } from "next";

import {
  absoluteUrl,
  getSiteUrl,
  isIndexingAllowed,
} from "@/lib/site-env";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexingAllowed()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const sitemap = absoluteUrl("/sitemap.xml");
  const host = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api", "/api/"],
      },
    ],
    ...(sitemap ? { sitemap } : {}),
    ...(host ? { host } : {}),
  };
}
