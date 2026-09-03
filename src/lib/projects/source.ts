/** True only during GitHub Pages static demo builds. */
export function isStaticDemoSource(): boolean {
  return process.env.GITHUB_PAGES === "true";
}
