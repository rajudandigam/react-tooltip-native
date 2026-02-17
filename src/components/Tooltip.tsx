/**
 * Tooltip component: thin wrapper over useTooltip. Renders trigger (cloned) and overlay when open.
 * ARIA tooltip pattern; WCAG 1.4.13 hoverable content via hook.
 */

import React from "react";
import type { TooltipProps } from "../types";
import { useTooltip } from "../hooks/useTooltip";
import { mergeStyles } from "../hooks/_utils";

const DEFAULT_OVERLAY_STYLE: React.CSSProperties = {
  maxWidth: 320,
};

export function Tooltip({
  children,
  content,
  placement = "top",
  offset = 8,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  openDelay = 500,
  closeDelay = 100,
  hoverableContent = true,
  dismissOnEsc = true,
  strategy = "auto",
  disableAnchorPositioning,
  id,
  describeOnlyWhenOpen = true,
  ariaLabel,
  className,
  style,
}: TooltipProps) {
  const { open, getTriggerProps, getTooltipProps } = useTooltip({
    placement,
    offset,
    openDelay,
    closeDelay,
    hoverableContent,
    dismissOnEsc,
    strategy,
    disableAnchorPositioning,
    id,
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    describeOnlyWhenOpen,
  });

  const child = React.Children.only(children) as React.ReactElement<{ ref?: React.Ref<HTMLElement> }>;
  const triggerProps = getTriggerProps({ ref: child.ref });

  const tooltipProps = getTooltipProps({
    className,
    style: mergeStyles(DEFAULT_OVERLAY_STYLE, style ?? {}),
    ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
    "data-rt-overlay": "tooltip",
  });

  return (
    <>
      {React.cloneElement(child, triggerProps)}
      <div
        {...tooltipProps}
        hidden={!open}
        data-state={open ? "open" : "closed"}
        style={{
          ...tooltipProps.style,
          pointerEvents: hoverableContent ? "auto" : "none",
          ...(open
            ? {}
            : {
                visibility: "hidden",
                pointerEvents: "none",
              }),
        }}
        aria-hidden={!open}
      >
        {content}
      </div>
    </>
  );
}
