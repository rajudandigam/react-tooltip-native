/**
 * Resolves whether to use native adapter or fallback adapter.
 * TODO: Integrate with useOverlayEngine / strategy prop.
 */

import type { Strategy } from "../types";
import type { FeatureSupport } from "./featureDetection";

export type ResolvedStrategy = "native" | "fallback";

/**
 * Given feature support and strategy prop, returns which adapter to use.
 */
export function resolveStrategy(
  supports: FeatureSupport,
  strategy: Strategy = "auto"
): ResolvedStrategy {
  if (strategy === "fallback") return "fallback";
  if (strategy === "native" && supports.popover) return "native";
  if (strategy === "auto" && supports.popover) return "native";
  return "fallback";
}
