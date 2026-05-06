import type { DataStore, MitreTactic, MitreTechnique } from "@/core/models";
import { TechniqueCell } from "./TechniqueCell";

export interface TacticColumnProps {
  tactic: MitreTactic;
  techniques: MitreTechnique[];
  dataStore: DataStore;
  selectedTechniqueId: string | null;
  techniqueMatchesFilter: (id: string) => boolean;
  onSelectTechnique: (id: string) => void;
}

export function TacticColumn({
  tactic,
  techniques,
  dataStore,
  selectedTechniqueId,
  techniqueMatchesFilter,
  onSelectTechnique,
}: TacticColumnProps) {
  const { techniques: techniqueMap, mappingsByTechnique, subtechniquesByParent } = dataStore;

  const getTechnique = (id: string): MitreTechnique | undefined => techniqueMap.get(id);
  const getMappingCount = (id: string): number => (mappingsByTechnique.get(id) ?? []).length;

  return (
    <div className="flex min-w-[200px] max-w-[240px] flex-col border-r border-white/10 last:border-r-0">
      <div className="sticky top-0 z-[1] border-b border-white/10 bg-surface-elevated px-2 py-2 text-center">
        <h2 className="text-xs font-semibold leading-tight text-gray-300">
          {tactic}
        </h2>
      </div>
      <div className="flex flex-1 flex-col gap-[2px] overflow-y-auto p-2">
        {techniques.map((technique) => (
          <TechniqueCell
            key={technique.id}
            technique={technique}
            mappingCount={getMappingCount(technique.id)}
            selectedTechniqueId={selectedTechniqueId}
            isDimmed={!techniqueMatchesFilter(technique.id)}
            onSelect={onSelectTechnique}
            childIds={subtechniquesByParent.get(technique.id) ?? []}
            getTechnique={getTechnique}
            getMappingCount={getMappingCount}
            techniqueMatchesFilter={techniqueMatchesFilter}
          />
        ))}
      </div>
    </div>
  );
}
