# BorrowBuddy

BorrowBuddy is a full-stack community borrowing application. Users create or join groups, share inventory, request and manage loans, inspect borrowing/lending history, and receive persistent in-app due-date reminders.

## Features

- JWT registration, login, profile, and protected API access.
- Groups, members, managers, invitations, and join requests.
- Inventory items with all-group or selected-group visibility.
- Borrow requests, lender approval/rejection, activation, and return workflow.
- Borrowing History for records where the authenticated user is borrower or lender.
- In-app notifications and one-day-before, due-today, and overdue reminders.
- Socket.IO events for authenticated real-time updates.
- Group/item image uploads served from `/uploads`.

## Architecture

The frontend is React 19 built by Vite. The backend is Node.js/Express with Mongoose and MongoDB. The browser calls `/api` endpoints with a JWT bearer token. The backend authenticates the token, applies ownership/membership rules, reads/writes MongoDB, and serves uploads. The reminder scheduler runs in the backend after MongoDB connects.

See the detailed guides:

- [Developer handbook](docs/DEVELOPER_GUIDE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database design](docs/DATABASE.md)
- [API reference](docs/API.md)
- [Testing guide](docs/TESTING.md)

## Prerequisites

- Git.
- Node.js and npm. No `engines` field is declared; the project was verified with Node 26.13.0 and npm 11.20.0. Use a supported Node LTS release for deployment.
- A reachable MongoDB deployment.

## Install

```powershell
git clone <repository-url> BorrowBuddy
cd BorrowBuddy

cd server
npm install
copy .env.example .env

cd ..\client
npm install
copy .env.example .env
```

On macOS/Linux, use `cp .env.example .env` instead of `copy`.

## Configure the environment

### Backend: `server/.env`

| Variable | Required | Purpose |
|---|---:|---|
| `NODE_ENV` | No | Runtime mode; defaults to `development`. |
| `PORT` | No | HTTP port; code default is `3000`. |
| `HOST` | No | Bind host; defaults to `0.0.0.0`. |
| `CORS_ORIGINS` | No | Comma-separated allowed browser origins. |
| `DBURL` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Long random signing secret; never commit it. |
| `JWT_EXPIRE` | No | JWT expiry passed to `jsonwebtoken`, such as `30d`. |
| `BODY_LIMIT` | No | Express request body limit; default `1mb`. |
| `UPLOAD_DIR` | No | Upload storage directory; default `server/uploads`. |
| `REMINDER_INTERVAL_MS` | No | Reminder scan interval; default one hour. |

The committed [server/.env.example](server/.env.example) contains placeholders only. Set `DBURL` and `JWT_SECRET` before starting the server.

### Frontend: `client/.env`

| Variable | Required | Example |
|---|---:|---|
| `VITE_API_URL` | No | `http://localhost:3000/api` |

Vite embeds this value during development/build. Never put MongoDB credentials or JWT secrets in frontend variables. If omitted in development, the API client falls back to `http://localhost:3000/api`.

## Run locally

Start MongoDB, then use two terminals:

```powershell
# Terminal 1
cd BorrowBuddy\server
npm run dev

# Terminal 2
cd BorrowBuddy\client
npm run dev
```

Open `http://localhost:5173`. Verify backend/database readiness at `http://localhost:3000/health`; it returns HTTP 200 only while MongoDB is connected.

For production-like local processes:

```powershell
cd server
npm start

cd ..\client
npm run build
npm run preview
```

## Test and check

```powershell
cd server
npm test
npm run test:coverage
npm run test:watch

cd ..\client
npm test
npm run test:watch
npm run lint
npm run build
```

The repository has no Playwright/Cypress runner or isolated MongoDB test service. Backend tests use isolated stubs/schema assertions and do not use production credentials. See [docs/TESTING.md](docs/TESTING.md) for coverage and unverified areas.

## Main workflows

1. Register or log in. The JWT is stored by the frontend and sent to protected routes.
2. Create a group or request membership through invitations.
3. Add inventory and choose all-group or selected-group sharing.
4. Request an available visible item. The lender approves/rejects the request.
5. Activate/return the loan through the borrowing workflow.
6. Open Borrowing History to see borrowed and lent records.
7. Receive due-date reminders in Notifications for active loans with due dates.

## Troubleshooting

- **MongoDB connection failure:** validate `DBURL`, database availability, credentials, and hosted-network allowlists.
- **Missing JWT error:** set a non-empty `JWT_SECRET`, then restart the backend and log in again.
- **Port conflict:** change `PORT`, then set `VITE_API_URL` to the matching `http://host:port/api` value and restart Vite.
- **CORS error:** add the exact frontend origin, including scheme and port, to `CORS_ORIGINS`.
- **API fetch failure:** check `/health`, confirm `VITE_API_URL` includes `http://` and `/api`, and inspect the browser Network tab.
- **Missing images:** ensure `UPLOAD_DIR` exists and is writable and that the browser can reach the backend upload origin.
- **Missing reminders:** confirm the loan is `active`, `dueDate` exists, borrower reference exists, MongoDB is connected, and the scheduler interval has elapsed. The scheduler also scans once at startup.
- **Production scheduler duplication:** use one scheduler instance per deployment unless multi-process operation has been explicitly tested.

## Development notes

The server imports routes from `server/Routes/`. The lowercase `server/routes/` directory mirrors those files. The current implementation has no migration tool; schema/index changes need an explicit deployment plan. See the handbook for request tracing, database relationships, security limitations, and debugging steps.
