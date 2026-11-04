# BorrowBuddy

BorrowBuddy is a full-stack community borrowing application. Users create groups, share inventory, request and manage loans, view borrowing/lending history, and receive in-app due-date reminders.

## Technology and architecture

- Frontend: React 19, Vite, Socket.IO client, plain CSS.
- Backend: Node.js, Express, Mongoose, MongoDB, JWT, Socket.IO, and Multer uploads.
- MongoDB stores users, groups, invitations, items, loans, notifications, and reminder logs.
- The Vite frontend calls the Express API under /api; the backend serves /uploads and /health.
- The due-date scheduler runs in the backend after MongoDB connects and creates persistent in-app notifications only.

## Prerequisites

Install Git, Node.js, npm, and a reachable MongoDB deployment. No exact Node engine is declared; this project was checked with Node v26.13.0 and npm 11.20.0. Use a currently supported Node LTS release for deployment.

## Project structure

client/ contains the React/Vite application, components, API service, and styles. server/ contains the Express app, controllers, middleware, Mongoose models, routes, and reminder scheduler. docs/API.md is the route-by-route API reference.

## Installation

From a terminal:

    git clone <repository-url> BorrowBuddy
    cd BorrowBuddy
    cd server
    npm install
    cd ../client
    npm install
    cd ..
    copy server\.env.example server\.env
    copy client\.env.example client\.env

On macOS/Linux replace the copy commands with cp server/.env.example server/.env and cp client/.env.example client/.env.

## Environment configuration

Backend server/.env variables:

| Variable | Required | Description |
|---|---:|---|
| NODE_ENV | No | development by default; use production when deployed. |
| PORT | No | HTTP port. The example is 5000; code default is 3000. |
| HOST | No | Bind host; example is 0.0.0.0. |
| CORS_ORIGINS | No | Comma-separated allowed browser origins, e.g. http://localhost:5173. |
| DBURL | Yes | MongoDB connection string. |
| JWT_SECRET | Yes | Long random signing secret; never commit a real value. |
| JWT_EXPIRE | No | JWT expiry passed to jsonwebtoken, e.g. 30d. |
| BODY_LIMIT | No | Express body limit; default 1mb. |
| UPLOAD_DIR | No | Upload directory; default server/uploads. |
| REMINDER_INTERVAL_MS | No | Reminder scan interval; example is one hour. |

Frontend client/.env uses VITE_API_URL, including /api, e.g. http://localhost:5000/api when backend PORT is 5000. If omitted, current Vite development fallback is http://localhost:3000/api. Never put MongoDB credentials or JWT secrets in frontend variables.

## Running locally

Start MongoDB, configure DBURL, then use terminal 1:

    cd server
    npm run dev

Check http://localhost:5000/health with the example port. In terminal 2:

    cd client
    npm run dev

Open the Vite URL shown, normally http://localhost:5173. For the backend use npm start instead of npm run dev for a production-like process. For the frontend run npm run build then npm run preview.

## Testing and checks

From server: npm test and npm run test:watch. From client: npm test, npm run test:watch, npm run lint, and npm run build. Tests do not use production credentials or send real notifications. Database-backed end-to-end testing requires a separately provisioned test MongoDB; this repository does not include an in-memory MongoDB service.

## Main workflows

1. Register and log in; the returned JWT authenticates API calls.
2. Create a group or request membership through invitations/join requests.
3. Add or share items with all groups or selected groups.
4. Request a loan; the lender approves/rejects it, and either party can activate/return it.
5. Open Borrowing History to see records where you are borrower or lender; its API is GET /api/loans.
6. For active loans with dates, the backend scheduler creates one in-app reminder before, on, and after the due date. Read or mark notifications in the existing Notifications UI.

See docs/API.md for request/response details.

## Troubleshooting

- MongoDB failure: confirm MongoDB is reachable, DBURL is valid, and hosted network access allows the server.
- Missing JWT_SECRET: create server/.env and set a non-empty secret.
- Port conflict: change PORT, set VITE_API_URL to the same backend port, and restart Vite.
- CORS error: add the exact browser origin, including scheme and port, to CORS_ORIGINS.
- 401 after login: log out and log in again to replace an expired token; verify the frontend uses the correct /api URL.
- Missing images: confirm UPLOAD_DIR exists/is writable and browser/API use the same backend origin.
- Missing reminders: confirm MongoDB is connected, loan status is active, dueDate exists, and the interval has elapsed or restart the backend for its immediate scan.

## Development and production

Use separate MongoDB databases, JWT secrets, upload storage, CORS origins, and environment files for development and production. Never commit .env files or real credentials. Run one scheduler instance per deployment unless multi-instance operation has been explicitly validated.
