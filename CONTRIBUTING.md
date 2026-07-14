# Contributing

KQL detection and hunting queries are the core of this project. Contributions welcome.

## How to contribute KQL queries

1. Fork the repo
2. Add your mapping to `public/data/kql_mappings.json`
3. Copy the file to `data/kql_mappings.json` to keep the CI mirror in sync
4. Follow the `KqlMapping` interface in [`packages/mke-core/src/models/index.ts`](packages/mke-core/src/models/index.ts)
5. Submit a PR

## KQL quality requirements

- **Syntactically valid KQL** — no pseudocode, no placeholders, no `// TODO`
- **Real Microsoft table and column names** — `DeviceProcessEvents`, `SigninLogs`, `SecurityEvent`, etc.
- **`technique_id` must exist** in `data/mitre_techniques.json`
- **`last_tested` must be a valid ISO 8601 date** (e.g. `2025-03-01`)
- **At least one reference URL** — MITRE technique page or Microsoft Docs
- **Description explaining what the query detects and why** — 2-3 sentences minimum

### Table → Data connector mapping

| Table | `data_connector` |
|-------|------------------|
| `DeviceProcessEvents`, `DeviceNetworkEvents`, `DeviceFileEvents`, `DeviceRegistryEvents` | Microsoft Defender for Endpoint |
| `SigninLogs`, `AuditLogs`, `AADSignInEventsBeta` | Microsoft Entra ID |
| `SecurityEvent` | Windows Security Events via AMA |
| `EmailEvents`, `EmailAttachmentInfo` | Microsoft Defender for Office 365 |

## Mapping ID convention

Format: `KQL-{technique_id}-{3-digit-sequence}`

- Detection queries use **odd** numbers: `001`, `003`, `005`
- Hunting queries use **even** numbers: `002`, `004`, `006`

Example: `KQL-T1059.001-001` (detection), `KQL-T1059.001-002` (hunting)

## Severity and confidence

Contributors self-assess both fields. Maintainers may adjust during review.

**Severity** — how impactful is the detected behavior?

| Level | Guideline |
|-------|-----------|
| `critical` | Immediate threat — active ransomware, credential dumping |
| `high` | Strong indicator of compromise — download cradles, defense evasion |
| `medium` | Suspicious but context-dependent — persistence mechanisms, policy changes |
| `low` | Informational, broad hunting — anomaly baselines, reconnaissance |
| `informational` | Purely observational, no direct threat signal |

**Confidence** — how reliably does this query detect the technique?

| Level | Guideline |
|-------|-----------|
| `production` | Low false-positive rate, tested in real environments |
| `testing` | Solid logic but not validated in production |
| `experimental` | Broad hunting query, expect false positives, needs tuning |

## What we don't accept

- Untested queries or queries copied without validation
- Queries without a description
- Duplicate mappings for the same technique without meaningful differentiation (different product, different detection angle, or different log source)

## Reporting issues

Use [GitHub Issues](https://github.com/triathIC/Mitre-selector/issues). Bug reports and feature requests welcome.
