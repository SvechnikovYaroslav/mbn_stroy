import type { SiteSetting as PayloadSiteSetting } from "@/payload-types";
import type { SiteSettings } from "@/types/site-settings";

function trimOrUndefined(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function mapPayloadSiteSettings(
  doc: PayloadSiteSetting
): SiteSettings {
  const contacts = doc.contacts;

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
  };
}
