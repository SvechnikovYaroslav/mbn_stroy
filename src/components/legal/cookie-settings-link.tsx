"use client";

import { openCookieSettings } from "@/components/legal/cookie-consent";

export function CookieSettingsLink() {
  return <button type="button" onClick={openCookieSettings} className="text-small text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Настройки cookies</button>;
}
