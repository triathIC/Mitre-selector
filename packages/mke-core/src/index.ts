/**
 * Public API of @triathic/mke-core.
 *
 * Framework-agnostic core of the MITRE KQL Explorer: ATT&CK v19 types and
 * tactic surface, KQL-mapping schema types, scenario-layer types, validators,
 * and pure data transforms. Consumed by the open-source explorer app and by
 * downstream consumers (e.g. a commercial repo depending on this core as a
 * shared package). Do not export framework-specific (React/DOM) code from
 * here — everything in this package must run in any modern JS runtime.
 */

export type {
  MitreTechnique,
  MitreTactic,
  Platform,
  Severity,
  KqlMapping,
  DataStore,
  AppState,
  AppAction,
  FilterState,
} from "./models/index.js";

export {
  TACTIC_ORDER,
  PLATFORMS,
  SEVERITY_COLORS,
  CONFIDENCE_COLORS,
  SEVERITY_ORDER,
  DEBOUNCE_MS,
} from "./constants/index.js";

export type {
  Scenario,
  KillChainStep,
  Detection,
  TechniqueRef,
  Correlation,
  ScenarioSource,
  MaturityLevel,
} from "./scenario/index.js";

export { buildDataStore } from "./utils/dataTransform.js";
export { loadDataStore } from "./utils/loadDataStore.js";
export type { LoadDataStoreUrls } from "./utils/loadDataStore.js";
export { buildContributionUrl, GITHUB_REPO_URL } from "./utils/github.js";

export { TECHNIQUE_ID_PATTERN, isTechniqueId } from "./validate/techniqueId.js";
export { validateKqlMapping } from "./validate/kqlMapping.js";
export type { KqlMappingValidationResult } from "./validate/kqlMapping.js";
