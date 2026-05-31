import type { DataStore, KqlMapping } from "@/core/models";

export function findMappingByKqlId(
  store: DataStore | null,
  kqlId: string
): KqlMapping | undefined {
  if (store === null || kqlId.length === 0) return undefined;
  for (const mappings of store.mappingsByTechnique.values()) {
    for (const m of mappings) {
      if (m.mapping_id === kqlId) return m;
    }
  }
  return undefined;
}

export function techniqueName(
  store: DataStore | null,
  id: string
): string | undefined {
  return store?.techniques.get(id)?.name;
}
