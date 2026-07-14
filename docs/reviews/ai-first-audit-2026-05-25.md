# AI-First Architecture Audit: MITRE KQL Explorer

- **Date:** 2026-05-25
- **Reviewer:** Claude Code (Opus 4.7), Senior Security Tooling Architect mandate
- **Scope:** AI-Discoverability, Maschinen-API, AI-Augmented UX
- **Stand der Inspektion:** Repo-Snapshot auf `main` @ `af0b3e1`, lokales `dist/` aus dem letzten `npm run build`

---

## 1. Executive Summary

- **AI-First-Reifegrad: 5 / 10** — solide SEO-Basis und vollständig pre-rendered Technique-Pages, aber Homepage-Matrix ist `<ClientOnly>`, es gibt keine dokumentierte API, kein `llms.txt`, keinen MCP-Server und keinerlei semantische Suche.
- **Top-3-Gaps (ROI-priorisiert):**
  1. **Homepage-Crawl-Loch:** `<main>` ist im SSG-Output leer (App.tsx:125-127) — Crawler sehen weder die 697 Techniken noch die 93 Mappings, sondern nur Filter-UI und 30 ItemList-Items.
  2. **Maschinen-API ist versteckt:** `/data/kql_mappings.json` wird unter dem Domain-Root ausgeliefert, aber nirgendwo dokumentiert oder versioniert. `llms.txt` fehlt, OpenAPI fehlt.
  3. **Kein MCP-Server:** Der einzige Hebel, der das Tool von "wird hoffentlich von Crawlern gefunden" zu "wird aktiv von Claude/ChatGPT genutzt" hebt, fehlt komplett.
- **Empfehlung Gesamt: Inkrementeller Umbau in drei Wellen**, kein Pivot. Der Stack (Vite + vite-react-ssg) liefert SSR bereits korrekt. Next.js-Migration ist nicht begründbar.

---

## 2. Status Quo (Fakten aus dem Repo)

### Stack & Build
- React 18.3.1 + TypeScript 5.6 + Vite 5.4 + TailwindCSS 3.4 (`package.json:14-39`).
- **SSG aktiv:** `vite-react-ssg` rendert Routes als statisches HTML (`package.json:19`, `src/routes.tsx:1-29`).
- **Build-Pipeline:** `tsc -b && vite-react-ssg build && tsx scripts/generate-sitemap.ts` (`package.json:8`).
- **Routing:** zwei Routen — `/` (index) und `/technique/:id` mit `getStaticPaths` über alle Techniken aus `public/data/mitre_techniques.json` (`src/routes.tsx:13-25`).

### Datenmodell & Daten-Layer
- **Mappings:** 93 KQL-Mappings (151 KB) in `public/data/kql_mappings.json`. **Achtung CLAUDE.md sagt 81 — Stand ist veraltet, real sind es 93.** Manuell kuratiert.
- **Techniken:** 697 (541 KB) in `public/data/mitre_techniques.json`, auto-generiert (`scripts/generate-mitre-data.ts`).
- **Build-Inlining:** `src/context/AppContext.tsx:16-22` importiert beide JSONs `import …Raw from "../../public/data/…"` direkt — die Daten landen statisch im JS-Bundle. Kein Runtime-Fetch.
- **Build-Output `/dist/data/`:** beide JSONs werden zusätzlich als statische Dateien unter dem Domain-Root ausgeliefert (`https://mitre.triath.xyz/data/kql_mappings.json` → 200). De-facto Bulk-API, aber undokumentiert.
- **State:** `useReducer` in `src/context/AppContext.tsx`, kein Runtime-Loading mehr (initial state ist der statisch gebaute `STATIC_DATA_STORE`, `AppContext.tsx:19-22`). `loadDataStore.ts`/`fetch` ist toter Code — gut für SSR, aber zu vermerken.

### Pre-rendered HTML — Crawler-View
Geprüft anhand des lokalen `dist/`-Outputs:

- **`dist/index.html` (10.959 Bytes):**
  - Vollständige `<head>` mit Title, Description, OG/Twitter, **zwei** JSON-LD-Scripts (`WebSite` mit `SearchAction`, `ItemList` mit Top-30 Techniken).
  - Header zeigt `697 techniques · 93 KQL queries · 69 with detections` als statischer Text.
  - **Matrix-`<main>` ist leer** im SSG-Output. Ursache: `App.tsx:125-127` wrappt `<MatrixView>` in `<ClientOnly>`. Crawler ohne JS sehen Filter-Bar + leeren Hauptbereich.
