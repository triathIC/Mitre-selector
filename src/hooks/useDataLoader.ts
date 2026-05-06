import { useEffect } from "react";
import { loadDataStore } from "@/core/utils/loadDataStore";
import { useAppContext } from "@/context/useAppContext";

const BASE = import.meta.env.BASE_URL;
const TECHNIQUES_URL = `${BASE}data/mitre_techniques.json`;
const MAPPINGS_URL = `${BASE}data/kql_mappings.json`;

/**
 * Loads MITRE + KQL data once on mount and dispatches the resulting DataStore
 * (or error) into the AppContext. Thin React wrapper around the framework-free
 * `loadDataStore` core function.
 */
export function useDataLoader(): void {
  const { dispatch } = useAppContext();

  useEffect(() => {
    let cancelled = false;

    loadDataStore({ techniquesUrl: TECHNIQUES_URL, mappingsUrl: MAPPINGS_URL })
      .then((dataStore) => {
        if (cancelled) return;
        dispatch({ type: "DATA_LOADED", payload: dataStore });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Unknown error loading data";
        dispatch({ type: "DATA_ERROR", payload: message });
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}
