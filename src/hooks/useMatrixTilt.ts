import type React from "react";
import { useCallback, useRef, useEffect } from "react";

export const TILT_DEFAULTS = {
  maxTilt: 10, // Grad — höher = dramatischer
  radius: 400, // Pixel — größer = mehr Zellen reagieren
  glareIntensity: 0.07, // 0-1 — höher = stärkerer Glanz
  scaleMax: 1.08, // Maximale Vergrößerung der Zelle unter Cursor
  resetDuration: 400, // ms — Dauer der Rückkehr-Animation
} as const;

export function useMatrixTilt(options: {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  maxTilt?: number;
  radius?: number;
  glareIntensity?: number;
  scaleMax?: number;
  resetDuration?: number;
} = {}) {
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = options.containerRef ?? internalRef;
  const rafRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasHoverRef = useRef(false);

  const {
    maxTilt = TILT_DEFAULTS.maxTilt,
    radius = TILT_DEFAULTS.radius,
    glareIntensity = TILT_DEFAULTS.glareIntensity,
    scaleMax = TILT_DEFAULTS.scaleMax,
    resetDuration = TILT_DEFAULTS.resetDuration,
  } = options;

  const scaleDelta = scaleMax - 1;

  // Animation Frame: Positionen live via getBoundingClientRect (ein Layout-Read pro Frame, gebatcht)
  const animate = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { x: mouseX, y: mouseY } = mouseRef.current;
    const cells = container.querySelectorAll<HTMLElement>("[data-tilt-cell]");

    for (const el of cells) {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > radius) {
        el.style.transform =
          "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)";
        el.style.removeProperty("--glare");
        el.style.removeProperty("z-index");
        continue;
      }

      const intensity = Math.pow(1 - distance / radius, 2);

      const normalizedDx = dx / (distance || 1);
      const normalizedDy = dy / (distance || 1);

      const tiltX = -normalizedDy * maxTilt * intensity;
      const tiltY = normalizedDx * maxTilt * intensity;
      const scale = 1 + scaleDelta * intensity;

      el.style.transform = `perspective(600px) rotateX(${String(tiltX)}deg) rotateY(${String(tiltY)}deg) scale(${String(scale)})`;

      const glareOpacity = glareIntensity * intensity;
      const glareX = 50 + normalizedDx * 30;
      const glareY = 50 + normalizedDy * 30;
      el.style.setProperty(
        "--glare",
        `radial-gradient(circle at ${String(glareX)}% ${String(glareY)}%, rgba(255,255,255,${String(glareOpacity)}) 0%, transparent 60%)`
      );

      el.style.zIndex = String(Math.round(intensity * 10));
    }
  }, [containerRef, maxTilt, radius, glareIntensity, scaleDelta]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hasHoverRef.current) return;
      mouseRef.current = { x: e.clientX, y: e.clientY };
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    },
    [animate]
  );

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const container = containerRef.current;
    if (!container) return;

    const cells = container.querySelectorAll<HTMLElement>("[data-tilt-cell]");
    for (const el of cells) {
      el.style.transform =
        "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)";
      el.style.transition = `transform ${String(resetDuration)}ms ease-out`;
      el.style.removeProperty("--glare");
      el.style.removeProperty("z-index");
      setTimeout(() => {
        el.style.transition = "transform 100ms ease-out";
      }, resetDuration);
    }
  }, [containerRef, resetDuration]);

  useEffect(() => {
    hasHoverRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches;
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    containerRef,
    handleMouseMove,
    handleMouseLeave,
  };
}
