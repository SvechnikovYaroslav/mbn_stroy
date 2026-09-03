/**
 * Resolve a public asset path with optional GitHub Pages basePath.
 * Pass paths like `/media/projects/...` — never hardcode `/mbn_stroy`.
 */
export function mediaUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function getPublicBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}
