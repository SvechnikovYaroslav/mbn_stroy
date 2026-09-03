import type { SiteSetting as PayloadSiteSetting } from "@/payload-types";
import type { LegalDetail, SiteSettings } from "@/types/site-settings";

function trimOrUndefined(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function mapPayloadSiteSettings(
  doc: PayloadSiteSetting
): SiteSettings {
  const contacts = doc.contacts;
  const legal = doc.legal;

  return {
    companyName: trimOrUndefined(doc.companyName) || "MBN Строй",
    slogan:
      trimOrUndefined(doc.slogan) || "Решаем задачи — меняем пространство",
    location: trimOrUndefined(doc.location) || "Тула и Тульская область",
    phone: trimOrUndefined(contacts?.phone),
    email: trimOrUndefined(contacts?.email),
    telegram: trimOrUndefined(contacts?.telegram),
    whatsapp: trimOrUndefined(contacts?.whatsapp),
    workingHours: trimOrUndefined(contacts?.workingHours),
    legalName: trimOrUndefined(legal?.legalName),
    legalForm: trimOrUndefined(legal?.legalForm),
    inn: trimOrUndefined(legal?.inn),
    ogrnOrOgrnip: trimOrUndefined(legal?.ogrnOrOgrnip),
    legalAddress: trimOrUndefined(legal?.legalAddress),
    privacyEmail: trimOrUndefined(legal?.privacyEmail),
  };
}

/** True when core operator identity fields are present for legal pages. */
export function hasCompleteLegalDetails(settings: SiteSettings): boolean {
  return Boolean(
    settings.legalName &&
      settings.inn &&
      settings.ogrnOrOgrnip &&
      settings.legalAddress
  );
}

/** Filled legal rows only — never emit empty placeholders. */
export function getLegalDetails(settings: SiteSettings): LegalDetail[] {
  const rows: Array<LegalDetail | null> = [
    settings.legalName
      ? {
          key: "legalName",
          label: "Юридическое наименование",
          value: settings.legalName,
        }
      : null,
    settings.legalForm
      ? { key: "legalForm", label: "Форма", value: settings.legalForm }
      : null,
    settings.inn ? { key: "inn", label: "ИНН", value: settings.inn } : null,
    settings.ogrnOrOgrnip
      ? {
          key: "ogrnOrOgrnip",
          label: "ОГРН / ОГРНИП",
          value: settings.ogrnOrOgrnip,
        }
      : null,
    settings.legalAddress
      ? {
          key: "legalAddress",
          label: "Юридический адрес",
          value: settings.legalAddress,
        }
      : null,
    settings.privacyEmail
      ? {
          key: "privacyEmail",
          label: "Email по вопросам персональных данных",
          value: settings.privacyEmail,
        }
      : null,
  ];

  return rows.filter((row): row is LegalDetail => Boolean(row));
}

/** Contact email preferred for privacy requests. */
export function getPrivacyContactEmail(
  settings: SiteSettings
): string | undefined {
  return settings.privacyEmail || settings.email;
}
