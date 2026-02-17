/**
 * Deterministic overlay state machine for open/close transitions.
 * No DOM, no timers. Used by adapters to decide when to perform side effects (showPopover/hidePopover or position overlay).
 */

import type { OpenChangeReason } from "../types";

export type OverlayState = "closed" | "opening" | "open" | "closing";

export type StateEvent =
  | { type: "REQUEST_OPEN"; reason: OpenChangeReason }
  | { type: "REQUEST_CLOSE"; reason: OpenChangeReason }
  | { type: "OPENED" }
  | { type: "CLOSED" };

export type TransitionResult = {
  state: OverlayState;
  /** Caller should perform "open" side effect (e.g. showPopover or position overlay). */
  shouldOpen: boolean;
  /** Caller should perform "close" side effect (e.g. hidePopover or detach observers). */
  shouldClose: boolean;
};

/**
 * Computes next state and side-effect flags from current state and event.
 * Deterministic; no side effects.
 */
export function transition(
  current: OverlayState,
  event: StateEvent
): TransitionResult {
  switch (current) {
    case "closed":
      if (event.type === "REQUEST_OPEN")
        return { state: "opening", shouldOpen: true, shouldClose: false };
      return { state: "closed", shouldOpen: false, shouldClose: false };

    case "opening":
      if (event.type === "OPENED")
        return { state: "open", shouldOpen: false, shouldClose: false };
      if (event.type === "REQUEST_CLOSE")
        return { state: "closing", shouldOpen: false, shouldClose: true };
      return { state: "opening", shouldOpen: false, shouldClose: false };

    case "open":
      if (event.type === "REQUEST_CLOSE")
        return { state: "closing", shouldOpen: false, shouldClose: true };
      return { state: "open", shouldOpen: false, shouldClose: false };

    case "closing":
      if (event.type === "CLOSED")
        return { state: "closed", shouldOpen: false, shouldClose: false };
      if (event.type === "REQUEST_OPEN")
        return { state: "opening", shouldOpen: true, shouldClose: false };
      return { state: "closing", shouldOpen: false, shouldClose: false };

    default: {
      const _: never = current;
      return _;
    }
  }
}
