# Backend Setup

The backend is an Express API in `backend/`. Run commands in that directory unless otherwise noted.

## Requirements

- Node.js compatible with the installed dependencies
- npm

## Install and start

From the project directory:

```bash
cd backend
npm install
npm run dev
```

Use `npm start` to run without nodemon. The API listens on port `3001` unless `PORT` is set. Check that it is available with `GET http://localhost:3001/api/health`.

The frontend is a separate Vite application. In another terminal, return to the project directory and run:

```bash
npm install
npm run dev
```

The frontend normally runs at `http://localhost:5173`.

## Environment

The backend loads `backend/.env`. At minimum, configure a private JWT signing secret:

```env
PORT=3001
JWT_SECRET=replace_with_a_private_random_secret
FRONTEND_URL=http://localhost:5173
```

Optional SMTP settings allow password-reset messages to be sent through a configured mail server:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_smtp_or_app_password
```

The backend requires `JWT_SECRET` and fails during startup if it is missing. Keep real secrets in the local environment; do not commit `.env` or paste secret values into logs or documentation.

`ORACLE_USER`, `ORACLE_PASSWORD`, and `ORACLE_CONNECT_STRING` are read by the retained Oracle configuration helper. The current server does not initialize an Oracle connection.

## Active data storage

`backend/services/mockDb.js` is the active data service. It resolves `backend/mock_db.json` relative to the module file and reads/writes that JSON file. It stores users, tournaments, teams, players, matches, turfs, fields, slots, bookings, and reviews.

Back up the active JSON file before changing or resetting data. It may contain user records and password hashes and should be handled as private application data.

The repository also retains alternate storage components:

- `backend/config/database.js` and the `oracledb` dependency provide an Oracle connection helper.
- `backend/config/db.js` and the Mongoose models provide a MongoDB connection/schema path.
- `backend/services/fileStorageService.js` and `backend/data/` provide a separate file-storage implementation.

These are not initialized by `backend/server.js`; the current runtime uses the JSON mock store. They are documented here for clarity and are not removed or disabled by this setup guide.

## API routes

### Health and authentication

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Register an Organizer |
| `POST` | `/api/auth/login` | Log in an Organizer |
| `POST` | `/api/auth/authority/register` | Register a venue authority |
| `POST` | `/api/auth/authority/login` | Log in a venue authority |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset password with token |

### Tournaments

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/tournaments/all` | List tournaments |
| `GET` | `/api/tournaments/:id` | Read a tournament |
| `GET` | `/api/tournaments/my-tournaments` | List the signed-in Organizer's tournaments |
| `POST` | `/api/tournaments` | Create a tournament (Organizer) |
| `PUT` | `/api/tournaments/:id` | Update a tournament (Organizer/owner checks apply) |
| `DELETE` | `/api/tournaments/:id` | Delete a tournament (Organizer/owner checks apply) |

### Turf and field management

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/turfs` | List public turfs |
| `GET` | `/api/turfs/:id` | Read a public turf |
| `GET` | `/api/turfs/:fieldId/slots?date=YYYY-MM-DD` | Read field slots |
| `GET` | `/api/turfs/:fieldId/reviews` | Read field reviews |
| `POST` | `/api/turfs/:fieldId/reviews` | Create a field review |
| `GET` | `/api/turfs/mine` | List the signed-in authority's turfs |
| `POST` | `/api/turfs` | Create a turf (authority) |
| `GET` | `/api/turfs/mine/:turfId` | Read an owned turf |
| `PUT` | `/api/turfs/mine/:turfId` | Update an owned turf |
| `DELETE` | `/api/turfs/mine/:turfId` | Soft-delete an owned turf |
| `POST` | `/api/turfs/mine/:turfId/fields` | Add a field |
| `PUT` | `/api/turfs/mine/:turfId/fields/:fieldId` | Update a field |
| `DELETE` | `/api/turfs/mine/:turfId/fields/:fieldId` | Delete an unreferenced field |
| `POST` | `/api/turfs/bookings` | Create a booking (Organizer) |
| `GET` | `/api/turfs/bookings/user/:userId` | List an Organizer's bookings |

Authority management endpoints require a bearer token with the `authority` role and check ownership of the nested turf. Organizer-only routes require the `organizer` role. Pending/deleted turf records are omitted from public listings; deletion may be blocked when booking or slot references exist.

## Manual smoke checks

1. Start the backend and request `GET /api/health`.
2. Register and log in using the Organizer routes.
3. Register and log in using the authority routes; verify the roles remain separate.
4. With an Organizer account, create a tournament and read it from the tournament list/detail routes.
5. With an authority account, register a turf and add/edit a field.

Use local test accounts and local data. Avoid posting real user credentials or password hashes.

## Troubleshooting

- **Missing `JWT_SECRET`:** set it in `backend/.env` and restart the backend.
- **Port in use:** set `PORT` to an available port and ensure the frontend API base URL matches the backend.
- **Password-reset email not delivered:** verify the SMTP host, port, user, and app password. The mail service logs that delivery failed when SMTP is unavailable.
- **Data changes missing:** confirm the process has write access to `backend/mock_db.json`; back up the file before manual edits.
- **CORS/network errors:** ensure the backend is running and the frontend is configured for the same host and port.

For general frontend commands and active browser routes, see [README.md](./README.md).
