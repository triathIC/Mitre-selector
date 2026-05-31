import { Head } from "vite-react-ssg";
import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { getScenario } from "@/data/scenarios";
import { useAppContext } from "@/context/useAppContext";
import {
  CorrelationBlock,
  MaturityBadge,
  StepCard,
} from "@/components/scenario";
import { techniqueName } from "@/components/scenario/utils";

function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center md:px-6">
      <h1 className="font-display text-2xl font-semibold text-scn-text">
        Scenario not found
      </h1>
      <p className="mt-3 text-sm text-scn-dim">
        The scenario you requested does not exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded border border-scn-border bg-scn-bg-2 px-3 py-1.5 text-sm text-scn-text hover:bg-scn-bg-3"
      >
        ← Back to scenarios
      </Link>
    </main>
  );
}

export default function ScenarioDetailPage() {
  const params = useParams<{ scenarioId: string }>();
  const id = params.scenarioId ?? "";
  const scenario = getScenario(id);
  const { state } = useAppContext();

  const sortedSteps = useMemo(
    () =>
      scenario
        ? [...scenario.steps].sort((a, b) => a.order - b.order)
        : [],
    [scenario]
  );

  if (!scenario) {
    return <NotFound />;
  }

  const sourceLabel = [
    scenario.source.report,
    scenario.source.case,
    scenario.source.published,
  ]
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .join(" · ");

  return (
    <>
      <Head>
        <title>{scenario.title} – Scenario | MITRE ATT&CK KQL Explorer</title>
        <meta name="description" content={scenario.summary.slice(0, 155)} />
      </Head>

      <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6 md:py-10">
        <nav className="mb-6 text-[12px]">
          <Link to="/" className="text-scn-dim hover:text-scn-text">
            ← Scenarios
          </Link>
        </nav>

        {/* 1. Header */}
        <header
          className="scn-reveal mb-8"
          style={{ animationDelay: "0ms" }}
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <MaturityBadge level={scenario.maturityOverall} size="md" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-scn-text md:text-3xl">
            {scenario.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="rounded border border-scn-border bg-scn-bg-3 px-2 py-0.5 text-scn-dim">
              {scenario.threat}
            </span>
            <span className="rounded border border-scn-border bg-scn-bg-3 px-2 py-0.5 text-scn-dim">
              {scenario.dwellTime}
            </span>
            <span className="rounded border border-scn-border bg-scn-bg-3 px-2 py-0.5 text-scn-dim">
              {scenario.steps.length} steps
            </span>
            {scenario.stack.map((s) => (
              <span
                key={s}
                className="rounded border border-scn-border bg-scn-bg-3 px-2 py-0.5 text-scn-dim"
              >
                {s}
              </span>
            ))}
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-scn-dim md:text-[15px]">
            {scenario.summary}
          </p>

          <p className="mt-4 text-[12px] text-scn-faint">
            Source:{" "}
            <a
              href={scenario.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-scn-dim underline hover:text-scn-text"
            >
              {scenario.source.name}
              {sourceLabel.length > 0 ? ` — ${sourceLabel}` : ""}
            </a>
            {scenario.source.intrusionDate
              ? ` · intrusion ${scenario.source.intrusionDate}`
              : ""}
          </p>
        </header>

        {/* 2. ATT&CK chips */}
        <section
          className="scn-reveal mb-10"
          style={{ animationDelay: "80ms" }}
          aria-labelledby="attack-chips-heading"
        >
          <h2
            id="attack-chips-heading"
            className="mb-3 text-[11px] uppercase tracking-wide text-scn-faint"
          >
            ATT&CK techniques
          </h2>
          <ul className="flex flex-wrap gap-1.5">
            {scenario.techniques.map((tid) => {
              const name = techniqueName(state.dataStore, tid);
              return (
                <li key={tid}>
                  <span
                    className="inline-flex items-center gap-1.5 rounded border border-scn-border bg-scn-bg-2 px-2 py-1 font-mono text-[11px] text-scn-dim"
                    title={name ?? tid}
                  >
                    <span className="text-scn-text">{tid}</span>
                    {name && (
                      <span className="text-scn-faint">{name}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 3. Kill chain */}
        <section
          className="scn-reveal mb-10"
          style={{ animationDelay: "160ms" }}
          aria-labelledby="killchain-heading"
        >
          <h2
            id="killchain-heading"
            className="mb-4 font-display text-lg font-semibold text-scn-text"
          >
            Kill chain
          </h2>
          <ol className="list-none">
            {sortedSteps.map((step, i) => (
              <StepCard
                key={step.order}
                step={step}
                isLast={i === sortedSteps.length - 1}
              />
            ))}
          </ol>
        </section>

        {/* 4. Correlation */}
        <div
          className="scn-reveal mb-10"
          style={{ animationDelay: "240ms" }}
        >
          <CorrelationBlock correlation={scenario.correlation} />
        </div>

        {/* 5. Blind spots */}
        <section
          className="scn-reveal mb-12"
          style={{ animationDelay: "320ms" }}
          aria-labelledby="blindspots-heading"
        >
          <h2
            id="blindspots-heading"
            className="mb-3 font-display text-lg font-semibold text-scn-text"
          >
            Blind spots
          </h2>
          <ul className="space-y-2 rounded-[12px] border border-scn-border bg-scn-bg-2 p-4 md:p-5">
            {scenario.blindSpots.map((b, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm leading-relaxed text-scn-dim"
              >
                <span
                  className="mt-1.5 inline-block h-1 w-1 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: "var(--accent)" }}
                  aria-hidden="true"
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
