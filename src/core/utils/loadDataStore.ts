import type { DataStore, KqlMapping, MitreTechnique } from "../models";
import { buildDataStore } from "./dataTransform";

export interface LoadDataStoreUrls {
  techniquesUrl: string;
  mappingsUrl: string;
}

/**
 * Fetches MITRE techniques and KQL mappings from the given URLs and builds an
 * in-memory DataStore. Pure of any framework — usable from any JS runtime that
 * provides a global fetch (browsers, modern Node, edge runtimes).
 *
 * Throws on HTTP errors or invalid payload shape.
 */
export async function loadDataStore(urls: LoadDataStoreUrls): Promise<DataStore> {
  const [techniquesRes, mappingsRes] = await Promise.all([
    fetch(urls.techniquesUrl),
    fetch(urls.mappingsUrl),
  ]);

  if (!techniquesRes.ok) {
    throw new Error(`Failed to load MITRE data: ${String(techniquesRes.status)}`);
  }
  if (!mappingsRes.ok) {
    throw new Error(`Failed to load KQL mappings: ${String(mappingsRes.status)}`);
  }

  const [techniques, mappings]: [MitreTechnique[], KqlMapping[]] = await Promise.all([
    techniquesRes.json() as Promise<MitreTechnique[]>,
    mappingsRes.json() as Promise<KqlMapping[]>,
  ]);

  if (!Array.isArray(techniques) || !Array.isArray(mappings)) {
    throw new Error("Invalid data shape: expected arrays");
  }

  return buildDataStore(techniques, mappings);
}
