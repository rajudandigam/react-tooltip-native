/**
 * Strategy-agnostic interaction logic: hover delays, focus/blur, click, escape, hoverableContent.
 * No DOM listeners here; callers (React handlers) invoke the returned handlers.
 * All timers are cancelable; destroy() cancels them (safe for unmount / React strict mode).
 */

import type { OpenChangeReason } from "../types";

export type InteractionKind = "tooltip" | "popover";

export type InteractionConfig = {
  kind: InteractionKind;
  openDelayMs: number;
  closeDelayMs: number;
  hoverableContent: boolean;
  dismissOnEsc: boolean;
};

export type InteractionRequest =
  | { type: "OPEN_REQUEST"; reason: OpenChangeReason }
  | { type: "CLOSE_REQUEST"; reason: OpenChangeReason }
  | { type: "TOGGLE_REQUEST"; reason: OpenChangeReason };

export type InteractionHandlers = {
  onPointerEnterTrigger(): void;
  onPointerLeaveTrigger(): void;
  onPointerEnterOverlay(): void;
  onPointerLeaveOverlay(): void;
  onFocusTrigger(): void;
  onBlurTrigger(): void;
  onClickTrigger(): void;
  onKeyDownEscape(): void;
  destroy(): void;
};

function noop(): void {}

/**
 * Creates handlers that schedule OPEN/CLOSE/TOGGLE requests via onRequest.
 * Timers are cleared when starting the opposite action or on destroy().
 */
export function createInteractionManager(input: {
  config: InteractionConfig;
  onRequest: (req: InteractionRequest) => void;
}): InteractionHandlers {
  const { config, onRequest } = input;
  const { kind, openDelayMs, closeDelayMs, hoverableContent, dismissOnEsc } = config;

  let openTimerId: ReturnType<typeof setTimeout> | null = null;
  let closeTimerId: ReturnType<typeof setTimeout> | null = null;

  function clearOpenTimer(): void {
    if (openTimerId !== null) {
      clearTimeout(openTimerId);
      openTimerId = null;
    }
  }

  function clearCloseTimer(): void {
    if (closeTimerId !== null) {
      clearTimeout(closeTimerId);
      closeTimerId = null;
    }
  }

  function scheduleOpen(reason: OpenChangeReason): void {
    clearCloseTimer();
    openTimerId = setTimeout(() => {
      openTimerId = null;
      onRequest({ type: "OPEN_REQUEST", reason });
    }, openDelayMs);
  }

  function scheduleClose(reason: OpenChangeReason): void {
    clearOpenTimer();
    closeTimerId = setTimeout(() => {
      closeTimerId = null;
      onRequest({ type: "CLOSE_REQUEST", reason });
    }, closeDelayMs);
  }

  function destroy(): void {
    clearOpenTimer();
    clearCloseTimer();
  }

  if (kind === "tooltip") {
    return {
      onPointerEnterTrigger() {
        scheduleOpen("pointer-enter");
      },
      onPointerLeaveTrigger() {
        scheduleClose("pointer-leave");
      },
      onPointerEnterOverlay() {
        if (hoverableContent) clearCloseTimer();
      },
      onPointerLeaveOverlay() {
        if (hoverableContent) scheduleClose("pointer-leave");
      },
      // Immediate open on focus for accessibility (WCAG 1.4.13); no delay.
      onFocusTrigger() {
        clearOpenTimer();
        clearCloseTimer();
        onRequest({ type: "OPEN_REQUEST", reason: "focus" });
      },
      onBlurTrigger() {
        clearOpenTimer();
        scheduleClose("blur");
      },
      onClickTrigger: noop,
      onKeyDownEscape() {
        if (dismissOnEsc) {
          clearOpenTimer();
          clearCloseTimer();
          onRequest({ type: "CLOSE_REQUEST", reason: "escape" });
        }
      },
      destroy,
    };
  }

  return {
    onPointerEnterTrigger: noop,
    onPointerLeaveTrigger: noop,
    onPointerEnterOverlay: noop,
    onPointerLeaveOverlay: noop,
    onFocusTrigger: noop,
    onBlurTrigger: noop,
    onClickTrigger() {
      clearOpenTimer();
      clearCloseTimer();
      onRequest({ type: "TOGGLE_REQUEST", reason: "click" });
    },
    onKeyDownEscape() {
      if (dismissOnEsc) {
        clearOpenTimer();
        clearCloseTimer();
        onRequest({ type: "CLOSE_REQUEST", reason: "escape" });
      }
    },
    destroy,
  };
}