- **`dist/technique/<ID>.html` (697 Dateien, je ~20 KB):**
  - Vollständig pre-rendered inkl. KQL-Queries als `<pre><code>` im Body.
  - JSON-LD `TechArticle` mit `keywords`, `datePublished`, `dateModified`, `about.identifier`, `sameAs` auf MITRE (`Seo.tsx:136-156`).
  - Sub-Techniken-IDs (`T1078.004` etc.) sind in Pfaden enthalten — Deep-Link pro Sub-Technique.
  - **Aber:** KQL-Source ist mit Highlighter-`<span>`-Tags durchsetzt. Lesbar, aber nicht clean konsumierbar — ein LLM muss reverse-extracten.

### AI-Discoverability-Files
- **`robots.txt`** (`public/robots.txt:1-39`): explizit erlaubt GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, ClaudeBot, Claude-SearchBot, Claude-User, Google-Extended, Applebot-Extended. **Vollständig.** Verweis auf Sitemap am Ende.
- **`sitemap.xml`** (`scripts/generate-sitemap.ts`): 698 URLs (Home + 697 Techniken), `lastmod` aus jeweils jüngstem `last_tested` der gemappten KQL-Einträge.
- **`llms.txt`: fehlt komplett.** Weder im `public/` noch im Build.
- **JSON-LD:** vorhanden für Home (`WebSite`, `ItemList[30]`) und pro Technique-Page (`TechArticle`). Schema-Wahl `TechArticle` ist defensibel — `Dataset` oder `SoftwareSourceCode` wären für die KQL-Mappings selbst präziser, sind aber nicht eingesetzt.
- **OG/Twitter:** pro Technique individuell, mit statischem `og-image.svg` für alle. Kein Per-Mapping-OG-Image.
- **Canonical:** korrekt gesetzt (`Seo.tsx:108`, `:162`).

### API & Bulk-Export
- **Kein `/api/*`-Verzeichnis** im Repo, keine Vercel Functions, keine Edge-Routes. Bestätigt via `find`.
- **`/data/kql_mappings.json` und `/data/mitre_techniques.json` werden ausgeliefert** (Vercel serviert `dist/data/` statisch). Aber: nicht in `llms.txt` oder Footer beworben, kein CORS-Hinweis dokumentiert, kein API-Vertrag (Schema kann sich ändern).
- **Kein NDJSON, kein JSON-Feed, keine OpenAPI-Spec.**
- **Kein MCP-Server.**

### Search-Implementation
- **Client-side only** (`src/hooks/useFilteredData.ts:31-46`): plain Substring-Match auf `name`, `id`, `title`, `description` per `toLowerCase().includes()`. Keine Fuzzy-Suche, kein Index, kein Embedding.
- `?q=`-URL-Parameter wird in `App.tsx:73-78` ausgelesen und in den Filter-State gefüttert — funktioniert, aber nur clientseitig nach Hydration.

### CI / Daten-Pipeline
- `.github/workflows/update-mitre-data.yml` (existiert; nicht gelesen, Annahme: holt STIX wöchentlich).
- `.github/workflows/security.yml` (existiert; nicht gelesen).
- `data/` ist Duplikat von `public/data/` für CI-Diff-Check (laut CLAUDE.md).

---

## 3. Gap-Analyse (Scorecard)

Bewertung: `Vollständig` / `Teilweise` / `Fehlt` / `Aktiv kontraproduktiv`.

