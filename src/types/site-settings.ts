/**
 * Public site settings (mapped from Payload Global `site-settings`).
 * Empty contact / legal fields stay undefined — UI must hide those items.
 */
export interface SiteSettings {
  companyName: string;
  slogan: string;
  location: string;
  phone?: string;
  email?: string;
  telegram?: string;
  whatsapp?: string;
  workingHours?: string;
  legalName?: string;
  legalForm?: string;
  inn?: string;
  ogrnOrOgrnip?: string;
  legalAddress?: string;
  privacyEmail?: string;
}

export type ContactChannel = {
  key: "phone" | "email" | "telegram" | "whatsapp" | "workingHours" | "location";
  label: string;
  value: string;
  href?: string;
};

export type LegalDetail = {
  key: keyof Pick<
    SiteSettings,
    | "legalName"
    | "legalForm"
    | "inn"
    | "ogrnOrOgrnip"
    | "legalAddress"
    | "privacyEmail"
  >;
  label: string;
  value: string;
};
