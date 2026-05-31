import type { KillChainStep } from "@/types/scenario";
import { useAppContext } from "@/context/useAppContext";
import { MaturityBadge } from "./MaturityBadge";
import { findMappingByKqlId } from "./utils";

export interface StepCardProps {
  step: KillChainStep;
  isLast: boolean;
}

export function StepCard({ step, isLast }: StepCardProps) {
  const { state } = useAppContext();
  const mapping = findMappingByKqlId(state.dataStore, step.detection.kqlId);
  const kqlText =
    mapping?.kql ?? step.detection.kqlDraft.join("\n");

  return (
    <li className="relative flex gap-5 pb-8 last:pb-0">
      {/* timeline rail */}
      <div className="relative flex flex-col items-center" aria-hidden="true">
        <div className="z-10 mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-scn-border-2 bg-scn-bg-3 font-mono text-[11px] text-scn-dim">
          {step.order}
        </div>
        {!isLast && (
          <div className="absolute top-7 bottom-0 w-px bg-scn-border" />
        )}
      </div>

      <article className="flex-1 rounded-[12px] border border-scn-border bg-scn-bg-2 p-4 md:p-5">
        <header className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-[11px] text-scn-faint">
            {step.relTime}
          </span>
          <span
            className="rounded border px-2 py-0.5 font-mono text-[11px]"
            style={{
              color: "var(--tactic)",
              borderColor: "var(--tactic)",
              backgroundColor: "rgba(217,164,65,0.06)",
            }}
          >
            {step.tactic}
          </span>
          <span className="font-display text-sm font-semibold text-scn-text">
            <span className="font-mono text-scn-dim">{step.technique.id}</span>{" "}
            {step.technique.name}
          </span>
        </header>

        {step.technique.secondary && step.technique.secondary.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-scn-faint">
              also
            </span>
            {step.technique.secondary.map((t) => (
              <span
                key={t.id}
                className="rounded border border-scn-border bg-scn-bg-3 px-1.5 py-0.5 font-mono text-[11px] text-scn-dim"
                title={t.name}
              >
                {t.id}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm leading-relaxed text-scn-dim">
          {step.whatHappened}
        </p>

        <section className="mt-4 rounded-[10px] border border-scn-border bg-scn-bg-3 p-3 md:p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {step.detection.tables.map((t) => (
                <span
                  key={t}
                  className="rounded border border-scn-border-2 bg-scn-raised px-1.5 py-0.5 font-mono text-[11px] text-scn-text"
                >
                  {t}
                </span>
              ))}
            </div>
            <MaturityBadge level={step.detection.maturity} size="sm" />
          </div>

          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] text-scn-faint">
            <span>kqlId</span>
            <span className="text-scn-dim">{step.detection.kqlId}</span>
            {!mapping && (
              <span className="rounded border border-scn-border bg-scn-bg-2 px-1.5 py-0.5 text-scn-faint">
                draft
              </span>
            )}
          </div>

          <pre className="overflow-x-auto rounded border border-scn-border bg-scn-bg p-3 font-mono text-[12px] leading-relaxed text-scn-text">
            <code>{kqlText}</code>
          </pre>

          <p className="mt-3 text-[12px] leading-relaxed text-scn-dim">
            <span className="font-semibold text-scn-text">FP / FN:</span>{" "}
            {step.detection.fpNotes}
          </p>
        </section>
      </article>
    </li>
  );
}
