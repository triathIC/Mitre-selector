# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
uses [Conventional Commits](https://www.conventionalcommits.org/) so the
sections below mirror the commit history.

## [Unreleased]

### Added

- MITRE ATT&CK v19 STIX bundle pinning: `data/mitre-manifest.json` (downloadUrl, SHA-256, expectedTacticCount, locked tactic shortnames), `scripts/update-mitre.sh` to fetch + validate + lock the bundle, `scripts/lock-mitre-manifest.ts` helper, and `scripts/check-mitre-bundle.ts` verification (asserts hash match, 15 active tactics, `stealth` + `defense-impairment` present, legacy `defense-evasion` removed). New npm scripts `update-mitre` and `test:bundle`. The raw bundle is gitignored — pinning is via the manifest hash.
- `check-mitre-bundle.ts` extended with KQL-mapping consistency assertions: rejects any mapping still tagged `defense-evasion`, requires every `technique_id` (and `additional_technique_ids`) to resolve to an active v19 attack-pattern, and verifies `data/kql_mappings.json` mirrors `public/data/kql_mappings.json`.
- `.github/workflows/mitre-drift-check.yml` (Mondays 06:00 UTC + `workflow_dispatch`): compares `data/mitre-manifest.json`'s `mitreAttackVersion` against the highest `ATT&CK-v*` tag in `mitre/cti`. On drift it opens a single GitHub issue labeled `mitre-drift` per upstream version (idempotent — won't re-open while the previous issue is still open), populated from `.github/templates/mitre-drift-issue.md` with a step-by-step migration checklist (manifest bump → `update-mitre.sh` → `test:bundle` → regenerate techniques → audit mappings).
- `migration-proposal.md` and `migration-review-needed.md`: dry-run v19 migration plan for the 18 KQL mappings currently tagged `defense-evasion`. Each technique is matched against the v19 STIX bundle (including `revoked-by` successor chains: T1070.001 → T1685.005, T1562/T1562.001 → T1685) with a Stealth or Defense Impairment proposal and an explicit confidence rating. Four items flagged for architect decision (re-ID vs. retag, plus T1518.001 → Discovery and T1548.002 → Privilege Escalation).
- Home-page JSON-LD: `WebSite` schema with `SearchAction` (`?q=` URL template) plus an `ItemList` of the top 30 techniques ranked by KQL-mapping count, so AI-search crawlers see structured navigation on the index page.
- Per-technique `TechArticle` JSON-LD extended with `about` (MITRE technique as a `Thing` with `identifier` and `sameAs` linking to attack.mitre.org), `keywords` (derived from mapping tags + base terms), `isPartOf` (WebSite reference), and `inLanguage`.
- `?q=` URL parameter handler in `AppContent`: on mount, reads `window.location.search` and pre-populates the search filter, making the home-page `SearchAction` URL template functional.
- `public/robots.txt` AI-crawler allowlist: explicit `Allow: /` rules for GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, ClaudeBot, Claude-SearchBot, Claude-User, Google-Extended, and Applebot-Extended (in addition to the existing wildcard rule).

### Changed

