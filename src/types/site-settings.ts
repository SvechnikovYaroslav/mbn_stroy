/**
 * Public site settings (mapped from Payload Global `site-settings`).
 * Empty contact fields stay undefined — UI must hide those items.
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
}

export type ContactChannel = {
  key: "phone" | "email" | "telegram" | "whatsapp" | "workingHours" | "location";
  label: string;
  value: string;
  href?: string;
};
