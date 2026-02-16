/**
 * Overlay state machine: closed | opening | open | closing.
 * TODO: Implement transitions and reason propagation (setOpen(open, reason)).
 */

import type { OpenChangeReason } from "../types";

export type OverlayState = "closed" | "opening" | "open" | "closing";

export interface StateMachineState {
  state: OverlayState;
  reason: OpenChangeReason | undefined;
}

/**
 * TODO: Implement deterministic transitions and reason propagation.
 */
export function createOverlayStateMachine(): {
  getState: () => StateMachineState;
  setOpen: (_open: boolean, _reason?: OpenChangeReason) => void;
} {
  return {
    getState: () => ({ state: "closed", reason: undefined }),
    setOpen: () => {},
  };
}
