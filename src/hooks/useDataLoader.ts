import { useEffect } from "react";
import type { KqlMapping, MitreTechnique } from "@/types";
import { buildDataStore } from "@/utils/dataTransform";
import { useAppContext } from "@/context/AppContext";

const BASE = import.meta.env.BASE_URL;
const MITRE_JSON = `${BASE}data/mitre_techniques.json`;
const KQL_JSON = `${BASE}data/kql_mappings.json`;

/**
 * Fetches both JSON data sources in parallel, builds DataStore, and dispatches to context.
 * Call once at app root (e.g. App.tsx) on mount.
 */
export function useDataLoader(): void {
  const { dispatch } = useAppContext();

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        const [mitreRes, kqlRes] = await Promise.all([
          fetch(MITRE_JSON),
          fetch(KQL_JSON),
        ]);

        if (!mitreRes.ok) {
          throw new Error(`Failed to load MITRE data: ${mitreRes.status}`);
        }
        if (!kqlRes.ok) {
          throw new Error(`Failed to load KQL mappings: ${kqlRes.status}`);
        }

        const [mitreJson, kqlJson] = await Promise.all([
          mitreRes.json(),
          kqlRes.json(),
        ]);

        if (cancelled) return;

        const techniques = mitreJson as MitreTechnique[];
        const mappings = kqlJson as KqlMapping[];

        if (!Array.isArray(techniques) || !Array.isArray(mappings)) {
          throw new Error("Invalid data shape: expected arrays");
        }

        const dataStore = buildDataStore(techniques, mappings);
        dispatch({ type: "DATA_LOADED", payload: dataStore });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Unknown error loading data";
        dispatch({ type: "DATA_ERROR", payload: message });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}
