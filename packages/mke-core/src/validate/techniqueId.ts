/**
 * MITRE ATT&CK technique-ID format validation.
 *
 * Purpose: single source of truth for the `T####` / `T####.###` ID format
 *          used across mappings, scenarios and contribution tooling.
 * Author:  Triath
 * Date:    2026-07-14
 */

/**
 * Matches "T####" (technique) or "T####.###" (sub-technique), e.g. T1059 / T1059.001.
 * The sub-technique digits are written out (no `{3}` inside the optional group)
 * so security/detect-unsafe-regex's star-height heuristic accepts the pattern.
 */
export const TECHNIQUE_ID_PATTERN = /^T\d{4}(\.\d\d\d)?$/;

/** True if `value` is a well-formed MITRE ATT&CK technique or sub-technique ID. */
export function isTechniqueId(value: string): boolean {
  return TECHNIQUE_ID_PATTERN.test(value);
}
