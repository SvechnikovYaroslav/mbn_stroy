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
  if (process.env.GITHUB_PAGES === "true") return "staging";
  if (process.env.NODE_ENV === "production") return "production";
  return "development";
}

export function isIndexingAllowed(): boolean {
  return getSiteEnv() === "production" && process.env.GITHUB_PAGES !== "true";
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
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${origin}${basePath}${path === "/" ? "" : path}` || `${origin}${basePath}/`;
}

export function metadataBaseUrl(): URL | undefined {
  const origin = getSiteUrl();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (origin) {
    try {
      return new URL(`${origin}${basePath}/`);
    } catch {
      return undefined;
    }
  }

  // Demo-only fallback for static export asset resolution — not a production canonical.
  if (process.env.GITHUB_PAGES === "true") {
    try {
      return new URL("https://svechnikovyaroslav.github.io/mbn_stroy/");
    } catch {
      return undefined;
    }
  }

  return undefined;
}
