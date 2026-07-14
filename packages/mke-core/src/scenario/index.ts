export type MaturityLevel =
  | "theorized"
  | "static-reviewed"
  | "lab-tested"
  | "field-observed";

export interface TechniqueRef {
  id: string;
  name: string;
  secondary?: TechniqueRef[];
}

export interface Detection {
  tables: string[];
  kqlId: string;
  /** lines; join with "\n" for display */
  kqlDraft: string[];
  maturity: MaturityLevel;
  fpNotes: string;
}

export interface KillChainStep {
  order: number;
  relTime: string;
  tactic: string;
  technique: TechniqueRef;
  whatHappened: string;
  detection: Detection;
}

export interface Correlation {
  linkingEntity: string;
  timeWindow: string;
  inputs: number;
  output: string;
  sequence: string[];
  narrative: string;
  architectNote?: string;
}

export interface ScenarioSource {
  name: string;
  url: string;
  report?: string;
  case?: string;
  published?: string;
  intrusionDate?: string;
}

export interface Scenario {
  id: string;
  title: string;
  source: ScenarioSource;
  threat: string;
  dwellTime: string;
  stack: string[];
  maturityOverall: MaturityLevel;
  summary: string;
  /** flat technique-id list, drives the chips */
  techniques: string[];
  steps: KillChainStep[];
  correlation: Correlation;
  blindSpots: string[];
  /** authoring metadata — ignore in the UI */
  _meta?: unknown;
}