- **MITRE ATT&CK v19 migration applied** (see `migration-proposal.md`): the `Defense Evasion` tactic is replaced by `Stealth` + `Defense Impairment` in `MitreTactic`, `TACTIC_ORDER` (v19 matrix order: Privilege Escalation → Stealth → Defense Impairment → Credential Access) and `scripts/generate-mitre-data.ts` TACTIC_MAP. `mitre_techniques.json` regenerated from the pinned v19 bundle (697 active techniques, 15 tactics). 18 KQL mappings updated: T1070.001 → T1685.005 (re-ID), T1562.001 → T1685 (re-ID), and tag `defense-evasion` swapped for `stealth` / `defense-impairment` per the v19 placement of each technique. Mappings for T1518.001 (now Discovery) and T1548.002 (now Privilege Escalation) keep their existing primary tactic tag.
- `scripts/generate-mitre-data.ts` now reads the pinned `data/enterprise-attack.json` and only falls back to the manifest URL when the local bundle is missing — output is reproducible against the locked SHA-256 rather than the live `master` branch.
- README: document `data/` vs `public/data/` directory structure and correct primary file path for KQL contributions.
- CONTRIBUTING.md: correct KQL file path to `public/data/kql_mappings.json`, add CI mirror sync step, update `KqlMapping` interface link to `src/core/models/index.ts`.
- Extracted `Severity` as a named type in `src/core/models/index.ts`; `KqlMapping.severity` and `SEVERITY_COLORS` key now reference it — single source of truth for severity values.
- `SEVERITY_ORDER` typed as `Severity[]` (was `KqlMapping["severity"][]`); FilterBar derives its dropdown list from it instead of a duplicate hardcoded array.
- Exported `PLATFORMS` constant from `src/core/constants/index.ts`; FilterBar derives its dropdown list from it instead of a duplicate hardcoded array.

### Removed

- Deprecated `subtechnique_id?` field removed from `KqlMapping` interface — unused since `technique_id` accepts sub-technique format directly.

## [0.2.0] – 2026-05-08

### Added

- Static-site generation via `vite-react-ssg`: every MITRE technique URL
  (`/technique/<T-ID>`) is pre-rendered as its own crawlable HTML file.
  The build now produces 698 pages (1 home + 697 techniques).
- React Router v6 routing (`/` and `/technique/:id`) so the URL becomes
  the source of truth for the selected technique.
- Per-page SEO head: title, description (≤155 chars), canonical, Open
  Graph (`og:type=article` per technique, `website` on home), Twitter
  Card, and JSON-LD `TechArticle` schema with author "Matthias" and
  `dateModified` derived from the linked KQL mappings' `last_tested`.
- `dist/sitemap.xml` (698 URLs) generated by a postbuild script
  (`scripts/generate-sitemap.ts`); `lastmod` per technique reflects the
  latest `last_tested` across its mappings.
- `public/robots.txt` allowing all crawlers and pointing to the sitemap.
- `public/og-image.svg` (1200×630 branded) used as `og:image` on every
  page.
- `src/core/` module: pure types, constants, and utilities (no React
  dependency) extracted as a shareable foundation, with a barrel export
  in `src/core/index.ts`.
- `additional_technique_ids?: string[]` on `KqlMapping` — a single KQL
  query can now be linked to multiple ATT&CK techniques without
  duplicating the query string. The data loader registers the mapping
  under every linked technique.
- Vercel Analytics custom events: `technique_opened`, `kql_copied`,
  `external_link_clicked`, `search_performed` (the last debounced 1000
  ms and only sent when the query length is ≥3; only the length leaves
  the browser, never the query string).
- Type-safe analytics tracking wrapper at `src/lib/analytics.ts`
  (discriminated-union events, try/catch so analytics never breaks the
  app, tiny built-in `debounce` helper).
- Google Analytics 4 (`G-D3N42GZ6DK`) loaded client-side after
  hydration with **Consent Mode v2 default-denied** (no cookies, no
  hits until consent is granted). Production-only — `vite dev` does not
  ship the tag.
- GDPR/TTDSG consent banner (`src/components/ConsentBanner.tsx`) with
  visually equivalent Accept and Reject buttons. Decision persists in
  `localStorage` and is replayed on subsequent visits via
  `gtag('consent', 'update', ...)`.
