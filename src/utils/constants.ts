import type { MitreTactic } from "@/types";

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
export const SEVERITY_COLORS: Record<
  "informational" | "low" | "medium" | "high" | "critical",
  { bg: string; text: string; border: string }
> = {
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
