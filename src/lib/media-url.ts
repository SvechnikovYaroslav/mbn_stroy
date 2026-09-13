/**
 * Resolve a public media path.
 * Payload media (`/api/media/...`) and absolute URLs are returned unchanged.
 */
export function mediaUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized;
}
