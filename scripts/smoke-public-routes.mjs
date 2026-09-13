#!/usr/bin/env node
/**
 * Public-route smoke test for a running site (staging / production).
 *
 * Usage:
 *   SMOKE_BASE_URL=https://stage.example.com node scripts/smoke-public-routes.mjs
 *
 * Fails (exit 1) on HTTP 5xx, missing required routes, or service URLs
 * that the public UI exposes but then 404.
 */

const REQUIRED_PATHS = [
  "/",
  "/services",
  "/projects",
  "/calculator",
  "/about",
  "/contacts",
  "/admin",
  "/api/health",
];

const TIMEOUT_MS = 25_000;

function parseBaseUrl() {
  const raw = (process.env.SMOKE_BASE_URL || process.argv[2] || "").trim();
  if (!raw) {
    console.error("Set SMOKE_BASE_URL or pass the origin as argv[2].");
    process.exit(1);
  }
  try {
    return new URL(raw).origin;
  } catch {
    console.error(`Invalid SMOKE_BASE_URL: ${raw}`);
    process.exit(1);
  }
}

function normalizePath(href, origin) {
  try {
    const url = new URL(href, origin);
    if (url.origin !== new URL(origin).origin) return null;
    return url.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return null;
  }
}

function extractServicePaths(html, origin) {
  const found = new Set();
  const patterns = [
    /href=["']([^"']+)["']/gi,
    /href=([^\s>]+)/gi,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const path = normalizePath(match[1], origin);
      if (!path) continue;
      const service = path.match(/^\/services\/([a-z0-9][a-z0-9-]*)$/i);
      if (service) found.add(`/services/${service[1]}`);
    }
  }

  return [...found].sort();
}

async function fetchWorkTypeServicePaths(origin) {
  const url = new URL("/api/work-types", origin);
  url.searchParams.set("limit", "100");
  url.searchParams.set("depth", "0");
  url.searchParams.set("where[and][0][active][equals]", "true");
  url.searchParams.set("where[and][1][showOnServicesPage][equals]", "true");

  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) return [];

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return [];

  const body = await response.json();
  const docs = Array.isArray(body?.docs) ? body.docs : [];
  return docs
    .map((doc) => (typeof doc?.slug === "string" ? doc.slug.trim() : ""))
    .filter((slug) => /^[a-z0-9][a-z0-9-]*$/i.test(slug))
    .map((slug) => `/services/${slug}`);
}

async function probe(origin, path) {
  const url = `${origin}${path}`;
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Accept: "text/html,application/json;q=0.9,*/*;q=0.8" },
  });

  const status = response.status;
  const finalUrl = response.url;
  const text = await response.text();
  return { path, url, status, finalUrl, text };
}

function classify(result, { mustExist = false } = {}) {
  if (result.status >= 500) {
    return { ok: false, reason: `HTTP ${result.status}` };
  }
  if (mustExist && result.status === 404) {
    return { ok: false, reason: "HTTP 404 (expected to exist)" };
  }
  if (result.status >= 200 && result.status < 400) {
    return { ok: true, reason: `HTTP ${result.status}` };
  }
  if (result.path === "/admin" && result.status >= 200 && result.status < 500) {
    return { ok: true, reason: `HTTP ${result.status}` };
  }
  return { ok: false, reason: `HTTP ${result.status}` };
}

async function main() {
  const origin = parseBaseUrl();
  const failures = [];
  const rows = [];

  console.log(`Smoke public routes: ${origin}`);

  const requiredResults = [];
  for (const path of REQUIRED_PATHS) {
    try {
      const result = await probe(origin, path);
      requiredResults.push(result);
      const verdict = classify(result, { mustExist: true });
      rows.push({ path, ...verdict });
      if (!verdict.ok) failures.push(`${path} ${verdict.reason}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      rows.push({ path, ok: false, reason: message });
      failures.push(`${path} ${message}`);
    }
  }

  const home = requiredResults.find((item) => item.path === "/");
  const services = requiredResults.find((item) => item.path === "/services");
  const uiServicePaths = new Set([
    ...extractServicePaths(home?.text || "", origin),
    ...extractServicePaths(services?.text || "", origin),
  ]);

  let apiServicePaths = [];
  try {
    apiServicePaths = await fetchWorkTypeServicePaths(origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`work-types API skipped: ${message}`);
  }

  const servicePaths = [...new Set([...uiServicePaths, ...apiServicePaths])].sort();

  if (uiServicePaths.size === 0) {
    failures.push("no /services/{slug} hrefs found on / or /services");
    rows.push({
      path: "/services/*",
      ok: false,
      reason: "no service detail links in public HTML",
    });
  }

  for (const path of servicePaths) {
    try {
      const result = await probe(origin, path);
      const fromUi = uiServicePaths.has(path);
      const verdict = classify(result, { mustExist: fromUi });
      rows.push({ path, ...verdict });
      if (!verdict.ok) failures.push(`${path} ${verdict.reason}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      rows.push({ path, ok: false, reason: message });
      failures.push(`${path} ${message}`);
    }
  }

  const health = requiredResults.find((item) => item.path === "/api/health");
  if (health && health.status >= 200 && health.status < 300) {
    try {
      const payload = JSON.parse(health.text);
      if (payload?.ok !== true) {
        failures.push("/api/health body is not { ok: true }");
        rows.push({
          path: "/api/health#body",
          ok: false,
          reason: "missing ok:true",
        });
      }
    } catch {
      failures.push("/api/health is not JSON");
      rows.push({ path: "/api/health#body", ok: false, reason: "not JSON" });
    }
  }

  for (const row of rows) {
    const mark = row.ok ? "OK " : "FAIL";
    console.log(`${mark}  ${row.path}  ${row.reason}`);
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} smoke failure(s):`);
    for (const line of failures) console.error(` - ${line}`);
    process.exit(1);
  }

  console.log(`\nSmoke passed (${rows.length} checks).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
