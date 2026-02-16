We now move from product definition to production-grade internal architecture.
This document defines:
Internal module boundaries


Rendering pipeline


Native adapter


Fallback adapter


Lifecycle sequencing


Anchor injection implementation


Flicker mitigation strategy


Behavior parity contract


Performance model


DX guarantees


This is the Final Architecture Document for react-tooltip-native (MVP).

🏗️ Final Architecture Document
react-tooltip-native – MVP (Phase 1)

1️⃣ Architectural Principles
Native-first always


Use Popover API if supported.


Use CSS Anchor Positioning if supported.


Only activate JS fallback when necessary.


Behavior parity across strategies


Native and fallback must feel identical.


No portals in native path


Top Layer handles rendering plane.


Minimal fallback math


No Floating UI.


No heavy collision engine.


Viewport clamp only.


Headless-first design


Logic separated from presentation.



2️⃣ High-Level Architecture Overview
┌──────────────────────────────┐
│ React App                    │
│                              │
│  <Tooltip /> / <Popover />  │
│        │                     │
│        ▼                     │
│  useOverlayEngine()         │
│        │                     │
│        ▼                     │
│  Strategy Resolver          │
│   (native vs fallback)      │
│        │                     │
│   ┌────┴─────┐               │
│   ▼          ▼               │
│ Native    Fallback Adapter   │
│ Adapter     (Observers + JS) │
│   │          │               │
│   ▼          ▼               │
│ Browser Top Layer or         │
│ Positioned DOM Node          │
└──────────────────────────────┘


3️⃣ Internal Module Structure
src/
 ├─ core/
 │   ├─ useOverlayEngine.ts
 │   ├─ stateMachine.ts
 │   ├─ interactionManager.ts
 │   ├─ accessibility.ts
 │
 ├─ strategy/
 │   ├─ resolveStrategy.ts
 │   ├─ nativeAdapter.ts
 │   ├─ fallbackAdapter.ts
 │   ├─ featureDetection.ts
 │
 ├─ positioning/
 │   ├─ anchorInjection.ts
 │   ├─ fallbackPositioning.ts
 │   ├─ scrollParents.ts
 │
 ├─ components/
 │   ├─ Tooltip.tsx
 │   ├─ Popover.tsx
 │
 └─ hooks/
     ├─ useTooltip.ts
     ├─ usePopover.ts


4️⃣ Strategy Resolution
Strategy Modes
strategy?: "native" | "fallback" | "auto"

Resolution Logic
if strategy === "native":
    if supports.popover:
        use nativeAdapter
    else:
        fallbackAdapter

if strategy === "fallback":
    fallbackAdapter

if strategy === "auto":
    if supports.popover:
        nativeAdapter
    else:
        fallbackAdapter


5️⃣ Feature Detection Layer
Popover Detection
const supportsPopover =
  typeof HTMLElement !== "undefined" &&
  "showPopover" in HTMLElement.prototype;

Anchor Positioning Detection
const supportsAnchor =
  typeof CSS !== "undefined" &&
  CSS.supports("position-anchor: --x");

Expose via:
supports: {
  popover: boolean;
  anchorPositioning: boolean;
}


6️⃣ Native Adapter (Core of Library)
Responsibilities
Apply popover="auto|manual"


Manage showPopover / hidePopover


Inject anchor styles


Handle flicker mitigation


Sync open state



6.1 Anchor Injection (Automatic)
Trigger injection
style: {
  anchorName: `--rt-${id}`
}

Important:
anchor-name is a real CSS property.


Value must be dashed-ident like --rt-123.



Overlay injection
style: {
  positionAnchor: `--rt-${id}`
}

No user wiring required.

6.2 Placement Mapping (Native Path)
Map Placement → CSS:
Example:
position-area: top center;

Future:
 Support @position-try for flipping.

6.3 Flicker Mitigation (Critical)
Sequence:
1. Inject anchor styles
2. Inject placement styles
3. requestAnimationFrame()
4. call showPopover()

Alternative safe fallback:
visibility: hidden;
apply styles;
showPopover();
next frame → visibility: visible;

No visible (0,0) flash allowed.

