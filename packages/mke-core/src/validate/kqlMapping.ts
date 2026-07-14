/**
 * KQL-mapping schema validator.
 *
 * Purpose: runtime validation of KqlMapping objects (kql_mappings.json
 *          entries) — required fields, enum membership, technique-ID and
 *          mapping-ID formats. Pure TypeScript, no dependencies, so it can
 *          run in CI scripts, contribution tooling and any JS runtime.
 * Author:  Triath
 * Date:    2026-07-14
 */
import type { KqlMapping } from "../models/index.js";
import { isTechniqueId } from "./techniqueId.js";

export interface KqlMappingValidationResult {
  valid: boolean;
  /** Human-readable problems, empty when valid. Format: "<field>: <problem>". */
  errors: string[];
}

const PRODUCTS: readonly string[] = ["Microsoft Sentinel", "Defender XDR"];
const QUERY_TYPES: readonly string[] = ["detection", "hunting"];
const SEVERITIES: readonly string[] = [
  "informational",
  "low",
  "medium",
  "high",
  "critical",
];
const CONFIDENCE_LEVELS: readonly string[] = [
  "experimental",
  "testing",
  "production",
];

/**
 * "KQL-T####-NNN" or "KQL-T####.###-NNN" (NNN = sequential per technique).
 * Sub-technique digits written out (no `{3}` inside the optional group) to
 * satisfy security/detect-unsafe-regex's star-height heuristic.
 */
const MAPPING_ID_PATTERN = /^KQL-T\d{4}(\.\d\d\d)?-\d{3}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

/**
 * Validates a candidate object against the KqlMapping schema.
 * Collects every problem instead of failing fast, so contribution tooling
 * can show all errors at once.
 */
export function validateKqlMapping(candidate: unknown): KqlMappingValidationResult {
  if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) {
    return { valid: false, errors: ["mapping: must be a plain object"] };
  }

  const errors: string[] = [];
  const {
    mapping_id,
    technique_id,
    additional_technique_ids,
    product,
    data_connector,
    log_sources,
    query_type,
    severity,
    title,
    description,
    kql,
    tags,
    author,
    references,
    last_tested,
    version,
    confidence,
    tuning_notes,
  } = candidate as Record<keyof KqlMapping, unknown>;

  if (!isNonEmptyString(mapping_id)) {
    errors.push("mapping_id: required non-empty string");
  } else if (!MAPPING_ID_PATTERN.test(mapping_id)) {
    errors.push(
      `mapping_id: "${mapping_id}" does not match "KQL-T####-NNN" / "KQL-T####.###-NNN"`,
    );
  }

  if (!isNonEmptyString(technique_id)) {
    errors.push("technique_id: required non-empty string");
  } else if (!isTechniqueId(technique_id)) {
    errors.push(
      `technique_id: "${technique_id}" is not a valid technique ID (T#### or T####.###)`,
    );
  } else if (
    isNonEmptyString(mapping_id) &&
    MAPPING_ID_PATTERN.test(mapping_id) &&
    !mapping_id.startsWith(`KQL-${technique_id}-`)
  ) {
    errors.push(
      `mapping_id: "${mapping_id}" must embed technique_id ("KQL-${technique_id}-NNN")`,
    );
  }

  if (additional_technique_ids !== undefined) {
    if (!isStringArray(additional_technique_ids)) {
      errors.push("additional_technique_ids: must be an array of strings when present");
    } else {
      for (const id of additional_technique_ids) {
        if (!isTechniqueId(id)) {
          errors.push(
            `additional_technique_ids: "${id}" is not a valid technique ID`,
          );
        }
      }
    }
  }

  if (typeof product !== "string" || !PRODUCTS.includes(product)) {
    errors.push(`product: must be one of ${PRODUCTS.join(" | ")}`);
  }
  if (typeof query_type !== "string" || !QUERY_TYPES.includes(query_type)) {
    errors.push(`query_type: must be one of ${QUERY_TYPES.join(" | ")}`);
  }
  if (typeof severity !== "string" || !SEVERITIES.includes(severity)) {
    errors.push(`severity: must be one of ${SEVERITIES.join(" | ")}`);
  }
  if (typeof confidence !== "string" || !CONFIDENCE_LEVELS.includes(confidence)) {
    errors.push(`confidence: must be one of ${CONFIDENCE_LEVELS.join(" | ")}`);
  }

  if (!isNonEmptyString(data_connector)) errors.push("data_connector: required non-empty string");
  if (!isNonEmptyString(title)) errors.push("title: required non-empty string");
  if (!isNonEmptyString(description)) errors.push("description: required non-empty string");
  if (!isNonEmptyString(kql)) errors.push("kql: required non-empty string");
  if (!isNonEmptyString(author)) errors.push("author: required non-empty string");

  if (!isStringArray(log_sources)) errors.push("log_sources: must be an array of strings");
  if (!isStringArray(tags)) errors.push("tags: must be an array of strings");
  if (!isStringArray(references)) errors.push("references: must be an array of strings");

  if (typeof last_tested !== "string" || !ISO_DATE_PATTERN.test(last_tested)) {
    errors.push('last_tested: must be an ISO date string ("YYYY-MM-DD")');
  } else {
    // Round-trip through Date to reject impossible calendar dates ("2026-13-45").
    const parsed = new Date(`${last_tested}T00:00:00Z`);
    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== last_tested
    ) {
      errors.push(`last_tested: "${last_tested}" is not a real calendar date`);
    }
  }

  if (typeof version !== "number" || !Number.isFinite(version)) {
    errors.push("version: must be a finite number");
  }

  if (tuning_notes !== undefined && typeof tuning_notes !== "string") {
    errors.push("tuning_notes: must be a string when present");
  }

  return { valid: errors.length === 0, errors };
}
