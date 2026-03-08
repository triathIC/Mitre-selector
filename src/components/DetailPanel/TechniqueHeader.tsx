import type { MitreTechnique } from "@/types";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";

export interface TechniqueHeaderProps {
  technique: MitreTechnique;
  onClose: () => void;
  closeButtonRef?: React.Ref<HTMLButtonElement>;
}

export function TechniqueHeader({ technique, onClose, closeButtonRef }: TechniqueHeaderProps): JSX.Element {
  return (
    <div className="border-b border-white/10 pb-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-mono text-lg font-semibold text-gray-100">
            {technique.id}
          </h2>
          <p className="mt-0.5 text-sm text-gray-300">{technique.name}</p>
        </div>
        <Button
          ref={closeButtonRef}
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close panel"
        >
          ✕
        </Button>
      </div>
      <a
        href={technique.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-xs text-blue-400 hover:underline"
      >
        View on MITRE ATT&CK →
      </a>
      <div className="mt-2 flex flex-wrap gap-1">
        {technique.tactics.map((t) => (
          <Badge key={t} className="bg-surface-overlay text-gray-400">
            {t}
          </Badge>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {technique.platforms.map((p) => (
          <Badge key={p} className="bg-white/5 text-gray-500">
            {p}
          </Badge>
        ))}
      </div>
    </div>
  );
}
