/**
 * Site environment helpers for SEO / robots / canonical.
 * Never invent production URLs — require NEXT_PUBLIC_SITE_URL explicitly.
 */

export type SiteEnv = "development" | "staging" | "production";

export function getSiteEnv(): SiteEnv {
  const raw = (process.env.SITE_ENV || "").trim().toLowerCase();
  if (raw === "production" || raw === "staging" || raw === "development") {
    return raw;
  }
  if (process.env.NODE_ENV === "production") return "production";
  return "development";
}

export function isIndexingAllowed(): boolean {
  return getSiteEnv() === "production";
}

/**
 * Absolute public site origin without trailing slash.
 * Empty when unset (dev / incomplete config) — callers must handle.
 */
export function getSiteUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    return undefined;
  }
}

export function absoluteUrl(pathname = "/"): string | undefined {
  const origin = getSiteUrl();
  if (!origin) return undefined;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${origin}${path === "/" ? "" : path}`;
}

export function metadataBaseUrl(): URL | undefined {
  const origin = getSiteUrl();
  if (!origin) return undefined;
  try {
    return new URL(`${origin}/`);
  } catch {
    return undefined;
  }
}