6.4 Mode Mapping
Prop
Native Mapping
auto
popover="auto"
manual
popover="manual"


6.5 Behavior Contract
Native behavior must:
Esc closes (if enabled)


auto mode light-dismiss works


manual mode persists


Focus restoration optional



7️⃣ Fallback Adapter
Activated when:
Popover unsupported
 OR


strategy === "fallback"



7.1 Rendering Model (Fallback)
Overlay remains in normal DOM


Positioned via position: fixed


No React portal unless necessary


(Portal optional later — not MVP requirement)

7.2 Positioning Engine
Minimal math:
rect = trigger.getBoundingClientRect()
overlayRect = overlay.getBoundingClientRect()

switch placement:
  top:
    x = rect.centerX - overlay.width / 2
    y = rect.top - overlay.height - offset
...
Clamp to viewport

Support:
start / end alignment


offset


viewport bounds


No advanced collision tree.

7.3 Observers (Performance Critical)
Attach:
ResizeObserver → trigger


ResizeObserver → overlay


Scroll listeners:
Attach only to nearest scroll parents


Passive listeners


Remove on unmount


DO NOT:
Use global window scroll only


Use polling loops


Use continuous rAF loops



8️⃣ Behavior Parity Layer
Fallback must replicate:
Behavior
Native
Fallback
auto outside press
Browser
Manual document listener
Esc close
Browser event
Manual keydown listener
manual persistence
Browser
No outside press close
openChange reason
Derived
Derived


Outside Click Logic (Fallback)
document.addEventListener("pointerdown", handler, true)
if click outside trigger + overlay:
   close("outside-press")


9️⃣ Interaction Manager
Unified across both strategies.
Manages:
Hover timers


Focus/blur


Click handling


Esc handling


Controlled vs uncontrolled mode


No strategy-specific logic here.

🔟 State Machine
States:
closed
opening
open
closing

Transitions must be deterministic.
Reason propagation required:
setOpen(true, "pointer-enter")
setOpen(false, "escape")


1️⃣1️⃣ Accessibility Layer
Tooltip:
role="tooltip"


aria-describedby injected


Never focusable by default


Popover:
aria-expanded


aria-controls


restoreFocusOnClose optional


Never trap focus in MVP.

1️⃣2️⃣ Performance Model
Native Path
No scroll listeners


No continuous measurement


CSS handles positioning


Browser handles stacking


Fallback Path
ResizeObserver only when open


Scroll listeners only when open


Removed immediately on close


Memory-safe.

1️⃣3️⃣ DX Guarantees
No manual anchor wiring


No manual ID sync


No portal configuration needed


No CSS variables required from user


Headless usage works out of box



1️⃣4️⃣ Styling Strategy
Headless


Minimal default styles:


[data-rt-overlay] {
  position: fixed;
  z-index: 1; /* fallback only */
}

Native path does not rely on z-index.

1️⃣5️⃣ Internal Lifecycle Sequence (Tooltip Example)
User hover →
interactionManager starts timer →
setOpen(true) →
strategyResolver →
nativeAdapter →
inject anchor →
rAF →
showPopover()

Fallback:
User hover →
setOpen(true) →
fallbackAdapter →
measure →
apply position →
attach observers


1️⃣6️⃣ Bundle Discipline Rules
To maintain 2–4KB gzip:
No external positioning libs


No animation lib


No polyfills bundled


No heavy utility libraries


Keep code modular and tree-shakable



1️⃣7️⃣ Future Phase 2 Extension Points
Architecture already supports:
Dropdown


ContextMenu


Toggletip


Shadow DOM bridge module


Multi-anchor system


View Transitions integration


Without breaking core.

🏁 Final Architecture Assessment
This architecture is:
Native-first


Fallback-safe


Performance-aware


Accessibility-aligned


Production-ready


Strict about behavior parity


Bundle-disciplined


It integrates:
✔ Anchor auto-injection
 ✔ ResizeObserver-based fallback
 ✔ Flicker mitigation
 ✔ Behavior parity contract
 ✔ Strict tooltip vs popover separation
 ✔ Honest performance model

