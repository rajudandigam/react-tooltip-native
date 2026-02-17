/**
 * usePopover: headless popover hook. Delegates state and lifecycle to useOverlayEngine;
 * provides getTriggerProps/getPopoverProps with anchor injection and interaction wiring.
 */

import type React from "react";
import { useCallback, useId } from "react";
import type { UsePopoverOptions, UsePopoverReturn } from "../types";
import { useOverlayEngine } from "../core/useOverlayEngine";
import { makeAnchorName, withAnchorNameStyle, withPositionAnchorStyle } from "../positioning/anchorInjection";
import { composeRefs } from "./_utils";

export function usePopover(options: UsePopoverOptions = {}): UsePopoverReturn {
  const {
    mode = "auto",
    placement = "bottom",
    offset = 8,
    strategy = "auto",
    disableAnchorPositioning,
    restoreFocusOnClose = true,
    id: idProp,
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    closeOnEsc = true,
    closeOnOutsidePress: closeOnOutsidePressProp,
  } = options;

  const generatedId = useId();
  const id = idProp ?? (generatedId.replace(/:/g, "-") || "rt-popover");
  const anchorName = makeAnchorName(id);

  const closeOnOutsidePress =
    closeOnOutsidePressProp ?? mode === "auto";

  const engine = useOverlayEngine({
    kind: "popover",
    mode,
    placement,
    offset,
    strategy,
    disableAnchorPositioning,
    controlledOpen,
    defaultOpen: defaultOpen ?? false,
    onOpenChange,
    interactionConfig: {
      openDelayMs: 0,
      closeDelayMs: 0,
      hoverableContent: false,
      dismissOnEsc: closeOnEsc,
    },
    closeOnOutsidePress,
    closeOnEsc,
    restoreFocusOnClose,
  });

  const handlers = engine.getInteractionHandlers();
  const { open } = engine;

  const toggle = useCallback(
    (reason?: import("../types").OpenChangeReason) => {
      engine.setOpen(!open, reason ?? "click");
    },
    [engine, open]
  );

  const getTriggerProps = useCallback(
    <T extends object>(
      props?: T
    ): T & {
      ref: React.RefCallback<HTMLElement>;
      "aria-expanded"?: boolean;
      "aria-controls"?: string;
      style?: React.CSSProperties;
      onClick?: React.MouseEventHandler<HTMLElement>;
      onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
    } => {
      const base = (props ?? {}) as T & {
        ref?: React.RefCallback<HTMLElement> | React.RefObject<HTMLElement>;
        style?: React.CSSProperties;
        onClick?: React.MouseEventHandler<HTMLElement>;
        onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
      };
      const withAnchor = withAnchorNameStyle(base, anchorName);
      return {
        ...withAnchor,
        ref: composeRefs<HTMLElement>(engine.triggerRef, base.ref),
        "aria-expanded": open,
        "aria-controls": id,
        onClick: (e) => {
          base.onClick?.(e);
          handlers?.onClickTrigger();
        },
        onKeyDown: (e) => {
          base.onKeyDown?.(e);
          if (e.key === "Escape") handlers?.onKeyDownEscape();
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handlers?.onClickTrigger();
          }
        },
      } as T & {
        ref: React.RefCallback<HTMLElement>;
        "aria-expanded"?: boolean;
        "aria-controls"?: string;
        style?: React.CSSProperties;
        onClick?: React.MouseEventHandler<HTMLElement>;
        onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
      };
    },
    [engine, anchorName, id, open, handlers]
  );

  const getPopoverProps = useCallback(
    <T extends object>(
      props?: T
    ): T & {
      ref: React.RefCallback<HTMLElement>;
      id: string;
      style?: React.CSSProperties;
    } => {
      const base = (props ?? {}) as T & {
        ref?: React.RefCallback<HTMLElement> | React.RefObject<HTMLElement>;
        style?: React.CSSProperties;
      };
      const withAnchor = withPositionAnchorStyle(base, anchorName);
      return {
        ...withAnchor,
        ref: composeRefs<HTMLElement>(engine.overlayRef, base.ref),
        id,
      } as T & {
        ref: React.RefCallback<HTMLElement>;
        id: string;
        style?: React.CSSProperties;
      };
    },
    [engine, anchorName, id]
  );

  return {
    open,
    setOpen: engine.setOpen,
    toggle,
    getTriggerProps,
    getPopoverProps,
    supports: engine.supports,
  };
}
