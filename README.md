# MITRE ATT&CK KQL Explorer

A production-grade, open-source web app that bridges **MITRE ATT&CK** techniques with actionable **KQL** queries for **Microsoft Sentinel** and **Defender XDR**. No backend — static data and client-side state.

![MITRE ATT&CK KQL Explorer](https://via.placeholder.com/800x400?text=MITRE+ATT%26CK+KQL+Explorer)

## Features

- **Matrix view**: Browse Enterprise ATT&CK by tactic; techniques show KQL coverage at a glance.
- **Detail panel**: Select a technique to see description, sub-techniques, and all linked KQL mappings.
- **KQL cards**: Severity, confidence, product, log sources, copy-to-clipboard, tuning notes, and references.
- **Filters**: Platform, product, severity, search (technique name/ID, KQL title/description), and “Has KQL” toggle.
- **Responsive**: Full matrix on desktop, horizontally scrollable on tablet, tactic accordion on mobile.
- **Dark theme**: Optimized for security / SOC use.

## Tech stack

| Layer     | Technology        |
|----------|--------------------|
| Framework| React 18 + Vite 5  |
| Language | TypeScript (strict)|
| Styling  | TailwindCSS 3      |
| State    | React Context + useReducer |
| Data     | Static JSON (no backend)   |

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Data is loaded from `public/data/mitre_techniques.json` and `public/data/kql_mappings.json`.

## Scripts

| Command | Description |
|--------|--------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | ESLint |
| `npm run generate-mitre-data` | Fetch STIX and generate `data/mitre_techniques.json` (and `public/data/`) |

## Data

- **`mitre_techniques.json`**: Generated from [MITRE CTI](https://github.com/mitre/cti) Enterprise ATT&CK STIX. Do not edit by hand; use `npm run generate-mitre-data`.
- **`kql_mappings.json`**: Community-curated KQL detections and hunting queries. See [CONTRIBUTING.md](CONTRIBUTING.md) for the schema and how to add mappings.

## Deployment

- **GitHub Pages**: Push to `main`; the [deploy workflow](.github/workflows/deploy.yml) builds and publishes the `dist` folder.
- **Vercel**: Import the repo and use the default build command and output directory (`dist`).

## Contributing

KQL mappings are the core value. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Required fields and format for `kql_mappings.json`
- Quality bar (valid KQL, no placeholders)
- How to open a PR or use the issue template

## License

[MIT](LICENSE).
