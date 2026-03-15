import type React from "react";
import { useCallback, useRef, useEffect } from "react";

export const TILT_DEFAULTS = {
  maxTilt: 8, // Grad — höher = dramatischer
  radius: 200, // Pixel — größer = mehr Zellen reagieren
  glareIntensity: 0.07, // 0-1 — höher = stärkerer Glanz
  scaleMax: 1.04, // Maximale Vergrößerung der Zelle unter Cursor
  resetDuration: 400, // ms — Dauer der Rückkehr-Animation
} as const;

interface CellPosition {
  element: HTMLElement;
  centerX: number;
  centerY: number;
}

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
  const cellsRef = useRef<CellPosition[]>([]);
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

  // Zell-Positionen cachen (nur bei Resize neu berechnen)
  const updateCellPositions = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const cells = container.querySelectorAll<HTMLElement>("[data-tilt-cell]");
    cellsRef.current = Array.from(cells).map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        element: el,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      };
    });
  }, [containerRef]);

  // Animation Frame: berechne Tilt für jede Zelle
  const animate = useCallback(() => {
    const { x: mouseX, y: mouseY } = mouseRef.current;
    const cells = cellsRef.current;

    for (const cell of cells) {
      const dx = mouseX - cell.centerX;
      const dy = mouseY - cell.centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > radius) {
        cell.element.style.transform =
          "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)";
        cell.element.style.removeProperty("--glare");
        cell.element.style.removeProperty("z-index");
        continue;
      }

      const intensity = Math.pow(1 - distance / radius, 2);

      const normalizedDx = dx / (distance || 1);
      const normalizedDy = dy / (distance || 1);

      const tiltX = -normalizedDy * maxTilt * intensity;
      const tiltY = normalizedDx * maxTilt * intensity;
      const scale = 1 + scaleDelta * intensity;

      cell.element.style.transform = `perspective(600px) rotateX(${String(tiltX)}deg) rotateY(${String(tiltY)}deg) scale(${String(scale)})`;

      const glareOpacity = glareIntensity * intensity;
      const glareX = 50 + normalizedDx * 30;
      const glareY = 50 + normalizedDy * 30;
      cell.element.style.setProperty(
        "--glare",
        `radial-gradient(circle at ${String(glareX)}% ${String(glareY)}%, rgba(255,255,255,${String(glareOpacity)}) 0%, transparent 60%)`
      );

      cell.element.style.zIndex = String(Math.round(intensity * 10));
    }
  }, [maxTilt, radius, glareIntensity, scaleDelta]);

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
    for (const cell of cellsRef.current) {
      cell.element.style.transform =
        "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)";
      cell.element.style.transition = `transform ${String(resetDuration)}ms ease-out`;
      cell.element.style.removeProperty("--glare");
      cell.element.style.removeProperty("z-index");
      setTimeout(() => {
        cell.element.style.transition = "transform 100ms ease-out";
      }, resetDuration);
    }
  }, [resetDuration]);

  useEffect(() => {
    hasHoverRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches;
  }, []);

  useEffect(() => {
    updateCellPositions();

    const onResize = () => {
      updateCellPositions();
    };
    const onScroll = () => {
      updateCellPositions();
    };

    window.addEventListener("resize", onResize);
    const scrollContainer = containerRef.current?.closest("[data-matrix-scroll]");
    scrollContainer?.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("resize", onResize);
      scrollContainer?.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [updateCellPositions, containerRef]);

  return {
    containerRef,
    handleMouseMove,
    handleMouseLeave,
    updateCellPositions,
  };
}
