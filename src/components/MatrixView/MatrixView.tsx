import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DataStore, MitreTactic } from "@/core/models";
import { useFilteredData } from "@/hooks/useFilteredData";
import { useAppContext } from "@/context/useAppContext";
import { useMatrixTilt } from "@/hooks/useMatrixTilt";
import { useDragScroll } from "@/hooks/useDragScroll";
import { useSearchAnalytics } from "@/hooks/useSearchAnalytics";
import { TacticColumn } from "./TacticColumn";

export interface MatrixViewProps {
  dataStore: DataStore;
}

export function MatrixView({ dataStore }: MatrixViewProps) {
  const { techniquesByTactic, techniqueMatchesFilter } = useFilteredData(dataStore);
  const { state } = useAppContext();
  const selectedTechniqueId = state.selectedTechniqueId;
  const navigate = useNavigate();

  const filteredCount = useMemo(() => {
    let count = 0;
    for (const [, techniques] of techniquesByTactic) {
      for (const t of techniques) {
        if (techniqueMatchesFilter(t.id)) count++;
      }
    }
    return count;
  }, [techniquesByTactic, techniqueMatchesFilter]);

  useSearchAnalytics(state.filters.searchQuery, filteredCount);

  const [mobileTactic, setMobileTactic] = useState<MitreTactic | "">(
    dataStore.tactics[0] ?? ""
  );

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const topScrollRef = useRef<HTMLDivElement | null>(null);
  const [showRightFade, setShowRightFade] = useState(false);
  const [matrixScrollWidth, setMatrixScrollWidth] = useState(0);
  const {
    handleMouseMove: handleTiltMouseMove,
    handleMouseLeave: handleTiltMouseLeave,
  } = useMatrixTilt({ containerRef: scrollRef });
  useDragScroll(scrollRef);

  useEffect(() => {
    const matrix = scrollRef.current;
    const top = topScrollRef.current;
    if (!matrix) return;

    function syncFromMatrix() {
      if (!matrix) return;
      if (top && top.scrollLeft !== matrix.scrollLeft) {
        top.scrollLeft = matrix.scrollLeft;
      }
      const canScrollRight = matrix.scrollWidth - matrix.scrollLeft - matrix.clientWidth > 2;
      setShowRightFade(canScrollRight);
    }

    function syncFromTop() {
      if (!matrix || !top) return;
      if (matrix.scrollLeft !== top.scrollLeft) {
        matrix.scrollLeft = top.scrollLeft;
      }
    }

    function updateWidth() {
      if (!matrix) return;
      setMatrixScrollWidth(matrix.scrollWidth);
      syncFromMatrix();
    }

    updateWidth();
    matrix.addEventListener("scroll", syncFromMatrix, { passive: true });
    top?.addEventListener("scroll", syncFromTop, { passive: true });
    const observer = new ResizeObserver(updateWidth);
    observer.observe(matrix);

    return () => {
      matrix.removeEventListener("scroll", syncFromMatrix);
      top?.removeEventListener("scroll", syncFromTop);
      observer.disconnect();
    };
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      navigate(`/technique/${id}`);
    },
    [navigate]
  );

  const tactics = dataStore.tactics;
  const firstTactic = tactics[0];
  const effectiveTactic = (mobileTactic || firstTactic) as MitreTactic | undefined;

  if (!effectiveTactic) {
    return <div className="p-4 text-gray-500">No tactics available.</div>;
  }

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
          onChange={(e) => {
            setMobileTactic(e.target.value as MitreTactic);
          }}
          className="mb-2 w-full rounded border border-white/10 bg-surface-overlay px-3 py-2 text-sm text-gray-200 focus:border-cyan-500 focus:outline-none"
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

      {/* Desktop / tablet: full scrollable matrix with fade hint */}
      <div className="relative hidden h-full md:flex md:flex-col">
        {/* Sticky synced scrollbar above the matrix so users don't have to
            look at the bottom of the area to scroll horizontally. */}
        <div
          ref={topScrollRef}
          className="overflow-x-scroll overflow-y-hidden border-b border-white/10 bg-surface-elevated"
          aria-hidden="true"
        >
          <div style={{ width: matrixScrollWidth, height: 1 }} />
        </div>
        <div
          ref={scrollRef}
          data-matrix-scroll
          className="scrollbar-hide flex min-h-0 flex-1 cursor-grab overflow-x-scroll overflow-y-hidden"
          role="grid"
          aria-label="MITRE ATT&CK matrix"
          onMouseMove={handleTiltMouseMove}
          onMouseLeave={handleTiltMouseLeave}
        >
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
        {/* Right-edge fade to hint scrollability */}
        <div
          className={`pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-surface to-transparent transition-opacity duration-200 ${
            showRightFade ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
      </div>
    </>
  );
}
