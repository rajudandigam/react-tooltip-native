/**
 * Core entry: types and non-React utilities only.
 * No React components or hooks.
 */

export type {
  OverlayMode,
  Placement,
  Strategy,
  OpenChangeReason,
} from "./types";

export { getFeatureSupport } from "./strategy/featureDetection";
export type { FeatureSupport } from "./strategy/featureDetection";
export { resolveStrategy } from "./strategy/resolveStrategy";
export type { ResolvedStrategy } from "./strategy/resolveStrategy";
export { getTriggerAnchorStyle, getOverlayAnchorStyle } from "./positioning/anchorInjection";
