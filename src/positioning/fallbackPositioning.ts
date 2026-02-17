/**
 * Pure fallback positioning math: placement + offset + viewport clamp.
 * No DOM, no listeners, no flipping. Used only when strategy === "fallback".
 */

import type { Placement } from "../types";

export type PositionResult = {
  top: number;
  left: number;
};

/**
 * Computes overlay top/left for position:fixed from trigger and overlay rects.
 * Clamps to viewport; does not flip placement.
 */
export function computeFallbackPosition(input: {
  triggerRect: DOMRect;
  overlayRect: DOMRect;
  placement: Placement;
  offset: number;
  viewportWidth: number;
  viewportHeight: number;
}): PositionResult {
  const {
    triggerRect: t,
    overlayRect: o,
    placement,
    offset,
    viewportWidth,
    viewportHeight,
  } = input;

  let top: number;
  let left: number;

  switch (placement) {
    case "top":
      top = t.top - o.height - offset;
      left = t.left + t.width / 2 - o.width / 2;
      break;
    case "top-start":
      top = t.top - o.height - offset;
      left = t.left;
      break;
    case "top-end":
      top = t.top - o.height - offset;
      left = t.right - o.width;
      break;
    case "bottom":
      top = t.bottom + offset;
      left = t.left + t.width / 2 - o.width / 2;
      break;
    case "bottom-start":
      top = t.bottom + offset;
      left = t.left;
      break;
    case "bottom-end":
      top = t.bottom + offset;
      left = t.right - o.width;
      break;
    case "left":
      left = t.left - o.width - offset;
      top = t.top + t.height / 2 - o.height / 2;
      break;
    case "left-start":
      left = t.left - o.width - offset;
      top = t.top;
      break;
    case "left-end":
      left = t.left - o.width - offset;
      top = t.bottom - o.height;
      break;
    case "right":
      left = t.right + offset;
      top = t.top + t.height / 2 - o.height / 2;
      break;
    case "right-start":
      left = t.right + offset;
      top = t.top;
      break;
    case "right-end":
      left = t.right + offset;
      top = t.bottom - o.height;
      break;
    default: {
      const _exhaust: never = placement;
      void _exhaust;
      top = 0;
      left = 0;
    }
  }

  const maxLeft = viewportWidth - o.width;
  const maxTop = viewportHeight - o.height;

  return {
    left: Math.max(0, Math.min(left, maxLeft)),
    top: Math.max(0, Math.min(top, maxTop)),
  };
}
