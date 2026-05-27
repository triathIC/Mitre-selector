# MITRE ATT&CK v19 — Migration Proposal

**Generated:** 2026-05-27 (Phase 2, dry-run — no code changes)
**Source of truth:** v19.0 STIX bundle pinned in `data/mitre-manifest.json` (SHA-256 verified)
**Scope:** every KQL mapping in `public/data/kql_mappings.json` tagged `defense-evasion` — 18 mappings across 15 distinct techniques.

## How to read this

In v18 (current), tactic information for each KQL mapping is derived
implicitly from `technique_id` → `mitre_techniques.json` (which still
encodes `Defense Evasion`). v19 deprecates that tactic and replaces it
with **Stealth** and **Defense Impairment**. The columns below report
what v19 STIX says about each technique's new tactic placement.

- **Aktuell**: the tactic the project currently surfaces for this technique (Defense Evasion in v18-derived data).
- **Vorschlag v19**: the proposed v19 tactic, taken from v19 STIX kill_chain_phases when unambiguous.
- **Confidence**: `high` when v19 STIX maps to exactly one of {Stealth, Defense Impairment}; `medium` when v19 maps to both (heuristic picks a primary); `low` when v19 moves the technique elsewhere or it is no longer present.

Confidence < high → also listed in [`migration-review-needed.md`](./migration-review-needed.md).

## Summary

| Metric | Count |
|---|---|
| Mappings tagged `defense-evasion` | 18 |
| Distinct techniques | 15 |
| High-confidence proposals | 11 |
| Needs review | 4 |

## Mapping table

| Technique-ID | Name | Aktuell | Vorschlag v19 | Confidence | Begründung |
|---|---|---|---|---|---|
| T1027 | Obfuscated Files or Information | Defense Evasion | Stealth | high | v19 STIX places this technique under `stealth` only. v19 kill_chain_phases: Stealth |
| T1036 | Masquerading | Defense Evasion | Stealth | high | v19 STIX places this technique under `stealth` only. v19 kill_chain_phases: Stealth |
| T1055 | Process Injection | Defense Evasion | Stealth | high | v19 STIX places this technique under `stealth` only. v19 kill_chain_phases: Stealth, Privilege Escalation |
| T1070.001 | Clear Windows Event Logs → **T1685.005** Clear Windows Event Logs | Defense Evasion | Defense Impairment | medium | v19 revokes `T1070.001` and points to successor `T1685.005` (Clear Windows Event Logs). v19 STIX places this technique under `defense-impairment` only. v19 kill_chain_phases: Defense Impairment |
| T1112 | Modify Registry | Defense Evasion | Defense Impairment | high | v19 STIX places this technique under `defense-impairment` only. v19 kill_chain_phases: Defense Impairment, Persistence |
| T1134 | Access Token Manipulation | Defense Evasion | Stealth | high | v19 STIX places this technique under `stealth` only. v19 kill_chain_phases: Stealth, Privilege Escalation |
| T1218 | System Binary Proxy Execution | Defense Evasion | Stealth | high | v19 STIX places this technique under `stealth` only. v19 kill_chain_phases: Stealth |
| T1218.005 | Mshta | Defense Evasion | Stealth | high | v19 STIX places this technique under `stealth` only. v19 kill_chain_phases: Stealth |
| T1218.010 | Regsvr32 | Defense Evasion | Stealth | high | v19 STIX places this technique under `stealth` only. v19 kill_chain_phases: Stealth |
| T1518.001 | Security Software Discovery | Defense Evasion | (none — moved to: Discovery) | low | v19 relocates this technique out of stealth/defense-impairment entirely — manual review of the project mapping needed. v19 kill_chain_phases: Discovery |
| T1548.002 | Bypass User Account Control | Defense Evasion | (none — moved to: Privilege Escalation) | low | v19 relocates this technique out of stealth/defense-impairment entirely — manual review of the project mapping needed. v19 kill_chain_phases: Privilege Escalation |
| T1553.005 | Mark-of-the-Web Bypass | Defense Evasion | Defense Impairment | high | v19 STIX places this technique under `defense-impairment` only. v19 kill_chain_phases: Defense Impairment |
| T1556 | Modify Authentication Process | Defense Evasion | Defense Impairment | high | v19 STIX places this technique under `defense-impairment` only. v19 kill_chain_phases: Defense Impairment, Persistence, Credential Access |
| T1562.001 | Disable or Modify Tools → **T1685** Disable or Modify Tools | Defense Evasion | Defense Impairment | medium | v19 revokes `T1562.001` and points to successor `T1685` (Disable or Modify Tools). v19 STIX places this technique under `defense-impairment` only. v19 kill_chain_phases: Defense Impairment |
| T1564.001 | Hidden Files and Directories | Defense Evasion | Stealth | high | v19 STIX places this technique under `stealth` only. v19 kill_chain_phases: Stealth |

## Affected mapping IDs (per technique)

- **T1027**: KQL-T1027-001, KQL-T1027-002
- **T1036**: KQL-T1036-001
- **T1055**: KQL-T1055-001
- **T1070.001**: KQL-T1070.001-001, KQL-T1070.001-002
- **T1112**: KQL-T1112-001
- **T1134**: KQL-T1134-001
- **T1218**: KQL-T1218-002
- **T1218.005**: KQL-T1218.005-001
- **T1218.010**: KQL-T1218.010-001
- **T1518.001**: KQL-T1518.001-001
- **T1548.002**: KQL-T1548.002-001
- **T1553.005**: KQL-T1553.005-001
- **T1556**: KQL-T1556-001
- **T1562.001**: KQL-T1562.001-001, KQL-T1562.001-002
- **T1564.001**: KQL-T1564.001-001