| Dimension                       | Indikator                                                          | Status                 | Code-Referenz |
|---------------------------------|--------------------------------------------------------------------|------------------------|---------------|
| **AI-Discoverability**          |                                                                    |                        |               |
| llms.txt                        | Existiert, beschreibt Tool präzise, listet Mapping-Endpoints       | **Fehlt**              | — (kein File in `public/`) |
| Server-Side Rendering — Technik | KQL-Content im initialen HTML, nicht JS-only                       | **Vollständig**        | `dist/technique/T1078.004.html` (verified) |
| Server-Side Rendering — Home    | Matrix-Inhalt im initialen HTML                                    | **Aktiv kontraproduktiv** | `src/App.tsx:125-127` wrappt `MatrixView` in `<ClientOnly>` |
| JSON-LD / schema.org            | Structured Data per Mapping (Dataset / SoftwareSourceCode)         | **Teilweise**          | `src/components/Seo.tsx:136-156` — `TechArticle` pro Technique. KQL-Mappings selbst haben kein eigenes JSON-LD. |
| Semantische HTML-Struktur       | h1-h3 Hierarchie, semantische Tags, deep links pro Technik         | **Teilweise**          | `h1` für Site-Titel, `h4` für KQL-Titel, kein `<h1>`/`<h2>` pro Technique-Detail. Hierarchie springt. |
| sitemap.xml                     | Eine URL pro Mapping, automatisch generiert                        | **Teilweise**          | `scripts/generate-sitemap.ts` — eine URL pro **Technique** (698), nicht pro Mapping (93). Keine `mapping_id`-Granularität. |
| OG / Twitter Cards              | Pro Mapping individuelle Preview-Daten                             | **Teilweise**          | `Seo.tsx:163-172` — pro Technique individuell, aber statisches `og-image.svg` für alle. |
| robots.txt — AI-Bots            | GPTBot/ClaudeBot/etc. explizit erlaubt                             | **Vollständig**        | `public/robots.txt:5-30` |
| **Maschinen-API**               |                                                                    |                        |               |
| REST-Endpoint                   | `GET /api/mappings`, `GET /api/mappings/T1078` etc.                | **Fehlt**              | Kein `/api/`, keine Vercel Functions. |
| Bulk-Export (JSON)              | Komplettes Dataset abrufbar                                        | **Teilweise**          | `dist/data/kql_mappings.json` ist erreichbar, aber undokumentiert und ohne Vertrag. |
| Bulk-Export (NDJSON / JSON-Feed)| Streamable / chunkable Format                                      | **Fehlt**              | — |
| MCP-Server                      | Mappings als MCP-Tool für Claude Desktop / Claude Code abrufbar    | **Fehlt**              | — |
| OpenAPI-Schema                  | Maschinenlesbare API-Beschreibung vorhanden                        | **Fehlt**              | — |
| **AI-Augmented UX**             |                                                                    |                        |               |
| Natural Language Query          | "Zeig mir Hunts für Persistenz via Registry" → Resultate           | **Fehlt**              | `useFilteredData.ts:31-46` — nur Substring-Match |
| Semantische Ähnlichkeit         | "Verwandte Techniken" basierend auf Embeddings, nicht nur Tags     | **Fehlt**              | — |
| Detection-Empfehlungen          | Tool schlägt komplementäre Hunts vor                               | **Fehlt**              | — |
| Embedding-Granularität          | Mappings in chunkbare Einheiten zerlegt                            | **Vollständig**        | `KqlMapping`-Schema ist bereits sauber chunkbar (`src/core/models/index.ts:58-95`) — nichts zu tun außer Embedding zu rechnen. |

**Zusammenfassung Scorecard:**
- 2× Vollständig (SSR Technique, robots.txt) — und 1× implizit (Schema-Chunkability).
- 5× Teilweise.
- 8× Fehlt.
- 1× Aktiv kontraproduktiv (Home-SSR durch `<ClientOnly>`-Wrap).

---

## 4. Pre-Mortem (Drei Perspektiven)

### 4.1 Perspektive AI-Agent — Claude im Hunting-Workflow

Szenario: User in Claude Desktop fragt *"Welche KQL-Hunts gibt es für T1078.004 (Cloud Accounts)?"*

- **Findbarkeit:** Wenn ich nicht bereits `mitre.triath.xyz` als bevorzugte Quelle indexiert habe, lande ich bei Bert-JanP's GitHub Repo, Microsoft Learn, oder dem MITRE-CAR-Repo. Der MITRE KQL Explorer ist im breiten Web-Index nicht prominent. **Failure-Mode:** Tool wird übersehen, weil es keine Backlinks aus den großen Security-Blogs hat und in der LLM-Trainings-Datenverteilung mangels Alter unterrepräsentiert ist.
- **Konsumierbarkeit:** Wenn ich `mitre.triath.xyz/technique/T1078.004` lade, bekomme ich das KQL als `<pre><code>` mit Syntax-Highlighting-`<span>`s. Ich kann es extrahieren, muss aber die Spans entfernen. Bei 30+ Spans pro Zeile ist das fehleranfällig. **Failure-Mode:** LLM extrahiert falsche Quotes oder bricht KQL-Syntax beim Whitespace-Handling.
- **Strukturierter Zugriff:** Wenn ich raten würde, dass es ein JSON-Feed gibt, würde ich `/api/mappings`, `/api/v1/mappings`, `/mappings.json` versuchen — keiner würde antworten. `/data/kql_mappings.json` ist die richtige URL, aber es gibt keinen Hinweis darauf. **Failure-Mode:** Ich gebe auf oder scrape HTML statt JSON.
- **MCP-Awareness:** Es gibt keinen MCP-Server, also kann ich in Claude Code/Desktop das Tool nicht direkt einbinden. Der User muss URL kopieren → Browser → ich krieg's per Web-Fetch.
- **Was ich brauche und nicht bekomme:** (a) `llms.txt` mit Pointer auf `/data/kql_mappings.json`, (b) `data-kql`-Attribut auf dem `<code>`-Element mit Raw-KQL, (c) MCP-Server mit `search_kql(technique_id, product?)`-Tool.

