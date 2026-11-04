# BorrowBuddy server deployment

## Required configuration

Copy `.env.example` to `.env` and set `DBURL`, `JWT_SECRET`, `JWT_EXPIRE`,
`CORS_ORIGINS`, `PORT`, `HOST`, `BODY_LIMIT`, and `UPLOAD_DIR`.
Use a strong secret and never commit the real `.env` file.

`UPLOAD_DIR` controls persistent uploaded files. The directory must be writable and
must use persistent storage in deployments where uploads must survive restarts.

Due-date reminders run on the server every `REMINDER_INTERVAL_MS` milliseconds
(one hour by default). They create in-app notifications for active loans only.
Reminder delivery is persisted in MongoDB and is deduplicated per loan and
reminder type, so server restarts do not resend completed reminders.

## Start commands

- Development: `npm run dev`
- Production: `NODE_ENV=production npm start`

The server connects to MongoDB before opening its HTTP listener. Startup fails if
the database or JWT configuration is unavailable. `GET /health` returns HTTP 200
when MongoDB is connected and HTTP 503 otherwise.

## Frontend

If the frontend and backend are served from the same origin, set
`VITE_API_URL=/api`. For the current Render backend, use
`VITE_API_URL=https://borrowbuddy-oklz.onrender.com/api`. If they are deployed
separately, set it to the real backend URL including `/api` — do not use the
`api.example.com` placeholder. Vite embeds this value at build time, so set it
in the frontend hosting provider and redeploy after changing it.
Configure the frontend's exact public origin in the backend `CORS_ORIGINS` value.
