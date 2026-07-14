import type { MaturityLevel } from "@triathic/mke-core";

export interface MaturityBadgeProps {
  level: MaturityLevel;
  size?: "sm" | "md";
}

const ORDER: MaturityLevel[] = [
  "theorized",
  "static-reviewed",
  "lab-tested",
  "field-observed",
];

function colorFor(level: MaturityLevel): string {
  switch (level) {
    case "theorized":
      return "var(--m-theorized)";
    case "static-reviewed":
      return "var(--m-static)";
    case "lab-tested":
      return "var(--m-lab)";
    case "field-observed":
      return "var(--m-field)";
  }
}

export function MaturityBadge({ level, size = "md" }: MaturityBadgeProps) {
  const reachedIndex = ORDER.indexOf(level);
  const color = colorFor(level);

  const segW = size === "sm" ? "w-2" : "w-3";
  const segH = size === "sm" ? "h-1.5" : "h-2";
  const gap = size === "sm" ? "gap-[2px]" : "gap-[3px]";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const padding = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1";

  return (
    <span
      className={`inline-flex items-center ${gap} rounded border border-scn-border bg-scn-bg-3 ${padding} font-mono ${textSize} text-scn-dim`}
      role="img"
      aria-label={`maturity: ${level}`}
      title={`maturity: ${level}`}
    >
      <span className={`inline-flex items-center ${gap}`}>
        {ORDER.map((tier, i) => {
          const filled = i <= reachedIndex;
          return (
            <span
              key={tier}
              className={`${segW} ${segH} rounded-sm`}
              style={{
                backgroundColor: filled ? color : "var(--border-2)",
                opacity: filled ? 1 : 0.45,
              }}
            />
          );
        })}
      </span>
      <span className="ml-1.5 tracking-tight" style={{ color }}>
        {level}
      </span>
    </span>
  );
}
