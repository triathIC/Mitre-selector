# @triathic/mke-core

Framework-agnostic core of the [MITRE KQL Explorer](https://mitre.triath.xyz): MITRE ATT&CK v19 types and tactic surface, KQL-mapping schema types and validators, scenario-layer types, and pure data transforms. No React, no DOM APIs beyond global `fetch` — runs in browsers, Node ≥ 18 and edge runtimes.

## Install

Published to GitHub Packages under the `@triathic` scope. Point your `.npmrc` at the registry (a GitHub token with `read:packages` is required for install):

```
@triathic:registry=https://npm.pkg.github.com
```

```sh
npm install @triathic/mke-core
```

## API

```ts
import {
  // ATT&CK v19 surface
  TACTIC_ORDER, PLATFORMS, SEVERITY_ORDER, SEVERITY_COLORS, CONFIDENCE_COLORS, DEBOUNCE_MS,
  // data store
  buildDataStore, loadDataStore,
  // validators
  TECHNIQUE_ID_PATTERN, isTechniqueId, validateKqlMapping,
  // contribution helper
  buildContributionUrl, GITHUB_REPO_URL,
} from "@triathic/mke-core";

import type {
  MitreTechnique, MitreTactic, Platform, Severity, KqlMapping, DataStore,
  AppState, AppAction, FilterState,
  Scenario, KillChainStep, Detection, TechniqueRef, Correlation, ScenarioSource, MaturityLevel,
  LoadDataStoreUrls, KqlMappingValidationResult,
} from "@triathic/mke-core";
```

- **`buildDataStore(techniques, mappings)`** — builds the in-memory `DataStore` (technique map, mappings-by-technique, tactic order, sub-technique index) from raw JSON arrays.
- **`loadDataStore({ techniquesUrl, mappingsUrl })`** — fetches both JSON files from the given URLs and builds the `DataStore`. Works in any runtime with global `fetch`.
- **`isTechniqueId(id)` / `TECHNIQUE_ID_PATTERN`** — `T####` / `T####.###` format validation.
- **`validateKqlMapping(candidate)`** — validates an unknown object against the `KqlMapping` schema (required fields, enums, ID formats); returns `{ valid, errors }` with all problems collected.

## Data files

This package intentionally ships **no data**. The runtime data files (`mitre_techniques.json`, `kql_mappings.json`) live in the explorer app (`public/data/`) and are served from its domain. Consumers either fetch them via `loadDataStore` from any base URL that hosts the two files, or bundle their own copies and call `buildDataStore` directly.

## License

MIT — see [LICENSE](./LICENSE), same license as the explorer repo.
