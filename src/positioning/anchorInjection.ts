/**
 * Automatic anchor injection: trigger gets anchorName, overlay gets positionAnchor.
 * TODO: Integrate with native adapter flicker sequence.
 */

const ANCHOR_PREFIX = "--rt-";

/**
 * Returns style object for trigger (anchorName). Value is dashed-ident for CSS.
 */
export function getTriggerAnchorStyle(id: string): { anchorName: string } {
  return { anchorName: `${ANCHOR_PREFIX}${id}` };
}

/**
 * Returns style object for overlay (positionAnchor).
 */
export function getOverlayAnchorStyle(id: string): { positionAnchor: string } {
  return { positionAnchor: `${ANCHOR_PREFIX}${id}` };
}
