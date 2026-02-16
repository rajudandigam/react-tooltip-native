/**
 * Fallback positioning: minimal math from rects, placement, offset, viewport clamp.
 * TODO: Implement; no positioning logic yet.
 */

import type { Placement } from "../types";

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface FallbackPositionResult {
  top: number;
  left: number;
}

/**
 * Compute position for overlay relative to trigger. Viewport clamp not applied yet.
 * TODO: Implement placement (top/bottom/left/right, start/end), offset.
 */
export function computeFallbackPosition(
  _triggerRect: Rect,
  _overlayRect: Rect,
  _placement: Placement,
  _offset: number
): FallbackPositionResult {
  return { top: 0, left: 0 };
}