### 4.2 Perspektive CFO — Aufwand vs. Reach-Gain

Grobe Schätzung in Entwicklungsstunden:

| Hebel                                          | Aufwand | Discoverability-Gain | ROI |
|------------------------------------------------|---------|----------------------|-----|
| `llms.txt` + Pointer auf `/data/*.json`        | 0,5 h   | Hoch                 | ★★★★★ |
| Home-Matrix in SSG-Output rendern              | 2-4 h   | Hoch                 | ★★★★★ |
| Raw-KQL in `data-kql`-Attribut + `data-mapping-id` auf `<article>` | 1-2 h | Hoch                 | ★★★★★ |
| Sitemap-Granularität auf Mapping-Ebene         | 1 h     | Mittel               | ★★★★  |
| JSON-LD `Dataset` zusätzlich zu `TechArticle`  | 2 h     | Mittel               | ★★★   |
| OpenAPI für `/data/*.json` + JSON-Schema       | 4-6 h   | Mittel               | ★★★   |
| MCP-Server (Stdio + remote-Variante)           | 12-20 h | Sehr hoch            | ★★★★  |
| NL-Query via Embedding-Search (lokales Modell) | 16-24 h | Mittel-hoch          | ★★    |
| Embedding-basierte "Verwandte Techniken"       | 8-12 h  | Mittel               | ★★    |

**Wo droht Over-Engineering:** NL-Query und Embedding-Search ohne Paid-API klingen sexy, sind aber ohne Server (Edge-Function mit WASM-Embedding-Modell wie `transformers.js`) entweder zu langsam (Cold-Start) oder muss lokales Modell zur Build-Zeit laufen. Erfahrungswert: das ist 16-24h Arbeit für einen Feature-Boost, der bei 93 Mappings auch durch besseres Tagging und JSON-LD erreicht werden könnte. **Zurückstellen bis Mapping-Count > 300**.

**Kostenlose Hebel (reine Config/Static):** `llms.txt`, Home-Matrix SSR-Fix, Raw-KQL-Attribut, Sitemap-Granularität. Das sind die ersten 24-48h.

### 4.3 Perspektive DACH-Practitioner — UX-Erhalt

- **Aktuelle Stärken, die explizit erhalten bleiben müssen:**
  - Schnelle, dichte Matrix-View (Tactics × Techniques), kein Klick-Heavy.
  - Sub-Techniken sind unter Parent gruppiert, keine Liste-aus-der-Hölle.
  - Detail-Panel öffnet seitlich, Matrix bleibt sichtbar → Kontext bleibt erhalten.
  - Copy-to-Clipboard für KQL ist ein Klick weg.
- **Wo AI-Features stören könnten:**
  - Eine NL-Query-Box mit LLM-Roundtrip (auch lokal) fügt Latenz hinzu. Der Practitioner will *jetzt* T1078.004 sehen, nicht 2s auf Embedding-Vektor warten. → **Konsequenz: AI-Suche nur als Opt-in neben Substring-Filter, nicht als Default-Replacement.**
  - "Verwandte Techniken"-Panel kann hilfreich sein, kann aber bei schwacher Embedding-Qualität (93 Mappings reichen kaum) irrelevante Treffer liefern und Vertrauen kosten.
- **Verlust durch AI-First-Umbau:** Keiner, sofern (a) der Substring-Filter erhalten bleibt, (b) die Matrix-Performance nicht durch JSON-LD-Bloat oder embedded Embeddings beeinträchtigt wird, (c) keine Chatty-UI-Patterns (Begrüßungstexte, Skeleton-Loaders) eingeführt werden.

