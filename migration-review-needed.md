# Migration — Review Needed

Below: every row from `migration-proposal.md` where confidence is **not high**.
Either v19 STIX places the technique under both new tactics, the technique
was relocated entirely, or it is no longer in the active v19 set.

**4 item(s) require a decision.**

## 1. T1070.001 — Clear Windows Event Logs → **T1685.005** Clear Windows Event Logs

- **Affected mapping IDs:** KQL-T1070.001-001, KQL-T1070.001-002
- **v19 kill_chain_phases:** Defense Impairment
- **Proposed:** Defense Impairment
- **Confidence:** medium
- **Reasoning:** v19 revokes `T1070.001` and points to successor `T1685.005` (Clear Windows Event Logs). v19 STIX places this technique under `defense-impairment` only.

**Question to architect:** v19 renames this technique to **T1685.005** under Defense Impairment. Decide for Phase 3: (a) keep `T1070.001` as technique_id and just retag the tactic, or (b) rewrite affected mappings to use `T1685.005` (recommended — follows MITRE).

## 2. T1518.001 — Security Software Discovery

- **Affected mapping IDs:** KQL-T1518.001-001
- **v19 kill_chain_phases:** Discovery
- **Proposed:** (none — moved to: Discovery)
- **Confidence:** low
- **Reasoning:** v19 relocates this technique out of stealth/defense-impairment entirely — manual review of the project mapping needed.

**Question to architect:** v19 moves this technique entirely out of the Defense Evasion family to **Discovery**. Decide for Phase 3: (a) follow v19 and re-tag this mapping to the new tactic, or (b) keep the old categorization for our UI.

## 3. T1548.002 — Bypass User Account Control

- **Affected mapping IDs:** KQL-T1548.002-001
- **v19 kill_chain_phases:** Privilege Escalation
- **Proposed:** (none — moved to: Privilege Escalation)
- **Confidence:** low
- **Reasoning:** v19 relocates this technique out of stealth/defense-impairment entirely — manual review of the project mapping needed.

**Question to architect:** v19 moves this technique entirely out of the Defense Evasion family to **Privilege Escalation**. Decide for Phase 3: (a) follow v19 and re-tag this mapping to the new tactic, or (b) keep the old categorization for our UI.

## 4. T1562.001 — Disable or Modify Tools → **T1685** Disable or Modify Tools

- **Affected mapping IDs:** KQL-T1562.001-001, KQL-T1562.001-002
- **v19 kill_chain_phases:** Defense Impairment
- **Proposed:** Defense Impairment
- **Confidence:** medium
- **Reasoning:** v19 revokes `T1562.001` and points to successor `T1685` (Disable or Modify Tools). v19 STIX places this technique under `defense-impairment` only.

**Question to architect:** v19 renames this technique to **T1685** under Defense Impairment. Decide for Phase 3: (a) keep `T1562.001` as technique_id and just retag the tactic, or (b) rewrite affected mappings to use `T1685` (recommended — follows MITRE).

