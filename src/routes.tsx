import type { RouteRecord } from "vite-react-ssg";
import Layout from "@/App";
import ScenarioLibraryPage from "@/pages/ScenarioLibraryPage";
import ScenarioDetailPage from "@/pages/ScenarioDetailPage";
import MatrixPage from "@/pages/MatrixPage";

export const routes: RouteRecord[] = [
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: ScenarioLibraryPage },
      {
        path: "scenario/:scenarioId",
        Component: ScenarioDetailPage,
        getStaticPaths: async () => {
          if (typeof window !== "undefined") return [];
          const fs = await import("node:fs");
          const path = await import("node:path");
          const dir = path.resolve(process.cwd(), "src/data/scenarios");
          const files = fs
            .readdirSync(dir)
            .filter((f) => f.endsWith(".json"));
          const ids: string[] = [];
          for (const file of files) {
            const raw = fs.readFileSync(path.resolve(dir, file), "utf-8");
            const data = JSON.parse(raw) as { id?: string };
            if (typeof data.id === "string" && data.id.length > 0) {
              ids.push(data.id);
            }
          }
          return ids.map((id) => `scenario/${id}`);
        },
      },
      { path: "matrix", Component: MatrixPage },
      {
        path: "technique/:id",
        Component: MatrixPage,
        getStaticPaths: async () => {
          if (typeof window !== "undefined") return [];
          const fs = await import("node:fs");
          const path = await import("node:path");
          const file = path.resolve(
            process.cwd(),
            "public/data/mitre_techniques.json"
          );
          const data = JSON.parse(fs.readFileSync(file, "utf-8")) as Array<{
            id: string;
          }>;
          return data.map((t) => `technique/${t.id}`);
        },
      },
    ],
  },
];
