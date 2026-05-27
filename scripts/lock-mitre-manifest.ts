/**
 * Reads the downloaded STIX bundle at data/enterprise-attack.json, validates
 * its tactic structure against data/mitre-manifest.json, then writes the
 * resulting SHA-256, ISO date and tactic shortnames back into the manifest.
 *
 * Invoked by scripts/update-mitre.sh — not intended to run standalone.
 *
 * Usage: npx tsx scripts/lock-mitre-manifest.ts <sha256-hex>
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface StixExternalRef {
  source_name?: string;
  external_id?: string;
}

interface StixObject {
  type: string;
  name?: string;
  revoked?: boolean;
  x_mitre_deprecated?: boolean;
  x_mitre_shortname?: string;
  external_references?: StixExternalRef[];
}

interface StixBundle {
  spec_version?: string;
  objects?: StixObject[];
}

interface Manifest {
  mitreAttackVersion: string;
  downloadUrl: string;
  expectedTacticCount: number;
  lastUpdated: string;
  stixBundleSha256: string;
  tacticShortnames: string[];
}

function fail(msg: string): never {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

const hash = process.argv[2];
if (!hash || !/^[0-9a-f]{64}$/i.test(hash)) {
  fail("expected first arg to be a 64-char SHA-256 hex string");
}

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const manifestPath = resolve(root, "data/mitre-manifest.json");
const bundlePath = resolve(root, "data/enterprise-attack.json");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
const bundle = JSON.parse(readFileSync(bundlePath, "utf8")) as StixBundle;

if (!Array.isArray(bundle.objects)) {
  fail("STIX bundle is missing the `objects` array");
}

const activeTactics = bundle.objects.filter(
  (o) =>
    o.type === "x-mitre-tactic" &&
    o.revoked !== true &&
    o.x_mitre_deprecated !== true,
);

const tacticShortnames = activeTactics
  .map((t) => t.x_mitre_shortname)
  .filter((s): s is string => typeof s === "string")
  .sort();

console.log(`Active (non-deprecated) tactics: ${String(activeTactics.length)}`);
console.log(`Shortnames: ${tacticShortnames.join(", ")}`);

if (activeTactics.length !== manifest.expectedTacticCount) {
  fail(
    `expected ${String(manifest.expectedTacticCount)} active tactics, found ${String(activeTactics.length)} — bump expectedTacticCount in the manifest if this is intentional`,
  );
}

if (tacticShortnames.includes("defense-evasion")) {
  fail(
    "defense-evasion is still present as an active tactic — this script targets ATT&CK v19+ where it must be deprecated/removed",
  );
}

const next: Manifest = {
  ...manifest,
  lastUpdated: new Date().toISOString().slice(0, 10),
  stixBundleSha256: hash,
  tacticShortnames,
};

writeFileSync(manifestPath, JSON.stringify(next, null, 2) + "\n", "utf8");
console.log(`Manifest locked → ${manifestPath}`);
