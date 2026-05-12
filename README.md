# MITRE ATT&CK KQL Explorer

Interactive MITRE ATT&CK matrix mapped to production-ready KQL queries for Microsoft Sentinel and Defender XDR.

![Screenshot](docs/screenshot.png)

## Use it

Open the live app: [mitre.triath.xyz](https://mitre.triath.xyz)

No setup required. Browse the matrix, click a technique, copy the KQL.

## Contribute

1. Fork the repo
2. Add KQL queries to `public/data/kql_mappings.json` following the schema in [CONTRIBUTING.md](CONTRIBUTING.md)
3. Copy the file to `data/kql_mappings.json` to keep the CI mirror in sync
4. Submit a PR

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full KQL quality requirements and mapping ID conventions.

## Self-host

```bash
git clone https://github.com/triathIC/Mitre-selector.git
cd Mitre-selector
npm install
npm run dev
```

Deploys to Vercel out of the box — just import the repo.

## Data files

The repo has two directories that mirror each other:

| Directory | Purpose |
|-----------|---------|
| `public/data/` | Runtime data — served by Vite and the primary source of truth |
| `data/` | CI mirror — checked against `public/data/` in CI to catch accidental drift |

`kql_mappings.json` is maintained manually; `mitre_techniques.json` is auto-generated from STIX (see below). Always edit files in `public/data/` and copy to `data/` to keep both in sync.

## STIX data update

```bash
npm run generate-mitre-data
```

Generates `public/data/mitre_techniques.json` (and the `data/` mirror) from the official [MITRE ATT&CK STIX bundle](https://github.com/mitre/cti). The CI workflow runs this weekly and opens a PR if techniques changed.

## Tech stack

React, TypeScript, Vite, TailwindCSS.

## License

[MIT](LICENSE)
