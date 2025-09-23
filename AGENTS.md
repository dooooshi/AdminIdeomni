# Repository Guidelines

## Project Structure & Module Organization
- `src/app` contains Next.js route groups; `(control-panel)` drives admin UX and `(public)` serves docs and marketing pages.
- Shared UI primitives live in `src/components`, global providers in `src/contexts`, and Redux Toolkit slices in `src/store`.
- Design tokens and theme helpers sit in `src/@ideomni`, while domain utilities and HTTP clients live in `src/lib` and `src/utils`.
- Static fonts stay in `public/assets`, generated references in `docs/`, and local scripts under `scripts/`.

## Build, Test, and Development Commands
- `pnpm install` bootstraps dependencies; Node 22.12+ is required.
- `pnpm dev` serves at `http://localhost:2000`; use `pnpm dev:clean` to clear `.next`.
- `pnpm build` compiles production bundles and `pnpm start` runs the compiled output.
- `pnpm run type-check` executes `tsc --noEmit`; `pnpm run build-docs` rebuilds the public component catalog.
- Run `pnpm audit` before shipping dependency or security-sensitive updates.

## Coding Style & Naming Conventions
- TypeScript is standard; keep `.ts`/`.tsx` files and rely on the path aliases (`@/`, `@ideomni/*`).
- Indent with tabs (mirrors existing files) and let Prettier 3.5.3 format commits.
- Components, contexts, and stores use `PascalCase`; hooks and utilities stay `camelCase`.
- Keep components thin, move heavy logic to `src/lib`, and default to named exports unless a file exposes one component.
- Co-locate Tailwind or CSS Module assets in `src/styles` or `Component.module.css`.

## Testing Guidelines
- Existing smoke checks sit beside HTTP utilities (`src/lib/http/test-cors.ts`); follow the same `*-test.ts` naming.
- Run targeted tests with `npx tsx path/to/test-file.ts` so they execute under the project config.
- Cover reducers, form schemas, and API clients with deterministic cases, and document manual UI checks in the PR.
- Always run `pnpm run type-check` and click through the affected route before requesting review.

## Commit & Pull Request Guidelines
- Keep commits small and imperative, matching history such as `fix dashboard cards` or `add mto_2`.
- Reference tickets in the body, and split refactors from feature work when possible.
- Summarize user-facing impact in the PR, list test commands, and attach UI screenshots when visual changes ship.
- Ensure the branch rebases onto `main`, flag breaking changes, and track follow-ups with checklists.
