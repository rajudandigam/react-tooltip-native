/**
 * Resolves whether to use native adapter or fallback adapter.
 * Strategy resolution does not consider anchorPositioning; that is used inside adapters for positioning.
 */

import type { Strategy } from "../types";
import type { Supports } from "./featureDetection";

export type ResolvedStrategy = "native" | "fallback";

/**
 * Given strategy preference and feature support, returns which adapter to use.
 * - "fallback" -> always "fallback"
 * - "native" -> "native" only if supports.popover, else "fallback"
 * - "auto" or undefined -> "native" only if supports.popover, else "fallback"
 */
export function resolveStrategy(input: {
  strategy?: Strategy;
  supports: Supports;
}): ResolvedStrategy {
  const { strategy = "auto", supports } = input;
  if (strategy === "fallback") return "fallback";
  if (strategy === "native" && supports.popover) return "native";
  if ((strategy === "auto" || strategy === undefined) && supports.popover) return "native";
  return "fallback";
}
