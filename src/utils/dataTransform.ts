import type {
  DataStore,
  KqlMapping,
  MitreTechnique,
  MitreTactic,
} from "@/types";
import { TACTIC_ORDER } from "./constants";

/**
 * Build in-memory DataStore from raw JSON arrays.
 * Called once on app init after fetching mitre_techniques.json and kql_mappings.json.
 */
export function buildDataStore(
  techniques: MitreTechnique[],
  mappings: KqlMapping[]
): DataStore {
  const techniqueMap = new Map<string, MitreTechnique>();
  for (const t of techniques) {
    techniqueMap.set(t.id, t);
  }

  const mappingsByTechnique = new Map<string, KqlMapping[]>();
  for (const m of mappings) {
    const id = m.technique_id;
    const list = mappingsByTechnique.get(id) ?? [];
    list.push(m);
    mappingsByTechnique.set(id, list);
  }

  const subtechniquesByParent = new Map<string, string[]>();
  for (const t of techniques) {
    if (t.parent_id !== null) {
      const list = subtechniquesByParent.get(t.parent_id) ?? [];
      list.push(t.id);
      subtechniquesByParent.set(t.parent_id, list);
    }
  }
  for (const [, list] of subtechniquesByParent) {
    list.sort();
  }

  const tacticsSet = new Set<MitreTactic>();
  for (const t of techniques) {
    for (const tactic of t.tactics) {
      tacticsSet.add(tactic);
    }
  }
  const tactics = TACTIC_ORDER.filter((t) => tacticsSet.has(t));

  return {
    techniques: techniqueMap,
    mappingsByTechnique,
    tactics,
    subtechniquesByParent,
  };
}
