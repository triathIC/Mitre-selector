import { useContext } from "react";
import { AppContext, type AppContextValue } from "@/context/context";

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (ctx === null) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return ctx;
}
