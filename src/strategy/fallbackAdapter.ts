/**
 * Fallback overlay adapter: position:fixed, computeFallbackPosition, observers/listeners only when open.
 * No portals, no polling, no rAF loops. Used when Popover API is not supported or strategy === "fallback".
 */

import type { Placement } from "../types";
import { computeFallbackPosition } from "../positioning/fallbackPositioning";
import { getScrollParents } from "../positioning/scrollParents";

export type FallbackAdapterOptions = {
  triggerEl: HTMLElement;
  overlayEl: HTMLElement;
  id: string;

  placement: Placement;
  offset: number;

  closeOnOutsidePress: boolean;
  closeOnEsc: boolean;
  restoreFocusOnClose?: boolean;

  onRequestClose?: (reason: "outside-press" | "escape") => void;

  onAfterOpen?: () => void;
  onAfterClose?: () => void;
};

export type FallbackAdapter = {
  open(): void;
  close(reason?: "programmatic" | "escape" | "outside-press"): void;
  updatePlacement(next: Placement): void;
  destroy(): void;
};

type TeardownFn = () => void;

export function createFallbackAdapter(options: FallbackAdapterOptions): FallbackAdapter {
  const {
    triggerEl,
    overlayEl,
    placement: initialPlacement,
    offset,
    closeOnOutsidePress,
    closeOnEsc,
    restoreFocusOnClose,
    onRequestClose,
    onAfterOpen,
    onAfterClose,
  } = options;

  let currentPlacement = initialPlacement;
  let isOpen = false;
  let destroyed = false;
  const teardowns: TeardownFn[] = [];
  let savedActiveElement: HTMLElement | null = null;

  function reposition(): void {
    // Prevent late callbacks after destroy; close() tears down observers so no reposition after close.
    if (destroyed) return;
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const overlayRect = overlayEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const { top, left } = computeFallbackPosition({
      triggerRect,
      overlayRect,
      placement: currentPlacement,
      offset,
      viewportWidth,
      viewportHeight,
    });

    overlayEl.style.left = `${left}px`;
    overlayEl.style.top = `${top}px`;
  }

  function attachListeners(): void {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const win = window;

    // ResizeObserver on trigger + overlay
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => reposition());
      ro.observe(triggerEl);
      ro.observe(overlayEl);
      teardowns.push(() => ro.disconnect());
    }

    // Scroll parents (nearest scroll containers + window)
    const scrollContainers = getScrollParents(triggerEl, { includeWindow: true });
    const onScroll = () => reposition();

    for (const container of scrollContainers) {
      if (container === win) {
        win.addEventListener("scroll", onScroll, { passive: true });
        teardowns.push(() => win.removeEventListener("scroll", onScroll));
      } else {
        (container as Element).addEventListener("scroll", onScroll, { passive: true });
        teardowns.push(() =>
          (container as Element).removeEventListener("scroll", onScroll)
        );
      }
    }

    // Window resize
    win.addEventListener("resize", onScroll);
    teardowns.push(() => win.removeEventListener("resize", onScroll));

    // Outside press (capture)
    if (closeOnOutsidePress) {
      const onPointerDown = (e: PointerEvent): void => {
        const target = e.target;
        if (!(target instanceof Node)) return;
        if (triggerEl.contains(target) || overlayEl.contains(target)) return;
        onRequestClose?.("outside-press");
      };
      document.addEventListener("pointerdown", onPointerDown, true);
      teardowns.push(() =>
        document.removeEventListener("pointerdown", onPointerDown, true)
      );
    }

    // Escape
    if (closeOnEsc) {
      const onKeyDown = (e: KeyboardEvent): void => {
        if (e.key === "Escape") onRequestClose?.("escape");
      };
      document.addEventListener("keydown", onKeyDown);
      teardowns.push(() => document.removeEventListener("keydown", onKeyDown));
    }
  }

  function runTeardowns(): void {
    const fns = teardowns.splice(0);
    for (const fn of fns) {
      try {
        fn();
      } catch {
        /* ignore */
      }
    }
  }

  function open(): void {
    if (destroyed || isOpen) return;
    if (typeof window === "undefined" || typeof document === "undefined") return;

    overlayEl.style.position = "fixed";
    overlayEl.style.zIndex = "1";
    overlayEl.style.visibility = "";

    reposition();

    if (restoreFocusOnClose && document.activeElement instanceof HTMLElement) {
      savedActiveElement = document.activeElement;
    }

    attachListeners();

    isOpen = true;
    onAfterOpen?.();
  }

  function close(_reason?: "programmatic" | "escape" | "outside-press"): void {
    if (!isOpen) return;

    overlayEl.style.visibility = "hidden";
    runTeardowns();

    if (restoreFocusOnClose && savedActiveElement != null) {
      try {
        savedActiveElement.focus();
      } catch {
        // ignore focus errors
      }
      savedActiveElement = null;
    }

    isOpen = false;
    onAfterClose?.();
  }

  function updatePlacement(next: Placement): void {
    currentPlacement = next;
    if (isOpen) reposition();
  }

  function destroy(): void {
    if (destroyed) return;

    destroyed = true;

    if (isOpen) {
      close("programmatic");
    } else {
      runTeardowns();
    }

    overlayEl.style.position = "";
    overlayEl.style.top = "";
    overlayEl.style.left = "";
    overlayEl.style.zIndex = "";
    overlayEl.style.visibility = "";
  }

  return {
    open,
    close,
    updatePlacement,
    destroy,
  };
}
