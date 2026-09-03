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

mkdirSync(path.resolve(".cache"), { recursive: true });

let backedUp = false;

try {
  if (existsSync(backupDir) && !existsSync(payloadDir)) {
    // Recover from a previously interrupted Pages build.
    cpSync(backupDir, payloadDir, { recursive: true });
    rmSync(backupDir, { recursive: true, force: true });
    console.log("Recovered src/app/(payload) from a previous backup.");
  }

  if (existsSync(payloadDir)) {
    if (existsSync(backupDir)) {
      rmSync(backupDir, { recursive: true, force: true });
    }
    cpSync(payloadDir, backupDir, { recursive: true });
    rmSync(payloadDir, { recursive: true, force: true });
    backedUp = true;
    console.log("Temporarily removed src/app/(payload) for GitHub Pages export.");
  }

  process.env.GITHUB_PAGES = "true";

  // Clear stale typed routes that still reference (payload) from prior server builds.
  const nextDir = path.resolve(".next");
  if (existsSync(nextDir)) {
    rmSync(nextDir, { recursive: true, force: true });
  }

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
    if (existsSync(payloadDir)) {
      rmSync(payloadDir, { recursive: true, force: true });
    }
    cpSync(backupDir, payloadDir, { recursive: true });
    rmSync(backupDir, { recursive: true, force: true });
    console.log("Restored src/app/(payload).");
  }
}

if (typeof process.exitCode === "number" && process.exitCode !== 0) {
  process.exit(process.exitCode);
}
