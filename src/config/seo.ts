import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { absoluteUrl, getSiteEnv, getSiteUrl, isIndexingAllowed } from "@/lib/site-env";

export const seoConfig = {
  siteName: siteConfig.name,
  locale: "ru_RU",
  defaultTitle: "Отделка квартир и помещений в Туле — Отделка 360",
  defaultDescription: siteConfig.description,
  phone: "+79207414124",
  address: {
    country: "RU",
    region: "Тульская область",
    locality: "Тула",
    street: "ул. Кирова, д. 135/1",
  },
  region: "Тула и Тульская область",
  socialImagePath: "/images/hero/otdelka-360-hero.webp",
  environment: getSiteEnv,
  siteUrl: getSiteUrl,
  indexingEnabled: isIndexingAllowed,
} as const;

export function seoRobots(): Metadata["robots"] {
  return seoConfig.indexingEnabled()
    ? { index: true, follow: true }
    : { index: false, follow: false, noarchive: true, nosnippet: true };
}

export function pageMetadata({
  pathname,
  title,
  description,
  imagePath = seoConfig.socialImagePath,
}: {
  pathname: string;
  title: string;
  description: string;
  imagePath?: string;
}): Metadata {
  const canonical = absoluteUrl(pathname);
  const image = absoluteUrl(imagePath);
  return {
    title,
    description,
    robots: seoRobots(),
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title,
      description,
      type: "website",
      locale: seoConfig.locale,
      siteName: seoConfig.siteName,
      ...(canonical ? { url: canonical } : {}),
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
