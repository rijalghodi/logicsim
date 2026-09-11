## LogicSim

LogicSim is a logic circuit simulator: a canvas-based UI (React + Konva) for building circuits on top of a plain-TypeScript simulation core (chips, ports, evaluation). The project is at a very early stage — the core only implements a NAND chip and the UI is a Konva drag-and-drop placeholder.

## Commands

Package manager is bun (see `bun.lock`).

- `bun install` — install dependencies
- `bun run dev` — start Vite dev server
- `bun run build` — typecheck (`tsc -b`) then production build via Vite
- `bun run lint` — run ESLint over the repo
- `bun run lint:fix` — run ESLint then Prettier `--write` over the repo
- `bun run preview` — preview the production build

There is no test runner configured yet.

## Architecture

- `src/core/` — the simulation domain, pure TypeScript with no React/UI dependencies.
  - `type.ts` defines `Bit` (0 | 1), `Port` (named signal holder), and the `Chip` interface (`inputs`, `outputs`, `evaluate()`).
  - Chips (e.g. `nand.ts`) implement `Chip` by wiring up `Port` instances and computing outputs from inputs in `evaluate()`.
  - `SPEC.md` is the design outline for the core and is currently just a table of contents for planned semantics, in build order: Signals → Ports → Components → Connections → Evaluation semantics → Clock semantics → Memory semantics → CPU semantics → Error handling. Treat it as the intended architecture roadmap when extending `core/`.
- `src/components/` — UI, rendered with `react-konva` (Konva canvas). `test.tsx` is a scratch/placeholder component (draggable shapes) and is expected to be replaced as the real circuit canvas is built.
- `src/App.tsx` / `src/main.tsx` — standard Vite React entry points.

When implementing new chips/components in `core/`, follow the existing pattern: a class implementing `Chip`, with `Port` instances for each named input/output and all logic contained in `evaluate()`. Keep `core/` free of any Konva/React imports — UI code in `components/` should consume core objects, not the other way around.

## Tooling notes

- React Compiler is enabled via `@rolldown/plugin-babel` + `reactCompilerPreset()` in `vite.config.ts` — avoid manual `useMemo`/`useCallback` micro-optimizations that fight the compiler.
- Prettier config (`.prettierrc`): double quotes, semicolons, trailing commas, 120 print width.
- ESLint (`eslint.config.js`) uses flat config with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh` (Vite preset).

## TODO

- [x] Core: circuit registry
- [x] Core: simulation logic
- [x] UI: Render Chip
- [x] UI: Render Boundary Port
- [x] UI: Render Wire
- [x] UI: Simulate Circuit
- [x] UI: Save, Edit, and Create New Circuit
- [x] UI: Delete Chip
- [x] UI: Chip Context Menu
- [x] Breadcrumb and Detail Chip
- [x] UI: Delete Boundary Port
- [x] UI: Rename Boundary Port
- [ ] UI: Cornered Wire
- [ ] UI: Wire Color
