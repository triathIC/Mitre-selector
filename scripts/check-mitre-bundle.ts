/**
 * Verifies the local STIX bundle matches data/mitre-manifest.json:
 *   - SHA-256 of data/enterprise-attack.json equals manifest.stixBundleSha256
 *   - non-deprecated x-mitre-tactic count equals manifest.expectedTacticCount
 *   - manifest.tacticShortnames equals the sorted shortnames in the bundle
 *   - the v19 tactics "stealth" and "defense-impairment" are present
 *   - the legacy "defense-evasion" tactic is NOT present as active
 *
 * No external test framework — uses node:assert. Run via `npm run test:bundle`.
 * If the raw bundle is missing locally, the script tells the user to run
 * `bash scripts/update-mitre.sh` instead of failing silently.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { strict as assert } from "node:assert";

interface StixObject {
  type: string;
  revoked?: boolean;
  x_mitre_deprecated?: boolean;
  x_mitre_shortname?: string;
}

interface StixBundle {
  objects?: StixObject[];
}

interface Manifest {
  mitreAttackVersion: string;
  expectedTacticCount: number;
  stixBundleSha256: string;
  tacticShortnames: string[];
}

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const manifestPath = resolve(root, "data/mitre-manifest.json");
const bundlePath = resolve(root, "data/enterprise-attack.json");

if (!existsSync(bundlePath)) {
  console.error(
    `ERROR: ${bundlePath} not found.\n` +
      "Run `bash scripts/update-mitre.sh` to download and lock the bundle.",
  );
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
const bundleRaw = readFileSync(bundlePath);
const bundle = JSON.parse(bundleRaw.toString("utf8")) as StixBundle;

const actualHash = createHash("sha256").update(bundleRaw).digest("hex");
assert.equal(
  actualHash,
  manifest.stixBundleSha256,
  `bundle SHA-256 mismatch — manifest expects ${manifest.stixBundleSha256}, file has ${actualHash}`,
);

assert.ok(Array.isArray(bundle.objects), "bundle is missing `objects` array");

const activeTactics = bundle.objects.filter(
  (o) =>
    o.type === "x-mitre-tactic" &&
    o.revoked !== true &&
    o.x_mitre_deprecated !== true,
);

assert.equal(
  activeTactics.length,
  manifest.expectedTacticCount,
  `active tactic count mismatch — manifest expects ${String(manifest.expectedTacticCount)}, bundle has ${String(activeTactics.length)}`,
);

const shortnames = activeTactics
  .map((t) => t.x_mitre_shortname)
  .filter((s): s is string => typeof s === "string")
  .sort();

assert.deepEqual(
  shortnames,
  [...manifest.tacticShortnames].sort(),
  "tactic shortnames in bundle do not match manifest",
);

assert.ok(
  shortnames.includes("stealth"),
  "expected v19 tactic `stealth` is missing from the bundle",
);
assert.ok(
  shortnames.includes("defense-impairment"),
  "expected v19 tactic `defense-impairment` is missing from the bundle",
);
assert.ok(
  !shortnames.includes("defense-evasion"),
  "legacy tactic `defense-evasion` is still active — bundle is pre-v19",
);

console.log(
  `OK — STIX bundle ${manifest.mitreAttackVersion} matches manifest (${String(activeTactics.length)} active tactics).`,
);
