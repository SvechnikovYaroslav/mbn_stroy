import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import path from "node:path";

/**
 * GitHub Pages cannot host Payload /admin or dynamic API routes.
 * Copy Payload + public lead API aside for static export, then restore.
 */
const payloadDir = path.resolve("src/app/(payload)");
const publicLeadsApiDir = path.resolve("src/app/(frontend)/api");
const backupRoot = path.resolve(".cache/pages-build-backup");
const payloadBackup = path.join(backupRoot, "payload");
const apiBackup = path.join(backupRoot, "frontend-api");

function removeDir(target) {
  if (!existsSync(target)) return;
  rmSync(target, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}

function stashDir(source, backup) {
  if (!existsSync(source)) return false;
  removeDir(backup);
  cpSync(source, backup, { recursive: true });
  removeDir(source);
  return true;
}

function restoreDir(source, backup) {
  if (!existsSync(backup)) return;
  removeDir(source);
  cpSync(backup, source, { recursive: true });
  removeDir(backup);
}

mkdirSync(path.resolve(".cache"), { recursive: true });

try {
  // Recover from a previously interrupted Pages build.
  if (existsSync(payloadBackup) && !existsSync(payloadDir)) {
    restoreDir(payloadDir, payloadBackup);
    console.log("Recovered src/app/(payload) from a previous backup.");
  }
  if (existsSync(apiBackup) && !existsSync(publicLeadsApiDir)) {
    restoreDir(publicLeadsApiDir, apiBackup);
    console.log("Recovered src/app/(frontend)/api from a previous backup.");
  }

  const removedPayload = stashDir(payloadDir, payloadBackup);
  const removedApi = stashDir(publicLeadsApiDir, apiBackup);

  if (removedPayload) {
    console.log("Temporarily removed src/app/(payload) for GitHub Pages export.");
  }
  if (removedApi) {
    console.log(
      "Temporarily removed src/app/(frontend)/api for GitHub Pages export."
    );
  }

  process.env.GITHUB_PAGES = "true";

  // Clear stale typed routes that still reference removed dirs.
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
  restoreDir(payloadDir, payloadBackup);
  restoreDir(publicLeadsApiDir, apiBackup);
  removeDir(backupRoot);
  if (existsSync(payloadDir)) {
    console.log("Restored src/app/(payload).");
  }
  if (existsSync(publicLeadsApiDir)) {
    console.log("Restored src/app/(frontend)/api.");
  }
}

if (typeof process.exitCode === "number" && process.exitCode !== 0) {
  process.exit(process.exitCode);
}
