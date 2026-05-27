The MITRE ATT&CK Enterprise STIX bundle pinned in `data/mitre-manifest.json` is behind the upstream release.

| Field | Value |
|---|---|
| Pinned version | `${PINNED}` |
| Latest upstream tag | `${UPSTREAM_TAG}` (`${UPSTREAM}`) |
| Release notes | https://attack.mitre.org/resources/updates/ |
| Upstream tag | https://github.com/mitre/cti/releases/tag/${UPSTREAM_TAG_URL} |

## Migration checklist

- [ ] Read the [release notes](https://attack.mitre.org/resources/updates/); identify deprecated, renamed, or relocated techniques and tactics.
- [ ] Bump `mitreAttackVersion` and `downloadUrl` in `data/mitre-manifest.json` to `${UPSTREAM}`.
- [ ] Reset `stixBundleSha256` and `tacticShortnames` so the lock script rewrites them on next run.
- [ ] Run `bash scripts/update-mitre.sh` to fetch the new bundle and re-lock SHA-256 + tactic shortnames.
- [ ] Run `npm run test:bundle` — verifies hash, tactic count, mapping consistency.
- [ ] Run `npx tsx scripts/generate-mitre-data.ts` to regenerate `mitre_techniques.json` (writes both `data/` and `public/data/`).
- [ ] If the tactic surface changed: update `MitreTactic` union (`src/core/models/index.ts`) and `TACTIC_ORDER` (`src/core/constants/index.ts`).
- [ ] If techniques were revoked / relocated: audit `public/data/kql_mappings.json` and produce a migration proposal (see the prior `migration-proposal.md` for the v19 example).
- [ ] `npm run build` green.
- [ ] Commit with `feat(mitre): bump to ATT&CK ${UPSTREAM}` and close this issue.

_Auto-opened by `.github/workflows/mitre-drift-check.yml`. Idempotent per upstream version — will not be re-opened while this issue stays open._