---

## 5. Top 5 Hebel (priorisiert)

### Hebel 1 — `llms.txt` + Pointer auf JSON-Feeds
- **Was:** `public/llms.txt` mit Tool-Beschreibung, Endpoints, Lizenzhinweis. Sekundär: `public/llms-full.txt` mit allen Mappings inline.
- **Warum:** Schließt den größten Discoverability-Gap. LLMs mit Web-Browsing finden über `llms.txt` direkt den strukturierten Zugriff statt HTML zu scrapen.
- **Wie:** Pure Static. Skizze:
  ```
  # MITRE ATT&CK KQL Explorer
  > Curated KQL queries for Microsoft Sentinel and Defender XDR,
  > mapped to MITRE ATT&CK techniques.

  ## Data
  - [All KQL mappings (JSON)](https://mitre.triath.xyz/data/kql_mappings.json)
  - [All MITRE techniques (JSON)](https://mitre.triath.xyz/data/mitre_techniques.json)
  - [Sitemap](https://mitre.triath.xyz/sitemap.xml)

  ## Schema
  See KqlMapping interface in repository:
  https://github.com/triathIC/Mitre-selector/blob/main/src/core/models/index.ts

  ## License
  Mappings: CC-BY 4.0. Code: MIT.
  ```
- **Aufwand:** S (< 1 h).
- **Risiko:** Kein technisches. Achtung: Wenn `llms-full.txt` über 1 MB wächst, Crawler-Truncation prüfen.
- **Messbarkeit:** Vercel Analytics nach 30 Tagen — Anteil "AI-Bot"-Sessions auf `/data/*.json`-Pfaden. Erwartung: vorher ~0, nachher messbar > 0.

### Hebel 2 — Homepage-Matrix in SSG-Output rendern
- **Was:** `<ClientOnly>`-Wrap um `MatrixView` entfernen oder durch SSR-fähige Variante ersetzen.
- **Warum:** Aktuell verliert der Crawler auf der Homepage die komplette Tactic×Technique-Matrix — der einzige Punkt, an dem die Breite des Tools sichtbar wäre. Dieser Gap ist `Aktiv kontraproduktiv` in der Scorecard.
- **Wie:** Prüfen, warum `<ClientOnly>` ursprünglich gesetzt wurde (vermutlich `useMatrixTilt` oder `useReducer`-Reset). Falls Browser-only-API: hinter `typeof window !== "undefined"`-Guard ziehen statt ganzen Subtree zu skippen. Falls Hydration-Mismatch: deterministisches Initial-Rendering sicherstellen.
- **Aufwand:** M (2-4 h) — Risiko Hydration-Mismatch bei Filter-State.
- **Risiko:** Hydration-Warnings können einbrechen; Performance-Regression durch initiales Riesen-DOM.
- **Messbarkeit:** `curl https://mitre.triath.xyz/ | grep -c "T1[0-9]"` — vorher 30 (ItemList), nachher > 500. Sekundär: Google Search Console "indexed pages" für Home.

### Hebel 3 — Raw-KQL als Data-Attribut + Mapping-ID an `<article>`
- **Was:** In `DetailPanel`/`KqlCard` jedes `<article>`-Element mit `data-mapping-id="KQL-T1078.004-001"` und `data-kql={raw}` (oder `<script type="application/vnd.kql">`) versehen.
- **Warum:** Crawler/LLMs können dann sauber Raw-KQL extrahieren statt Highlighter-Spans zu parsen. Ohne Layout-Veränderung für den menschlichen User.
- **Wie:**
  ```tsx
  <article data-mapping-id={m.mapping_id} data-technique-id={m.technique_id}>
    <script type="application/json" data-role="kql-mapping">
      {JSON.stringify({ id: m.mapping_id, kql: m.kql, ... })}
    </script>
    {/* existing UI */}
  </article>
  ```
  Mit `<script type="application/json">` ist das Markup semantisch und ohne UI-Impact.
- **Aufwand:** S (1-2 h).
- **Risiko:** Bundle-Größe wächst (KQL wird zweimal im HTML — als Highlight + als JSON). Bei 93 Mappings vernachlässigbar; ab ~500 Mappings prüfen.
- **Messbarkeit:** Test-Script: `extract_kql("https://mitre.triath.xyz/technique/T1078.004")` liefert syntaktisch valides KQL → CI-Smoke-Test einrichten.

