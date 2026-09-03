import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { LegalDocument } from "@/components/legal/legal-document";
import { privacyPolicyMeta } from "@/config/legal";
import { buildPrivacySections } from "@/lib/legal/documents";
import { absoluteUrl, isIndexingAllowed } from "@/lib/site-env";
import { ensureSiteSettingsDynamic } from "@/lib/site-settings/dynamic";
import {
  getSiteSettings,
  hasCompleteLegalDetails,
} from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = absoluteUrl("/privacy");
  return {
    title: privacyPolicyMeta.title,
    description: privacyPolicyMeta.description,
    ...(canonical ? { alternates: { canonical } } : {}),
    ...(!isIndexingAllowed()
      ? { robots: { index: false, follow: false } }
      : {}),
    openGraph: {
      title: privacyPolicyMeta.title,
      description: privacyPolicyMeta.description,
      type: "website",
      ...(canonical ? { url: canonical } : {}),
    },
  };
}

export default async function PrivacyPage() {
  await ensureSiteSettingsDynamic();
  const settings = await getSiteSettings();
  const sections = buildPrivacySections(settings);
  const incomplete =
    process.env.NODE_ENV !== "production" &&
    !hasCompleteLegalDetails(settings);

  return (
    <main>
      <Container className="py-12 md:py-16 lg:py-20">
        <LegalDocument
          h1={privacyPolicyMeta.h1}
          sections={sections}
          settings={settings}
          showIncompleteNotice={incomplete}
        />
      </Container>
    </main>
  );
}
