import { memo, useCallback, useState } from "react";
import type { MitreTechnique } from "@/types";

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
}: TechniqueCellProps) {
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

  const borderClass =
    mappingCount === 0
      ? "border-l-transparent bg-gray-800/40"
      : mappingCount >= 3
        ? "border-l-cyan-400 bg-gray-800/80"
        : "border-l-cyan-600 bg-gray-800/60";

  const textClass = mappingCount === 0 ? "text-gray-500" : "text-gray-300";
  const dimmedClass = isDimmed ? "opacity-40" : "";
  const selectedClass = isSelected
    ? "ring-2 ring-cyan-400 !bg-cyan-950"
    : "";
  const hoverClass = isSelected
    ? ""
    : mappingCount === 0
      ? "hover:bg-gray-700/50 hover:text-gray-400 hover:shadow-sm hover:shadow-gray-700/50"
      : mappingCount >= 3
        ? "hover:bg-gray-700/90 hover:border-l-cyan-300 hover:shadow-md hover:shadow-cyan-800/40"
        : "hover:bg-gray-700/70 hover:border-l-cyan-400 hover:shadow-md hover:shadow-cyan-900/30";
  const scaleClass = isSelected ? "hover:scale-100" : "hover:scale-105 hover:z-10";

  return (
    <div className="contain-layout contain-paint">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        title={`${technique.id} ${technique.name}`}
        className={`relative mb-1 flex cursor-pointer items-start gap-1 rounded border border-white/5 border-l-[3px] px-2 py-1.5 text-left text-xs transition-transform duration-150 ease-out ${borderClass} ${dimmedClass} ${selectedClass} ${hoverClass} ${scaleClass} focus:outline-none focus:ring-2 focus:ring-cyan-400`}
        aria-label={`${technique.id} ${technique.name}${mappingCount > 0 ? `, ${String(mappingCount)} KQL mapping(s)` : ""}`}
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
          <div className={`font-mono text-[11px] font-medium ${isSelected ? "text-cyan-400" : "text-gray-400"}`}>
            {technique.id}
          </div>
          <div className={`mt-0.5 line-clamp-2 leading-tight ${textClass}`}>
            {technique.name}
          </div>
        </div>
        {mappingCount >= 3 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded bg-cyan-400/20 px-1 font-mono text-[10px] font-semibold text-cyan-300">
            {mappingCount}
          </span>
        )}
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
