/**
 * Main entry: full public API per API_SPECS.md.
 */

export { Tooltip } from "./components/Tooltip";
export { Popover } from "./components/Popover";
export { useTooltip } from "./hooks/useTooltip";
export { usePopover } from "./hooks/usePopover";

export type {
  OverlayMode,
  Placement,
  Strategy,
  OpenChangeReason,
  TooltipProps,
  PopoverProps,
  UseTooltipOptions,
  UseTooltipReturn,
  UsePopoverOptions,
  UsePopoverReturn,
} from "./types";
