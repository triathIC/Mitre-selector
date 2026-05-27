/**
 * Reads the MITRE ATT&CK Enterprise STIX bundle pinned in
 * data/mitre-manifest.json and outputs mitre_techniques.json matching
 * the MitreTechnique interface. Falls back to the manifest's downloadUrl
 * if the local bundle is missing.
 *
 * Run with: npm run generate-mitre-data
 * Output:   data/mitre_techniques.json (and public/data/mitre_techniques.json)
 */

interface StixExternalRef {
  source_name?: string;
  external_id?: string;
  url?: string;
}

interface StixKillChainPhase {
  kill_chain_name?: string;
  phase_name?: string;
}

interface StixObject {
  type: string;
  id: string;
  name?: string;
  description?: string;
  revoked?: boolean;
  x_mitre_deprecated?: boolean;
  x_mitre_is_subtechnique?: boolean;
  x_mitre_platforms?: string[];
  x_mitre_domains?: string[];
  kill_chain_phases?: StixKillChainPhase[];
  external_references?: StixExternalRef[];
  relationship_type?: string;
  source_ref?: string;
  target_ref?: string;
}

interface MitreTechniqueOut {
  id: string;
  name: string;
  parent_id: string | null;
  tactics: string[];
  platforms: string[];
  url: string;
  description: string;
  deprecated: boolean;
}

const PLATFORM_MAP = new Map<string, string>([
  ["Windows", "Windows"],
  ["Linux", "Linux"],
  ["macOS", "macOS"],
  ["PRE", "Azure AD"],
  ["Azure AD", "Azure AD"],
  ["Office 365", "Office 365"],
  ["Google Workspace", "Google Workspace"],
  ["SaaS", "SaaS"],
  ["IaaS", "IaaS"],
  ["Network", "Network"],
  ["Containers", "Containers"],
]);

const TACTIC_MAP = new Map<string, string>([
  ["reconnaissance", "Reconnaissance"],
  ["resource-development", "Resource Development"],
  ["initial-access", "Initial Access"],
  ["execution", "Execution"],
  ["persistence", "Persistence"],
  ["privilege-escalation", "Privilege Escalation"],
  ["stealth", "Stealth"],
  ["defense-impairment", "Defense Impairment"],
  ["credential-access", "Credential Access"],
  ["discovery", "Discovery"],
  ["lateral-movement", "Lateral Movement"],
  ["collection", "Collection"],
  ["command-and-control", "Command and Control"],
  ["exfiltration", "Exfiltration"],
  ["impact", "Impact"],
]);

function normalizePlatform(p: string): string {
  return PLATFORM_MAP.get(p) ?? p;
}

function normalizeTactic(phaseName: string): string {
  return TACTIC_MAP.get(phaseName) ?? phaseName;
}

function getExternalId(obj: StixObject): string | null {
  const ref = obj.external_references?.find(
    (r) => r.source_name === "mitre-attack" && r.external_id
  );
  return ref?.external_id ?? null;
}

function getMitreUrl(obj: StixObject, fallbackId: string): string {
  const ref = obj.external_references?.find(
    (r) => r.source_name === "mitre-attack" && r.url
  );
  return ref?.url ?? `https://attack.mitre.org/techniques/${fallbackId.replace(".", "/")}/`;
}

interface Manifest {
  mitreAttackVersion: string;
  downloadUrl: string;
}

async function loadBundle(root: string): Promise<{ objects?: StixObject[] }> {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const localBundle = path.join(root, "data", "enterprise-attack.json");
  if (fs.existsSync(localBundle)) {
    console.log("Using pinned bundle:", localBundle);
    return JSON.parse(fs.readFileSync(localBundle, "utf8")) as {
      objects?: StixObject[];
    };
  }
  const manifestPath = path.join(root, "data", "mitre-manifest.json");
  const manifest = JSON.parse(
    fs.readFileSync(manifestPath, "utf8"),
  ) as Manifest;
  console.log(
    `Pinned bundle not found; fetching ${manifest.mitreAttackVersion} from ${manifest.downloadUrl}`,
  );
  const res = await fetch(manifest.downloadUrl);
  if (!res.ok) {
    throw new Error(`HTTP ${String(res.status)}: ${res.statusText}`);
  }
  return (await res.json()) as { objects?: StixObject[] };
}

