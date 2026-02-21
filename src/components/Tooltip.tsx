/**
 * Tooltip component: thin wrapper over useTooltip. Renders trigger (cloned) and overlay when open.
 * ARIA tooltip pattern; WCAG 1.4.13 hoverable content via hook.
 * React 19: do not access element.ref or child.props.ref (can trigger warning). Use engine ref only.
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
  triggerRef,
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

  const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
  const triggerProps = getTriggerProps({ ref: triggerRef });
  const mergedTriggerProps: Record<string, unknown> = { ...triggerProps };
  for (const key of Object.keys(child.props)) {
    if (key !== "ref") mergedTriggerProps[key] = (child.props as Record<string, unknown>)[key];
  }
  mergedTriggerProps.ref = triggerProps.ref;

  const overlayStyle = mergeStyles(DEFAULT_OVERLAY_STYLE, {
    ...(style ?? {}),
    pointerEvents: hoverableContent === false ? "none" : "auto",
  });

  const tooltipProps = getTooltipProps({
    className,
    style: overlayStyle,
    ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
    "data-rt-overlay": "tooltip",
  });

  return (
    <>
      {React.createElement(child.type as React.ElementType, mergedTriggerProps)}
      {open && (
        <div
          {...tooltipProps}
          style={{
            ...tooltipProps.style,
          }}
          aria-hidden={false}
        >
          {content}
        </div>
      )}
    </>
  );
}
