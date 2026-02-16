/**
 * Accessibility layer: role="tooltip", aria-describedby, aria-expanded, aria-controls.
 * TODO: Implement helpers used by components/hooks.
 */

/**
 * Get props for tooltip overlay (role, id).
 * TODO: role="tooltip", id for aria-describedby link.
 */
export function getTooltipOverlayAriaProps(id: string): { role: "tooltip"; id: string } {
  return { role: "tooltip", id };
}

/**
 * Get trigger aria-describedby for tooltip.
 * TODO: Return id when open/describeOnlyWhenOpen.
 */
export function getTooltipTriggerAriaDescribedBy(
  _id: string,
  _open: boolean,
  _describeOnlyWhenOpen: boolean
): string | undefined {
  return undefined;
}

/**
 * Get trigger aria-expanded and aria-controls for popover.
 * TODO: Return values for popover trigger.
 */
export function getPopoverTriggerAriaProps(
  _id: string,
  _open: boolean
): { "aria-expanded": boolean; "aria-controls": string } {
  return { "aria-expanded": false, "aria-controls": "" };
}
