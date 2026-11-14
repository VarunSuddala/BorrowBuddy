# BorrowBuddy testing guide

## Test tools actually installed

| Area | Tool | Location | Purpose |
|---|---|---|---|
| Backend | Node built-in `node:test` | `server/test/` | Controller, middleware, schema, and reminder-service tests |
| Backend coverage | Node `--experimental-test-coverage` | `server/package.json` | Text coverage report for loaded CommonJS modules |
| Frontend | Vitest 5 | `client/src/**/*.test.*` | Fast browser-like component and service tests |
| Frontend DOM | jsdom, Testing Library React, jest-dom | `client/package.json` | Observable React rendering and interaction assertions |
| Static checks | ESLint and Vite | client scripts | Lint and production build validation |

No Playwright/Cypress runner, Supertest package, MongoDB Memory Server, or dedicated test database configuration is installed in the current repository.

## Commands

From the repository root:

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

The backend `test` script uses `--test-concurrency=1` because tests temporarily stub shared Mongoose model methods. This avoids test files interfering with one another.

## Backend test inventory

### Authentication and authorization

[server/test/authorization.test.js](../server/test/authorization.test.js) verifies missing/invalid bearer tokens, valid JWT user loading, loan-history ownership query restrictions, and recipient-scoped notification reads.

[server/test/controllers.test.js](../server/test/controllers.test.js) verifies registration normalization and token output, invalid registration/login behavior, item ownership, loan lender authorization, loan return authorization, and notification read-all ownership.

### Groups and invitations

[server/test/groups.test.js](../server/test/groups.test.js) covers group name validation, authenticated owner assignment, owner-only deletion, unresolved-loan deletion blocking, invitation recipient authorization, and accepted membership updates.

The suite does not currently execute every group membership endpoint through a real Express HTTP server. In particular, remove-member, leave-group, discover, and full owner-request approval/rejection need additional integration coverage.

### Items

Controller tests cover required item names, trimming, authenticated ownership, unauthorized deletion, and unresolved-loan deletion blocking. Full item visibility queries and multipart image validation are not yet covered against a real database or HTTP multipart request.

### Loans and history

Tests cover loan history ownership query shape, lender-only approval, active transition, and unauthorized return attempts. The existing history component tests cover borrowed/lent classification, search, returned filtering, loading, error, and empty states. Full requested → active → returned workflow integration against MongoDB remains unverified.

### Notifications

Tests verify notification read and mark-all operations are restricted to the authenticated recipient. The model test verifies allowed notification types and the sparse unique dedupe index. The full `GET /api/notifications` population and unread-count query need HTTP/database integration coverage.

### Due-date reminders

[server/test/reminders.test.js](../server/test/reminders.test.js) verifies:

- one-day-before, due-today, overdue, and future classification;
- UTC timezone boundary behavior;
- reminder-log required fields and unique loan/type index;
- notification type validation and sparse dedupe index;
- repeated cycles creating one in-app reminder;
- active-only query constraints covering returned/rejected/cancelled exclusion;
- missing item references using safe notification content and the correct borrower.

The tests stub database calls, so they verify service decisions and query shapes but not MongoDB’s live unique-index race behavior. A multi-process integration test should be added before relying on this suite for distributed deployment guarantees.

## Frontend test inventory

- [client/src/App.test.jsx](../client/src/App.test.jsx): login and registration page interactions and API error rendering.
- [client/src/services/apiClient.test.js](../client/src/services/apiClient.test.js): bearer/JSON headers, successful response parsing, validation errors, and unavailable-server messages.
- [client/src/components/BorrowItemForm.test.jsx](../client/src/components/BorrowItemForm.test.jsx): default request submission, invalid custom duration, and server error display.
- [client/src/components/Inventory/AddItemModal.test.jsx](../client/src/components/Inventory/AddItemModal.test.jsx): required-field validation and trimmed edit submission.
- [client/src/components/Inventory/InventoryPanels.test.jsx](../client/src/components/Inventory/InventoryPanels.test.jsx): invitation/request empty state and action callbacks.
- [client/src/components/BorrowingHistory.test.jsx](../client/src/components/BorrowingHistory.test.jsx): borrowed/lent display, search, returned filtering, loading, error, and empty states.

Full Inventory provider integration, group creation/member interactions, notification page rendering, and real Socket.IO events are not covered by the current frontend suite.

## Coverage result observed

The backend coverage command was executed with Node 26.13.0 and reported:

| Metric | Result |
|---|---:|
| Lines | 49.61% |
| Branches | 55.08% |
| Functions | 44.30% |

These are loaded-module coverage figures, not a claim of complete endpoint coverage. Frontend coverage is unavailable because `@vitest/coverage-v8` or another Vitest coverage provider is not installed.

## Isolation and safety

- Tests use generated ObjectIds and temporary model-method stubs; they do not connect to the configured production database.
- No real email service exists in the application and tests do not send external notifications.
- Each stub is restored in `finally` blocks or test cleanup hooks.
- Frontend tests use jsdom and Testing Library cleanup between renders.
- No test depends on a specific execution order beyond the explicit sequential backend script.

## Adding a real integration layer

This is a documented gap, not currently implemented. A future integration layer should use a separate MongoDB database or ephemeral MongoDB instance, export a testable Express app without starting the listener, seed independent users/groups/items, use HTTP requests against the app, and drop the test database in teardown. It should never read `server/.env` production credentials.
