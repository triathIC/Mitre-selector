import { useState } from "react";
import type { KqlMapping } from "@/types";
import { Badge } from "@/components/ui";
import { KqlCodeBlock } from "./KqlCodeBlock";
import { SEVERITY_COLORS, CONFIDENCE_COLORS } from "@/utils/constants";

export interface KqlCardProps {
  mapping: KqlMapping;
}

export const SEVERITY_ORDER: KqlMapping["severity"][] = [
  "critical",
  "high",
  "medium",
  "low",
  "informational",
];

export function KqlCard({ mapping }: KqlCardProps): JSX.Element {
  const [descExpanded, setDescExpanded] = useState(false);
  const [tuningExpanded, setTuningExpanded] = useState(false);
  const descLines = mapping.description.split(/\n/).length;
  const showDescToggle = descLines > 3;
  const descPreview = showDescToggle && !descExpanded
    ? mapping.description.split(/\n/).slice(0, 3).join("\n")
    : mapping.description;

  const sevStyle = SEVERITY_COLORS[mapping.severity];
  const confStyle = CONFIDENCE_COLORS[mapping.confidence];

  return (
    <article
      className="rounded-lg border border-white/10 bg-surface-elevated p-4"
      aria-labelledby={`kql-title-${mapping.mapping_id}`}
    >
      <h3 id={`kql-title-${mapping.mapping_id}`} className="font-semibold text-gray-200">
        {mapping.title}
      </h3>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge className={`${sevStyle.bg} ${sevStyle.text} ${sevStyle.border} border`}>
          {mapping.severity}
        </Badge>
        <Badge className={`${confStyle.bg} ${confStyle.text}`}>
          {mapping.confidence}
        </Badge>
        <Badge className="bg-surface-overlay text-gray-400">
          {mapping.product}
        </Badge>
        <Badge className="bg-surface-overlay text-gray-400">
          {mapping.query_type}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {mapping.data_connector} · {mapping.log_sources.join(", ")}
      </p>
      <div className="mt-2">
        {mapping.log_sources.map((src) => (
          <Badge key={src} className="mr-1 mt-1 bg-white/5 text-gray-500">
            {src}
          </Badge>
        ))}
      </div>
      <div className="mt-2 text-sm text-gray-400">
        {showDescToggle ? (
          <>
            <p className="whitespace-pre-wrap">{descPreview}</p>
            {!descExpanded && (
              <button
                type="button"
                onClick={() => setDescExpanded(true)}
                className="mt-1 text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Show more
              </button>
            )}
            {descExpanded && (
              <p className="whitespace-pre-wrap">{mapping.description}</p>
            )}
          </>
        ) : (
          <p className="whitespace-pre-wrap">{mapping.description}</p>
        )}
      </div>
      <div className="mt-3">
        <KqlCodeBlock kql={mapping.kql} />
      </div>
      {mapping.tuning_notes && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setTuningExpanded((e) => !e)}
            className="text-xs text-gray-500 hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {tuningExpanded ? "Hide" : "Show"} tuning notes
          </button>
          {tuningExpanded && (
            <p className="mt-1 text-xs text-gray-500 whitespace-pre-wrap">{mapping.tuning_notes}</p>
          )}
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500">
        {mapping.author} · last tested {mapping.last_tested}
      </p>
      {mapping.references.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-2 text-xs">
          {mapping.references.map((ref, i) => (
            <li key={i}>
              <a
                href={ref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Ref {i + 1}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
