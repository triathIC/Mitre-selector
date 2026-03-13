import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DataStore, KqlMapping } from "@/types";
import { useAppContext } from "@/context/useAppContext";
import { TechniqueHeader } from "./TechniqueHeader";
import { KqlCard } from "./KqlCard";
import { CollapsibleSection } from "./CollapsibleSection";
import { SEVERITY_ORDER } from "./constants";

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

export function DetailPanel({ dataStore }: DetailPanelProps) {
  const { state, selectTechnique } = useAppContext();
  const selectedId = state.selectedTechniqueId;
  const [activeTab, setActiveTab] = useState<"detection" | "hunting">("detection");

  const technique = useMemo(() => {
    if (!selectedId) return null;
    return dataStore.techniques.get(selectedId) ?? null;
  }, [dataStore.techniques, selectedId]);

  const mappings = useMemo(() => {
    if (!selectedId) return [];
    const list = dataStore.mappingsByTechnique.get(selectedId) ?? [];
    return sortMappingsBySeverity(list);
  }, [dataStore.mappingsByTechnique, selectedId]);

  const detectionMappings = useMemo(
    () => mappings.filter((m) => m.query_type === "detection"),
    [mappings]
  );
  const huntingMappings = useMemo(
    () => mappings.filter((m) => m.query_type === "hunting"),
    [mappings]
  );

  const activeMappings = activeTab === "detection" ? detectionMappings : huntingMappings;

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

  useEffect(() => {
    if (detectionMappings.length === 0 && huntingMappings.length > 0) {
      setActiveTab("hunting");
    } else {
      setActiveTab("detection");
    }
  }, [selectedId, detectionMappings.length, huntingMappings.length]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") selectTechnique(null);
    },
    [selectTechnique]
  );

  useEffect(() => {
    if (!selectedId) return;
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
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
      className="flex h-full w-full flex-col overflow-y-auto border-l border-white/10 bg-surface-elevated md:w-[576px] md:min-w-[576px]"
      role="dialog"
      aria-labelledby="detail-panel-title"
      aria-modal="true"
    >
      <div id="detail-panel-title" className="sr-only">
        {technique.id} {technique.name}
      </div>

      {/* Compact header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-surface-elevated">
        <TechniqueHeader technique={technique} onClose={handleClose} closeButtonRef={closeButtonRef} />
      </div>

      <div className="flex flex-1 flex-col p-4">
        {/* Query section — immediately visible */}
        <div className="mb-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-200">
              {mappings.length} {mappings.length === 1 ? "Query" : "Queries"}
            </h3>
          </div>

          {mappings.length > 0 ? (
            <>
              {/* Tab toggle */}
              <div className="mt-2 flex gap-1 rounded-lg bg-surface/60 p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("detection");
                  }}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    activeTab === "detection"
                      ? "bg-surface-overlay text-gray-100 shadow-sm"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Detection ({detectionMappings.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("hunting");
                  }}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    activeTab === "hunting"
                      ? "bg-surface-overlay text-gray-100 shadow-sm"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Hunting ({huntingMappings.length})
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {activeMappings.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-500">
                    No {activeTab} queries for this technique.
                  </p>
                ) : (
                  activeMappings.map((m) => (
                    <KqlCard key={m.mapping_id} mapping={m} />
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-white/10 bg-surface-overlay/50 p-4 text-center text-sm text-gray-500">
              <p>No detections yet — contribute one!</p>
              <a
                href="https://github.com/your-org/mitre-kql-explorer/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-cyan-400 hover:underline"
              >
                CONTRIBUTING.md
              </a>
            </div>
          )}
        </div>

        {/* Collapsible metadata sections — below queries */}
        <div className="mt-4 space-y-1 border-t border-white/10 pt-4">
          <CollapsibleSection title="Description">
            <p className="text-sm leading-relaxed text-gray-400">{technique.description}</p>
          </CollapsibleSection>

          {subtechniqueIds.length > 0 && (
            <CollapsibleSection title={`Sub-techniques (${String(subtechniqueIds.length)})`}>
              <ul className="space-y-1">
                {subtechniqueIds.map((id) => {
                  const sub = dataStore.techniques.get(id);
                  if (!sub) return null;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => {
                          selectTechnique(id);
                        }}
                        className="text-left text-sm text-cyan-400 hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <span className="font-mono text-gray-400">{sub.id}</span>
                        <span className="ml-1.5">{sub.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </CollapsibleSection>
          )}

          {technique.platforms.length > 0 && (
            <CollapsibleSection title={`Platforms (${String(technique.platforms.length)})`}>
              <div className="flex flex-wrap gap-1.5">
                {technique.platforms.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center rounded border border-gray-600 px-2 py-0.5 text-xs text-gray-400"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      </div>
    </aside>
  );
}
