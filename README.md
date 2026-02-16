# react-tooltip-native

Native-first tooltip and popover for React using the Popover API and CSS Anchor Positioning, with a minimal JS fallback when unsupported.

- **TypeScript strict**, zero runtime dependencies
- **ESM + CJS** with `exports` map; dist-only publish
- **Tiered engine** (SSR guard → native path → fallback → structured failure)
- **React layer**: hook, component wrapper, React 19 action helper
- **Tests**: Vitest (unit, jsdom, coverage) + Playwright (E2E, demo as harness)
- **CI**: typecheck, unit, size-limit, Playwright
- **Release**: changesets + npm Trusted Publishing (OIDC-ready)
- **Demo app**: Vite app under `/demo` that imports from `dist` via aliases

## Quick start

1. **Clone and install**
   ```bash
   git clone https://github.com/rajudandigam/react-tooltip-native.git
   cd react-tooltip-native
   npm install
   ```

2. **Run checks**
   ```bash
   npm run build
   npm run test
   npm run size
   npm run dev:demo   # then open http://localhost:5173
   npm run test:pw   # E2E (build first)
   ```
   Or run everything: `npm run test:all`

## Scripts

| Script        | Description                          |
|---------------|--------------------------------------|
| `clean`       | Remove dist, coverage, playwright-report |
| `build`       | Build with tsup (ESM + CJS + types)  |
| `typecheck`   | `tsc --noEmit`                       |
| `test`        | Vitest unit tests                    |
| `test:watch`  | Vitest watch mode                    |
| `test:pw`     | Playwright E2E (demo app)            |
| `size`        | size-limit gate (run after build)    |
| `test:all`    | typecheck + test + build + size + test:pw |
| `dev:demo`    | Vite dev server for demo (port 5173) |
| `release`     | `changeset publish` (used by CI)     |

## Structure

- **`src/`** — Library code: `core/` (types, engine), `react/` (hook, component, actions), entry re-exports.
- **`demo/`** — Vite app; imports from `dist/*.mjs` via aliases (`@lib`, `@lib/core`, `@lib/react`).
- **`playwright/`** — E2E config and smoke tests against the demo.
- **`docs/`** — [DEV-ARCHITECTURE.md](docs/DEV-ARCHITECTURE.md), [ARCHITECTURE.md](docs/ARCHITECTURE.md), [PRD.md](docs/PRD.md), [API_SPECS.md](docs/API_SPECS.md), playbooks (CI, release, demo).

## Docs

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Library architecture (native/fallback, modules, behavior parity).
- **[PRD.md](docs/PRD.md)** — Product requirements.
- **[API_SPECS.md](docs/API_SPECS.md)** — Public API specifications.
- **[DEV-ARCHITECTURE.md](docs/DEV-ARCHITECTURE.md)** — Repo layout, testing, packaging, release.
- **[RELEASE-PLAYBOOK.md](docs/RELEASE-PLAYBOOK.md)** — npm Trusted Publishing (OIDC) and release flow.
- **[CI-PLAYBOOK.md](docs/CI-PLAYBOOK.md)** — CI jobs and local parity.
- **[DEMO-PLAYBOOK.md](docs/DEMO-PLAYBOOK.md)** — Demo app setup, aliases, Playwright, optional deploy.

## License

MIT — see [LICENSE](LICENSE).
