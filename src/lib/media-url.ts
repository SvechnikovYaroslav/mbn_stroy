/**
 * Resolve a public asset path with optional GitHub Pages basePath.
 * Pass paths like `/media/projects/...` — never hardcode `/mbn_stroy`.
 *
 * Payload media (`/api/media/...`) and absolute URLs are returned unchanged.
 */
export function mediaUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/api/")) return path;

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function getPublicBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}
