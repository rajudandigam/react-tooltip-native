/**
 * Feature detection for Popover API and CSS Anchor Positioning.
 * SSR-safe: no access to window/document at module top-level.
 * Call detectSupports() at runtime; safe when HTMLElement/CSS are undefined.
 */

export type Supports = {
  popover: boolean;
  anchorPositioning: boolean;
};

/**
 * Returns support flags for Popover API and CSS Anchor Positioning.
 * - Popover: true if HTMLElement is defined and showPopover exists on its prototype.
 * - Anchor: true if CSS is defined, CSS.supports is a function, and supports("position-anchor: --x").
 * Does not throw in SSR or when globals are missing.
 */
export function detectSupports(): Supports {
  const popover =
    typeof HTMLElement !== "undefined" &&
    "showPopover" in HTMLElement.prototype &&
    typeof (HTMLElement.prototype as unknown as { showPopover?: () => void }).showPopover === "function";

  const anchorPositioning =
    typeof CSS !== "undefined" &&
    typeof (CSS as { supports?: (property: string) => boolean }).supports === "function" &&
    (CSS as { supports: (property: string) => boolean }).supports("position-anchor: --x");

  return { popover, anchorPositioning };
}
