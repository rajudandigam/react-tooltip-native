/**
 * useTooltip: headless tooltip hook. Delegates state and lifecycle to useOverlayEngine;
 * provides getTriggerProps/getTooltipProps with anchor injection and interaction wiring.
 */

import type React from "react";
import { useCallback, useId } from "react";
import type { UseTooltipOptions, UseTooltipReturn } from "../types";
import { useOverlayEngine } from "../core/useOverlayEngine";
import { makeAnchorName, withAnchorNameStyle, withPositionAnchorStyle } from "../positioning/anchorInjection";
import { composeRefs } from "./_utils";

export function useTooltip(options: UseTooltipOptions = {}): UseTooltipReturn {
  const {
    placement = "top",
    offset = 8,
    openDelay = 500,
    closeDelay = 100,
    hoverableContent = true,
    dismissOnEsc = true,
    strategy = "auto",
    disableAnchorPositioning,
    id: idProp,
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    describeOnlyWhenOpen = true,
  } = options;

  const generatedId = useId();
  const id = idProp ?? (generatedId.replace(/:/g, "-") || "rt-tooltip");
  const anchorName = makeAnchorName(id);

  const engine = useOverlayEngine({
    kind: "tooltip",
    mode: "auto",
    placement,
    offset,
    strategy,
    disableAnchorPositioning,
    controlledOpen,
    defaultOpen: defaultOpen ?? false,
    onOpenChange,
    interactionConfig: {
      openDelayMs: openDelay,
      closeDelayMs: closeDelay,
      hoverableContent,
      dismissOnEsc,
    },
    closeOnOutsidePress: false,
    closeOnEsc: dismissOnEsc,
  });

  const handlers = engine.getInteractionHandlers();
  const { open } = engine;

  const getTriggerProps = useCallback(
    <T extends object>(
      props?: T
    ): T & {
      ref: React.RefCallback<HTMLElement>;
      "aria-describedby"?: string;
      style?: React.CSSProperties;
      onPointerEnter?: React.PointerEventHandler<HTMLElement>;
      onPointerLeave?: React.PointerEventHandler<HTMLElement>;
      onFocus?: React.FocusEventHandler<HTMLElement>;
      onBlur?: React.FocusEventHandler<HTMLElement>;
      onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
    } => {
      const base = (props ?? {}) as T & {
        ref?: React.RefCallback<HTMLElement> | React.RefObject<HTMLElement>;
        style?: React.CSSProperties;
        onPointerEnter?: React.PointerEventHandler<HTMLElement>;
        onPointerLeave?: React.PointerEventHandler<HTMLElement>;
        onFocus?: React.FocusEventHandler<HTMLElement>;
        onBlur?: React.FocusEventHandler<HTMLElement>;
        onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
      };
      const withAnchor = withAnchorNameStyle(base, anchorName);
      return {
        ...withAnchor,
        ref: composeRefs<HTMLElement>(engine.triggerRef, base.ref),
        ...(describeOnlyWhenOpen && open ? { "aria-describedby": id } : {}),
        onPointerEnter: (e) => {
          base.onPointerEnter?.(e);
          handlers?.onPointerEnterTrigger();
        },
        onPointerLeave: (e) => {
          base.onPointerLeave?.(e);
          handlers?.onPointerLeaveTrigger();
        },
        onFocus: (e) => {
          base.onFocus?.(e);
          handlers?.onFocusTrigger();
        },
        onBlur: (e) => {
          base.onBlur?.(e);
          handlers?.onBlurTrigger();
        },
        onKeyDown: (e) => {
          base.onKeyDown?.(e);
          if (e.key === "Escape") handlers?.onKeyDownEscape();
        },
      } as T & {
        ref: React.RefCallback<HTMLElement>;
        "aria-describedby"?: string;
        style?: React.CSSProperties;
        onPointerEnter?: React.PointerEventHandler<HTMLElement>;
        onPointerLeave?: React.PointerEventHandler<HTMLElement>;
        onFocus?: React.FocusEventHandler<HTMLElement>;
        onBlur?: React.FocusEventHandler<HTMLElement>;
        onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
      };
    },
    [engine, anchorName, id, open, describeOnlyWhenOpen, handlers]
  );

  const getTooltipProps = useCallback(
    <T extends object>(
      props?: T
    ): T & {
      ref: React.RefCallback<HTMLElement>;
      role: "tooltip";
      id: string;
      style?: React.CSSProperties;
      onPointerEnter?: React.PointerEventHandler<HTMLElement>;
      onPointerLeave?: React.PointerEventHandler<HTMLElement>;
    } => {
      const base = (props ?? {}) as T & {
        ref?: React.RefCallback<HTMLElement> | React.RefObject<HTMLElement>;
        style?: React.CSSProperties;
        onPointerEnter?: React.PointerEventHandler<HTMLElement>;
        onPointerLeave?: React.PointerEventHandler<HTMLElement>;
      };
      const withAnchor = withPositionAnchorStyle(base, anchorName);
      return {
        ...withAnchor,
        ref: composeRefs<HTMLElement>(engine.overlayRef, base.ref),
        role: "tooltip",
        id,
        onPointerEnter: (e) => {
          base.onPointerEnter?.(e);
          handlers?.onPointerEnterOverlay();
        },
        onPointerLeave: (e) => {
          base.onPointerLeave?.(e);
          handlers?.onPointerLeaveOverlay();
        },
      } as T & {
        ref: React.RefCallback<HTMLElement>;
        role: "tooltip";
        id: string;
        style?: React.CSSProperties;
        onPointerEnter?: React.PointerEventHandler<HTMLElement>;
        onPointerLeave?: React.PointerEventHandler<HTMLElement>;
      };
    },
    [engine, anchorName, id, handlers]
  );

  return {
    open,
    setOpen: engine.setOpen,
    getTriggerProps,
    getTooltipProps,
    supports: engine.supports,
  };
}
