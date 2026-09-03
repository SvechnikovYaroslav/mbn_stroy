import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import {
  absoluteUrl,
  isIndexingAllowed,
  metadataBaseUrl,
} from "@/lib/site-env";
import { ensureSiteSettingsDynamic } from "@/lib/site-settings/dynamic";
import { getSiteSettings } from "@/lib/site-settings";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const metadataBase = metadataBaseUrl();
const canonicalHome = absoluteUrl("/");

export const metadata: Metadata = {
  ...(metadataBase ? { metadataBase } : {}),
  title: {
    default: "MBN Строй — ремонт квартир и домов в Туле",
    template: "%s",
  },
  description: siteConfig.description,
  ...(canonicalHome
    ? { alternates: { canonical: canonicalHome } }
    : {}),
  ...(!isIndexingAllowed()
    ? { robots: { index: false, follow: false, googleBot: { index: false, follow: false } } }
    : {
        robots: {
          index: true,
          follow: true,
        },
      }),
  openGraph: {
    title: "MBN Строй — ремонт квартир и домов в Туле",
    description: siteConfig.description,
    type: "website",
    locale: "ru_RU",
    siteName: siteConfig.name,
    ...(canonicalHome ? { url: canonicalHome } : {}),
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureSiteSettingsDynamic();
  const settings = await getSiteSettings();

  return (
    <html lang="ru" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <OrganizationJsonLd settings={settings} />
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
