import { useState, type ReactNode } from "react";

export interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
        }}
        className="flex w-full items-center gap-2 rounded px-1 py-1.5 text-left text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        aria-expanded={open}
      >
        <span
          className="inline-block w-3 text-[10px] text-gray-500 transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "none" }}
        >
          ▶
        </span>
        {title}
      </button>
      {open && <div className="pb-2 pl-5 pt-1">{children}</div>}
    </div>
  );
}
