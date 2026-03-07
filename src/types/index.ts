/**
 * MITRE ATT&CK Technique (generated from STIX data).
 * Do NOT manually edit mitre_techniques.json — use scripts/generate-mitre-data.ts.
 */
export interface MitreTechnique {
  /** Technique ID, e.g. "T1059" or "T1059.001" */
  id: string;
  /** Human-readable name */
  name: string;
  /** Parent technique ID. null for top-level techniques. e.g. "T1059" for T1059.001 */
  parent_id: string | null;
  /** All mapped tactics (a technique can appear in multiple tactics) */
  tactics: MitreTactic[];
  /** Applicable platforms */
  platforms: Platform[];
  /** URL to official MITRE page */
  url: string;
  /** Brief description (from STIX) */
  description: string;
  /** Whether this technique is deprecated/revoked */
  deprecated: boolean;
}

export type MitreTactic =
  | "Reconnaissance"
  | "Resource Development"
  | "Initial Access"
  | "Execution"
  | "Persistence"
  | "Privilege Escalation"
  | "Defense Evasion"
  | "Credential Access"
  | "Discovery"
  | "Lateral Movement"
  | "Collection"
  | "Command and Control"
  | "Exfiltration"
  | "Impact";

export type Platform =
  | "Windows"
  | "Linux"
  | "macOS"
  | "Azure AD"
  | "Office 365"
  | "Google Workspace"
  | "SaaS"
  | "IaaS"
  | "Network"
  | "Containers";

/**
 * KQL Mapping — community-curated detection/hunting content.
 * This is the core value of the project.
 */
export interface KqlMapping {
  /** Unique mapping ID (format: "KQL-TXXXX-NNN" or "KQL-TXXXX.NNN-NNN") */
  mapping_id: string;
  /** Technique or sub-technique ID this maps to */
  technique_id: string;
  /** Sub-technique ID if applicable (e.g. "T1059.001"). Deprecated: use technique_id directly. */
  subtechnique_id?: string;
  /** Target product */
  product: "Microsoft Sentinel" | "Defender XDR";
  /** Required data connector in Sentinel (e.g. "Microsoft Defender for Endpoint") */
  data_connector: string;
  /** Log tables used in the query */
  log_sources: string[];
  /** Detection vs. proactive hunting */
  query_type: "detection" | "hunting";
  /** Severity rating */
  severity: "informational" | "low" | "medium" | "high" | "critical";
  /** Short descriptive title */
  title: string;
  /** What this query detects and why it matters */
  description: string;
  /** The KQL query — must be valid, tested, production-ready */
  kql: string;
  /** Searchable tags */
  tags: string[];
  /** Author (GitHub handle or name) */
  author: string;
  /** Reference URLs (blog posts, docs, research) */
  references: string[];
  /** ISO date when query was last validated against live data */
  last_tested: string;
  /** Schema version for future migrations */
  version: number;
  /** Confidence level: how reliably this detects the technique */
  confidence: "experimental" | "testing" | "production";
  /** Tuning notes for real-world deployment */
  tuning_notes?: string;
}

/**
 * In-memory lookup structure built at app init.
 */
export interface DataStore {
  techniques: Map<string, MitreTechnique>;
  /** technique_id → KqlMapping[] */
  mappingsByTechnique: Map<string, KqlMapping[]>;
  /** All unique tactics in display order */
  tactics: MitreTactic[];
  /** technique_id → child sub-technique IDs */
  subtechniquesByParent: Map<string, string[]>;
}

/**
 * Global app state managed via useReducer.
 */
export interface AppState {
  dataStore: DataStore | null;
  isLoading: boolean;
  error: string | null;
  selectedTechniqueId: string | null;
  filters: FilterState;
}

export interface FilterState {
  platform: Platform | "all";
  product: KqlMapping["product"] | "all";
  severity: KqlMapping["severity"] | "all";
  searchQuery: string;
  showOnlyWithKql: boolean;
}

export type AppAction =
  | { type: "DATA_LOADED"; payload: DataStore }
  | { type: "DATA_ERROR"; payload: string }
  | { type: "SELECT_TECHNIQUE"; payload: string | null }
  | { type: "SET_FILTER"; payload: Partial<FilterState> }
  | { type: "RESET_FILTERS" };
