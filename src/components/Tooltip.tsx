/**
 * Tooltip component per API_SPECS.md.
 * TODO: Wire to useTooltip, native/fallback adapters, anchor injection, ARIA.
 */

import React from "react";
import type { TooltipProps } from "../types";
import { useTooltip } from "../hooks/useTooltip";

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
  id: idProp,
  describeOnlyWhenOpen: _describeOnlyWhenOpen = true,
  ariaLabel,
  className,
  style,
}: TooltipProps) {
  const isControlled = controlledOpen !== undefined;
  const {
    open,
    setOpen: setOpenInternal,
    getTriggerProps,
    getTooltipProps,
    supports: _supports,
  } = useTooltip({
    placement,
    offset,
    openDelay,
    closeDelay,
    hoverableContent,
    dismissOnEsc,
    strategy,
    disableAnchorPositioning,
    id: idProp,
  });

  const effectiveOpen = isControlled ? controlledOpen : open;
  // TODO: Call onOpenChange when open state changes (setOpen callback or effect).
  void _describeOnlyWhenOpen;
  void defaultOpen;
  void onOpenChange;
  void setOpenInternal;

  // TODO: Use getTriggerProps on cloned child; render overlay with getTooltipProps and content.
  const triggerProps = getTriggerProps();
  const tooltipProps = getTooltipProps();

  type ChildProps = { ref?: React.Ref<HTMLElement> };
  const childElement = children as React.ReactElement<ChildProps>;
  const childRef = (childElement as unknown as { ref?: React.Ref<HTMLElement> }).ref;

  return (
    <>
      {React.cloneElement(childElement, {
        ...triggerProps,
        ...childElement.props,
        ref: (el: HTMLElement | null) => {
          if (el) {
            (triggerProps.ref as (el: HTMLElement | null) => void)(el);
            if (typeof childRef === "function") childRef(el);
            else if (childRef && typeof childRef === "object") (childRef as React.MutableRefObject<HTMLElement | null>).current = el;
          }
        },
      })}
      {/* TODO: Render overlay in correct layer (native Top Layer or fallback); conditional on effectiveOpen. */}
      {effectiveOpen && (
        <div
          {...tooltipProps}
          className={className}
          style={style}
          aria-label={ariaLabel}
          data-rt-overlay
        >
          {content}
        </div>
      )}
    </>
  );
}
