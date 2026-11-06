# Smart Tournament Planner

Smart Tournament Planner is a React application with an Express API for organizer tournament management and venue (turf) management. The active frontend is bootstrapped from `src/main.jsx`; the separate `src/App.jsx` is not the active entry point.

## Requirements

- Node.js compatible with the installed Vite version
- npm

## Run locally

Run the frontend from the directory containing this README and `package.json`:

```bash
npm install
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173`).

To run the API, use a second terminal:

```bash
cd backend
npm install
npm run dev
```

The API listens on port `3001` by default. It requires `backend/.env` with a private `JWT_SECRET`. Optional SMTP settings enable password-reset email delivery. Keep real secrets in the local environment and never commit them.

Build and lint the frontend:

```bash
npm run build
npm run lint
```

## Active frontend routes

| Route | Purpose |
| --- | --- |
| `/login` | Organizer login |
| `/register` | Organizer account registration |
| `/authority/login` | Venue authority login |
| `/authority/register` | Venue authority registration |
| `/forgot-password` | Request a password reset |
| `/reset-password` | Set a new password from a reset link |
| `/dashboard` | Organizer dashboard |
| `/tournaments` | Browse tournaments |
| `/tournaments/create` | Create a tournament |
| `/tournaments/edit/:id` | Edit a tournament |
| `/tournaments/:id` | Tournament details and in-page sections |
| `/tournaments/:id/teams` | Team management |
| `/tournaments/:id/players` | Player management |
| `/tournaments/:id/matches` | Match management |
| `/tournaments/:id/budget` | Budget management |
| `/turfs`, `/turfs/:id` | Browse turf venues |
| `/authority/dashboard` | Venue authority dashboard |
| `/authority/turfs/new` | Register a venue |
| `/authority/turfs/:id/edit` | Edit a venue |
| `/authority/turfs/:id` | Manage a venue and its fields |

Protected routes require an authenticated account with the appropriate role. Organizer and venue authority login/registration use separate routes and API operations.

## Project layout

```text
index.html
public/                    Static assets
src/
  main.jsx                 Active React entry and route configuration
  components/              Authentication, dashboard, tournament, and turf UI
  context/AuthContext.jsx  Authentication state
  services/                Frontend API and tournament data helpers
  utils/theme.js           Sport theme helpers
backend/
  server.js                Express API entry point
  routes/ controllers/     API routes and request handlers
  middleware/ models/      Authorization, errors, and Mongoose schemas
  services/mockDb.js       Active JSON-backed data store
```

`src/App.jsx` is an older, inactive router; the Vite entry in `index.html` loads `src/main.jsx`. Do not use the older route list in `App.jsx` as the active route map.

## Data and current limitations

- Authentication state is kept in browser local storage. Tournament and venue data are served by the backend.
- The backend currently uses `backend/mock_db.json` as its active store. Back up this file before resetting or replacing local data.
- Oracle and MongoDB connection helpers, Mongoose models, and a separate file-storage service remain in the repository, but `backend/server.js` does not initialize those alternate stores. Their code and dependencies are retained.
- The active frontend build has previously reported missing `dataService` exports called by the team/player screens (`getPlayersByTeam`, `registerPlayer`, `deletePlayer`, and `deleteTeam`). Review these existing warnings before relying on those operations.
- The frontend currently has no test script or test/spec files.

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for backend environment, API, and data-store details. The [Bangla implementation guide](./BANGLA_IMPLEMENTATION_GUIDE.md) provides a Bengali overview and manual verification checklist.
