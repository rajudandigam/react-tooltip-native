/**
 * useTooltip: headless tooltip hook per API_SPECS.md.
 * TODO: Wire to useOverlayEngine, strategy resolution, getTriggerProps/getTooltipProps.
 */

import type { RefCallback } from "react";
import { useCallback, useId, useState } from "react";
import type { UseTooltipOptions, UseTooltipReturn } from "../types";
import { detectSupports } from "../strategy/featureDetection";

export function useTooltip(options: UseTooltipOptions = {}): UseTooltipReturn {
  const {
    placement: _placement = "top",
    offset: _offset = 8,
    openDelay: _openDelay = 500,
    closeDelay: _closeDelay = 100,
    hoverableContent: _hoverableContent = true,
    dismissOnEsc: _dismissOnEsc = true,
    strategy: _strategy = "auto",
    disableAnchorPositioning: _disableAnchorPositioning,
    id: idProp,
  } = options;

  const generatedId = useId();
  const id = idProp ?? (generatedId.replace(/:/g, "") || "rt-tooltip");
  const [open, setOpenState] = useState(false);
  const supports = detectSupports();

  const setOpen = useCallback((next: boolean, _reason?: import("../types").OpenChangeReason) => {
    setOpenState(next);
  }, []);

  const getTriggerProps = useCallback(
    <T extends object>(
      props?: T
    ): T & {
      ref: RefCallback<HTMLElement>;
      "aria-describedby"?: string;
      style?: React.CSSProperties;
      onPointerEnter?: React.PointerEventHandler<HTMLElement>;
      onPointerLeave?: React.PointerEventHandler<HTMLElement>;
      onFocus?: React.FocusEventHandler<HTMLElement>;
      onBlur?: React.FocusEventHandler<HTMLElement>;
      onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
    } => {
      // TODO: Inject anchorName style; wire pointer/focus/keydown to interactionManager.
      return {
        ...(props ?? ({} as T)),
        ref: () => {},
        ...(open ? { "aria-describedby": id } : {}),
      };
    },
    [open, id]
  );

  const getTooltipProps = useCallback(
    <T extends object>(
      props?: T
    ): T & {
      ref: RefCallback<HTMLElement>;
      role: "tooltip";
      id: string;
      style?: React.CSSProperties;
    } => {
      // TODO: Inject positionAnchor style.
      return {
        ...(props ?? ({} as T)),
        ref: () => {},
        role: "tooltip",
        id,
      };
    },
    [id]
  );

  return {
    open,
    setOpen,
    getTriggerProps,
    getTooltipProps,
    supports,
  };
}
