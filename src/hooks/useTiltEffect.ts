import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent } from "react";

export function useTiltEffect(maxTilt = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const hasHoverRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      hasHoverRef.current = false;
      return;
    }

    const mediaQuery = window.matchMedia("(hover: hover)");
    const updateHasHover = () => {
      hasHoverRef.current = mediaQuery.matches;
    };

    updateHasHover();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateHasHover);
      return () => {
        mediaQuery.removeEventListener("change", updateHasHover);
      };
    }

    // Older APIs are deprecated and blocked by lint rules.
    return undefined;
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!hasHoverRef.current) return;

      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      const rotateX = (-y * maxTilt).toFixed(2);
      const rotateY = (x * maxTilt).toFixed(2);
      el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
      el.style.transition = "transform 100ms ease-out";

      const glareX = (((e.clientX - rect.left) / rect.width) * 100).toFixed(2);
      const glareY = (((e.clientY - rect.top) / rect.height) * 100).toFixed(2);
      el.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.07) 0%, transparent 60%), var(--cell-bg)`;
    },
    [maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    if (!hasHoverRef.current) return;

    const el = ref.current;
    if (!el) return;

    el.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)";
    el.style.transition = "transform 300ms ease-out";
    el.style.background = "var(--cell-bg)";
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
}
