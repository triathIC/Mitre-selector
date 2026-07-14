import { NavLink } from "react-router-dom";
import type { DataStore } from "@triathic/mke-core";

export interface HeaderProps {
  dataStore?: DataStore | null;
  /** Show matrix stats — only relevant on matrix routes */
  showStats?: boolean;
}

const NAV = [
  { to: "/", label: "Scenarios", end: true },
  { to: "/matrix", label: "Matrix", end: true },
  { to: "/matrix?hasKql=true", label: "KQL Library", end: false },
] as const;

function navLinkClass({ isActive }: { isActive: boolean }): string {
  const base =
    "rounded px-2 py-1 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-scn-accent";
  return isActive
    ? `${base} bg-scn-bg-3 text-scn-text`
    : `${base} text-scn-dim hover:text-scn-text hover:bg-scn-bg-3/60`;
}

export function Header({ dataStore, showStats = false }: HeaderProps) {
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
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        {statsText && (
          <p className="ml-auto font-mono text-xs text-gray-500">{statsText}</p>
        )}
      </div>
    </header>
  );
}
