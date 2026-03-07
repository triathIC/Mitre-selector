/**
 * Fetches MITRE ATT&CK Enterprise STIX bundle and outputs mitre_techniques.json
 * matching the MitreTechnique interface. Run with: npx tsx scripts/generate-mitre-data.ts
 *
 * Output: data/mitre_techniques.json (and public/data/mitre_techniques.json for app)
 */

const STIX_URL =
  "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json";

interface StixObject {
  type: string;
  id?: string;
  name?: string;
  description?: string;
  revoked?: boolean;
  x_mitre_deprecated?: boolean;
  x_mitre_external_id?: string;
  kill_chain_phases?: Array< { phase_name?: string }>;
  x_mitre_platforms?: string[];
  external_references?: Array< { source_name?: string; url?: string }>;
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

const PLATFORM_MAP: Record<string, string> = {
  "Windows": "Windows",
  "Linux": "Linux",
  "macOS": "macOS",
  "PRE": "Azure AD",
  "Office 365": "Office 365",
  "Google Workspace": "Google Workspace",
  "SaaS": "SaaS",
  "IaaS": "IaaS",
  "Network": "Network",
  "Containers": "Containers",
};

/** STIX phase_name (e.g. "initial-access") → MitreTactic display name */
const TACTIC_MAP: Record<string, string> = {
  "reconnaissance": "Reconnaissance",
  "resource-development": "Resource Development",
  "initial-access": "Initial Access",
  "execution": "Execution",
  "persistence": "Persistence",
  "privilege-escalation": "Privilege Escalation",
  "defense-evasion": "Defense Evasion",
  "credential-access": "Credential Access",
  "discovery": "Discovery",
  "lateral-movement": "Lateral Movement",
  "collection": "Collection",
  "command-and-control": "Command and Control",
  "exfiltration": "Exfiltration",
  "impact": "Impact",
};

function normalizePlatform(p: string): string {
  return PLATFORM_MAP[p] ?? p;
}

function normalizeTactic(phaseName: string): string {
  const key = phaseName.toLowerCase().replace(/\s+/g, "-");
  return TACTIC_MAP[key] ?? phaseName;
}

async function main(): Promise<void> {
  console.log("Fetching STIX bundle from", STIX_URL);
  const res = await fetch(STIX_URL);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  const bundle = (await res.json()) as { objects?: StixObject[] };
  const objects = bundle.objects ?? [];

  const attackPatterns = objects.filter(
    (o): o is StixObject & { x_mitre_external_id: string } =>
      o.type === "attack-pattern" && typeof o.x_mitre_external_id === "string"
  );

  const relationships = objects.filter(
    (o) => o.type === "relationship" && o.relationship_type === "x-mitre-is-subtechnique-of"
  );

  const idToRef = new Map<string, string>();
  for (const ap of attackPatterns) {
    if (ap.id && ap.x_mitre_external_id) {
      idToRef.set(ap.id, ap.x_mitre_external_id);
    }
  }
  const refToParent = new Map<string, string>();
  for (const r of relationships) {
    if (r.source_ref && r.target_ref) {
      const parentId = idToRef.get(r.target_ref);
      const childId = idToRef.get(r.source_ref);
      if (parentId && childId) refToParent.set(childId, parentId);
    }
  }

  const techniques: MitreTechniqueOut[] = [];
  for (const ap of attackPatterns) {
    if (ap.revoked === true) continue;
    if (ap.x_mitre_deprecated === true) continue;
    const externalId = ap.x_mitre_external_id!;
    const tactics =
      ap.kill_chain_phases?.map((p) => normalizeTactic(p.phase_name ?? "")).filter(Boolean) ?? [];
    const mitreRef = ap.external_references?.find(
      (e) => e.source_name === "mitre-attack"
    );
    const url = mitreRef?.url ?? `https://attack.mitre.org/techniques/${externalId.replace(".", "/")}/`;
    const platforms = (ap.x_mitre_platforms ?? []).map(normalizePlatform);

    techniques.push({
      id: externalId,
      name: ap.name ?? externalId,
      parent_id: refToParent.get(externalId) ?? null,
      tactics,
      platforms,
      url,
      description: ap.description ?? "",
      deprecated: ap.x_mitre_deprecated ?? false,
    });
  }

  techniques.sort((a, b) => a.id.localeCompare(b.id));

  const out = JSON.stringify(techniques, null, 2);
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(__dirname, "..");
  const dataDir = path.join(root, "data");
  const publicDataDir = path.join(root, "public", "data");

  for (const dir of [dataDir, publicDataDir]) {
    fs.mkdirSync(dir, { recursive: true });
    const outPath = path.join(dir, "mitre_techniques.json");
    fs.writeFileSync(outPath, out, "utf8");
    console.log("Wrote", outPath);
  }

  const topLevel = techniques.filter((t) => t.parent_id === null).length;
  const subCount = techniques.length - topLevel;
  console.log("Summary: %d techniques (%d top-level, %d sub-techniques), %d tactics", techniques.length, topLevel, subCount, new Set(techniques.flatMap((t) => t.tactics)).size);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
