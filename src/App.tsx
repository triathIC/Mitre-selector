import { Outlet, useMatch, useParams } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AppProvider } from "@/context/AppContext";
import { useAppContext } from "@/context/useAppContext";
import { Header, Footer } from "@/components/Layout";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { ConsentBanner } from "@/components/ConsentBanner";

function Chrome() {
  const { state } = useAppContext();
  const matrixMatch = useMatch("/matrix");
  const techniqueMatch = useMatch("/technique/:id");
  const showStats = Boolean(matrixMatch || techniqueMatch);

  return (
    <div className="flex min-h-screen flex-col bg-surface text-gray-200">
      <Header dataStore={state.dataStore} showStats={showStats} />
      <Outlet />
      <Footer />
    </div>
  );
}

function RootLayout() {
  const params = useParams<{ id: string }>();
  return (
    <AppProvider initialSelectedTechniqueId={params.id ?? null}>
      <Chrome />
      <Analytics />
      <SpeedInsights />
      <GoogleAnalytics />
      <ConsentBanner />
    </AppProvider>
  );
}

export default RootLayout;
