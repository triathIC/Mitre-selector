import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DataStore, MitreTactic } from "@/core/models";
import { useFilteredData } from "@/hooks/useFilteredData";
import { useAppContext } from "@/context/useAppContext";
import { useMatrixTilt } from "@/hooks/useMatrixTilt";
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
  const [showRightFade, setShowRightFade] = useState(false);
  const {
    handleMouseMove: handleTiltMouseMove,
    handleMouseLeave: handleTiltMouseLeave,
  } = useMatrixTilt({ containerRef: scrollRef });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function checkScroll() {
      if (!el) return;
      const canScrollRight = el.scrollWidth - el.scrollLeft - el.clientWidth > 2;
      setShowRightFade(canScrollRight);
    }

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", checkScroll);
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
      <div className="relative hidden md:block">
        <div
          ref={scrollRef}
          data-matrix-scroll
          className="flex overflow-x-auto overflow-y-hidden"
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
