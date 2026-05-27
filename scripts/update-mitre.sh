#!/usr/bin/env bash
#
# Fetch the MITRE ATT&CK Enterprise STIX bundle pinned in
# data/mitre-manifest.json, validate its tactic structure, and write the
# resulting SHA-256 (plus tactic shortnames + lastUpdated) back into the
# manifest so the version is reproducible.
#
# The raw bundle is intentionally gitignored — pinning is done via the
# manifest hash. Run this script whenever the manifest's downloadUrl /
# mitreAttackVersion is bumped.
#
# Usage: bash scripts/update-mitre.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST="$ROOT/data/mitre-manifest.json"
BUNDLE="$ROOT/data/enterprise-attack.json"

if [[ ! -f "$MANIFEST" ]]; then
  echo "ERROR: manifest not found at $MANIFEST" >&2
  exit 1
fi

URL="$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).downloadUrl)" "$MANIFEST")"
if [[ -z "$URL" ]]; then
  echo "ERROR: manifest is missing downloadUrl" >&2
  exit 1
fi

echo "Fetching $URL"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
if ! curl -fsSL "$URL" -o "$TMP"; then
  echo "ERROR: download failed. Verify the manifest URL / tag exists." >&2
  exit 1
fi

if [[ "$(uname)" == "Darwin" ]]; then
  HASH="$(shasum -a 256 "$TMP" | awk '{print $1}')"
else
  HASH="$(sha256sum "$TMP" | awk '{print $1}')"
fi
echo "SHA-256: $HASH"

mv "$TMP" "$BUNDLE"
trap - EXIT

# Hand off to the TS helper for JSON-safe manifest update + tactic validation.
exec npx tsx "$ROOT/scripts/lock-mitre-manifest.ts" "$HASH"
