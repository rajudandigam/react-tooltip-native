/**
 * Native adapter: popover attribute, showPopover/hidePopover, anchor injection, flicker mitigation.
 * TODO: Implement; no positioning logic yet.
 */

import type { OverlayMode } from "../types";

export interface NativeAdapterOptions {
  id: string;
  mode: OverlayMode;
  // placement/position-area applied via styles; TODO
}

/**
 * Apply native popover behavior to overlay element.
 * TODO: Inject anchor styles, placement styles, then showPopover() with flicker mitigation.
 */
export function applyNativePopover(
  _overlay: HTMLElement,
  _trigger: HTMLElement,
  _options: NativeAdapterOptions
): void {
  // TODO: set popover="auto"|"manual", anchorName on trigger, positionAnchor on overlay,
  // then rAF then showPopover().
}

/**
 * Show native popover (after styles applied).
 * TODO: Flicker mitigation sequence.
 */
export function showNativePopover(_overlay: HTMLElement): void {
  // TODO: requestAnimationFrame then overlay.showPopover()
}

/**
 * Hide native popover.
 */
export function hideNativePopover(overlay: HTMLElement): void {
  if (typeof (overlay as unknown as { hidePopover?: () => void }).hidePopover === "function") {
    (overlay as unknown as { hidePopover: () => void }).hidePopover();
  }
}
