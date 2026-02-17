/**
 * Nearest scrollable ancestors for fallback adapter scroll listener attachment.
 * Pure inspection; no listeners attached. SSR-safe (guards window/document/getComputedStyle).
 */

export type ScrollContainer = Element | Window;

export type GetScrollParentsOptions = {
  includeWindow?: boolean;
  boundary?: Element | null;
};

const SCROLLABLE_OVERFLOW = new Set<string>(["auto", "scroll", "overlay"]);

function isScrollable(el: Element): boolean {
  if (typeof getComputedStyle === "undefined") return false;
  const style = getComputedStyle(el);
  const overflow = style.overflow || style.overflowX || style.overflowY;
  return SCROLLABLE_OVERFLOW.has(overflow);
}

/**
 * Returns nearest scrollable ancestors from el up to boundary/documentElement, then optionally window.
 * Order: nearest first. SSR-safe: returns [] when window or getComputedStyle is missing.
 */
export function getScrollParents(
  el: Element | null,
  options: GetScrollParentsOptions = {}
): ScrollContainer[] {
  const { includeWindow = true, boundary = null } = options;

  if (typeof window === "undefined") return [];
  if (el == null) return includeWindow ? [window] : [];

  const result: ScrollContainer[] = [];
  let current: Element | null = el.parentElement;

  while (current != null && current !== boundary) {
    if (current === document.documentElement) break;
    if (isScrollable(current)) {
      if (!result.includes(current)) result.push(current);
    }
    current = current.parentElement;
  }

  if (includeWindow && !result.includes(window)) result.push(window);

  return result;
}
