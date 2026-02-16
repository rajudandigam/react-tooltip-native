# Development architecture

This document is the **single source of truth** for how this repo is structured and how to extend it. It reflects the **react-tooltip-native** architecture; see also [PRD.md](PRD.md), [ARCHITECTURE.md](ARCHITECTURE.md), and [API_SPECS.md](API_SPECS.md) for product and API details.

## Goals

- **Native-first**: Use Popover API when supported; use CSS Anchor Positioning when supported; activate JS fallback only when necessary.
- **TypeScript-first**, strict mode, zero runtime dependencies.
- **Behavior parity**: Native and fallback must feel identical (auto light-dismiss, manual persistence, Esc, openChange reasons).
- **No portals in native path**: Top Layer handles rendering; no React portal for native mode.
- **Minimal fallback**: No Floating UI; no heavy collision engine; viewport clamp only. Fallback must use ResizeObserver + scroll parents listeners only.
- **Bundle discipline**: Target 2–4KB gzip; no external positioning libs, no animation lib, no polyfills bundled.
- **Headless-first**: Logic separated from presentation; headless hooks and components.
- **ESM + CJS** with `exports` map; dist-only publish.
- **Testing**: Vitest (unit, jsdom) + Playwright (E2E, demo as harness). Write tests for each module.
- **Release**: changesets + npm Trusted Publishing (OIDC-ready).

## Strategy resolution

- **Modes**: `strategy?: "native" | "fallback" | "auto"`.
- **Resolution**:
  - `"native"`: use native adapter if Popover supported, else fallback.
  - `"fallback"`: always use fallback adapter.
  - `"auto"`: use native if Popover supported, else fallback.
- **Feature detection** (SSR-safe): `supports.popover` (e.g. `"showPopover" in HTMLElement.prototype`), `supports.anchorPositioning` (e.g. `CSS.supports("position-anchor: --x")`). Expose via public `supports` on hooks.

## Module structure

```
src/
├── core/
│   ├── useOverlayEngine.ts   # Unified overlay state + strategy dispatch
│   ├── stateMachine.ts       # closed | opening | open | closing; reason propagation
│   ├── interactionManager.ts # Hover timers, focus/blur, click, Esc; controlled vs uncontrolled
│   └── accessibility.ts      # ARIA wiring, role="tooltip", aria-describedby, etc.
├── strategy/
│   ├── resolveStrategy.ts    # native vs fallback given supports + strategy prop
│   ├── nativeAdapter.ts      # popover attr, showPopover/hidePopover, anchor injection, flicker mitigation
│   ├── fallbackAdapter.ts    # position:fixed, measure, apply position, attach observers
│   └── featureDetection.ts  # Popover + Anchor support (no top-level window/document)
├── positioning/
│   ├── anchorInjection.ts   # Automatic anchorName (trigger) + positionAnchor (overlay); --rt-${id}
│   ├── fallbackPositioning.ts # Minimal math: rects, placement, offset, viewport clamp
│   └── scrollParents.ts     # Nearest scroll parents for fallback scroll listeners
├── components/
│   ├── Tooltip.tsx
│   └── Popover.tsx
└── hooks/
    ├── useTooltip.ts
    └── usePopover.ts
```

Entry re-exports: `src/index.ts`, `src/core.ts`, `src/react.ts` (or equivalent) expose public API only. Internal modules stay internal.

## Native adapter responsibilities

- Apply `popover="auto"` or `popover="manual"` per mode.
- Manage `showPopover()` / `hidePopover()`.
- **Anchor injection (automatic)**: trigger `style.anchorName = \`--rt-${id}\``; overlay `style.positionAnchor = \`--rt-${id}\``. No user wiring.
- **Flicker mitigation**: (1) Inject anchor styles, (2) Apply placement styles, (3) `requestAnimationFrame()` then `showPopover()`. Alternatively: `visibility: hidden` → apply styles → `showPopover()` → next frame `visibility: visible`. No visible (0,0) flash.
- Map placement to CSS (e.g. `position-area: top center`).
- Sync open state; Esc and light-dismiss behavior per spec.

