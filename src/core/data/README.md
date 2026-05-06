# core/data

This directory is intentionally kept empty in the open-source variant.

The runtime data files (`mitre_techniques.json`, `kql_mappings.json`) live in
`public/data/` and are fetched at runtime — see `core/utils/loadDataStore.ts`
for the loader API. A consumer of `@/core` is expected to host these files
under any base URL and pass that URL to `loadDataStore(baseUrl)`.

In a downstream (e.g. commercial) consumer that wants to bundle data into
the JS payload instead of fetching, JSON modules can be placed here and
re-exported via `core/index.ts`.
