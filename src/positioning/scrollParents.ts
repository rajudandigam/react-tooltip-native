/**
 * Nearest scroll parents for fallback scroll listeners.
 * TODO: Implement; no DOM logic yet.
 */

/**
 * Returns the nearest scroll parent elements for the given element.
 * Used by fallback adapter to attach scroll listeners (passive, removed on unmount).
 * TODO: Walk up and collect elements with overflow scroll/auto.
 */
export function getScrollParents(_element: HTMLElement): HTMLElement[] {
  return [];
}