async function main(): Promise<void> {
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(__dirname, "..");

  const bundle = await loadBundle(root);
  const objects = bundle.objects ?? [];
  console.log("Total STIX objects:", objects.length);

  const attackPatterns = objects.filter(
    (o) =>
      o.type === "attack-pattern" &&
      getExternalId(o) !== null &&
      (o.x_mitre_domains === undefined ||
        o.x_mitre_domains.includes("enterprise-attack"))
  );
  console.log("Attack patterns (with external ID):", attackPatterns.length);

  // STIX internal id → external technique id (e.g. "attack-pattern--xxx" → "T1059")
  const stixIdToExternalId = new Map<string, string>();
  for (const ap of attackPatterns) {
    const extId = getExternalId(ap);
    if (extId) stixIdToExternalId.set(ap.id, extId);
  }

  // Parent resolution via "subtechnique-of" relationships
  const subtechniqueRels = objects.filter(
    (o) =>
      o.type === "relationship" &&
      o.relationship_type === "subtechnique-of" &&
      o.revoked !== true
  );
  console.log("Subtechnique-of relationships:", subtechniqueRels.length);

  const childToParent = new Map<string, string>();
  for (const r of subtechniqueRels) {
    if (r.source_ref && r.target_ref) {
      const childExtId = stixIdToExternalId.get(r.source_ref);
      const parentExtId = stixIdToExternalId.get(r.target_ref);
      if (childExtId && parentExtId) {
        childToParent.set(childExtId, parentExtId);
      }
    }
  }

  const techniques: MitreTechniqueOut[] = [];
  let skippedRevoked = 0;
  let skippedDeprecated = 0;

  for (const ap of attackPatterns) {
    if (ap.revoked === true) {
      skippedRevoked++;
      continue;
    }
    if (ap.x_mitre_deprecated === true) {
      skippedDeprecated++;
      continue;
    }

    const externalId = getExternalId(ap);
    if (externalId === null) continue;
    const tactics = (ap.kill_chain_phases ?? [])
      .filter((p) => p.kill_chain_name === "mitre-attack")
      .map((p) => p.phase_name)
      .filter((name): name is string => typeof name === "string")
      .map(normalizeTactic)
      .filter(Boolean);

    const platforms = (ap.x_mitre_platforms ?? []).map(normalizePlatform);
    const url = getMitreUrl(ap, externalId);

    techniques.push({
      id: externalId,
      name: ap.name ?? externalId,
      parent_id: childToParent.get(externalId) ?? null,
      tactics,
      platforms,
      url,
      description: (ap.description ?? "").split("\n")[0] ?? "",
      deprecated: false,
    });
  }

  techniques.sort((a, b) => a.id.localeCompare(b.id));

  const fs = await import("node:fs");
  const dataDir = path.join(root, "data");
  const publicDataDir = path.join(root, "public", "data");

  const out = JSON.stringify(techniques, null, 2);

  for (const dir of [dataDir, publicDataDir]) {
    fs.mkdirSync(dir, { recursive: true });
    const outPath = path.join(dir, "mitre_techniques.json");
    fs.writeFileSync(outPath, out, "utf8");
    console.log("Wrote", outPath);
  }

  const topLevel = techniques.filter((t) => t.parent_id === null).length;
  const subCount = techniques.length - topLevel;
  const tacticSet = new Set(techniques.flatMap((t) => t.tactics));

  console.log("---");
  console.log("Summary:");
  console.log("  Total techniques: %d (%d top-level, %d sub-techniques)", techniques.length, topLevel, subCount);
  console.log("  Tactics covered:  %d", tacticSet.size);
  console.log("  Skipped revoked:  %d", skippedRevoked);
  console.log("  Skipped deprecated: %d", skippedDeprecated);
  console.log("  Tactics:", [...tacticSet].sort().join(", "));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
