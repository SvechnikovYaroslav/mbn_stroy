import { demoSiteSettings } from "@/data/site-settings";
import { getCms } from "@/lib/cms";
import { mapPayloadSiteSettings } from "@/lib/site-settings/mapper";
import { isStaticDemoSource } from "@/lib/projects/source";
import type { ContactChannel, SiteSettings } from "@/types/site-settings";

async function getCmsSiteSettings(): Promise<SiteSettings> {
  try {
    const payload = await getCms();
    const doc = await payload.findGlobal({
      slug: "site-settings",
      depth: 0,
      overrideAccess: false,
    });
    return mapPayloadSiteSettings(doc);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[site-settings] Failed to load: ${message}`);
    // Safe public fallback — brand defaults, no invented contacts
    return demoSiteSettings;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isStaticDemoSource()) return demoSiteSettings;
  return getCmsSiteSettings();
}

function telegramHref(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const username = trimmed.replace(/^@/, "");
  if (!/^[a-zA-Z0-9_]{5,}$/.test(username)) return undefined;
  return `https://t.me/${username}`;
}

function whatsappHref(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10) return undefined;
  return `https://wa.me/${digits}`;
}

function phoneHref(value: string): string | undefined {
  const digits = value.replace(/[^\d+]/g, "");
  if (!digits) return undefined;
  return `tel:${digits}`;
}

/**
 * Contact items for UI. Omits empty fields. Always includes location.
 */
export function getContactChannels(settings: SiteSettings): ContactChannel[] {
  const items: ContactChannel[] = [];

  if (settings.phone) {
    items.push({
      key: "phone",
      label: "Телефон",
      value: settings.phone,
      href: phoneHref(settings.phone),
    });
  }
  if (settings.email) {
    items.push({
      key: "email",
      label: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
    });
  }
  if (settings.telegram) {
    items.push({
      key: "telegram",
      label: "Telegram",
      value: settings.telegram,
      href: telegramHref(settings.telegram),
    });
  }
  if (settings.whatsapp) {
    items.push({
      key: "whatsapp",
      label: "WhatsApp",
      value: settings.whatsapp,
      href: whatsappHref(settings.whatsapp),
    });
  }
  if (settings.workingHours) {
    items.push({
      key: "workingHours",
      label: "Время работы",
      value: settings.workingHours,
    });
  }

  items.push({
    key: "location",
    label: "Регион работы",
    value: settings.location,
  });

  return items;
}

export { isStaticDemoSource };
