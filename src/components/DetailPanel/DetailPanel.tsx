import { useCallback, useEffect, useMemo, useRef } from "react";
import type { DataStore, KqlMapping } from "@/types";
import { useAppContext } from "@/context/AppContext";
import { TechniqueHeader } from "./TechniqueHeader";
import { KqlCard, SEVERITY_ORDER } from "./KqlCard";

export interface DetailPanelProps {
  dataStore: DataStore;
}

function sortMappingsBySeverity(mappings: KqlMapping[]): KqlMapping[] {
  return [...mappings].sort((a, b) => {
    const ai = SEVERITY_ORDER.indexOf(a.severity);
    const bi = SEVERITY_ORDER.indexOf(b.severity);
    return ai - bi;
  });
}

export function DetailPanel({ dataStore }: DetailPanelProps): JSX.Element {
  const { state, selectTechnique } = useAppContext();
  const selectedId = state.selectedTechniqueId;

  const technique = useMemo(() => {
    if (!selectedId) return null;
    return dataStore.techniques.get(selectedId) ?? null;
  }, [dataStore.techniques, selectedId]);

  const mappings = useMemo(() => {
    if (!selectedId) return [];
    const list = dataStore.mappingsByTechnique.get(selectedId) ?? [];
    return sortMappingsBySeverity(list);
  }, [dataStore.mappingsByTechnique, selectedId]);

  const subtechniqueIds = useMemo(() => {
    if (!selectedId) return [];
    return dataStore.subtechniquesByParent.get(selectedId) ?? [];
  }, [dataStore.subtechniquesByParent, selectedId]);

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    selectTechnique(null);
  }, [selectTechnique]);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, [selectedId]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") selectTechnique(null);
    },
    [selectTechnique]
  );

  useEffect(() => {
    if (!selectedId) return;
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedId, handleEscape]);

  if (!selectedId) return <></>;

  if (!technique) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-gray-500">
        Technique not found.
      </div>
    );
  }

  return (
    <aside
      className="flex h-full w-full flex-col overflow-y-auto bg-surface-elevated p-4 md:w-[480px] md:min-w-[480px]"
      role="dialog"
      aria-labelledby="detail-panel-title"
      aria-modal="true"
    >
      <div id="detail-panel-title" className="sr-only">
        {technique.id} {technique.name}
      </div>
      <TechniqueHeader technique={technique} onClose={handleClose} closeButtonRef={closeButtonRef} />
      <p className="mt-3 text-sm text-gray-400">{technique.description}</p>
      {subtechniqueIds.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase text-gray-500">Sub-techniques</h3>
          <ul className="mt-1 space-y-1">
            {subtechniqueIds.map((id) => {
              const sub = dataStore.techniques.get(id);
              if (!sub) return null;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => selectTechnique(id)}
                    className="text-left text-sm text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sub.id} — {sub.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase text-gray-500">KQL Mappings</h3>
        {mappings.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-white/10 bg-surface-overlay/50 p-4 text-center text-sm text-gray-500">
            <p>No detections yet — contribute one!</p>
            <a
              href="https://github.com/your-org/mitre-kql-explorer/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-blue-400 hover:underline"
            >
              CONTRIBUTING.md
            </a>
          </div>
        ) : (
          <div className="mt-2 space-y-4">
            {mappings.map((m) => (
              <KqlCard key={m.mapping_id} mapping={m} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
