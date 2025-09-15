# API Overview (Draft)

Base URL: `http://<server>:3000/api`

## Users
- POST `/users/register`
  - Body: `{ "phone": "+229XXXXXXXX", "name": "..." }`
- GET `/users/:id`

## Drivers
- POST `/drivers`
  - Body: `{ "name": "...", "vehicle": "..." }`
- GET `/drivers/:id`

## Rides
- POST `/rides`
  - Body: `{ "passengerId": "...", "origin": { lat, lng }, "destination": { lat, lng }, "distanceKm": number }`
- POST `/rides/:id/accept`
- POST `/rides/:id/start`
- POST `/rides/:id/complete`
- GET `/rides/:id`

Notes
- Auth/OTP and payments are placeholders; integrate provider(s) before production.
- Use `EXPO_PUBLIC_API_URL` on mobile to point to the backend.
- Phone numbers: prefer Bénin format `+229XXXXXXXX` (or 8 local digits).
- Fares are estimated in XOF using a simple base + per-km (+ per-minute) formula.
