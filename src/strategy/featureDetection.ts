/**
 * Feature detection for Popover API and CSS Anchor Positioning.
 * SSR-safe: no access to window/document at module top-level.
 */

export interface FeatureSupport {
  popover: boolean;
  anchorPositioning: boolean;
}

/**
 * Returns support flags for Popover API and CSS Anchor Positioning.
 * Call at runtime (e.g. in effect or on first use); safe when window/document missing.
 */
export function getFeatureSupport(): FeatureSupport {
  if (typeof HTMLElement === "undefined" || typeof document === "undefined") {
    return { popover: false, anchorPositioning: false };
  }
  const popover =
    "showPopover" in HTMLElement.prototype &&
    typeof (HTMLElement.prototype as unknown as { showPopover?: () => void }).showPopover === "function";
  const anchorPositioning =
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("position-anchor: --x");
  return { popover, anchorPositioning };
}
