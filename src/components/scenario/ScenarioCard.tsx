import { Link } from "react-router-dom";
import type { Scenario } from "@/types/scenario";
import { MaturityBadge } from "./MaturityBadge";

export interface ScenarioCardProps {
  scenario: Scenario;
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  return (
    <Link
      to={`/scenario/${scenario.id}`}
      className="group relative flex flex-col gap-4 rounded-[14px] border border-scn-border bg-scn-bg-2 p-5 transition hover:border-scn-border-2 hover:bg-scn-bg-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-scn-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-scn-text group-hover:text-white">
          {scenario.title}
        </h3>
        <MaturityBadge level={scenario.maturityOverall} size="sm" />
      </div>

      <p className="line-clamp-3 text-sm leading-relaxed text-scn-dim">
        {scenario.summary}
      </p>

      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-scn-faint">
        <span className="rounded border border-scn-border bg-scn-bg-3 px-2 py-0.5 text-scn-dim">
          {scenario.threat}
        </span>
        <span className="rounded border border-scn-border bg-scn-bg-3 px-2 py-0.5 text-scn-dim">
          {scenario.dwellTime}
        </span>
        <span className="rounded border border-scn-border bg-scn-bg-3 px-2 py-0.5 text-scn-dim">
          {scenario.steps.length} steps
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-scn-border pt-3 text-[11px] text-scn-faint">
        <span className="font-mono">
          {scenario.source.name}
          {scenario.source.case ? ` ${scenario.source.case}` : ""}
        </span>
        <span className="font-mono text-scn-dim">{scenario.stack.join(" · ")}</span>
      </div>
    </Link>
  );
}
