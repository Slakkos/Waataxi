# Repository Guidelines

## Project Structure & Module Organization
- `backend/src` hosts the API, layered controller → service → repository/entity; keep validation in services and reuse shared DTOs.
- Domain controllers live in `backend/src/controllers` (PascalCase), services in `backend/src/services` (camelCase), and routing tables under `backend/src/routes/*.routes.ts`.
- Tests sit beside features in `backend/src/**/__tests__/*.test.ts`; build output lands in `backend/dist`.
- The Expo client boots from `mobile/index.ts` and `mobile/src/App.tsx`; shared UI lives in `mobile/src/*` and static media under `mobile/assets`.

## Build, Test, and Development Commands
- `npm run dev` starts backend ts-node and Expo watchers together for local integration.
- `npm run dev:backend` / `npm run dev:mobile` focus on one side; from `backend`, `npm run dev` reloads the API on changes.
- `npm run build` then `npm start` (in `backend`) compiles to `dist/index.js` for production rehearsal.
- `cd backend && npm test` executes the Jest suite via ts-jest; use `--watch` for rapid TDD loops.

## Coding Style & Naming Conventions
- TypeScript is strict: declare explicit return types, narrow unions before exporting, and keep model/controller files in PascalCase.
- Indent with two spaces, prefer single quotes, and order imports core → third-party → local.
- Reuse shared validators and DTOs to keep input/output parity across layers; keep modules self-documenting with concise comments only where logic is subtle.

## Testing Guidelines
- Author Jest specs alongside features, naming files `*.test.ts`; mock databases, network calls, and Expo native modules.
- Cover new code paths before PRs; document deliberate gaps in the PR body and convert TODOs into follow-up issues quickly.

## Commit & Pull Request Guidelines
- Format commits as `<area>: <imperative>` (e.g., `backend: add driver matching`).
- PRs should describe behavior changes, list local verification (`npm test`, Expo boot), attach screenshots or videos for UI updates, and link issues with `Closes #id`.

## Security & Configuration Tips
- Load secrets from `.env` files (`backend/.env`, `mobile/.env`) via `backend/src/config/env.ts`; never commit credentials.
- Validate external inputs at the service layer, sanitize before persistence or responses, and review dependencies during upgrades.
