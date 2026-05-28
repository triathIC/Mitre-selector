import type { RefObject } from "react";
import { useEffect } from "react";

const DRAG_THRESHOLD_PX = 5;

/**
 * Enables click-and-drag horizontal scrolling on the referenced element.
 * Movement under DRAG_THRESHOLD_PX is treated as a click and forwarded to
 * the underlying target (so TechniqueCell clicks still open the detail
 * panel). Movement above the threshold scrolls and the subsequent click
 * event is suppressed so the cell doesn't trigger.
 *
 * Interactive children (button, a, input, select, textarea) are excluded
 * from starting a drag — clicking those still works normally.
 */
export function useDragScroll(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let dragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    function isInteractiveTarget(target: EventTarget | null): boolean {
      if (!(target instanceof Element)) return false;
      return target.closest("button, a, input, select, textarea") !== null;
    }

    function onMouseDown(e: MouseEvent): void {
      if (e.button !== 0) return;
      if (!el) return;
      // Allow native click on interactive descendants — don't start a drag.
      if (isInteractiveTarget(e.target)) return;
      isDown = true;
      dragging = false;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
    }

    function onMouseMove(e: MouseEvent): void {
      if (!isDown || !el) return;
      const dx = e.clientX - startX;
      if (!dragging && Math.abs(dx) < DRAG_THRESHOLD_PX) return;
      if (!dragging) {
        dragging = true;
        el.style.cursor = "grabbing";
        el.style.userSelect = "none";
      }
      el.scrollLeft = startScrollLeft - dx;
      e.preventDefault();
    }

    function onMouseUp(): void {
      if (!isDown) return;
      const wasDragging = dragging;
      isDown = false;
      dragging = false;
      if (el) {
        el.style.cursor = "";
        el.style.userSelect = "";
      }
      if (wasDragging) {
        // Swallow the click that fires after a drag-release on the same
        // element so TechniqueCell doesn't open the detail panel.
        const swallow = (ev: MouseEvent): void => {
          ev.stopPropagation();
          ev.preventDefault();
          window.removeEventListener("click", swallow, true);
        };
        window.addEventListener("click", swallow, true);
      }
    }

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [ref]);
}
