/**
 * Automatic anchor injection: anchorName (trigger) and positionAnchor (overlay).
 * Pure helpers for headless DX; no manual anchor wiring. SSR-safe, no side effects.
 */

import type { CSSProperties } from "react";

export const ANCHOR_PREFIX = "--rt-";

const FALLBACK_ANCHOR_ID = "anchor";

/**
 * Returns a valid dashed-ident for CSS anchor-name / position-anchor.
 * Sanitizes: ":" (React useId) -> removed, spaces -> "-". Empty after sanitize -> "--rt-anchor".
 */
export function makeAnchorName(id: string): string {
  const sanitized = id
    .replace(/:/g, "")
    .trim()
    .replace(/\s+/g, "-");
  if (sanitized.length === 0 || /^-*$/.test(sanitized))
    return `${ANCHOR_PREFIX}${FALLBACK_ANCHOR_ID}`;
  return `${ANCHOR_PREFIX}${sanitized}`;
}

/**
 * Merges anchorName into props.style. Does not mutate input or props.style.
 */
export function withAnchorNameStyle<T extends { style?: CSSProperties }>(
  props: T,
  anchorName: string
): T {
  const existing = props.style && typeof props.style === "object" && !Array.isArray(props.style)
    ? props.style
    : {};
  return { ...props, style: { ...existing, anchorName } };
}

/**
 * Merges positionAnchor into props.style. Does not mutate input or props.style.
 */
export function withPositionAnchorStyle<T extends { style?: CSSProperties }>(
  props: T,
  positionAnchor: string
): T {
  const existing = props.style && typeof props.style === "object" && !Array.isArray(props.style)
    ? props.style
    : {};
  return { ...props, style: { ...existing, positionAnchor } };
}
