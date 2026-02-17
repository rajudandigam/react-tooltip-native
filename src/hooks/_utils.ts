/**
 * Headless hook helpers: ref composition, handler merging, style merge.
 * No dependencies; SSR-safe.
 */

import type React from "react";
import type { Ref, RefCallback } from "react";

/**
 * Composes multiple refs (RefCallback or RefObject) into a single RefCallback.
 * Calls each ref with the node; ignores null/undefined refs.
 */
export function composeRefs<T>(...refs: (Ref<T> | undefined | null)[]): RefCallback<T> {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (ref == null) return;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };
}

/**
 * Returns a function that calls each handler in order with the same event.
 * Used to merge user handlers with our interaction handlers (user first, then ours).
 */
export function callAll<T extends (...args: unknown[]) => void>(
  ...handlers: (T | undefined | null)[]
): T {
  return ((...args: unknown[]) => {
    handlers.forEach((fn) => fn?.(...args));
  }) as T;
}

/**
 * Merges base and injected styles without mutating either. Returns a new object.
 */
export function mergeStyles(
  base: React.CSSProperties | undefined,
  injected: React.CSSProperties
): React.CSSProperties {
  if (base == null || (typeof base === "object" && !Array.isArray(base) && Object.keys(base).length === 0)) {
    return { ...injected };
  }
  return { ...base, ...injected };
}
