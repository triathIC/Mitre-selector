import type { RouteRecord } from "vite-react-ssg";
import Layout from "@/App";

export const routes: RouteRecord[] = [
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: null },
      {
        path: "technique/:id",
        element: null,
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
