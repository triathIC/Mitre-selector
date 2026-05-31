import type { Scenario } from "@/types/scenario";

const modules = import.meta.glob<{ default: Scenario }>("./*.json", {
  eager: true,
});

export const scenarios: Scenario[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.title.localeCompare(b.title));

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
