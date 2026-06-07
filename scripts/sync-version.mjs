#!/usr/bin/env node

/**
 * sync-version.mjs
 *
 * Keeps version numbers in sync across:
 *   - package.json          (source of truth)
 *   - src-tauri/tauri.conf.json
 *   - src-tauri/Cargo.toml
 *
 * Usage:
 *   node scripts/sync-version.mjs              # sync from package.json
 *   node scripts/sync-version.mjs 0.3.0-pre.1  # set + sync a new version
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const PACKAGE_JSON = resolve(root, "package.json");
const TAURI_CONF = resolve(root, "src-tauri/tauri.conf.json");
const CARGO_TOML = resolve(root, "src-tauri/Cargo.toml");

// If a version argument is provided, use it. Otherwise read from package.json.
const argVersion = process.argv[2];

// --- package.json ---
const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8"));
if (argVersion) {
  pkg.version = argVersion;
  writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`package.json        -> ${argVersion}`);
} else {
  console.log(`package.json        == ${pkg.version} (source of truth)`);
}

const version = pkg.version;

// --- tauri.conf.json ---
const tauriConf = JSON.parse(readFileSync(TAURI_CONF, "utf-8"));
const oldTauriVersion = tauriConf.version;
tauriConf.version = version;
writeFileSync(TAURI_CONF, JSON.stringify(tauriConf, null, 2) + "\n");
console.log(`tauri.conf.json     -> ${version} (was ${oldTauriVersion})`);

// --- Cargo.toml ---
// Cargo.toml only supports semver without pre-release metadata in the
// [package] version field. Strip any pre-release suffix for Cargo.
const cargoVersion = version.replace(/-.*$/, "");
let cargo = readFileSync(CARGO_TOML, "utf-8");
const cargoMatch = cargo.match(/^version\s*=\s*"([^"]+)"/m);
const oldCargoVersion = cargoMatch ? cargoMatch[1] : "unknown";
cargo = cargo.replace(
  /^version\s*=\s*"[^"]+"/m,
  `version = "${cargoVersion}"`,
);
writeFileSync(CARGO_TOML, cargo);
console.log(
  `Cargo.toml          -> ${cargoVersion} (was ${oldCargoVersion})${version !== cargoVersion ? ` [stripped pre-release suffix from ${version}]` : ""}`,
);

console.log("\nAll versions synced.");
