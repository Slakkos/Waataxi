# Contributing Guide

## Quick Start
- Prérequis: Node.js 18+, npm, et une instance PostgreSQL.
- Installer les dépendances:
  - `cd backend && npm install`
  - `cd mobile && npm install`

## Environment Setup
- Backend (`backend/.env`):
  - `PORT=3000`
  - `DATABASE_URL=postgres://user:pass@host:5432/dbname`
  - `GOOGLE_MAPS_API_KEY=` (optional)
- Mobile: copy `mobile/.env.example` to `mobile/.env` and set:
  - `EXPO_PUBLIC_API_URL=http://<LAN-IP>:3000/api` (devices can’t reach `localhost`).

## Run Locally
- Global:
  - `npm run dev` – lance API + Expo.
- Backend:
  - `npm run dev` – API en dev (ts-node).
  - `npm run build && npm start` – compile puis lance depuis `dist/`.
- Mobile:
  - `npm run start` – démarre Expo.
  - `npm run android` | `npm run ios` | `npm run web` – lance les cibles.

## Tests
- Backend utilise Jest avec ts-jest.
  - `npm test` (depuis `backend/`)
  - Place tests next to code in `__tests__` using `*.test.ts`.
  - Phone numbers: prefer Bénin format `+229XXXXXXXX` (or 8 local digits).

## Outils
- Standard: npm + Expo.

## Commits & Pull Requests
- Use concise, scoped commits, e.g., `backend: fix fare calc` or `mobile: add login flow`.
- Open a PR with a clear summary, rationale, and screenshots for UI changes; link issues (e.g., `Closes #123`).
- Ensure backend builds/tests pass and the mobile app starts via Expo.

See `AGENTS.md` for detailed repository guidelines and conventions.
