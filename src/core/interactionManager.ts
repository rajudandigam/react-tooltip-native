/**
 * Interaction manager: hover timers, focus/blur, click, Esc; controlled vs uncontrolled.
 * Unified across native and fallback; no strategy-specific logic.
 * TODO: Implement.
 */

import type { OpenChangeReason } from "../types";

export interface InteractionManagerOptions {
  openDelay: number;
  closeDelay: number;
  onOpenChange: (open: boolean, reason: OpenChangeReason) => void;
}

/**
 * TODO: Manage hover timers (openDelay/closeDelay), focus/blur, click, Esc.
 * Used by useTooltip/usePopover via useOverlayEngine.
 */
export function createInteractionManager(
  _options: InteractionManagerOptions
): {
  setup: () => void;
  teardown: () => void;
  handlePointerEnter: () => void;
  handlePointerLeave: () => void;
  handleFocus: () => void;
  handleBlur: () => void;
  handleClick: () => void;
  handleKeyDown: (e: KeyboardEvent) => void;
} {
  return {
    setup: () => {},
    teardown: () => {},
    handlePointerEnter: () => {},
    handlePointerLeave: () => {},
    handleFocus: () => {},
    handleBlur: () => {},
    handleClick: () => {},
    handleKeyDown: () => {},
  };
}