### Hebel 4 — MCP-Server `mitre-kql-mcp`
- **Was:** Stdio-MCP-Server (Node oder TypeScript), der zwei Tools exponiert: `list_techniques_with_kql(filter?)` und `get_kql_for_technique(technique_id, product?, query_type?)`. Quelle: `dist/data/kql_mappings.json` zur Build-Zeit ins Package gebündelt.
- **Warum:** Hebt das Tool aus "Web-Property" in "agent-konsumierbares Werkzeug". Claude Code / Claude Desktop User installieren `npx mitre-kql-mcp` und Claude bekommt direkten strukturierten Zugriff — ohne HTML-Scraping, ohne Halluzination.
- **Wie:** Skizze als separates Repo / Workspace-Package:
  ```ts
  import { Server } from "@modelcontextprotocol/sdk/server/index.js";
  import mappings from "./kql_mappings.json" with { type: "json" };

  const server = new Server({ name: "mitre-kql-mcp", version: "0.1.0" }, { capabilities: { tools: {} } });
  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: [
      { name: "get_kql_for_technique", description: "...", inputSchema: { /* zod */ } },
      { name: "list_techniques_with_kql", description: "...", inputSchema: { /* zod */ } },
    ],
  }));
  server.setRequestHandler(CallToolRequestSchema, async (req) => { /* filter mappings */ });
  ```
  Versionierung an die Schema-Version (`KqlMapping.version`) koppeln. Veröffentlichung als npm-Package `mitre-kql-mcp`.
- **Aufwand:** L (12-20 h) — inkl. Tests, Versionierung, Docs, ggf. Auto-Update-Mechanismus.
- **Risiko:** Maintenance-Last (Schema-Drift zwischen Web-JSON und npm-Package). Lösung: build-time Snapshot, Daily-CI-Republish.
- **Messbarkeit:** npm-Downloads, GitHub-Stars auf MCP-Repo, MCP-Marketplace-Listung (Anthropic, Smithery).

### Hebel 5 — Sitemap-Granularität auf Mapping-Ebene
- **Was:** Pro Mapping eine eigene URL `mitre.triath.xyz/technique/<id>#<mapping_id>` in `sitemap.xml`, plus Fragment-Anchor im `DetailPanel` (`id={m.mapping_id}` auf `<article>`).
- **Warum:** Sitemap-URLs sind das stärkste Signal an Crawler. Aktuell signalisieren wir 698 Pages — wir haben aber 93 atomare Detection-Units, die jeweils zitierbar sein sollten.
- **Wie:** `scripts/generate-sitemap.ts` erweitern, pro Mapping ein `<url>` mit `loc` inkl. Anchor und korrektem `lastmod` aus `last_tested`. Im UI sicherstellen, dass beim Aufruf mit `#KQL-T...-NNN` die richtige Card gescrollt und geöffnet wird.
- **Aufwand:** S-M (2-3 h).
- **Risiko:** Suchmaschinen ignorieren manchmal Fragment-URLs. Backup-Plan: dedizierte Routes `/mapping/<mapping_id>` mit Server-Redirect/Render. Aufwand dann höher.
- **Messbarkeit:** Search Console "Coverage" — indexierte URLs steigen von 698 auf ~790 (697 + 93).

---

## 6. Roadmap-Vorschlag (3 Wellen)

### Welle 1 — Quick Wins (24-72 h, reine Config/Static)
- Hebel 1: `llms.txt` + Verweis im Footer.
- Hebel 2: Home-Matrix SSR-Fix (`<ClientOnly>` entfernen oder umbauen).
- Hebel 3: Raw-KQL als `<script type="application/json">` pro `<article>`.
- Hebel 5: Sitemap-Granularität auf Mapping-Ebene.
- Bonus: `og-image` pro Technique dynamisch (statisches Template, Build-Zeit per `satori` o.ä.).

**Erwarteter Outcome:** AI-First-Reifegrad von 5 → 7. Messbar an indexierten Pages und LLM-Zitierbarkeit.

### Welle 2 — Mittlere Tiefe (1-2 Wochen)
- JSON-LD `Dataset` zusätzlich zu `TechArticle` (per Mapping + Sammlung).
- OpenAPI-Schema für die bestehenden JSON-Feeds + JSON-Schema-File aus dem TypeScript-Type generiert (`ts-json-schema-generator`).
- Versionierte JSON-Feeds: `/data/v1/kql_mappings.json` mit `Cache-Control`-Header, alte Pfade als Redirect.
- "Verwandte Techniken"-Panel auf Basis von Tag-Overlap (kein Embedding nötig für v1).

