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

function applyPlacementStyle(overlayEl: HTMLElement, placement: Placement): void {
  const value = PLACEMENT_TO_POSITION_AREA[placement];
  (overlayEl.style as unknown as { positionArea?: string }).positionArea = value;
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

  function open(): void {
    (triggerEl.style as unknown as { anchorName?: string }).anchorName = anchorName;
    (overlayEl.style as unknown as { positionAnchor?: string }).positionAnchor = anchorName;
    applyPlacementStyle(overlayEl, currentPlacement);
    overlayEl.setAttribute("popover", mode);

    overlayEl.style.visibility = "hidden";

    requestAnimationFrame(() => {
      if (typeof (overlayEl as unknown as { showPopover?: () => void }).showPopover === "function") {
        (overlayEl as unknown as { showPopover: () => void }).showPopover();
      }
      requestAnimationFrame(() => {
        overlayEl.style.visibility = "";
        onAfterOpen?.();
      });
    });
  }

  function close(): void {
    try {
      if (typeof (overlayEl as unknown as { matches?: (s: string) => boolean }).matches === "function") {
        if ((overlayEl as unknown as { matches: (s: string) => boolean }).matches(":popover-open")) {
          if (typeof (overlayEl as unknown as { hidePopover?: () => void }).hidePopover === "function") {
            (overlayEl as unknown as { hidePopover: () => void }).hidePopover();
          }
        }
      } else {
        if (typeof (overlayEl as unknown as { hidePopover?: () => void }).hidePopover === "function") {
          (overlayEl as unknown as { hidePopover: () => void }).hidePopover();
        }
      }
    } finally {
      onAfterClose?.();
    }
  }

  function updatePlacement(next: Placement): void {
    currentPlacement = next;
    applyPlacementStyle(overlayEl, next);
  }

  function destroy(): void {
    overlayEl.style.visibility = "";
    (triggerEl.style as unknown as { anchorName?: string }).anchorName = "";
    (overlayEl.style as unknown as { positionAnchor?: string }).positionAnchor = "";
  }

  return {
    open,
    close,
    updatePlacement,
    destroy,
  };
}
