Excellent — now we’ll formalize the public API for react-tooltip-native, fully aligned with:
Native-first + fallback architecture
Automatic anchor injection
Behavior parity contract
WCAG/APG compliance
Headless-first philosophy
Bundle discipline
This is the final public API surface for MVP (Phase 1).

📦 Public API — react-tooltip-native
The API is intentionally small, predictable, and extensible.

1️⃣ Design Philosophy
Two usage levels
Level
For
API
90% of users
Simple usage
<Tooltip />, <Popover />
Advanced users
Custom composition
useTooltip(), usePopover()


2️⃣ Shared Core Types
export type OverlayMode = "auto" | "manual";

export type Placement =
  | "top" | "bottom" | "left" | "right"
  | "top-start" | "top-end"
  | "bottom-start" | "bottom-end"
  | "left-start" | "left-end"
  | "right-start" | "right-end";

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


3️⃣ <Tooltip /> Component
Purpose
Short descriptive content.
Non-interactive by default (ARIA tooltip pattern compliant).

Props
export interface TooltipProps {
  /** The trigger element */
  children: React.ReactElement;

  /** Tooltip content */
  content: React.ReactNode;

  /** Placement relative to trigger */
  placement?: Placement; // default: "top"

  /** Gap in pixels between trigger and tooltip */
  offset?: number; // default: 8

  /** Controlled mode */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    reason: OpenChangeReason
  ) => void;

  /** Hover/focus timing */
  openDelay?: number;  // default: 500ms
  closeDelay?: number; // default: 100ms

  /** WCAG 1.4.13 compliance */
  hoverableContent?: boolean; // default: true
  dismissOnEsc?: boolean;     // default: true

  /** Rendering strategy */
  strategy?: Strategy; // default: "auto"
  disableAnchorPositioning?: boolean;

  /** Accessibility */
  id?: string; // auto-generated if omitted
  describeOnlyWhenOpen?: boolean; // default: true
  ariaLabel?: string;

  /** Styling */
  className?: string;
  style?: React.CSSProperties;
}


Behavioral Guarantees
Injects:
role="tooltip" on overlay
aria-describedby on trigger
Automatically injects:
anchorName on trigger
positionAnchor on overlay
Uses Popover API in native mode
No focus trapping
Supports Esc dismiss
Hoverable by default (WCAG compliant)

Example
<Tooltip content="Copy to clipboard">
  <button>📋</button>
</Tooltip>


4️⃣ <Popover /> Component
Purpose
Interactive overlay container.

Props
export interface PopoverProps {
  children: React.ReactElement;
  content: React.ReactNode;

  /** popover="auto" or "manual" */
  mode?: OverlayMode; // default: "auto"

  placement?: Placement; // default: "bottom"
  offset?: number; // default: 8

  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    reason: OpenChangeReason
  ) => void;

  /** Interaction type */
  trigger?: "click" | "click-and-focus"; // default: "click"

  closeOnEsc?: boolean; // default: true
  closeOnOutsidePress?: boolean; // auto=true, manual=false

  /** Focus management */
  restoreFocusOnClose?: boolean; // default: true
  initialFocus?: 
    | "first"
    | "none"
    | React.RefObject<HTMLElement>;

  /** Rendering */
  strategy?: Strategy; // default: "auto"
  disableAnchorPositioning?: boolean;

  /** Accessibility */
  id?: string;
  ariaLabel?: string;
  setAriaExpanded?: boolean; // default: true
  setAriaControls?: boolean; // default: true

  /** Styling */
  className?: string;
  style?: React.CSSProperties;
}


Native Mapping
If supported:
<div popover="auto">

or
<div popover="manual">


Example
<Popover content={<ProfileMenu />}>
  <Avatar />
</Popover>


5️⃣ Headless Hook API
For advanced composition.

useTooltip()
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
}

Return
export interface UseTooltipReturn {
  open: boolean;
  setOpen: (
    open: boolean,
    reason?: OpenChangeReason
  ) => void;

  getTriggerProps: <T extends object>(
    props?: T
  ) => T & {
    ref: React.RefCallback<HTMLElement>;
    "aria-describedby"?: string;
    style?: React.CSSProperties; // anchorName injected
    onPointerEnter?: any;
    onPointerLeave?: any;
    onFocus?: any;
    onBlur?: any;
    onKeyDown?: any;
  };

  getTooltipProps: <T extends object>(
    props?: T
  ) => T & {
    ref: React.RefCallback<HTMLElement>;
    role: "tooltip";
    id: string;
    style?: React.CSSProperties; // positionAnchor injected
  };

  supports: {
    popover: boolean;
    anchorPositioning: boolean;
  };
}


Example (Headless)
const {
  open,
  getTriggerProps,
  getTooltipProps
} = useTooltip({ placement: "right" });

return (
  <>
    <button {...getTriggerProps()}>
      Hover me
    </button>
    {open && (
      <div {...getTooltipProps()}>
        Tooltip content
      </div>
    )}
  </>
);


usePopover()
export interface UsePopoverOptions {
  mode?: OverlayMode;
  placement?: Placement;
  offset?: number;
  strategy?: Strategy;
  disableAnchorPositioning?: boolean;
  restoreFocusOnClose?: boolean;
  id?: string;
}

Return
export interface UsePopoverReturn {
  open: boolean;

  setOpen: (
    open: boolean,
    reason?: OpenChangeReason
  ) => void;

  toggle: (reason?: OpenChangeReason) => void;

  getTriggerProps: <T extends object>(
    props?: T
  ) => T & {
    ref: React.RefCallback<HTMLElement>;
    "aria-expanded"?: boolean;
    "aria-controls"?: string;
    style?: React.CSSProperties; // anchorName injected
    onClick?: any;
    onKeyDown?: any;
  };

  getPopoverProps: <T extends object>(
    props?: T
  ) => T & {
    ref: React.RefCallback<HTMLElement>;
    id: string;
    style?: React.CSSProperties; // positionAnchor injected
  };

  supports: {
    popover: boolean;
    anchorPositioning: boolean;
  };
}


6️⃣ Automatic Anchor Injection (Public Behavior)
Developers NEVER need to write:
anchor-name: --my-anchor;
position-anchor: --my-anchor;

The hook injects:
style: {
  anchorName: "--rt-123"
}

and
style: {
  positionAnchor: "--rt-123"
}

This keeps API ergonomic.

7️⃣ Strategy Contract (Publicly Documented)
"auto"
Use Popover + Anchor if available, otherwise fallback.
"native"
Force Popover API. If not supported → fallback.
"fallback"
Skip Popover API entirely.

8️⃣ Developer Guarantees
When using default configuration:
No z-index hacks required
Works inside transformed containers
Works inside overflow:hidden parents
No continuous scroll listeners in native mode
Bundle stays ≤ 4KB gzip

9️⃣ What Is NOT Public (Internal Only)
ResizeObserver wiring
Scroll parent detection
Fallback math
Flicker mitigation sequence
Strategy resolution logic
These remain internal.

🔟 MVP Public Surface Summary
Exported API:
export { Tooltip } from "./components/Tooltip";
export { Popover } from "./components/Popover";

export { useTooltip } from "./hooks/useTooltip";
export { usePopover } from "./hooks/usePopover";

export type {
  OverlayMode,
  Placement,
  Strategy,
  OpenChangeReason
};

That’s it.
Small, clean, production-grade.

Final Assessment
This API:
Matches the PRD
Integrates expert feedback
Avoids over-engineering
Keeps surface area tight
Is extensible for Phase 2
Preserves bundle discipline
Supports headless design systems
Aligns with WCAG/APG expectations
