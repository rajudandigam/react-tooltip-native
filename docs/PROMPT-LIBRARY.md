# Prompt library (Cursor prompts)

Use these prompts when implementing or changing parts of **react-tooltip-native**. Authoritative references: docs/PRD.md, docs/ARCHITECTURE.md, docs/API_SPECS.md, docs/DEV-ARCHITECTURE.md.

---

## Feature detection module

**Prompt:** Implement the feature detection module per docs/DEV-ARCHITECTURE.md and docs/ARCHITECTURE.md §5. In `src/strategy/featureDetection.ts`, export a function or object that returns `{ popover: boolean; anchorPositioning: boolean }`. Popover: check `typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype`. Anchor: check `typeof CSS !== "undefined" && CSS.supports("position-anchor: --x")`. SSR-safe: no access to window/document at module top-level; run checks inside a function. Add unit tests: (1) when window/document absent, return false or safe default; (2) when present, mock HTMLElement.prototype and CSS.supports and assert correct booleans.

---

## Strategy resolution

**Prompt:** Implement strategy resolution per docs/DEV-ARCHITECTURE.md. In `src/strategy/resolveStrategy.ts`, given `supports: { popover, anchorPositioning }` and `strategy?: "native" | "fallback" | "auto"`, return whether to use native adapter or fallback adapter. Logic: "native" → native if supports.popover else fallback; "fallback" → always fallback; "auto" → native if supports.popover else fallback. Add unit tests for all combinations.

---

## Native adapter

**Prompt:** Implement the native adapter per docs/ARCHITECTURE.md §6 and docs/DEV-ARCHITECTURE.md. In `src/strategy/nativeAdapter.ts`: (1) Apply `popover="auto"` or `popover="manual"` to overlay. (2) Manage showPopover()/hidePopover(). (3) Use anchor injection: trigger gets `style.anchorName = \`--rt-${id}\``, overlay gets `style.positionAnchor = \`--rt-${id}\`` (via positioning/anchorInjection or inline). (4) Flicker mitigation: inject anchor styles, apply placement styles, then requestAnimationFrame then showPopover(); or visibility hidden → apply styles → showPopover() → next frame visibility visible. No (0,0) flash. (5) Map placement to CSS (e.g. position-area). Add unit tests for anchor injection and flicker sequence (mock showPopover). No portals; Top Layer only.

---

## Fallback positioning and observers

**Prompt:** Implement fallback positioning and observers per docs/ARCHITECTURE.md §7 and docs/DEV-ARCHITECTURE.md. In `src/positioning/fallbackPositioning.ts`: minimal math from trigger and overlay getBoundingClientRect(); support placement (top/bottom/left/right, start/end), offset, viewport clamp. In `src/positioning/scrollParents.ts`: get nearest scroll parents for an element. In `src/strategy/fallbackAdapter.ts`: position overlay with position:fixed using fallbackPositioning; attach ResizeObserver to trigger and overlay; attach scroll listeners only to nearest scroll parents (passive); remove all observers on unmount. Do not use global window scroll only, polling, or continuous rAF. Add unit tests for positioning math and for observer attach/detach (mocks). Ensure behavior parity with native for openChange reasons.

---

## Anchor injection

**Prompt:** Implement automatic anchor injection per docs/ARCHITECTURE.md §6.1. In `src/positioning/anchorInjection.ts`, provide a function that, given an id, returns style objects: for trigger `{ anchorName: \`--rt-${id}\` }` (dashed-ident), for overlay `{ positionAnchor: \`--rt-${id}\` }`. No user wiring required. Used by native adapter. Add unit tests that returned styles match expected shape and id.

---

## Interaction manager and state machine

**Prompt:** Implement the state machine and interaction manager per docs/ARCHITECTURE.md §9–10 and docs/DEV-ARCHITECTURE.md. State machine: states closed | opening | open | closing; transitions deterministic; support setOpen(open, reason) with reason propagation (e.g. "pointer-enter", "escape", "outside-press"). Interaction manager: unified across native and fallback; manages hover timers (openDelay/closeDelay), focus/blur, click, Esc; controlled vs uncontrolled mode; no strategy-specific logic. Add unit tests for state transitions and for interaction manager (hover delay, Esc, outside click when applicable).

---

## Tooltip and Popover hooks

