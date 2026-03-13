import type { KqlMapping } from "@/types";

export const SEVERITY_ORDER: KqlMapping["severity"][] = [
  "critical",
  "high",
  "medium",
  "low",
  "informational",
];
