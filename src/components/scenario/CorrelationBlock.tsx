import type { Correlation } from "@triathic/mke-core";

export interface CorrelationBlockProps {
  correlation: Correlation;
}

export function CorrelationBlock({ correlation }: CorrelationBlockProps) {
  return (
    <section
      className="rounded-[14px] border bg-scn-accent-soft p-5 md:p-6"
      style={{ borderColor: "var(--accent-line)" }}
      aria-labelledby="correlation-heading"
    >
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2
          id="correlation-heading"
          className="font-display text-lg font-semibold"
          style={{ color: "var(--accent)" }}
        >
          Correlation
        </h2>
        <div className="font-mono text-[11px] text-scn-dim">
          {correlation.inputs} signals → {correlation.output}
        </div>
      </header>

      <dl className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded border border-scn-border bg-scn-bg-2 p-3">
          <dt className="mb-1 text-[11px] uppercase tracking-wide text-scn-faint">
            Linking entity
          </dt>
          <dd className="font-mono text-sm text-scn-text">
            {correlation.linkingEntity}
          </dd>
        </div>
        <div className="rounded border border-scn-border bg-scn-bg-2 p-3">
          <dt className="mb-1 text-[11px] uppercase tracking-wide text-scn-faint">
            Time window
          </dt>
          <dd className="font-mono text-sm text-scn-text">
            {correlation.timeWindow}
          </dd>
        </div>
      </dl>

      <div className="mb-5">
        <div className="mb-2 text-[11px] uppercase tracking-wide text-scn-faint">
          Sequence
        </div>
        <ol className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
          {correlation.sequence.map((step, i) => (
            <li key={`${String(i)}-${step}`} className="flex items-center gap-2">
              <span className="rounded border border-scn-border-2 bg-scn-bg-3 px-2 py-1 font-mono text-[11px] text-scn-text">
                <span className="text-scn-faint">{i + 1}.</span> {step}
              </span>
              {i < correlation.sequence.length - 1 && (
                <span
                  className="hidden font-mono text-[11px] md:inline"
                  style={{ color: "var(--accent)" }}
                  aria-hidden="true"
                >
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <p className="text-sm leading-relaxed text-scn-text">
        {correlation.narrative}
      </p>

      {correlation.architectNote && (
        <p
          className="mt-4 border-l-2 pl-3 text-sm leading-relaxed text-scn-dim"
          style={{ borderColor: "var(--accent-line)" }}
        >
          <span className="font-semibold text-scn-text">Architect note: </span>
          {correlation.architectNote}
        </p>
      )}
    </section>
  );
}
