/**
 * Popover component: thin wrapper over usePopover. Renders trigger (cloned) and panel when open.
 * Supports initialFocus and trigger="click-and-focus".
 * React 19: do not access element.ref or child.props.ref (can trigger warning). Use engine ref only.
 */

import React, { useEffect, useRef } from "react";
import type { PopoverProps } from "../types";
import { usePopover } from "../hooks/usePopover";
import { composeRefs, mergeStyles } from "../hooks/_utils";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const DEFAULT_PANEL_STYLE: React.CSSProperties = {
  maxWidth: 320,
  pointerEvents: "auto",
};

export function Popover({
  children,
  triggerRef,
  content,
  mode = "auto",
  placement = "bottom",
  offset = 8,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  trigger = "click",
  closeOnEsc = true,
  closeOnOutsidePress,
  restoreFocusOnClose = true,
  initialFocus,
  strategy = "auto",
  disableAnchorPositioning,
  id,
  ariaLabel,
  setAriaExpanded = true,
  setAriaControls = true,
  className,
  style,
}: PopoverProps) {
  const panelRef = useRef<HTMLElement>(null);

  const {
    open,
    setOpen,
    getTriggerProps,
    getPopoverProps,
  } = usePopover({
    mode,
    placement,
    offset,
    strategy,
    disableAnchorPositioning,
    restoreFocusOnClose,
    id,
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    closeOnEsc,
    closeOnOutsidePress,
    setAriaExpanded,
    setAriaControls,
  });

  const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
  let triggerProps = getTriggerProps({ ref: triggerRef });

  if (trigger === "click-and-focus") {
    const existingOnFocus = (triggerProps as { onFocus?: React.FocusEventHandler<HTMLElement> }).onFocus;
    triggerProps = {
      ...triggerProps,
      onFocus: (e: React.FocusEvent<HTMLElement>) => {
        existingOnFocus?.(e);
        setOpen(true, "focus");
      },
    } as typeof triggerProps;
  }
  const mergedTriggerProps: Record<string, unknown> = { ...triggerProps };
  for (const key of Object.keys(child.props)) {
    if (key !== "ref") mergedTriggerProps[key] = (child.props as Record<string, unknown>)[key];
  }
  mergedTriggerProps.ref = triggerProps.ref;

  const basePopoverProps = getPopoverProps({
    className,
    style: mergeStyles(DEFAULT_PANEL_STYLE, style ?? {}),
    ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
    "data-rt-overlay": "popover",
  });
  const popoverProps = {
    ...basePopoverProps,
    ref: composeRefs(panelRef, basePopoverProps.ref),
  };

  useEffect(() => {
    if (!open || !initialFocus) return;

    if (initialFocus === "first") {
      const el = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      el?.focus();
    } else if (initialFocus === "none") {
      // no-op
    } else if ("current" in initialFocus && initialFocus.current) {
      initialFocus.current.focus();
    }
  }, [open, initialFocus]);

  return (
    <>
      {React.createElement(child.type as React.ElementType, mergedTriggerProps)}
      <div
        {...popoverProps}
        hidden={!open}
        data-state={open ? "open" : "closed"}
        style={{
          ...popoverProps.style,
          ...(open
            ? {}
            : {
                visibility: "hidden",
                pointerEvents: "none",
              }),
        }}
      >
        {content}
      </div>
    </>
  );
}
