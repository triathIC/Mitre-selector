/**
 * Verifies the local STIX bundle matches data/mitre-manifest.json AND
 * that the project's KQL mappings stay consistent with the pinned v19
 * tactic surface:
 *   - SHA-256 of data/enterprise-attack.json equals manifest.stixBundleSha256
 *   - non-deprecated x-mitre-tactic count equals manifest.expectedTacticCount
 *   - manifest.tacticShortnames equals the sorted shortnames in the bundle
 *   - the v19 tactics "stealth" and "defense-impairment" are present
 *   - the legacy "defense-evasion" tactic is NOT present as active
 *   - no KQL mapping carries the deprecated `defense-evasion` tag
 *   - every KQL mapping's technique_id (and additional_technique_ids)
 *     resolves to an active, non-revoked attack-pattern in v19
 *   - data/kql_mappings.json mirrors public/data/kql_mappings.json
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

interface StixExternalRef {
  source_name?: string;
  external_id?: string;
}

interface StixObject {
  type: string;
  revoked?: boolean;
  x_mitre_deprecated?: boolean;
  x_mitre_shortname?: string;
  external_references?: StixExternalRef[];
}

interface KqlMapping {
  mapping_id: string;
  technique_id: string;
  additional_technique_ids?: string[];
  tags: string[];
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

// --- KQL mapping consistency vs. v19 bundle ----------------------------------

const mappingsPath = resolve(root, "public/data/kql_mappings.json");
const mirrorPath = resolve(root, "data/kql_mappings.json");
const mappingsRaw = readFileSync(mappingsPath, "utf8");
const mirrorRaw = readFileSync(mirrorPath, "utf8");
assert.equal(
  mappingsRaw,
  mirrorRaw,
  "public/data/kql_mappings.json and data/kql_mappings.json must be byte-identical (CI mirror)",
);

const mappings = JSON.parse(mappingsRaw) as KqlMapping[];

const activeAttackPatterns = new Set<string>();
for (const o of bundle.objects) {
  if (o.type !== "attack-pattern") continue;
  if (o.revoked === true) continue;
  if (o.x_mitre_deprecated === true) continue;
  const ext = o.external_references?.find(
    (r) => r.source_name === "mitre-attack",
  )?.external_id;
  if (ext) activeAttackPatterns.add(ext);
}

const missingTechniques: string[] = [];
const tagViolations: string[] = [];
for (const m of mappings) {
  if (m.tags.includes("defense-evasion")) {
    tagViolations.push(m.mapping_id);
  }
  const ids = [m.technique_id, ...(m.additional_technique_ids ?? [])];
  for (const id of ids) {
    if (!activeAttackPatterns.has(id)) {
      missingTechniques.push(`${m.mapping_id} → ${id}`);
    }
  }
}

assert.deepEqual(
  tagViolations,
  [],
  `mappings still carry deprecated \`defense-evasion\` tag: ${tagViolations.join(", ")}`,
);
assert.deepEqual(
  missingTechniques,
  [],
  `mappings reference techniques that are not active in v19: ${missingTechniques.join("; ")}`,
);

console.log(
  `OK — STIX bundle ${manifest.mitreAttackVersion} matches manifest (${String(activeTactics.length)} active tactics); ${String(mappings.length)} KQL mappings consistent with v19.`,
);
