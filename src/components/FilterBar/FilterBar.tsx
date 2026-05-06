import { useCallback, useEffect, useState } from "react";
import type { KqlMapping, Platform } from "@/core/models";
import { useAppContext } from "@/context/useAppContext";
import { Button } from "@/components/ui";
import { DEBOUNCE_MS } from "@/core/constants";

const PLATFORMS: Array<Platform | "all"> = [
  "all",
  "Windows",
  "Linux",
  "macOS",
  "Azure AD",
  "Office 365",
  "Google Workspace",
  "SaaS",
  "IaaS",
  "Network",
  "Containers",
];

const PRODUCTS: Array<KqlMapping["product"] | "all"> = [
  "all",
  "Microsoft Sentinel",
  "Defender XDR",
];

const SEVERITIES: Array<KqlMapping["severity"] | "all"> = [
  "all",
  "critical",
  "high",
  "medium",
  "low",
  "informational",
];

export function FilterBar() {
  const { state, setFilter, resetFilters, hasActiveFilters } = useAppContext();
  const [localSearch, setLocalSearch] = useState(state.filters.searchQuery);

  useEffect(() => {
    setLocalSearch(state.filters.searchQuery);
  }, [state.filters.searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => {
      setFilter({ searchQuery: localSearch });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(t);
    };
  }, [localSearch, setFilter]);

  const handlePlatformChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilter({ platform: e.target.value as Platform | "all" });
    },
    [setFilter]
  );

  const handleProductChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilter({ product: e.target.value as KqlMapping["product"] | "all" });
    },
    [setFilter]
  );

  const handleSeverityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilter({ severity: e.target.value as KqlMapping["severity"] | "all" });
    },
    [setFilter]
  );

  const handleShowOnlyWithKql = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter({ showOnlyWithKql: e.target.checked });
    },
    [setFilter]
  );

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-surface-elevated px-4 py-3">
      <label className="sr-only" htmlFor="filter-platform">
        Platform
      </label>
      <select
        id="filter-platform"
        value={state.filters.platform}
        onChange={handlePlatformChange}
        className="rounded border border-white/10 bg-surface-overlay px-2 py-1.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label="Filter by platform"
      >
        {PLATFORMS.map((p) => (
          <option key={p} value={p}>
            {p === "all" ? "All platforms" : p}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="filter-product">
        Product
      </label>
      <select
        id="filter-product"
        value={state.filters.product}
        onChange={handleProductChange}
        className="rounded border border-white/10 bg-surface-overlay px-2 py-1.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label="Filter by product"
      >
        {PRODUCTS.map((p) => (
          <option key={p} value={p}>
            {p === "all" ? "All products" : p}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="filter-severity">
        Severity
      </label>
      <select
        id="filter-severity"
        value={state.filters.severity}
        onChange={handleSeverityChange}
        className="rounded border border-white/10 bg-surface-overlay px-2 py-1.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label="Filter by severity"
      >
        {SEVERITIES.map((s) => (
          <option key={s} value={s}>
            {s === "all" ? "All severities" : s}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="filter-search">
        Search techniques and KQL
      </label>
      <input
        id="filter-search"
        type="search"
        value={localSearch}
        onChange={(e) => {
          setLocalSearch(e.target.value);
        }}
        placeholder="Search…"
        className="min-w-[160px] rounded border border-white/10 bg-surface-overlay px-2 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label="Search techniques and KQL mappings"
      />

      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
        <input
          type="checkbox"
          checked={state.filters.showOnlyWithKql}
          onChange={handleShowOnlyWithKql}
          className="rounded border-white/20 focus:ring-blue-500"
          aria-label="Show only techniques with KQL"
        />
        Has KQL
      </label>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Reset filters
        </Button>
      )}
    </div>
  );
}