## Fallback adapter responsibilities

- **Rendering**: Overlay in normal DOM; `position: fixed`; no React portal required for MVP.
- **Positioning**: Minimal math from trigger/overlay rects; placement (top/bottom/left/right, start/end); offset; viewport clamp. No advanced collision tree.
- **Observers (performance-critical)**:
  - ResizeObserver on trigger and on overlay.
  - Scroll listeners only on **nearest scroll parents**; passive; remove on unmount.
  - Do **not** use global window scroll only, polling loops, or continuous rAF loops.
- **Behavior parity**: Replicate auto outside-press (document listener), Esc (keydown), manual persistence, and openChange reason values so fallback matches native.

## Behavior parity contract

Fallback must match native for: auto light-dismiss, manual persistence, Esc close, openChange reason values, controlled/uncontrolled consistency. No visible behavior differences.

## Performance model

- **Native path**: No scroll listeners; no continuous measurement; CSS handles positioning; browser handles stacking.
- **Fallback path**: ResizeObserver and scroll listeners only when open; remove immediately on close; memory-safe.

## Test matrix pointers

- **Unit (Vitest, jsdom)**: Feature detection (SSR, supported/unsupported); state machine transitions; interactionManager (hover, focus, Esc); native adapter (anchor injection, flicker sequence); fallback adapter (positioning, observer attach/detach); hooks (getTriggerProps/getTooltipProps, open state); accessibility attributes.
- **E2E (Playwright)**: Demo smoke; Tooltip/Popover open/close; overflow container repro; transform container repro; Esc and outside-press; no clipboard/OS-specific APIs in assertions.
- Run `npm run test:all` before marking work done.

## Packaging and exports

- **tsup**: Entry points produce `dist/*.mjs`, `dist/*.cjs`, `dist/*.d.ts`. Entries align with public surface (e.g. main, core, react).
- **package.json**: `exports` for `.`, `./core`, `./react` with `types`, `import`, `require`. `files: ["dist"]`, `sideEffects: false`.
- **Bundle**: No external positioning libs; keep ≤ 4KB gzip. Check with `npm run size`.

## Repo layout (summary)

- **`src/`** — Library code as above; entry re-exports at top level.
- **`demo/`** — Vite app importing from `dist/*.mjs` via aliases (`@lib`, `@lib/core`, `@lib/react`); Playwright harness. Include repro pages for overflow and transform.
- **`playwright/`** — E2E config and tests (smoke + repros).
- **`docs/`** — PRD, ARCHITECTURE, API_SPECS, DEV-ARCHITECTURE, PROMPT-LIBRARY, playbooks.
- **`.github/workflows/`** — CI (typecheck, unit, size, playwright), Release (changesets + publish).

## Release flow

1. Create changeset(s) with `npx changeset`.
2. Merge to `main`; CI runs.
3. Release workflow runs on push to `main`; changesets/action versions and publishes via `npm run release`.
4. npm Trusted Publishing (OIDC) must be configured — see [RELEASE-PLAYBOOK.md](RELEASE-PLAYBOOK.md).

## Implementation order (MVP)

1. Feature detection + strategy resolution (with unit tests).
2. State machine + interaction manager (with unit tests).
3. Positioning: anchor injection + fallback positioning + scroll parents (with unit tests).
4. Native adapter (flicker mitigation, showPopover/hidePopover) (with unit tests).
5. Fallback adapter (observers, positioning) (with unit tests).
6. Accessibility layer (with unit tests).
7. useTooltip / usePopover hooks (with unit tests).
8. Tooltip and Popover components (with unit tests).
9. Entry exports and packaging; demo + repro pages; Playwright smoke and repro tests.
10. Docs and Cursor rules.
