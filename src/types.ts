/**
 * Shared core types per API_SPECS.md.
 * Non-React types are re-exported from core.ts; all types from index.ts and react.ts.
 */

export type OverlayMode = "auto" | "manual";

export type Placement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "left-start"
  | "left-end"
  | "right-start"
  | "right-end";

export type Strategy = "auto" | "native" | "fallback";

export type OpenChangeReason =
  | "pointer-enter"
  | "pointer-leave"
  | "focus"
  | "blur"
  | "click"
  | "escape"
  | "outside-press"
  | "programmatic";

// React-dependent types (used by components and hooks)
import type React from "react";

export interface TooltipProps {
  /** The trigger element */
  children: React.ReactElement;
  /** Tooltip content */
  content: React.ReactNode;
  /** Placement relative to trigger */
  placement?: Placement;
  /** Gap in pixels between trigger and tooltip */
  offset?: number;
  /** Controlled mode */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason: OpenChangeReason) => void;
  /** Hover/focus timing */
  openDelay?: number;
  closeDelay?: number;
  /** WCAG 1.4.13 compliance */
  hoverableContent?: boolean;
  dismissOnEsc?: boolean;
  /** Rendering strategy */
  strategy?: Strategy;
  disableAnchorPositioning?: boolean;
  /** Accessibility */
  id?: string;
  describeOnlyWhenOpen?: boolean;
  ariaLabel?: string;
  /** Styling */
  className?: string;
  style?: React.CSSProperties;
}

export interface PopoverProps {
  children: React.ReactElement;
  content: React.ReactNode;
  mode?: OverlayMode;
  placement?: Placement;
  offset?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason: OpenChangeReason) => void;
  trigger?: "click" | "click-and-focus";
  closeOnEsc?: boolean;
  closeOnOutsidePress?: boolean;
  restoreFocusOnClose?: boolean;
  initialFocus?: "first" | "none" | React.RefObject<HTMLElement>;
  strategy?: Strategy;
  disableAnchorPositioning?: boolean;
  id?: string;
  ariaLabel?: string;
  setAriaExpanded?: boolean;
  setAriaControls?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface UseTooltipOptions {
  placement?: Placement;
  offset?: number;
  openDelay?: number;
  closeDelay?: number;
  hoverableContent?: boolean;
  dismissOnEsc?: boolean;
  strategy?: Strategy;
  disableAnchorPositioning?: boolean;
  id?: string;
  /** Controlled: when set, open state is driven by this prop */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason: OpenChangeReason) => void;
  /** When true (default), aria-describedby is only set when open */
  describeOnlyWhenOpen?: boolean;
}

export interface UseTooltipReturn {
  open: boolean;
  setOpen: (open: boolean, reason?: OpenChangeReason) => void;
  getTriggerProps: <T extends object>(
    props?: T
  ) => T & {
    ref: React.RefCallback<HTMLElement>;
    "aria-describedby"?: string;
    style?: React.CSSProperties;
    onPointerEnter?: React.PointerEventHandler<HTMLElement>;
    onPointerLeave?: React.PointerEventHandler<HTMLElement>;
    onFocus?: React.FocusEventHandler<HTMLElement>;
    onBlur?: React.FocusEventHandler<HTMLElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  };
  getTooltipProps: <T extends object>(
    props?: T
  ) => T & {
    ref: React.RefCallback<HTMLElement>;
    role: "tooltip";
    id: string;
    style?: React.CSSProperties;
    onPointerEnter?: React.PointerEventHandler<HTMLElement>;
    onPointerLeave?: React.PointerEventHandler<HTMLElement>;
  };
  supports: {
    popover: boolean;
    anchorPositioning: boolean;
  };
}

export interface UsePopoverOptions {
  mode?: OverlayMode;
  placement?: Placement;
  offset?: number;
  strategy?: Strategy;
  disableAnchorPositioning?: boolean;
  restoreFocusOnClose?: boolean;
  id?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason: OpenChangeReason) => void;
  closeOnEsc?: boolean;
  closeOnOutsidePress?: boolean;
  setAriaExpanded?: boolean;
  setAriaControls?: boolean;
}

export interface UsePopoverReturn {
  open: boolean;
  setOpen: (open: boolean, reason?: OpenChangeReason) => void;
  toggle: (reason?: OpenChangeReason) => void;
  getTriggerProps: <T extends object>(
    props?: T
  ) => T & {
    ref: React.RefCallback<HTMLElement>;
    "aria-expanded"?: boolean;
    "aria-controls"?: string;
    style?: React.CSSProperties;
    onClick?: React.MouseEventHandler<HTMLElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  };
  getPopoverProps: <T extends object>(
    props?: T
  ) => T & {
    ref: React.RefCallback<HTMLElement>;
    id: string;
    style?: React.CSSProperties;
  };
  supports: {
    popover: boolean;
    anchorPositioning: boolean;
  };
}
