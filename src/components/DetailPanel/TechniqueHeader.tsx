import { useState } from "react";
import type { MitreTechnique } from "@/core/models";
import { Button } from "@/components/ui";
import { trackExternalClick } from "@/lib/analytics";

export interface TechniqueHeaderProps {
  technique: MitreTechnique;
  onClose: () => void;
  closeButtonRef?: React.Ref<HTMLButtonElement>;
}

const MAX_VISIBLE_TACTICS = 3;

export function TechniqueHeader({ technique, onClose, closeButtonRef }: TechniqueHeaderProps) {
  const [showAllTactics, setShowAllTactics] = useState(false);
  const visibleTactics = showAllTactics
    ? technique.tactics
    : technique.tactics.slice(0, MAX_VISIBLE_TACTICS);
  const overflowCount = technique.tactics.length - MAX_VISIBLE_TACTICS;

  return (
    <div className="px-4 pb-3 pt-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="flex items-baseline gap-2">
            <span className="font-mono text-sm font-semibold text-cyan-400">{technique.id}</span>
            <span className="text-base font-semibold text-gray-100">{technique.name}</span>
          </h2>
        </div>
        <Button
          ref={closeButtonRef}
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close panel"
          className="shrink-0"
        >
          ✕
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {visibleTactics.map((t) => (
          <span
            key={t}
            className="inline-flex items-center rounded border border-indigo-700 bg-indigo-900 px-2 py-0.5 text-xs font-medium text-indigo-300"
          >
            {t}
          </span>
        ))}
        {!showAllTactics && overflowCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setShowAllTactics(true);
            }}
            className="inline-flex items-center rounded border border-indigo-700/50 bg-indigo-900/50 px-2 py-0.5 text-xs font-medium text-indigo-400 hover:bg-indigo-900 hover:text-indigo-300"
          >
            +{overflowCount}
          </button>
        )}
      </div>

      <a
        href={technique.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          trackExternalClick(technique.url);
        }}
        className="mt-2 inline-block text-xs text-gray-500 hover:text-cyan-400"
      >
        View on MITRE ATT&CK →
      </a>
    </div>
  );
}
