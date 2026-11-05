# BorrowBuddy API reference

This reference is based on the Express routes imported from `server/Routes` by [server/index.js](../server/index.js) and the controllers they call. API paths are mounted under `/api`. Protected routes require the header `Authorization: Bearer <JWT>`. The JWT is issued by registration/login and the server derives ownership from the verified identity.

Successful responses use { success: true, data: ... }. Errors use { success: false, message: "..." }. Dates are ISO-8601 strings. There is no general pagination contract; notifications are limited to 50 records.

## Authentication and users

| Method and path | Auth | Request | Result and restrictions |
|---|---|---|---|
| POST /api/auth/register | Public | JSON: name, email, password; optional phone | 201 with public user and token. Name/email/password required; password minimum 6 characters; name max 50; email valid and unique. 400 on validation/duplicate. |
| POST /api/auth/login | Public | JSON: email, password | 200 with public user and token. 400 missing fields; 401 invalid credentials. |
| GET /api/auth/me | Bearer | None | 200 current user; 401 invalid token; 404 if account is gone. |
| PUT /api/auth/profile | Bearer | Optional JSON: name, email, phone, currentPassword, newPassword | 200 updated public user. New password requires current password and is at least 6 characters; duplicate email is 400. |
| GET /api/auth/users | Bearer | Optional query search | 200 users excluding current user; search matches name/email case-insensitively. |

Example register body: { "name": "Asha Rao", "email": "asha@example.com", "password": "correct horse", "phone": "555-0100" }.
Example success: { "success": true, "data": { "_id": "...", "name": "Asha Rao", "email": "asha@example.com", "phone": "", "avatar": "", "createdAt": "2026-11-05T10:00:00.000Z", "token": "<JWT>" } }.

## Groups and memberships

| Method and path | Auth/permission | Request and behavior | Errors |
|---|---|---|---|
| POST /api/groups | Bearer | multipart/form-data: name required; description, categories JSON array, image optional. Image JPEG/JPG/PNG, max 2 MB. Owner becomes member and manager. | 400 invalid/missing data. |
| GET /api/groups | Bearer | None. Lists groups owned by or containing the current user. | 401. |
| GET /api/groups/discover | Bearer | None. Lists groups where current user is neither owner nor member, newest first. | 401. |
| GET /api/groups/:id/details | Bearer, member | None. Returns group, members, visible items, active loans, per-member items and stats. | 403 non-member; 404 missing group. |
| GET /api/groups/:id/items | Bearer, member | Query search, category, status. | 404 when membership/group cannot be found. |
| POST /api/groups/:id/items | Bearer, manager/owner | JSON name and category required; description optional. Creates available item without image. | 403; 404; 400 validation. |
| POST /api/groups/:id/loans | Bearer, group member | Same JSON body as POST /api/loans, but groupId is taken from the path. | Same loan visibility, validation, and state errors as POST /api/loans. |
| GET /api/groups/:id/loans | Bearer, group member | None. Returns loans in the group; booked loans are promoted to active as part of the existing controller behavior. | 404 for a missing/inaccessible group. |
| GET /api/groups/:id/members | Bearer, member | None. Returns public member profiles. | 403; 404. |
| DELETE /api/groups/:id/members/:memberId | Bearer, owner | Removes member. Owner cannot remove self; unresolved loans block removal. | 400 invalid/blocked; 403; 404. |
| PATCH /api/groups/:id/leave | Bearer, member | None. Owner cannot leave; unresolved loans block leaving. | 400; 403; 404. |
| DELETE /api/groups/:id | Bearer, owner | None. Deletes only when no requested/booked/active loans; cancels pending invitations and clears item group links. | 400 blocked; 403; 404. |

## Invitations and join requests

| Method and path | Auth/permission | Request and behavior | Errors |
|---|---|---|---|
| POST /api/invitations | Bearer, group member | JSON groupId, inviteeId required; message optional. | 400 invalid/duplicate/already member; 403 non-member; 404 group/user. |
| GET /api/invitations/me | Bearer | None. Returns received invitations and requests created by current user, newest first, with direction. | 401. |
| POST /api/invitations/requests | Bearer | JSON groupId required; message optional. Creates member request. | 400 already belongs/pending; 404 group. |
| GET /api/invitations/owner-requests | Bearer, group owner | None. Returns member requests for owned groups. | 401. |
| PATCH /api/invitations/:id/accept | Bearer, invitee | Accepts pending owner invitation and adds current user to group. | 400 invalid/non-pending; 403 wrong user/member-request; 404. |
| PATCH /api/invitations/:id/reject | Bearer, invitee | Rejects pending owner invitation. | Same authorization/validation as accept. |
| PATCH /api/invitations/:id/approve | Bearer, group owner | Approves pending member request. | 400 invalid/non-pending; 403; 404. |
| PATCH /api/invitations/:id/reject-request | Bearer, group owner | Rejects pending member request. | 400 invalid/non-pending; 403; 404. |

## Items and inventory

