import { memo, useCallback, useState } from "react";
import type { MitreTechnique } from "@/types";
import { MAPPING_INTENSITY } from "@/utils/constants";

export interface TechniqueCellProps {
  technique: MitreTechnique;
  mappingCount: number;
  selectedTechniqueId: string | null;
  isDimmed: boolean;
  onSelect: (id: string) => void;
  childIds: string[];
  getTechnique: (id: string) => MitreTechnique | undefined;
  getMappingCount: (id: string) => number;
  techniqueMatchesFilter: (id: string) => boolean;
}

function TechniqueCellComponent({
  technique,
  mappingCount,
  selectedTechniqueId,
  isDimmed,
  onSelect,
  childIds,
  getTechnique,
  getMappingCount,
  techniqueMatchesFilter,
}: TechniqueCellProps): JSX.Element {
  const isSelected = selectedTechniqueId === technique.id;
  const [expanded, setExpanded] = useState(false);
  const hasChildren = childIds.length > 0;

  const handleClick = useCallback(() => {
    onSelect(technique.id);
  }, [technique.id, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(technique.id);
      }
    },
    [technique.id, onSelect]
  );

  const intensityClass =
    mappingCount === 0
      ? MAPPING_INTENSITY.NONE
      : mappingCount >= 3
        ? MAPPING_INTENSITY.STRONG
        : MAPPING_INTENSITY.LIGHT;

  const dimmedClass = isDimmed ? "opacity-40" : "";
  const selectedClass = isSelected
    ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-surface"
    : "";

  return (
    <div className="contain-layout contain-paint">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`mb-1 flex cursor-pointer items-start gap-1 rounded border px-2 py-1.5 text-left text-xs transition ${intensityClass} ${dimmedClass} ${selectedClass} hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-surface`}
        aria-label={`${technique.id} ${technique.name}${mappingCount > 0 ? `, ${mappingCount} KQL mapping(s)` : ""}`}
        aria-pressed={isSelected}
      >
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="shrink-0 p-0.5 text-gray-500 hover:text-gray-300 focus:outline-none"
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse sub-techniques" : "Expand sub-techniques"}
          >
            <span className="inline-block w-3 transition-transform" style={{ transform: expanded ? "rotate(90deg)" : "none" }}>
              ▶
            </span>
          </button>
        )}
        <div className="min-w-0 flex-1">
          <span className="font-mono font-medium text-gray-300">{technique.id}</span>
          <span className="ml-1 truncate text-gray-500">{technique.name}</span>
          {mappingCount > 0 && (
            <span className="ml-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden />
          )}
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="ml-3 mt-0.5 border-l border-white/10 pl-2">
          {childIds.map((id) => {
            const child = getTechnique(id);
            if (!child) return null;
            const childMappings = getMappingCount(id);
            const childDimmed = !techniqueMatchesFilter(id);
            return (
              <TechniqueCellComponent
                key={id}
                technique={child}
                mappingCount={childMappings}
                selectedTechniqueId={selectedTechniqueId}
                isDimmed={childDimmed}
                onSelect={onSelect}
                childIds={[]}
                getTechnique={getTechnique}
                getMappingCount={getMappingCount}
                techniqueMatchesFilter={techniqueMatchesFilter}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export const TechniqueCell = memo(TechniqueCellComponent);
