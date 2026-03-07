import type { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function Badge({ children, className = "", "aria-label": ariaLabel }: BadgeProps): JSX.Element {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      {children}
    </span>
  );
}