| Method and path | Auth/permission | Request and validation | Result |
|---|---|---|---|
| POST /api/items | Bearer | multipart: name required; category, description, sharingType all/selected, sharedWithGroups JSON array, groupId, image optional. Image JPEG/JPG/PNG/WebP, max 3 MB. Selected groups must belong to owner. | 201 available item; 400/403 invalid visibility or input. |
| GET /api/items | Bearer | None. Returns owned and visible items, newest first, with owner/group names. | 200 data array. |
| GET /api/items/:id | Bearer | None. Item must be visible to current user. | 200 item; 404 invalid/inaccessible. |
| PATCH /api/items/:id | Bearer, owner | multipart optional name/category/description/sharingType/sharedWithGroups/image. | 200 updated item; 400 invalid sharing; 403 non-owner; 404. |
| DELETE /api/items/:id | Bearer, owner | None. Deletion only for available/maintenance/retired items without requested/booked/active loans. | 200; 400 blocked; 403; 404. |

## Borrowing, lending and history

Loan statuses are requested, booked, active, returned, rejected and cancelled.

| Method and path | Auth/permission | Request and validation | Result |
|---|---|---|---|
| POST /api/loans | Bearer | JSON itemId required; optional checkoutDate, dueDate, durationDays, note, groupId. Dates must be valid, due >= checkout; duration is whole number 1-365. Owners cannot borrow their item. | 201 requested loan; item is reserved. 400 invalid/unavailable; 404 not visible. |
| GET /api/loans | Bearer | None. Server filter is borrowerId=current OR lenderId=current; populated item, borrower, lender and group. Sort newest first. | 200 loan array. This is also the borrowing history endpoint. |
| PATCH /api/loans/:id/approve | Bearer, lender | None. Requested loan only; changes loan active and item borrowed. | 400 state/conflict; 403; 404. |
| PATCH /api/loans/:id/reject | Bearer, lender | None. Requested loan only. | 400 state; 403; 404. |
| PATCH /api/loans/:id/activate | Bearer, borrower/lender | None. Booked loan only; item must be booked. | 400 state; 403; 404. |
| PATCH /api/loans/:id/return | Bearer, borrower/lender | Optional JSON returnDate and note; note max 500 characters. Active/booked only. | 200 returned loan; 400 invalid/state; 403; 404. |

History classification is client-side: borrowerId equal to the authenticated user means Borrowed; lenderId equal means Lent. The backend ownership filter prevents another user's history from being returned. No history query filters or pagination are implemented. The current client performs search, role/status filtering, and newest-first sorting after this response is loaded.

Example loan request: { "itemId": "...", "checkoutDate": "2026-11-05T00:00:00.000Z", "dueDate": "2026-11-12T00:00:00.000Z", "durationDays": 7, "note": "Please keep it dry", "groupId": "..." }.

## Notifications

| Method and path | Auth/permission | Request and response |
|---|---|---|---|
| GET /api/notifications | Bearer | No query parameters. Returns up to 50 notifications for recipientId=current user, newest first, and unreadCount. |
| PATCH /api/notifications/:id/read | Bearer, recipient only | No body. Marks one notification read. Another user's notification returns 404. |
| PATCH /api/notifications/read-all | Bearer | No body. Marks all current user's unread notifications read. |

Example reminder: { "success": true, "unreadCount": 1, "data": [{ "type": "due_date_reminder", "title": "Item due today", "message": "Camera is due today. Please return it today.", "read": false, "data": { "loanId": "...", "itemId": "...", "reminderType": "due_today" } }] }.

## Due-date reminders

There is no public reminder endpoint. The server starts the scheduler after MongoDB connects, runs once immediately, then every REMINDER_INTERVAL_MS. It scans only active loans with a non-null dueDate and borrower reference.

UTC calendar classification is one_day_before for one UTC day remaining, due_today for the due UTC date, and overdue for any earlier UTC date. Each loan/type has a unique ReminderLog and an atomic in-app claim; notifications have a unique sparse dedupeKey. Returned, rejected, cancelled, missing-date and missing-borrower loans are skipped. Only the borrower receives a due_date_reminder. Email reminders do not exist. The scheduler has no public API endpoint.

## Route and implementation notes

- `GET /api/invitations` and `GET /api/invitations/me` call the same controller and return the current user's received invitations plus requests they created.
- The invitation schema uses `invitedBy` and `invitedUserId`. The controller accepts the existing client payload name `inviteeId` as a compatibility alias, then stores the schema field.
- `server/utils/itemVisibility.js` still contains a legacy `inviteeId` lookup for accepted-invitation synchronization. Because the schema uses `invitedUserId`, this path is a known implementation gap rather than a supported API guarantee.

## System and static routes

| Method and path | Auth | Response |
|---|---|---|
| GET / | Public | Plain text: Server is running. |
| GET /health | Public | 200 { success: true, status: ok } while MongoDB is connected; otherwise 503 and success false. |
| GET /uploads/<filename> | Public static | Serves files from UPLOAD_DIR; this is not a JWT-protected API route. |
