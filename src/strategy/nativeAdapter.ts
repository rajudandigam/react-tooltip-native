/**
 * Native popover adapter: popover attribute, showPopover/hidePopover, anchor injection, flicker mitigation.
 * No portals, no fallback math, no listeners. Used only when strategy is native and Popover API is supported.
 */

import type { Placement } from "../types";
import { makeAnchorName } from "../positioning/anchorInjection";

const PLACEMENT_TO_POSITION_AREA: Record<Placement, string> = {
  top: "top center",
  "top-start": "top start",
  "top-end": "top end",
  bottom: "bottom center",
  "bottom-start": "bottom start",
  "bottom-end": "bottom end",
  left: "left center",
  "left-start": "left start",
  "left-end": "left end",
  right: "right center",
  "right-start": "right start",
  "right-end": "right end",
};

export type NativeAdapterOptions = {
  triggerEl: HTMLElement;
  overlayEl: HTMLElement;
  id: string;
  mode: "auto" | "manual";
  placement: Placement;
  /** Reserved for MVP; native path uses CSS anchor positioning for spacing. */
  offset: number;
  onAfterOpen?: () => void;
  onAfterClose?: () => void;
};

export type NativeAdapter = {
  open(): void;
  close(): void;
  updatePlacement(next: Placement): void;
  destroy(): void;
};

type PopoverStyle = { positionArea?: string; positionAnchor?: string };
type TriggerStyle = { anchorName?: string };

function setPositionArea(el: HTMLElement, value: string): void {
  (el.style as unknown as PopoverStyle).positionArea = value;
}

export function createNativeAdapter(options: NativeAdapterOptions): NativeAdapter {
  const {
    triggerEl,
    overlayEl,
    id,
    mode,
    placement,
    onAfterOpen,
    onAfterClose,
  } = options;

  let currentPlacement = placement;
  const anchorName = makeAnchorName(id);

  let isOpen = false;
  let openRequested = false;
  let openRafId: number | null = null;
  let revealRafId: number | null = null;
  /** True once we have applied anchor/positionAnchor styles in open(); used by destroy() to clear only when we mutated. */
  let hasSetAnchorStyles = false;

  overlayEl.setAttribute("popover", mode);

  function cancelPendingRaf(): void {
    if (openRafId !== null) {
      cancelAnimationFrame(openRafId);
      openRafId = null;
    }
    if (revealRafId !== null) {
      cancelAnimationFrame(revealRafId);
      revealRafId = null;
    }
  }

  function isPopoverOpen(): boolean {
    try {
      return (overlayEl as unknown as { matches: (s: string) => boolean }).matches(":popover-open");
    } catch {
      return false;
    }
  }

  function open(): void {
    if (isOpen) return;
    if (isPopoverOpen()) {
      isOpen = true;
      return;
    }

    openRequested = true;
    cancelPendingRaf();

    (triggerEl.style as unknown as TriggerStyle).anchorName = anchorName;
    (overlayEl.style as unknown as PopoverStyle).positionAnchor = anchorName;
    hasSetAnchorStyles = true;
    setPositionArea(overlayEl, currentPlacement);
    overlayEl.style.visibility = "hidden";

    openRafId = requestAnimationFrame(() => {
      openRafId = null;
      if (!openRequested) return;
      (overlayEl as unknown as { showPopover?: () => void }).showPopover?.();

      revealRafId = requestAnimationFrame(() => {
        revealRafId = null;
        if (!openRequested) return;
        overlayEl.style.visibility = "";
        isOpen = true;
        onAfterOpen?.();
      });
    });
  }

  function close(): void {
    if (!isOpen && !openRequested) return;

    openRequested = false;
    cancelPendingRaf();

    if (isPopoverOpen()) {
      (overlayEl as unknown as { hidePopover: () => void }).hidePopover();
    }
    isOpen = false;
    onAfterClose?.();
  }

  function updatePlacement(next: Placement): void {
    currentPlacement = next;
    setPositionArea(overlayEl, next);
  }

  function destroy(): void {
    openRequested = false;
    cancelPendingRaf();

    if (isOpen && typeof (overlayEl as unknown as { hidePopover?: () => void }).hidePopover === "function") {
      (overlayEl as unknown as { hidePopover: () => void }).hidePopover();
    }
    isOpen = false;

    overlayEl.style.visibility = "";

    if (hasSetAnchorStyles) {
      (triggerEl.style as unknown as TriggerStyle).anchorName = "";
      (overlayEl.style as unknown as PopoverStyle).positionAnchor = "";
    }
  }

  return {
    open,
    close,
    updatePlacement,
    destroy,
  };
}
