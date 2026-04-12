import { Component, lazy, Suspense } from "react";
import { AppProvider } from "@/context/AppContext";
import { useAppContext } from "@/context/useAppContext";
import { useDataLoader } from "@/hooks/useDataLoader";
import { Header, Footer } from "@/components/Layout";
import { FilterBar } from "@/components/FilterBar";
import { MatrixView } from "@/components/MatrixView";

const DetailPanel = lazy(() =>
  import("@/components/DetailPanel").then((m) => ({ default: m.DetailPanel }))
);

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded border border-red-500/50 bg-red-500/10 p-4 text-red-400 text-sm">
            Something went wrong.
          </div>
        )
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  useDataLoader();
  const { state } = useAppContext();

  if (state.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-gray-400">Loading MITRE ATT&CK data…</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="max-w-md text-center text-red-400">
          <p className="font-medium">Failed to load data</p>
          <p className="mt-2 text-sm">{state.error}</p>
        </div>
      </div>
    );
  }

  if (!state.dataStore) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="max-w-md text-center text-red-400">
          <p className="font-medium">App state is invalid</p>
          <p className="mt-2 text-sm">Data store is missing after load completed.</p>
        </div>
      </div>
    );
  }

  const dataStore = state.dataStore;

  return (
    <div className="flex min-h-screen flex-col bg-surface text-gray-200">
      <Header dataStore={dataStore} />
      <FilterBar />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto">
          <ErrorBoundary>
            <MatrixView dataStore={dataStore} />
          </ErrorBoundary>
        </main>
        {state.selectedTechniqueId && (
          <ErrorBoundary fallback={<div className="p-4 text-red-400">Detail panel error.</div>}>
            <Suspense
              fallback={
                <div className="flex w-[576px] items-center justify-center border-l border-white/10 bg-surface-elevated text-gray-500">
                  Loading…
                </div>
              }
            >
              <DetailPanel dataStore={dataStore} />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
