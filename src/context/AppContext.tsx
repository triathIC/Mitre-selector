import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { AppAction, AppState, FilterState } from "@/types";

const initialFilters: FilterState = {
  platform: "all",
  product: "all",
  severity: "all",
  searchQuery: "",
  showOnlyWithKql: false,
};

const initialState: AppState = {
  dataStore: null,
  isLoading: true,
  error: null,
  selectedTechniqueId: null,
  filters: initialFilters,
};

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

type AppContextValue = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  selectTechnique: (id: string | null) => void;
  setFilter: (payload: Partial<FilterState>) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(appReducer, initialState);

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

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (ctx === null) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return ctx;
}