**Erwarteter Outcome:** AI-First-Reifegrad 7 → 8. Tool wird API-konsumierbar.

### Welle 3 — Strategisch (> 1 Monat)
- MCP-Server `mitre-kql-mcp` (Hebel 4). Initial Stdio, später optional remote via Edge Function.
- Optional: Embedding-Layer mit lokalem WASM-Modell (z. B. `Xenova/all-MiniLM-L6-v2` via `transformers.js`) zur Build-Zeit; persistierte Vektoren als statisches Asset. NL-Query als Opt-in im UI.
- Optional: GitHub-Actions-Workflow, der wöchentlich einen "delta digest" als `llms-changelog.txt` erzeugt — LLMs mit Web-Access sehen Änderungen.

**Erwarteter Outcome:** AI-First-Reifegrad 8 → 9. Tool ist Standard-Werkzeug in Hunting-Agents-Workflows.

---

## 7. Bewusst NICHT geändert

1. **Stack bleibt React + Vite + vite-react-ssg.** Next.js bringt RSC und Edge-Renderng, löst aber kein offenes Problem — SSR ist bereits da, Routes sind statisch, ISR wird nicht gebraucht. Migration wäre Kosten ohne Outcome.
2. **Open-Core-Prinzip bleibt unangetastet.** Alle Mappings bleiben in `public/data/kql_mappings.json`, MIT/CC-BY-Lizenz. Keine Auth-Wall, kein "Premium-Mapping-Tier".
3. **Substring-Filter bleibt der Default-Suchmechanismus.** AI-Suche wird, wenn überhaupt, additiv eingeführt. Practitioner-Workflow (Type → Enter → Result < 200 ms) darf nicht degradieren.
4. **Tailwind-only-CSS-Regel bleibt.** Keine UI-Framework-Migration, kein Chakra/Radix-Wechsel "für AI-Features".
5. **`mitre_techniques.json` bleibt auto-generiert.** Manuelle Edits an Technique-Metadaten würden bei der nächsten STIX-Synchronisation überschrieben werden — das ist konsistent zu CLAUDE.md.

---

## 8. Offene Fragen / Verify-Items

1. **Werden die Vercel-Headers für `/data/*.json` schon korrekt gesetzt?** Verify: `curl -I https://mitre.triath.xyz/data/kql_mappings.json` — `Content-Type: application/json`, `Cache-Control`, `Access-Control-Allow-Origin: *`. Falls CORS fehlt, ist die "de-facto-API" für Browser-Clients aus anderen Domains nicht nutzbar.
2. **Warum genau ist `MatrixView` in `<ClientOnly>` gewrappt?** Verify im Git-Log: `git log -S "ClientOnly" -- src/App.tsx`. Falls als Workaround für Hydration-Mismatch beim `useMatrixTilt`-Hook → der Hebel 2 hat versteckte Komplexität.
3. **Bert-JanP, Bert-JanP (adapted), triathematician — wie ist der Author-Attribution-Stand bei Welle 1?** Wenn Hebel 3 Raw-KQL exponiert, wird `author` exposeter. Verify, ob alle 93 Mappings korrekt attribuiert sind, bevor sie "agentenfreundlich" werden.
4. **Brauchen wir ein `noindex` für `?q=`-URLs?** Aktuell wird `?q=Lateral` über `App.tsx:73-78` als Filter angewendet. Wenn ein Crawler arbiträre `?q=…`-Varianten indexiert, entstehen Duplicate-Content-Probleme. Verify mit Search-Console.
5. **CLAUDE.md sagt "81 KQL entries" — real sind es 93.** Verify und korrigieren, sonst weichen Doku und Tool-Realität weiter ab. Empfehlung: dynamisch aus JSON ziehen statt hardcoden.
6. **Lizenz-Datei vs. Lizenz-Aussage:** `LICENSE` existiert, aber sind die KQL-Mappings (Community-Beitrag) dual-lizenziert (MIT für Code, CC-BY 4.0 für Mappings)? Verify, denn `llms.txt` muss eine klare Lizenz nennen, sonst zitieren LLMs vorsichtig oder gar nicht.

---

*End of audit. Awaiting Matthias' review and commit approval before adding to repo history.*
