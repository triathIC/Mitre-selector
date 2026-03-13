import type { KqlMapping } from "@/types";
import { Badge } from "@/components/ui";
import { KqlCodeBlock } from "./KqlCodeBlock";
import { SEVERITY_COLORS, CONFIDENCE_COLORS } from "@/utils/constants";

export interface KqlCardProps {
  mapping: KqlMapping;
}

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function KqlCard({ mapping }: KqlCardProps) {
  const sevStyle = SEVERITY_COLORS[mapping.severity];
  const confStyle = CONFIDENCE_COLORS[mapping.confidence];

  return (
    <article
      className="rounded-lg border border-white/10 bg-surface-elevated"
      aria-labelledby={`kql-title-${mapping.mapping_id}`}
    >
      {/* Card header */}
      <div className="border-b border-white/5 px-4 py-3">
        <h4 id={`kql-title-${mapping.mapping_id}`} className="text-sm font-semibold text-gray-200">
          {mapping.title}
        </h4>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge className={`${sevStyle.bg} ${sevStyle.text} ${sevStyle.border} border`}>
            {mapping.severity}
          </Badge>
          <Badge className={`${confStyle.bg} ${confStyle.text}`}>
            {mapping.confidence}
          </Badge>
          <Badge className="border border-white/10 bg-transparent text-gray-400">
            {mapping.product}
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-500">{mapping.data_connector}</span>
          <span className="text-xs text-gray-600">·</span>
          {mapping.log_sources.map((src) => (
            <Badge key={src} className="bg-white/5 font-mono text-[11px] text-gray-500">
              {src}
            </Badge>
          ))}
        </div>
      </div>

      {/* KQL code — the core value */}
      <div className="px-4 py-3">
        <KqlCodeBlock kql={mapping.kql} />
      </div>

      {/* Footer: author, refs, tuning */}
      <div className="border-t border-white/5 px-4 py-2.5">
        <p className="text-xs text-gray-500">
          {mapping.author} · last tested {mapping.last_tested}
        </p>
        {mapping.references.length > 0 && (
          <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {mapping.references.map((ref, i) => (
              <li key={i}>
                <a
                  href={ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-cyan-400 hover:underline"
                >
                  {extractHostname(ref)}
                </a>
              </li>
            ))}
          </ul>
        )}
        {mapping.tuning_notes && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-400">
              Tuning notes
            </summary>
            <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-gray-500">
              {mapping.tuning_notes}
            </p>
          </details>
        )}
      </div>
    </article>
  );
}
