# Repository Guidelines

## Project Structure & Module Organization
- Backend: TypeScript Express API (TypeORM, Jest)
  - Source: `backend/src` (entities, services, controllers, routes, config)
  - Tests: `backend/src/**/__tests__/*.test.ts`
  - Build output: `backend/dist`
- Mobile: Expo React Native app
  - Source: `mobile/src` (screens, navigation, services)
  - Entry: `mobile/index.ts`, `mobile/src/App.tsx`
  - Assets: `mobile/assets`

## Build, Test, and Development Commands
- Root:
  - `npm run dev`: start backend and Expo together.
  - `npm run dev:backend` | `npm run dev:mobile`: run each app separately.
- Backend (from `backend/`):
  - `npm run dev`: start API in dev (ts-node).
  - `npm run build`: compile to `dist/`.
  - `npm start`: run `dist/index.js`.
  - `npm test`: execute Jest tests.
- Mobile (from `mobile/`):
  - `npm run start`: start Expo bundler.
  - `npm run android` | `npm run ios` | `npm run web`: launch targets.

## Coding Style & Naming Conventions
- TypeScript strict mode; prefer explicit types and no implicit returns.
- Indentation: 2 spaces; use single quotes (or project default).
- Filenames: PascalCase for classes/entities (e.g., `User.ts`); camelCase for utils/services (e.g., `driverService.ts`); route files `*.routes.ts`.
- Keep modules layered: controllers → services → repositories/entities; avoid circular dependencies.

## Testing Guidelines
- Framework: Jest with ts-jest (backend).
- Location & naming: place tests under `__tests__` adjacent to code, named `*.test.ts`.
- Run: `cd backend && npm test`.
- Scope: test public behavior; mock external I/O and network calls.

## Commit & Pull Request Guidelines
- Commits: concise, imperative, scoped by area, e.g., `backend: fix ride fare calc`, `mobile: add login screen`.
- PRs: include a clear summary, rationale, and screenshots for UI changes; link issues (e.g., `Closes #123`).
- Checks: backend builds and tests pass; mobile starts via Expo; update docs if config or API changes.

## Security & Configuration
- Never commit secrets. Use `.env` files: `backend/.env`, `mobile/.env`.
- Backend env vars: `PORT`, `DATABASE_URL`, `GOOGLE_MAPS_API_KEY` (see `backend/src/config/env.ts`).
- Validate inputs and reuse shared validators where available.

