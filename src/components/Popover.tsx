/**
 * Popover component per API_SPECS.md.
 * TODO: Wire to usePopover, native/fallback adapters, anchor injection, ARIA, focus restore.
 */

import React from "react";
import type { PopoverProps } from "../types";
import { usePopover } from "../hooks/usePopover";

export function Popover({
  children,
  content,
  mode = "auto",
  placement = "bottom",
  offset = 8,
  open: controlledOpen,
  defaultOpen: _defaultOpen,
  onOpenChange: _onOpenChange,
  trigger: _trigger = "click",
  closeOnEsc: _closeOnEsc = true,
  closeOnOutsidePress: _closeOnOutsidePress,
  restoreFocusOnClose = true,
  initialFocus: _initialFocus,
  strategy = "auto",
  disableAnchorPositioning,
  id: idProp,
  ariaLabel,
  setAriaExpanded: _setAriaExpanded = true,
  setAriaControls: _setAriaControls = true,
  className,
  style,
}: PopoverProps) {
  const isControlled = controlledOpen !== undefined;
  const {
    open,
    setOpen: _setOpen,
    toggle: _toggle,
    getTriggerProps,
    getPopoverProps,
    supports: _supports,
  } = usePopover({
    mode,
    placement,
    offset,
    strategy,
    disableAnchorPositioning,
    restoreFocusOnClose,
    id: idProp,
  });

  const effectiveOpen = isControlled ? controlledOpen : open;
  // TODO: Call onOpenChange when open state changes; outside-press/Esc.

  const triggerProps = getTriggerProps();
  const popoverProps = getPopoverProps();
  void _defaultOpen;
  void _onOpenChange;
  void _trigger;
  void _closeOnEsc;
  void _closeOnOutsidePress;
  void _setAriaExpanded;
  void _setAriaControls;
  void _initialFocus;
  void _setOpen;
  void _toggle;

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
      {/* TODO: Render overlay (popover="auto"|"manual" in native path); conditional on effectiveOpen. */}
      {effectiveOpen && (
        <div
          {...popoverProps}
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
