Excellent. We’re now formalizing this properly.
Below is the final, production-grade PRD for react-tooltip-native, integrating:
Native-first strategy
Anchor name auto-injection
ResizeObserver-based fallback
Strict native/fallback behavior parity
Flicker mitigation
WCAG/APG alignment
Real-world use cases
Explicit acceptance criteria
Clear MVP boundaries
This is written as a complete product document, not a concept note.

📄 Product Requirements Document (PRD)
Project Name
react-tooltip-native
Tagline
The native-first, zero-z-index overlay system for React.

1️⃣ Problem Statement
Modern React applications frequently suffer from overlay-related issues:
1.1 Stacking Context Conflicts
Tooltips and popovers get clipped or hidden due to:
overflow: hidden
Nested modals and drawers
Transformed containers (transform, scale, perspective)
z-index conflicts
Even portal-based solutions still operate within the document stacking model and can break in complex layouts.

1.2 Heavy JS Positioning Engines
Most existing libraries rely on continuous DOM measurement:
getBoundingClientRect
scroll listeners
resize listeners
collision detection math
While robust, this introduces:
Bundle size overhead
Runtime cost
Jitter during scroll
Complex bug surface

1.3 Accessibility Gaps
Many tooltip libraries fail WCAG 1.4.13 requirements:
Not dismissible via Esc
Not hoverable when moving pointer into tooltip
Tooltip content receives focus improperly
Inconsistent aria wiring
Correct ARIA and WCAG implementation is non-trivial.

2️⃣ Opportunity (Why Now)
Modern browser APIs allow us to offload most overlay complexity to the platform:
2.1 Popover API
Renders elements in the browser’s Top Layer
Handles light-dismiss automatically (popover="auto")
Supports manual control (popover="manual")
Built-in focus guardrails
This solves stacking context conflicts natively.

2.2 CSS Anchor Positioning
Allows CSS-based tethering of overlay to trigger
Supports CSS fallback positions (@position-try)
Eliminates continuous JS coordinate calculations

2.3 Strategic Gap
There is currently no mainstream React library that:
Uses Popover API first
Uses CSS Anchor Positioning
Falls back safely
Aligns fully with WCAG/APG tooltip guidance
Keeps bundle small
This is the gap react-tooltip-native fills.

3️⃣ Product Vision
A future-forward overlay library that:
Defaults to browser-native capabilities
Escapes stacking context problems by design
Uses CSS for positioning when possible
Falls back minimally and efficiently
Ships production-grade accessibility by default
Remains headless and design-system friendly

4️⃣ Goals
G1. Top Layer Rendering
Use Popover API by default when supported.
G2. CSS-led Positioning
Use anchor positioning when supported.
G3. Efficient Fallback
Use minimal in-house positioning math only when required.
G4. Accessibility by Default
Comply with:
ARIA Tooltip Pattern
WCAG 1.4.13 Content on Hover or Focus
G5. Small Bundle
Target: 2–4KB gzip (Tooltip + Popover core)

5️⃣ Non-Goals (MVP)
Full dropdown/menu system semantics
Focus trapping
Shadow DOM official support
Follow-cursor tooltips
Animation framework
Virtual element positioning
Full parity with react-tooltip v5

6️⃣ MVP Scope (Phase 1)
6.1 Components
<Tooltip />
For non-interactive, descriptive content.
<Popover />
For interactive overlay content.

7️⃣ Real Use Cases (MVP Coverage)
Tooltip Use Cases
1. Icon Help Tooltip
<Tooltip content="Copy to clipboard">
  <button>📋</button>
</Tooltip>

2. Disabled Button Explanation
Tooltip on disabled action explaining reason.
3. Data Table Cell Hint
Tooltip inside:
overflow:hidden containers
horizontally scrollable grids
virtualized lists
4. Tooltip inside Transformed Container
Inside scaled Storybook iframe or CSS transform.

Popover Use Cases
1. Profile Menu
<Popover content={<ProfileMenu />}>
  <Avatar />
</Popover>

2. Inline Form
Mini form inside popover (email input + save button).
3. Onboarding Hint
Click-triggered info popover with dismiss.

8️⃣ Functional Requirements (MVP)
Tooltip Requirements
Opens on hover + focus
Closes on blur + pointer leave + Esc
Default hoverableContent = true
Does not receive focus
Applies:
role="tooltip"
aria-describedby
Uses:
Popover API (native path)
Anchor positioning (if available)
JS fallback (if not)

Popover Requirements
Opens on click (keyboard supported)
mode="auto" default
mode="manual" optional
Esc closes
Outside click closes in auto mode
Can contain interactive content
Optional focus restore

9️⃣ Rendering Strategy
Strategy = "auto"
If Popover supported:
Use popover attribute
No portals
Top Layer rendering
If Anchor supported:
CSS anchor-name + position-anchor
CSS placement
If not:
Fallback engine activates

🔧 Fallback Engine (MVP Specification)
Must Use:
ResizeObserver (trigger + overlay)
Scroll listeners on nearest scroll parents
Passive listeners
No global polling
No requestAnimationFrame loops
Positioning Math:
Top / Bottom / Left / Right
Start / End alignment
Viewport clamp
Offset support

10️⃣ Behavior Parity Requirement
Fallback mode MUST match native mode for:
auto light-dismiss
manual persistence
Esc behavior
openChange reason values
controlled/uncontrolled consistency
No visible behavior differences allowed.

11️⃣ Flicker Mitigation Requirement
On native show:
Inject anchor styles
Apply placement styles
Wait microtask or requestAnimationFrame
Call showPopover()
OR
Use visibility gating until tethered.
No initial flash at (0,0) allowed.

12️⃣ Acceptance Criteria (From User Perspective)
The library is considered MVP-ready if:
Rendering
Tooltip inside overflow:hidden container is visible
Tooltip inside transform container is visible
Tooltip inside nested modal works
Accessibility
Tooltip satisfies WCAG 1.4.13:
Dismissible
Hoverable
Persistent
Tooltip never traps focus
Popover restores focus on close
Performance
Native path uses no scroll listeners
Fallback path only attaches to scroll parents
No layout thrashing
Bundle
≤ 4KB gzip
No heavy dependencies
DX
No manual anchor wiring required
Headless usage works out of the box

13️⃣ Risks & Mitigations
Risk 1: Anchor Positioning Inconsistent in Some Environments
Mitigation:
Robust feature detection
Fallback auto-switch
Clear docs on supported browsers

Risk 2: Popover Nested Behavior Differences
Mitigation:
Expose mode explicitly
Document auto vs manual clearly

Risk 3: Flicker During Show
Mitigation:
Delay showPopover until styles applied
Visibility gating

Risk 4: Performance Regressions in Fallback
Mitigation:
Use ResizeObserver
Limit scroll listeners
Remove observers on unmount

Risk 5: Over-Promising "No Jitter"
Mitigation:
Avoid marketing exaggeration
State native reduces complexity but not magic

14️⃣ Out of Scope (Explicit)
Shadow DOM official bridging (Phase 2)
Menu semantics (aria-menu patterns)
Focus trap
Animation engine
CSS theme system
Virtual element anchor
Server-only rendering

15️⃣ MVP Definition of Done
Tooltip + Popover components implemented
Headless hooks implemented
Native + fallback path parity tested
Flicker mitigation validated
WCAG 1.4.13 manual test checklist passed
Transform container repro verified
Scroll container repro verified
Cross-browser smoke tested

Final Assessment
This PRD is:
Technically defensible
Future-forward
Narrow enough for MVP
Clear in scope
Production-focused
Honest about trade-offs
