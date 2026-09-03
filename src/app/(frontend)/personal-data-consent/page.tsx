import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { LegalDocument } from "@/components/legal/legal-document";
import { personalDataConsentMeta } from "@/config/legal";
import { buildConsentSections } from "@/lib/legal/documents";
import { absoluteUrl, isIndexingAllowed } from "@/lib/site-env";
import { ensureSiteSettingsDynamic } from "@/lib/site-settings/dynamic";
import {
  getSiteSettings,
  hasCompleteLegalDetails,
} from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = absoluteUrl("/personal-data-consent");
  return {
    title: personalDataConsentMeta.title,
    description: personalDataConsentMeta.description,
    ...(canonical ? { alternates: { canonical } } : {}),
    ...(!isIndexingAllowed()
      ? { robots: { index: false, follow: false } }
      : {}),
    openGraph: {
      title: personalDataConsentMeta.title,
      description: personalDataConsentMeta.description,
      type: "website",
      ...(canonical ? { url: canonical } : {}),
    },
  };
}

export default async function PersonalDataConsentPage() {
  await ensureSiteSettingsDynamic();
  const settings = await getSiteSettings();
  const sections = buildConsentSections(settings);
  const incomplete =
    process.env.NODE_ENV !== "production" &&
    !hasCompleteLegalDetails(settings);

  return (
    <main>
      <Container className="py-12 md:py-16 lg:py-20">
        <LegalDocument
          h1={personalDataConsentMeta.h1}
          sections={sections}
          settings={settings}
          showIncompleteNotice={incomplete}
        />
        <p className="mt-12 max-w-3xl text-body text-muted-foreground">
          Подробнее о порядке обработки данных — в{" "}
          <Link
            href="/privacy"
            className="text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Политике обработки персональных данных
          </Link>
          .
        </p>
      </Container>
    </main>
  );
}
