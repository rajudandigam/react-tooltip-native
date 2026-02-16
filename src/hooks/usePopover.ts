/**
 * usePopover: headless popover hook per API_SPECS.md.
 * TODO: Wire to useOverlayEngine, strategy resolution, getTriggerProps/getPopoverProps.
 */

import type { RefCallback } from "react";
import { useCallback, useId, useState } from "react";
import type { UsePopoverOptions, UsePopoverReturn } from "../types";
import { getFeatureSupport } from "../strategy/featureDetection";

export function usePopover(options: UsePopoverOptions = {}): UsePopoverReturn {
  const {
    mode: _mode = "auto",
    placement: _placement = "bottom",
    offset: _offset = 8,
    strategy: _strategy = "auto",
    disableAnchorPositioning: _disableAnchorPositioning,
    restoreFocusOnClose: _restoreFocusOnClose = true,
    id: idProp,
  } = options;

  const generatedId = useId();
  const id = idProp ?? (generatedId.replace(/:/g, "") || "rt-popover");
  const [open, setOpenState] = useState(false);
  const supports = getFeatureSupport();

  const setOpen = useCallback((next: boolean, _reason?: import("../types").OpenChangeReason) => {
    setOpenState(next);
  }, []);

  const toggle = useCallback((_reason?: import("../types").OpenChangeReason) => {
    setOpenState((prev) => !prev);
  }, []);

  const getTriggerProps = useCallback(
    <T extends object>(
      props?: T
    ): T & {
      ref: RefCallback<HTMLElement>;
      "aria-expanded"?: boolean;
      "aria-controls"?: string;
      style?: React.CSSProperties;
      onClick?: React.MouseEventHandler<HTMLElement>;
      onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
    } => {
      // TODO: Inject anchorName style; wire click/keydown to interactionManager.
      return {
        ...(props ?? ({} as T)),
        ref: () => {},
        "aria-expanded": open,
        "aria-controls": open ? id : undefined,
        onClick: () => setOpenState((prev) => !prev),
      };
    },
    [open, id]
  );

  const getPopoverProps = useCallback(
    <T extends object>(
      props?: T
    ): T & {
      ref: RefCallback<HTMLElement>;
      id: string;
      style?: React.CSSProperties;
    } => {
      // TODO: Inject positionAnchor style.
      return {
        ...(props ?? ({} as T)),
        ref: () => {},
        id,
      };
    },
    [id]
  );

  return {
    open,
    setOpen,
    toggle,
    getTriggerProps,
    getPopoverProps,
    supports,
  };
}
