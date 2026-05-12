import type { MitreTactic, Severity } from "../models";

/**
 * Canonical MITRE ATT&CK tactic display order (left to right in matrix).
 */
export const TACTIC_ORDER: MitreTactic[] = [
  "Reconnaissance",
  "Resource Development",
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Defense Evasion",
  "Credential Access",
  "Discovery",
  "Lateral Movement",
  "Collection",
  "Command and Control",
  "Exfiltration",
  "Impact",
];

/**
 * Severity → Tailwind/color mapping for badges and matrix intensity.
 */
export const SEVERITY_COLORS: Record<Severity, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/50" },
  high: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/50" },
  medium: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/50" },
  low: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/50" },
  informational: { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/50" },
};

/**
 * Confidence → display styling.
 */
export const CONFIDENCE_COLORS: Record<
  "experimental" | "testing" | "production",
  { bg: string; text: string }
> = {
  production: { bg: "bg-green-500/20", text: "text-green-400" },
  testing: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  experimental: { bg: "bg-gray-500/20", text: "text-gray-400" },
};

export const DEBOUNCE_MS = 300;

/**
 * All supported MITRE ATT&CK platforms in display order.
 */
export const PLATFORMS = [
  "Windows",
  "Linux",
  "macOS",
  "Azure AD",
  "Office 365",
  "Google Workspace",
  "SaaS",
  "IaaS",
  "Network",
  "Containers",
] as const satisfies import("../models").Platform[];

/**
 * Severity ranking from most to least severe — used for sorting and filter dropdowns.
 */
export const SEVERITY_ORDER: Severity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "informational",
];
