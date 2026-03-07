# Contributing to MITRE ATT&CK KQL Explorer

Thank you for contributing detection and hunting content. This project bridges MITRE ATT&CK techniques with production-ready KQL for Microsoft Sentinel and Defender XDR.

## KQL mapping contributions

### Where to contribute

- **KQL content**: Edit or add entries in `public/data/kql_mappings.json` (or `data/kql_mappings.json` if you use a different setup).
- **Do not** edit `mitre_techniques.json` by hand — it is generated from MITRE STIX via `scripts/generate-mitre-data.ts`.

### KQL mapping requirements

Each entry in `kql_mappings.json` must conform to the `KqlMapping` schema:

| Field | Required | Notes |
|-------|----------|--------|
| `mapping_id` | Yes | Format: `KQL-{technique_id}-{3-digit}` (e.g. `KQL-T1059.001-001`) |
| `technique_id` | Yes | MITRE technique or sub-technique ID (e.g. `T1059`, `T1059.001`) |
| `product` | Yes | `"Microsoft Sentinel"` or `"Defender XDR"` |
| `data_connector` | Yes | Required connector in Sentinel (e.g. `"Microsoft Defender for Endpoint"`) |
| `log_sources` | Yes | Array of log tables used (e.g. `["DeviceProcessEvents"]`) |
| `query_type` | Yes | `"detection"` or `"hunting"` |
| `severity` | Yes | `"informational"` \| `"low"` \| `"medium"` \| `"high"` \| `"critical"` |
| `title` | Yes | Short descriptive title |
| `description` | Yes | What the query detects and why it matters |
| `kql` | Yes | Valid, tested KQL — no placeholders or pseudocode |
| `tags` | Yes | Searchable tags (e.g. `["powershell", "execution"]`) |
| `author` | Yes | Your name or GitHub handle |
| `references` | Yes | Array of URLs (MITRE, docs, research) |
| `last_tested` | Yes | ISO 8601 date when query was last validated |
| `version` | Yes | Integer; start at 1, increment when `kql` changes |
| `confidence` | Yes | `"experimental"` \| `"testing"` \| `"production"` |
| `tuning_notes` | No | Optional deployment and tuning guidance |

### Quality bar

- **KQL**: Must run against the stated product and log sources. No dummy tables or placeholders.
- **Uniqueness**: Prefer one mapping per distinct detection idea; use a new `mapping_id` for variants (e.g. different products or severities).
- **Attribution**: Keep `author` and `references` accurate so others can trace and tune.

### Submitting

1. Open an issue using the [New KQL mapping](/.github/ISSUE_TEMPLATE/new-kql-mapping.yml) template (if available), or describe your mapping in a PR.
2. Add or edit the mapping in `public/data/kql_mappings.json`.
3. Open a pull request. A maintainer will review and merge.

## Code contributions

- Follow the project’s TypeScript and React patterns (functional components, named exports, strict types).
- Run `npm run lint` and `npm run build` before submitting.

## License

By contributing, you agree that your contributions will be licensed under the same [MIT License](LICENSE) as the project.
