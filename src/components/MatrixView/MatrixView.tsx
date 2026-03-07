import { useCallback, useState } from "react";
import type { DataStore, MitreTactic } from "@/types";
import { useFilteredData } from "@/hooks/useFilteredData";
import { useAppContext } from "@/context/AppContext";
import { TacticColumn } from "./TacticColumn";

export interface MatrixViewProps {
  dataStore: DataStore;
}

export function MatrixView({ dataStore }: MatrixViewProps): JSX.Element {
  const { techniquesByTactic, techniqueMatchesFilter } = useFilteredData(dataStore);
  const { state, selectTechnique } = useAppContext();
  const selectedTechniqueId = state.selectedTechniqueId;
  const [mobileTactic, setMobileTactic] = useState<MitreTactic | "">(
    dataStore.tactics[0] ?? ""
  );

  const handleSelect = useCallback(
    (id: string) => {
      selectTechnique(id);
    },
    [selectTechnique]
  );

  const tactics = dataStore.tactics;
  const effectiveTactic = mobileTactic || tactics[0];

  return (
    <>
      {/* Mobile: tactic selector + single column */}
      <div className="md:hidden">
        <label className="sr-only" htmlFor="mobile-tactic">
          Select tactic
        </label>
        <select
          id="mobile-tactic"
          value={effectiveTactic}
          onChange={(e) => setMobileTactic(e.target.value as MitreTactic)}
          className="mb-2 w-full rounded border border-white/10 bg-surface-overlay px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
          aria-label="Select tactic"
        >
          {tactics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div role="grid" aria-label="MITRE ATT&CK matrix">
          <TacticColumn
            tactic={effectiveTactic}
            techniques={techniquesByTactic.get(effectiveTactic) ?? []}
            dataStore={dataStore}
            selectedTechniqueId={selectedTechniqueId}
            techniqueMatchesFilter={techniqueMatchesFilter}
            onSelectTechnique={handleSelect}
          />
        </div>
      </div>
      {/* Desktop / tablet: full scrollable matrix */}
      <div className="hidden md:flex md:overflow-x-auto md:overflow-y-hidden" role="grid" aria-label="MITRE ATT&CK matrix">
        {tactics.map((tactic) => {
          const techniques = techniquesByTactic.get(tactic) ?? [];
          return (
            <TacticColumn
              key={tactic}
              tactic={tactic}
              techniques={techniques}
              dataStore={dataStore}
              selectedTechniqueId={selectedTechniqueId}
              techniqueMatchesFilter={techniqueMatchesFilter}
              onSelectTechnique={handleSelect}
            />
          );
        })}
      </div>
    </>
  );
}
