import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { SiteHeader } from "@/components/layout/site-header";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/json-ld";
import { brandHomeTitle, siteConfig } from "@/config/site";
import { seoRobots } from "@/config/seo";
import {
  absoluteUrl,
  metadataBaseUrl,
} from "@/lib/site-env";
import { legalConfig } from "@/lib/legal/registry";

import "./globals.css";

const metadataBase = metadataBaseUrl();
const canonicalHome = absoluteUrl("/");

export const metadata: Metadata = {
  ...(metadataBase ? { metadataBase } : {}),
  title: {
    default: brandHomeTitle(),
    template: "%s",
  },
  description: siteConfig.description,
  ...(canonicalHome
    ? { alternates: { canonical: canonicalHome } }
    : {}),
  robots: seoRobots(),
  openGraph: {
    title: brandHomeTitle(),
    description: siteConfig.description,
    type: "website",
    locale: "ru_RU",
    siteName: siteConfig.name,
    ...(canonicalHome ? { url: canonicalHome } : {}),
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
        <CookieConsent metrikaId={legalConfig.yandexMetrikaId} />
      </body>
    </html>
  );
}