- KQL detections:
  - `KQL-T1111-001` — AiTM token replay over Entra ID `SigninLogs`
    (Microsoft Sentinel; primary T1111, also tagged T1539).
  - `KQL-T1557.001-001` — NTLM relay / pass-the-hash via Defender for
    Endpoint `DeviceLogonEvents`, scoped to CVE-2026-32202 (Defender
    XDR; primary T1557.001, also tagged T1550.002).
  - `KQL-T1557.001-002` — AiTM token theft via phishing proxy with a
    15-minute window joining `SigninLogs` and
    `AADNonInteractiveUserSignInLogs` (Microsoft Sentinel; primary
    T1557.001, also tagged T1539).
  - `KQL-T1068-001` — Linux privilege escalation hunting for
    CVE-2026-31431 on Azure Linux VMs and AKS nodes via MDE for Linux
    `DeviceProcessEvents` (Defender XDR).
- `node` to the `tsconfig.json` `types` so the SSG `getStaticPaths`
  helper can read `public/data/mitre_techniques.json` via `node:fs` at
  build time.

### Changed

- Build script: `tsc -b && vite-react-ssg build && tsx scripts/generate-sitemap.ts`.
- `vite.config.ts` `base`: `"./"` → `"/"`. Relative asset paths broke
  once pages were nested under `/technique/<T-ID>/`; absolute paths fix
  that.
- `AppContext` initialises the `DataStore` synchronously by importing
  the JSON files at module scope, so SSR has data on first render and
  the app no longer flashes a "Loading…" state.
- `AppProvider` accepts `initialSelectedTechniqueId` so the SSR render
  and the first hydration paint match the URL parameter; a small
  URL→state `useEffect` keeps the reducer in sync on client navigation.
- `MatrixView`, `DetailPanel` close, `DetailPanel` Escape, and the
  sub-technique drilldown links navigate via `useNavigate` instead of
  calling `selectTechnique` directly.
- `MatrixView` is wrapped in `<ClientOnly>` — purely navigational, not
  SEO-relevant. Rendering it server-side inflated each HTML to ~252 KiB
  and `dist/` to 179 MiB; with `ClientOnly` each page is ~7–13 KiB and
  `dist/` is ~11 MiB. The DetailPanel (the actual SEO content) still
  renders SSR-side.
- `index.html` no longer carries `<title>` or `<meta charset>` — both
  now come from the `Seo` component so they are set correctly per page
  and `charset` lands inside the first 1024 bytes of `<head>`.
- Updated `mitre_techniques.json` from STIX (PR #6, automated weekly
  refresh — picked up during the SSG migration).

### Fixed

- Lighthouse Best Practices regressions on `/technique/<T-ID>` pages:
  `charset` declaration order and 404s on relative `/technique/assets/…`
  asset URLs. Lighthouse now reports SEO 100 / Best Practices 96 on a
  technique page (the residual entries are
  `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js`,
  which 404 only on local preview and resolve to 200 once deployed).

### Removed

- `src/hooks/useDataLoader.ts` (the runtime fetch path is replaced by
  module-scope JSON imports; `loadDataStore` stays exported from
  `@/core` for downstream consumers that prefer the fetch API).
- `src/components/DetailPanel/constants.ts` (the `SEVERITY_ORDER`
  constant moved into `src/core/constants/`).
- `react-helmet-async` dependency — replaced by `vite-react-ssg`'s
  `<Head>`, which integrates with the SSG renderer natively.
- Duplicate `<Analytics />` mount in `src/main.tsx` (the App.tsx mount
  inside `<AppProvider>` is the canonical one).

### Notes for upcoming releases

- Render the static OG asset as a real PNG (no image conversion tool was
  available locally; SVG is accepted by Twitter/LinkedIn/Slack but
  Facebook falls back to the no-image link card).
- npm audit currently lists 6 transitive vulnerabilities (Vite/ESLint
  dependency tree). `npm audit fix --force` would bump Vite to v8 — a
  breaking change deferred to a dedicated PR.
- Consent banner ships with two equally weighted choices but no
  "settings" view. Granular per-purpose toggles can be added without
  reshipping the gtag wiring.

[Unreleased]: https://github.com/triathIC/Mitre-selector/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/triathIC/Mitre-selector/releases/tag/v0.2.0
