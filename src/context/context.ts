import { createContext } from "react";
import type { AppAction, AppState, FilterState } from "@/core/models";

export type AppContextValue = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  selectTechnique: (id: string | null) => void;
  setFilter: (payload: Partial<FilterState>) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
};

export const AppContext = createContext<AppContextValue | null>(null);
