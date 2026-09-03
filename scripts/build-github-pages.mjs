import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import path from "node:path";

/**
 * GitHub Pages cannot host Payload /admin or /api.
 * Copy the Payload App Router group aside, remove it for static export, then restore.
 */
const payloadDir = path.resolve("src/app/(payload)");
const backupDir = path.resolve(".cache/payload-app-backup");

function removeDir(target) {
  if (!existsSync(target)) return;
  rmSync(target, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}

mkdirSync(path.resolve(".cache"), { recursive: true });

try {
  if (existsSync(backupDir) && !existsSync(payloadDir)) {
    // Recover from a previously interrupted Pages build.
    cpSync(backupDir, payloadDir, { recursive: true });
    removeDir(backupDir);
    console.log("Recovered src/app/(payload) from a previous backup.");
  }

  if (existsSync(payloadDir)) {
    removeDir(backupDir);
    cpSync(payloadDir, backupDir, { recursive: true });
    removeDir(payloadDir);
    console.log("Temporarily removed src/app/(payload) for GitHub Pages export.");
  }

  process.env.GITHUB_PAGES = "true";

  // Clear stale typed routes that still reference (payload) from prior server builds.
  removeDir(path.resolve(".next"));

  const result = spawnSync("npm", ["run", "build"], {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  }
} finally {
  if (existsSync(backupDir)) {
    removeDir(payloadDir);
    cpSync(backupDir, payloadDir, { recursive: true });
    removeDir(backupDir);
    console.log("Restored src/app/(payload).");
  }
}

if (typeof process.exitCode === "number" && process.exitCode !== 0) {
  process.exit(process.exitCode);
}
