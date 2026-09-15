import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

export const legalConfig = {
  siteName: "Отделка 360",
  // Legal texts intentionally point to the future production origin, not stage.
  siteUrl: "https://xn--360-5cdtg9ahy4b.xn--p1ai",
  operatorName: "Индивидуальный предприниматель Никоноров Даниил Юрьевич",
  operatorShortName: "ИП Никоноров Даниил Юрьевич",
  inn: "711303313779",
  ogrnip: "324710000034141",
  address: "г. Тула, ул. Кирова, д. 135/1",
  phone: "+79207414124",
  email: "otdelka-360@yandex.ru",
  yandexMetrikaId: process.env.YANDEX_METRIKA_ID?.trim() || undefined,
} as const;

export const legalDocuments = {
  privacy: {
    slug: "privacy",
    current: "1.0",
    title: "Политика обработки персональных данных",
    versions: { "1.0": { effectiveDate: "2026-09-15", file: "privacy.md" } },
  },
  consent: {
    slug: "consent",
    current: "1.0",
    title: "Согласие на обработку персональных данных",
    versions: { "1.0": { effectiveDate: "2026-09-15", file: "consent.md" } },
  },
  cookies: {
    slug: "cookies",
    current: "1.0",
    title: "Политика cookies",
    versions: { "1.0": { effectiveDate: "2026-09-15", file: "cookies.md" } },
  },
  terms: {
    slug: "terms",
    current: "1.0",
    title: "Пользовательское соглашение",
    versions: { "1.0": { effectiveDate: "2026-09-15", file: "terms.md" } },
  },
} as const;

export type LegalDocumentSlug = keyof typeof legalDocuments;

export function isLegalDocumentSlug(value: string): value is LegalDocumentSlug {
  return value in legalDocuments;
}

export function getLegalDocument(slug: LegalDocumentSlug, version?: string) {
  const document = legalDocuments[slug];
  const resolvedVersion = version || document.current;
  const entry = document.versions[resolvedVersion as keyof typeof document.versions];
  if (!entry) return undefined;

  const markdown = readFileSync(
    join(process.cwd(), "src", "content", "legal", resolvedVersion, entry.file),
    "utf8"
  )
    .replaceAll("{{SITE_URL}}", legalConfig.siteUrl)
    .replaceAll("{{LEGAL_EMAIL}}", legalConfig.email);

  return { ...document, version: resolvedVersion, effectiveDate: entry.effectiveDate, markdown };
}

export function currentLegalVersions() {
  return {
    consent: legalDocuments.consent.current,
    privacy: legalDocuments.privacy.current,
    cookies: legalDocuments.cookies.current,
    terms: legalDocuments.terms.current,
  } as const;
}
