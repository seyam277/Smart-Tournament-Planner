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
- Register with email and password
- Login with email and password
- **Forgot Password** functionality (sends email with reset link)
- Password reset page accessible via email link
- JWT token-based authentication

### Tournament Access Control
- **Tournament Creator Only**: Can edit and delete their own tournaments
- **Other Organizers**: Can view the tournament but not edit
- **Unauthenticated Users**: Can view tournaments but not create/edit
- Each tournament tracks who created it (creatorEmail)

### Data Storage
- **File-based Storage**: Data stored in `backend/data/` directory as JSON
- **tournaments.json**: All tournament data
- **users.json**: All user data with hashed passwords
- **Optional Oracle Database**: Uncomment database initialization in `server.js`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new organizer
- `POST /api/auth/login` - Login organizer
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Tournaments
- `GET /api/tournaments/all` - Get all tournaments (public)
- `GET /api/tournaments/:id` - Get specific tournament
- `POST /api/tournaments` - Create tournament (requires auth)
- `PUT /api/tournaments/:id` - Update tournament (creator only)
- `DELETE /api/tournaments/:id` - Delete tournament (creator only)
- `GET /api/tournaments/my-tournaments` - Get user's tournaments

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
