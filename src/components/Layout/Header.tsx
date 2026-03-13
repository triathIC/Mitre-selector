import type { DataStore } from "@/types";

export interface HeaderProps {
  dataStore?: DataStore | null;
}

export function Header({ dataStore }: HeaderProps): JSX.Element {
  let statsText = "";
  if (dataStore) {
    const techniqueCount = dataStore.techniques.size;
    let totalMappings = 0;
    let techniquesWithDetections = 0;
    for (const [, mappings] of dataStore.mappingsByTechnique) {
      totalMappings += mappings.length;
      if (mappings.length > 0) techniquesWithDetections++;
    }
    statsText = `${techniqueCount} techniques · ${totalMappings} KQL queries · ${techniquesWithDetections} with detections`;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-14 max-w-full items-center justify-between px-4">
        <h1 className="text-lg font-semibold text-gray-100">
          MITRE ATT&CK KQL Explorer
        </h1>
        {statsText && (
          <p className="font-mono text-xs text-gray-500">{statsText}</p>
        )}
      </div>
    </header>
  );
}
