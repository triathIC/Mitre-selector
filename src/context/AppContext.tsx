import {
  useCallback,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  AppAction,
  AppState,
  FilterState,
  KqlMapping,
  MitreTechnique,
} from "@/core/models";
import { buildDataStore } from "@/core/utils/dataTransform";
import { AppContext, type AppContextValue } from "@/context/context";
import techniquesRaw from "../../public/data/mitre_techniques.json";
import mappingsRaw from "../../public/data/kql_mappings.json";

const STATIC_DATA_STORE = buildDataStore(
  techniquesRaw as MitreTechnique[],
  mappingsRaw as KqlMapping[]
);

const initialFilters: FilterState = {
  platform: "all",
  product: "all",
  severity: "all",
  searchQuery: "",
  showOnlyWithKql: false,
};

function makeInitialState(initialSelectedTechniqueId: string | null): AppState {
  return {
    dataStore: STATIC_DATA_STORE,
    isLoading: false,
    error: null,
    selectedTechniqueId: initialSelectedTechniqueId,
    filters: initialFilters,
  };
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "DATA_LOADED":
      return {
        ...state,
        dataStore: action.payload,
        isLoading: false,
        error: null,
      };
    case "DATA_ERROR":
      return {
        ...state,
        dataStore: null,
        isLoading: false,
        error: action.payload,
      };
    case "SELECT_TECHNIQUE":
      return { ...state, selectedTechniqueId: action.payload };
    case "SET_FILTER":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case "RESET_FILTERS":
      return { ...state, filters: initialFilters };
    default:
      return state;
  }
}

export interface AppProviderProps {
  children: ReactNode;
  /** Pre-set the selected technique (e.g. from URL param) so SSR + first paint match. */
  initialSelectedTechniqueId?: string | null;
}

export function AppProvider({
  children,
  initialSelectedTechniqueId = null,
}: AppProviderProps) {
  const [state, dispatch] = useReducer(
    appReducer,
    initialSelectedTechniqueId,
    makeInitialState
  );

  const selectTechnique = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_TECHNIQUE", payload: id });
  }, []);

  const setFilter = useCallback((payload: Partial<FilterState>) => {
    dispatch({ type: "SET_FILTER", payload });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const hasActiveFilters = useMemo(() => {
    const f = state.filters;
    return (
      f.platform !== "all" ||
      f.product !== "all" ||
      f.severity !== "all" ||
      f.searchQuery.trim() !== "" ||
      f.showOnlyWithKql
    );
  }, [state.filters]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      dispatch,
      selectTechnique,
      setFilter,
      resetFilters,
      hasActiveFilters,
    }),
    [state, selectTechnique, setFilter, resetFilters, hasActiveFilters]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
