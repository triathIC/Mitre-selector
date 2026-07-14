# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
uses [Conventional Commits](https://www.conventionalcommits.org/) so the
sections below mirror the commit history.

## [Unreleased]

### Added

- **Scenario layer v1**: new landing route `/` shows a Scenario Library, with detail pages at `/scenario/:scenarioId` rendering kill chain + correlation + blind spots. Scenarios are static JSON in `src/data/scenarios/*.json`, auto-discovered via `import.meta.glob`, so adding a JSON file requires zero code changes. First scenario shipped: `scenario-trigona-3h.json` (DFIR Report — Trigona ransomware in 3 hours, 6 kill-chain steps, 17 ATT&CK techniques). New components in `src/components/scenario/`: `MaturityBadge` (4-segment honest-maturity indicator: theorized / static-reviewed / lab-tested / field-observed), `ScenarioCard`, `StepCard` (timeline rail, tactic chip, KQL detection block with FP/FN notes), `CorrelationBlock` (accent-bordered hero section: linking entity, time window, sequence flow, narrative, architect note). Detection KQL rendering looks up `detection.kqlId` against the existing `mappingsByTechnique` store and falls back to `detection.kqlDraft` joined with newlines.
- Canonical design tokens in `src/index.css` (`--bg`, `--text`, `--accent`, `--m-theorized/static/lab/field`, etc.) exposed as Tailwind utilities under the `scn-*` namespace via `tailwind.config.js`. Archivo registered as `font-display` (Google Fonts link in `index.html`) for scenario headings; existing matrix UI keeps DM Sans.
- Secondary navigation in `Header`: Scenarios / Matrix / KQL Library (the last links to `/matrix?hasKql=true`). Matrix stats line is now gated to matrix routes only via `useMatch`.
- New route `/matrix` (matrix landing page) alongside the existing `/technique/:id` (preserved unchanged so all 691 static SEO pages still generate). `MatrixPage` reads `?q=` and `?hasKql=true` URL params on mount and applies them to the filter state.
- Drag-to-scroll on the matrix via a new `useDragScroll` hook (`src/hooks/useDragScroll.ts`). Press-and-drag with the left mouse button anywhere in the matrix area scrolls horizontally; movement under a 5 px threshold is treated as a click so `TechniqueCell` clicks still open the detail panel. Clicks on interactive descendants (buttons, links, inputs) never start a drag. The cursor switches from `grab` to `grabbing` while dragging.

### Fixed

- Closing the technique detail panel (X button or Escape key) now navigates to `/matrix` instead of `/`. The previous target made sense when `/` was the matrix; after the Scenario Layer v1 commit `/` serves the Scenario Library, so closing the panel from `/technique/T1078` was dumping the user onto the Scenario page instead of back on the matrix. Two-line fix in `src/components/DetailPanel/DetailPanel.tsx` (`handleClose` and the Escape handler).
- Horizontal scrolling of the matrix is now driven by a **sticky scrollbar at the top of the matrix area** (directly under the FilterBar), so users don't have to look at the bottom edge to scroll right. A small synced `<div>` above the matrix renders the scrollbar; its width tracks the matrix's `scrollWidth` via `ResizeObserver`, and a guarded bidirectional `scrollLeft` sync keeps the top control and the actual matrix container in lockstep. The matrix container's native scrollbar is hidden via a new `.scrollbar-hide` utility in `src/index.css` so only the sticky one is visible.
- Matrix horizontal scrollbar is now always visible at the bottom of the matrix area, directly above the footer, instead of only appearing after scrolling the page down to the end of the tallest tactic column. Root cause was a missing height chain between `<main>` and the scroll container in `MatrixView`: the scroll container had no constrained height, so its width-scrollbar lived at the foot of the natural content height (= tallest column). Fix is three Tailwind class adjustments — `main` becomes `md:overflow-hidden` on desktop, the matrix wrapper gets `h-full md:flex md:flex-col`, and the scroll container gets `flex-1 min-h-0`. This also activates the per-column `overflow-y-auto` in `TacticColumn`, so long columns (Persistence, Discovery) scroll internally without affecting the others.

### Changed

- `.gitignore` now excludes the local Obsidian architecture notes `docs/ARCHITECTURE_HUB.md` and `docs/architecture.md` (alongside the already-ignored `docs/PROJECT-DOCUMENTATION.md`) — these are personal PKM files, not repo documentation.
- Dependency maintenance: ran `npm update` (in-range bumps) + `npm audit fix` (non-breaking), clearing 10 of 12 security advisories (flatted, form-data, picomatch, ws, @babel/core, brace-expansion, js-yaml, postcss, etc.). The 2 remaining (esbuild/vite dev-server request leak) require the Vite 8 major bump and are intentionally deferred to a dedicated PR. The `typescript-eslint` 8.56 → 8.62 bump tightened `no-unnecessary-type-assertion`, which flagged two now-redundant `as` assertions: removed `(mobileTactic || firstTactic) as MitreTactic | undefined` in `MatrixView.tsx` and `event.props as Record<…>` in `lib/analytics.ts` (both types are already inferred correctly by tsc). All major-version bumps (React 19, Tailwind 4, Vite 8, ESLint 10, TypeScript 6, react-router 7) remain deferred.
- `src/App.tsx` refactored from a matrix-only `Layout` into a thin `RootLayout` (`AppProvider` + Vercel `Analytics` + `SpeedInsights` + `GoogleAnalytics` + `ConsentBanner` + `Header` + `<Outlet />` + `Footer`). All matrix-specific shell (`FilterBar`, `MatrixView`, `DetailPanel`, URL→technique sync, `<Seo>`, top-techniques computation, the matrix-local `ErrorBoundary`) moved into a new `src/pages/MatrixPage.tsx`. The `Seo` home-variant canonical URL changed from `${SITE_URL}/` to `${SITE_URL}/matrix` (and the matching `SearchAction.urlTemplate`) since `/` now serves Scenarios; `/technique/:id` canonical is unchanged so existing SEO is preserved.
- `npm run lint` is now green from a clean checkout. ESLint ignores include `dist-node` (build artifact), and `tsconfig.node.json` now includes `scripts/**/*.ts` so the typescript-eslint parser project covers the maintenance scripts. `scripts/generate-mitre-data.ts` was refactored to satisfy strict rules: `PLATFORM_MAP` / `TACTIC_MAP` are `Map<string,string>` (no object-injection warnings) and the two non-null assertions on `getExternalId` / `phase_name` were replaced by explicit guards + a type-predicate filter. Output is byte-identical to before the refactor.

### Removed

- `.github/workflows/update-mitre-data.yml` — legacy weekly auto-sync workflow that opened a PR with the regenerated `mitre_techniques.json`. With v19 bundle pinning (manifest hash lock) and the new `mitre-drift-check.yml`, this workflow only produced no-op diffs and ran a third-party action (`peter-evans/create-pull-request@v6`) for no benefit.

## [0.3.0] – 2026-05-27

### Added

- MITRE ATT&CK v19 STIX bundle pinning: `data/mitre-manifest.json` (downloadUrl, SHA-256, expectedTacticCount, locked tactic shortnames), `scripts/update-mitre.sh` to fetch + validate + lock the bundle, `scripts/lock-mitre-manifest.ts` helper, and `scripts/check-mitre-bundle.ts` verification (asserts hash match, 15 active tactics, `stealth` + `defense-impairment` present, legacy `defense-evasion` removed). New npm scripts `update-mitre` and `test:bundle`. The raw bundle is gitignored — pinning is via the manifest hash.
- `check-mitre-bundle.ts` extended with KQL-mapping consistency assertions: rejects any mapping still tagged `defense-evasion`, requires every `technique_id` (and `additional_technique_ids`) to resolve to an active v19 attack-pattern, and verifies `data/kql_mappings.json` mirrors `public/data/kql_mappings.json`.
- `.github/workflows/mitre-drift-check.yml` (Mondays 06:00 UTC + `workflow_dispatch`): compares `data/mitre-manifest.json`'s `mitreAttackVersion` against the highest `ATT&CK-v*` tag in `mitre/cti`. On drift it opens a single GitHub issue labeled `mitre-drift` per upstream version (idempotent — won't re-open while the previous issue is still open), populated from `.github/templates/mitre-drift-issue.md` with a step-by-step migration checklist (manifest bump → `update-mitre.sh` → `test:bundle` → regenerate techniques → audit mappings).
- `docs/migrations/v18-to-v19/migration-proposal.md` and `migration-review-needed.md`: dry-run v19 migration plan for the 18 KQL mappings currently tagged `defense-evasion`. Each technique is matched against the v19 STIX bundle (including `revoked-by` successor chains: T1070.001 → T1685.005, T1562/T1562.001 → T1685) with a Stealth or Defense Impairment proposal and an explicit confidence rating. Four items flagged for architect decision (re-ID vs. retag, plus T1518.001 → Discovery and T1548.002 → Privilege Escalation).
- Home-page JSON-LD: `WebSite` schema with `SearchAction` (`?q=` URL template) plus an `ItemList` of the top 30 techniques ranked by KQL-mapping count, so AI-search crawlers see structured navigation on the index page.
- Per-technique `TechArticle` JSON-LD extended with `about` (MITRE technique as a `Thing` with `identifier` and `sameAs` linking to attack.mitre.org), `keywords` (derived from mapping tags + base terms), `isPartOf` (WebSite reference), and `inLanguage`.
- `?q=` URL parameter handler in `AppContent`: on mount, reads `window.location.search` and pre-populates the search filter, making the home-page `SearchAction` URL template functional.
- `public/robots.txt` AI-crawler allowlist: explicit `Allow: /` rules for GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, ClaudeBot, Claude-SearchBot, Claude-User, Google-Extended, and Applebot-Extended (in addition to the existing wildcard rule).

### Changed

- **MITRE ATT&CK v19 migration applied** (see `docs/migrations/v18-to-v19/migration-proposal.md`): the `Defense Evasion` tactic is replaced by `Stealth` + `Defense Impairment` in `MitreTactic`, `TACTIC_ORDER` (v19 matrix order: Privilege Escalation → Stealth → Defense Impairment → Credential Access) and `scripts/generate-mitre-data.ts` TACTIC_MAP. `mitre_techniques.json` regenerated from the pinned v19 bundle (697 active techniques, 15 tactics). 18 KQL mappings updated: T1070.001 → T1685.005 (re-ID), T1562.001 → T1685 (re-ID), and tag `defense-evasion` swapped for `stealth` / `defense-impairment` per the v19 placement of each technique. Mappings for T1518.001 (now Discovery) and T1548.002 (now Privilege Escalation) keep their existing primary tactic tag.
- Bumped the pinned MITRE ATT&CK STIX bundle from v19.0 to **v19.1** (manifest hash `fc78303…1c97d`). v19.1 is a content patch — same 15 tactics, same 697 active techniques, only a single description whitespace fix in T1006; no mapping audit required.
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
