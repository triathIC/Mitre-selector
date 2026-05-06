import { useMemo } from "react";
import type { DataStore, MitreTechnique, MitreTactic } from "@/core/models";
import { useAppContext } from "@/context/useAppContext";

export interface FilteredResult {
  /** Techniques per tactic (only top-level; sub-techniques attached to parent) */
  techniquesByTactic: Map<MitreTactic, MitreTechnique[]>;
  /** Whether a technique ID matches current filters */
  techniqueMatchesFilter: (techniqueId: string) => boolean;
}

/**
 * Derives filtered technique lists per tactic and filter-match predicate.
 * Used by MatrixView and DetailPanel.
 */
export function useFilteredData(dataStore: DataStore | null): FilteredResult {
  const { state } = useAppContext();
  const filters = state.filters;
  const searchLower = filters.searchQuery.trim().toLowerCase();

  return useMemo(() => {
    if (dataStore === null) {
      return {
        techniquesByTactic: new Map(),
        techniqueMatchesFilter: () => false,
      };
    }

    const { techniques, tactics, mappingsByTechnique } = dataStore;

    function matchesSearch(t: MitreTechnique): boolean {
      if (searchLower === "") return true;
      const nameMatch = t.name.toLowerCase().includes(searchLower);
      const idMatch = t.id.toLowerCase().includes(searchLower);
      if (nameMatch || idMatch) return true;
      const mappings = mappingsByTechnique.get(t.id) ?? [];
      for (const m of mappings) {
        if (
          m.title.toLowerCase().includes(searchLower) ||
          m.description.toLowerCase().includes(searchLower)
        ) {
          return true;
        }
      }
      return false;
    }

    function matchesPlatform(t: MitreTechnique): boolean {
      if (filters.platform === "all") return true;
      return t.platforms.includes(filters.platform);
    }

    function hasMatchingKql(techniqueId: string): boolean {
      const mappings = mappingsByTechnique.get(techniqueId) ?? [];
      if (filters.product !== "all") {
        if (!mappings.some((m) => m.product === filters.product)) return false;
      }
      if (filters.severity !== "all") {
        if (!mappings.some((m) => m.severity === filters.severity)) return false;
      }
      return true;
    }

    function techniqueMatchesFilter(techniqueId: string): boolean {
      const t = techniques.get(techniqueId);
      if (!t) return false;
      if (!matchesSearch(t)) return false;
      if (!matchesPlatform(t)) return false;
      if (filters.showOnlyWithKql) {
        const mappings = mappingsByTechnique.get(techniqueId) ?? [];
        if (mappings.length === 0) return false;
      }
      if (!hasMatchingKql(techniqueId)) return false;
      return true;
    }

    const techniquesByTactic = new Map<MitreTactic, MitreTechnique[]>();
    for (const tactic of tactics) {
      const list: MitreTechnique[] = [];
      for (const [, t] of techniques) {
        if (t.parent_id !== null) continue;
        if (!t.tactics.includes(tactic)) continue;
        list.push(t);
      }
      list.sort((a, b) => a.id.localeCompare(b.id));
      techniquesByTactic.set(tactic, list);
    }

    return {
      techniquesByTactic,
      techniqueMatchesFilter,
    };
  }, [dataStore, filters.platform, filters.product, filters.severity, filters.showOnlyWithKql, searchLower]);
}
