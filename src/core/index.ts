/**
 * Public API of the @/core module.
 *
 * Anything exported here is intended for consumption by the UI layer of this
 * project AND by external consumers (e.g. a downstream commercial repo that
 * depends on this core as a shared module). Do not export framework-specific
 * (React) code from here.
 */

export type {
  MitreTechnique,
  MitreTactic,
  Platform,
  KqlMapping,
  DataStore,
  AppState,
  AppAction,
  FilterState,
} from "./models";

export {
  TACTIC_ORDER,
  SEVERITY_COLORS,
  CONFIDENCE_COLORS,
  SEVERITY_ORDER,
  DEBOUNCE_MS,
} from "./constants";

export { buildDataStore } from "./utils/dataTransform";
export { loadDataStore } from "./utils/loadDataStore";
export type { LoadDataStoreUrls } from "./utils/loadDataStore";
export { buildContributionUrl, GITHUB_REPO_URL } from "./utils/github";
