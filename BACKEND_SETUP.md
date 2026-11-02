# Backend Setup & Installation Guide

## Project Structure
```
tournament-hobe/
├── backend/               # Backend API server
│   ├── config/
│   │   ├── config.js      # Configuration (database, JWT, email)
│   │   └── database.js    # Oracle Database connection
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Authentication & error handling
│   ├── routes/            # API routes
│   ├── services/          # Email & file storage services
│   ├── utils/             # Utility functions (JWT, password)
│   ├── data/              # File-based data storage
│   ├── .env               # Environment variables
│   ├── package.json
│   └── server.js          # Main server file
└── src/                   # Frontend React application
```

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Oracle Database (optional, can use file storage instead)
- Gmail account (for password reset emails)

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd tournament-hobe/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Edit the `.env` file in the backend directory:

```env
# Server
PORT=3001
NODE_ENV=development

# Oracle Database Configuration
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password
ORACLE_CONNECT_STRING=localhost:1521/xe

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# File Storage Path
FILE_STORAGE_PATH=./data

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

`JWT_SECRET` is required by the backend and must be a private, randomly generated secret held in the backend environment. Do not commit the real value or share it in logs. The backend no longer uses a source-code fallback for JWT signing.

### 4. Email Setup (Gmail)
To enable password reset emails:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"
3. Create an "App Password" for Gmail
4. Use the App Password in the `.env` file as EMAIL_PASSWORD

### 5. Start the Backend Server
```bash
npm start
```
Or with auto-reload:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd tournament-hobe
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Frontend
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Features Implemented

### Authentication
- Separate Organizer registration and login
- Separate Turf Authority registration and login
- Shared user store with server-assigned `organizer` or `authority` role
- Role-protected Organizer tournament operations
- **Forgot Password** functionality (sends email with reset link)
- Password reset page accessible via email link
- JWT token-based authentication

### Tournament Access Control
- **Tournament Creator Only**: Can edit and delete their own tournaments
- **Other Organizers**: Can view the tournament but not edit
- **Unauthenticated Users**: Can view tournaments but not create/edit
- Each tournament tracks who created it (creatorEmail)

### Data Storage
- **Current active store**: `backend/services/mockDb.js` reads and writes `mock_db.json` relative to the backend process working directory. When started with the backend package scripts, this resolves to `backend/mock_db.json`.
- The mock JSON store contains users, tournaments, teams, players, matches, turfs, slots, bookings, and reviews.
- `backend/services/fileStorageService.js`, the Mongoose models, and Oracle/Mongo connection helpers are present, but the current `backend/server.js` does not initialize those alternative stores.
- Organizer and Authority accounts use the same active user collection. Existing accounts without a role are treated as Organizers.
- Authority-owned turf and field management uses that same JSON store. New turf records embed their independently identified `fields` array and are assigned to the authenticated Authority by the backend.
- New turf registrations start with `registrationStatus: "pending"` and are excluded from public turf responses. No approval workflow exists in this stage. Deletion is a soft delete; turf/field records with booking or slot references are protected from deletion.
- Turf photos are stored as validated HTTP/HTTPS URLs. Coordinates are stored as latitude/longitude values; interactive map selection and file uploads are not included.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new organizer
- `POST /api/auth/login` - Login organizer
- `POST /api/auth/authority/register` - Register Turf Authority and business contact profile
- `POST /api/auth/authority/login` - Login Turf Authority
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Tournaments
- `GET /api/tournaments/all` - Get all tournaments (public)
- `GET /api/tournaments/:id` - Get specific tournament
- `POST /api/tournaments` - Create tournament (requires auth)
- `PUT /api/tournaments/:id` - Update tournament (creator only)
- `DELETE /api/tournaments/:id` - Delete tournament (creator only)
- `GET /api/tournaments/my-tournaments` - Get user's tournaments

### Turfs and Fields
- `GET /api/turfs` - List public turfs (pending/deleted Authority registrations are omitted)
- `GET /api/turfs/:id` - Get a public, active turf
- `GET /api/turfs/mine` - List the authenticated Authority's turfs
- `POST /api/turfs` - Create a pending turf (Authority role required; owner ID is derived from the verified token)
- `GET /api/turfs/mine/:turfId` - Get owned turf management details
- `PUT /api/turfs/mine/:turfId` - Update an owned turf
- `DELETE /api/turfs/mine/:turfId` - Soft-delete an owned turf unless booking history exists
- `POST /api/turfs/mine/:turfId/fields` - Add a field to an owned turf
- `PUT /api/turfs/mine/:turfId/fields/:fieldId` - Update a field on an owned turf
- `DELETE /api/turfs/mine/:turfId/fields/:fieldId` - Delete an unreferenced field on an owned turf

Authority management endpoints require a bearer token with the `authority` role. Every nested turf operation checks ownership using the authenticated account ID. Public serializers do not return Authority identity or registration status.

## Frontend Components Updated

- `Login.jsx` - Login with forgot password option
- `Register.jsx` - Registration with backend integration
- `ResetPassword.jsx` - Password reset page
- `TournamentListBackend.jsx` - View all tournaments with permissions
- `TournamentCreateBackend.jsx` - Create new tournament

## Testing the System

### 1. Register
- Go to `/register`
- Fill in details and submit
- Backend validates and creates account

### 2. Login
- Go to `/login`
- Enter credentials
- Receive JWT token

### 3. Forgot Password
- Click "Forgot Password?" on login page
- Enter email
- Check email for reset link
- Click link to reset password

### 4. Create Tournament
- After login, go to `/tournaments/create`
- Fill in tournament details
- Only you can edit this tournament

### 5. View Tournaments
- Go to `/tournaments`
- View all tournaments
- Other tournaments show "Created by: email@example.com"
- Only your tournaments have Edit/Delete buttons

## Database Setup (Oracle)

To enable Oracle Database:

1. Install Oracle client on your machine
2. Update connection string in `.env`:
   ```
   ORACLE_CONNECT_STRING=yourdomain:1521/xe
   ```
3. Create database tables (SQL provided separately)
4. Uncomment in `server.js`:
   ```javascript
   await initializeDatabase()
   ```

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env or use different port
PORT=3002 npm start
```

### Email Not Sending
- Verify Gmail App Password is correct
- Check "Less secure app access" settings in Gmail
- Ensure EMAIL_USER and EMAIL_PASSWORD are correct

### CORS Issues
- Verify FRONTEND_URL in `.env` matches your frontend URL
- Default is `http://localhost:5173`

### File Storage Issues
- Ensure backend has write permissions to `./data` directory
- Check if `data/` directory exists

## Security Notes
- Change JWT_SECRET before production
- Use strong passwords
- Configure CORS properly for production domains
- Use HTTPS in production
- Store sensitive data in environment variables
- Hash passwords with bcryptjs (already implemented)