**Prompt:** Implement useTooltip and usePopover per docs/API_SPECS.md §5 and docs/DEV-ARCHITECTURE.md. useTooltip: options (placement, offset, openDelay, closeDelay, hoverableContent, dismissOnEsc, strategy, disableAnchorPositioning, id). Return open, setOpen(open, reason?), getTriggerProps (ref, aria-describedby, style with anchorName, pointer/focus/keydown handlers), getTooltipProps (ref, role="tooltip", id, style with positionAnchor), supports. usePopover: options (mode, placement, offset, strategy, restoreFocusOnClose, id). Return open, setOpen, toggle, getTriggerProps (ref, aria-expanded, aria-controls, style with anchorName, click/keydown), getPopoverProps (ref, id, style with positionAnchor), supports. Hooks use useOverlayEngine (or equivalent) and strategy resolution; inject anchor styles via getTriggerProps/getTooltipProps/getPopoverProps. Add unit tests for open state, get*Props shape, and supports. Run npm run test:all when done.

---

## Tooltip and Popover components

**Prompt:** Implement <Tooltip /> and <Popover /> per docs/API_SPECS.md §3–4 and docs/DEV-ARCHITECTURE.md. Tooltip: children (trigger), content, placement, offset, open/defaultOpen/onOpenChange, openDelay/closeDelay, hoverableContent, dismissOnEsc, strategy, id, describeOnlyWhenOpen, ariaLabel, className, style. Injects role="tooltip", aria-describedby; uses anchor injection and Popover API in native mode. Popover: children, content, mode (auto|manual), placement, offset, open/defaultOpen/onOpenChange, trigger (click|click-and-focus), closeOnEsc, closeOnOutsidePress, restoreFocusOnClose, initialFocus, strategy, id, setAriaExpanded, setAriaControls, ariaLabel, className, style. Add unit tests for render, open/close, and ARIA attributes. No focus trapping in MVP.

---

## Demo repro pages (overflow / transform)

**Prompt:** Add demo pages that reproduce real-world scenarios per docs/PRD.md §7 and acceptance criteria. (1) Overflow repro: a section with overflow:hidden or overflow:auto containing a trigger and tooltip/popover; verify overlay is visible and not clipped (native Top Layer or correct fallback positioning). (2) Transform repro: a section with CSS transform (e.g. scale or translate) containing a trigger and tooltip/popover; verify overlay appears in the correct place. Use the existing demo app (demo/main.tsx or separate routes); import from @lib/react. Add data-testid or roles so Playwright can assert visibility. Do not change library code; only demo markup and styles.

---

## Playwright tests for repros

**Prompt:** Add Playwright tests for the overflow and transform demo repro pages per docs/DEV-ARCHITECTURE.md. In playwright/tests/: (1) Navigate to the overflow repro page; open tooltip or popover; assert that the overlay is visible (e.g. getByRole("tooltip") or data-rt-overlay visible). (2) Navigate to the transform repro page; open tooltip or popover; assert overlay is visible and (if possible) positioned relative to trigger. Use existing Playwright config; no clipboard or OS-specific APIs. Run npm run test:pw and ensure tests pass when demo is built.

---

## Accessibility layer

**Prompt:** Implement the accessibility layer per docs/ARCHITECTURE.md §11 and docs/API_SPECS.md. In src/core/accessibility.ts (or equivalent): Tooltip — role="tooltip" on overlay, aria-describedby on trigger, never focusable by default. Popover — aria-expanded, aria-controls, restoreFocusOnClose optional. No focus trap in MVP. Expose helpers or apply in components/hooks. Add unit tests that rendered output has correct roles and ARIA attributes.

---

## Packaging

**Prompt:** Ensure package.json exports map has ".", "./core", "./react" with types, import, and require. tsup.config.ts entry keys match. Build outputs dist/*.mjs, dist/*.cjs, and dist/*.d.ts. Demo vite.config.ts resolve.alias points at dist/*.mjs. No runtime dependencies; peerDependencies only for React. Bundle ≤ 4KB gzip; run npm run size.

---

## CI

**Prompt:** CI workflow: jobs typecheck, unit (with coverage artifact), size (after build), playwright (after unit and size). Use Node 20, npm ci. Upload coverage and playwright-report artifacts on failure/success as needed. Concurrency group on ref. No secrets required for CI.

---

## Release

**Prompt:** Release workflow: on push to main, run test:all then changesets/action with publish command `npm run release`. Permissions: contents write, pull-requests write, id-token write (OIDC). Document in RELEASE-PLAYBOOK that npm Trusted Publishing must be enabled in npm package settings and linked to this GitHub repo.
