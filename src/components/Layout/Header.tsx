import { Link, useLocation } from "react-router-dom";
import type { DataStore } from "@triathic/mke-core";

export interface HeaderProps {
  dataStore?: DataStore | null;
  /** Show matrix stats — only relevant on matrix routes */
  showStats?: boolean;
}

const NAV = [
  { to: "/", label: "Scenarios" },
  { to: "/matrix", label: "Matrix" },
  { to: "/matrix?hasKql=true", label: "KQL Library" },
] as const;

function navLinkClass(isActive: boolean): string {
  const base =
    "rounded px-2 py-1 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-scn-accent";
  return isActive
    ? `${base} bg-scn-bg-3 text-scn-text`
    : `${base} text-scn-dim hover:text-scn-text hover:bg-scn-bg-3/60`;
}

export function Header({ dataStore, showStats = false }: HeaderProps) {
  // "KQL Library" is not its own route — it is /matrix?hasKql=true, so it
  // shares a pathname with "Matrix". NavLink matches on pathname only, which
  // would highlight both at once; discriminate on the query string instead so
  // exactly one nav item is active at any time.
  const location = useLocation();
  const hasKqlFilter =
    new URLSearchParams(location.search).get("hasKql") === "true";

  function isNavActive(to: string): boolean {
    if (to === "/matrix") {
      return location.pathname === "/matrix" && !hasKqlFilter;
    }
    if (to === "/matrix?hasKql=true") {
      return location.pathname === "/matrix" && hasKqlFilter;
    }
    return location.pathname === to;
  }

  let statsText = "";
  if (showStats && dataStore) {
    const techniqueCount = dataStore.techniques.size;
    let totalMappings = 0;
    let techniquesWithDetections = 0;
    for (const [, mappings] of dataStore.mappingsByTechnique) {
      totalMappings += mappings.length;
      if (mappings.length > 0) techniquesWithDetections++;
    }
    statsText = `${String(techniqueCount)} techniques · ${String(totalMappings)} KQL queries · ${String(techniquesWithDetections)} with detections`;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-14 max-w-full items-center gap-6 px-4">
        <h1 className="font-display text-lg font-semibold text-gray-100">
          MITRE ATT&CK KQL Explorer
        </h1>
        <nav aria-label="Primary" className="flex items-center gap-1">
          {NAV.map((item) => {
            const isActive = isNavActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                className={navLinkClass(isActive)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {statsText && (
          <p className="ml-auto font-mono text-xs text-gray-500">{statsText}</p>
        )}
      </div>
    </header>
  );
}
