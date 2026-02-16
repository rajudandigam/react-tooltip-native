/**
 * Fallback adapter: position:fixed, ResizeObserver, scroll parents listeners.
 * TODO: Implement positioning and observers; no logic yet.
 */

import type { Placement } from "../types";

export interface FallbackAdapterOptions {
  placement: Placement;
  offset: number;
  // TODO: viewport clamp, etc.
}

/**
 * Position overlay using fallback (JS) math and attach observers.
 * TODO: Use fallbackPositioning + scrollParents; ResizeObserver on trigger and overlay;
 * scroll listeners on nearest scroll parents only; remove on unmount.
 */
export function applyFallbackPosition(
  _overlay: HTMLElement,
  _trigger: HTMLElement,
  _options: FallbackAdapterOptions
): () => void {
  // TODO: measure, apply position, attach ResizeObserver and scroll listeners.
  return function cleanup() {
    // TODO: remove observers.
  };
}
