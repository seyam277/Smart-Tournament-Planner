# Tournament Hobe - Complete Setup & Implementation Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `react-router-dom` - For page routing
- Other dependencies from package.json

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Complete File Structure

```
src/
├── App.jsx                          # Main app with routing
├── App.css                          # App styles
├── index.css                        # Global styles (already configured)
├── main.jsx                         # React entry point
│
├── components/
│   ├── auth/
│   │   ├── OrganizerLogin.jsx      # Login page
│   │   ├── OrganizerRegister.jsx   # Registration page
│   │   └── ProtectedRoute.jsx      # Route protection wrapper
│   │
│   ├── dashboard/
│   │   └── Dashboard.jsx            # Main dashboard with sidebar
│   │
│   ├── tournament/
│   │   ├── TournamentCreate.jsx    # Create new tournament
│   │   ├── TournamentList.jsx      # List all tournaments
│   │   └── TournamentDetails.jsx   # Tournament details page
│   │
│   ├── team/
│   │   └── TeamManagement.jsx      # Add/edit/delete teams
│   │
│   ├── player/
│   │   └── PlayerManagement.jsx    # Add/edit/delete players
│   │
│   ├── match/
│   │   └── MatchManagement.jsx     # Schedule and manage matches
│   │
│   ├── statistics/
│   │   └── StandingsTable.jsx      # Points table & standings
│   │
│   ├── awards/
│   │   └── AwardManagement.jsx     # Awards & recognition
│   │
│   └── budget/
│       └── BudgetManagement.jsx    # Budget & expense tracking
│
├── services/
│   └── dataService.js              # Mock data service (localStorage)
│
└── context/
    └── AuthContext.jsx             # Authentication context
```

---

## Component Details & Changes Needed

### Phase 1: Authentication (COMPLETED ✓)

**Files Modified/Created:**
- [OrganizerLogin.jsx](src/components/auth/OrganizerLogin.jsx) - Login form
- [OrganizerRegister.jsx](src/components/auth/OrganizerRegister.jsx) - Registration form
- [ProtectedRoute.jsx](src/components/auth/ProtectedRoute.jsx) - Route protection
- [AuthContext.jsx](src/context/AuthContext.jsx) - Auth state management

**What it does:**
- Organizers can register and login
- Sessions persist using localStorage
- Protected routes redirect unauthenticated users

**TODO (if connecting to real backend):**
- Replace localStorage with actual API calls in `OrganizerLogin.jsx` line 30
- Add password hashing on backend
- Implement JWT token validation

---

### Phase 2: Dashboard (COMPLETED ✓)

**File:** [Dashboard.jsx](src/components/dashboard/Dashboard.jsx)

**Features:**
- Sidebar navigation with all main features
- Quick stats cards (to be populated with real data)
- Quick action buttons

**TODO (to enhance):**
- Line 60-80: Connect dashboard cards to show real data from context
- Add logout functionality
- Add organizer profile view

---

### Phase 3: Tournament Management (COMPLETED ✓)

**Files:**
- [TournamentCreate.jsx](src/components/tournament/TournamentCreate.jsx) - Create new tournament
- [TournamentList.jsx](src/components/tournament/TournamentList.jsx) - List tournaments
- [TournamentDetails.jsx](src/components/tournament/TournamentDetails.jsx) - Tournament hub

**TODO (to enhance):**
- Add tournament editing functionality
- Add tournament status updates
- Display tournament statistics
- Add tournament settings page

---

### Phase 4: Team Management (COMPLETED ✓)

**File:** [TeamManagement.jsx](src/components/team/TeamManagement.jsx)

**Features:**
- Add teams to tournament
- Edit team details
- Delete teams
- Display all teams in table

**TODO (to enhance):**
- Add team logo upload
- Add team edit functionality
- Add team history
- Validate team names (no duplicates)

---

### Phase 5: Player Management (COMPLETED ✓)

**File:** [PlayerManagement.jsx](src/components/player/PlayerManagement.jsx)

**Features:**
- Register players to teams
- Assign jersey numbers and positions
- View player list
- Delete players

**TODO (to enhance):**
- Add player photo upload
- Add player statistics tracking
- Add player performance history
- Add player search/filter

---

### Phase 6: Match Management (COMPLETED ✓)

**File:** [MatchManagement.jsx](src/components/match/MatchManagement.jsx)

**Features:**
- Schedule matches
- Assign teams and venue
- Set match date and time
- View match list

**TODO (to add):**
- **Line 20-30**: Add match result entry form
- **Line 40-60**: Add functionality to record goals/scores
- Add Man of Match selection
- Add match statistics recording
- Add automatic standings update after match result

---

### Phase 7: Statistics & Standings (COMPLETED ✓)

**File:** [StandingsTable.jsx](src/components/statistics/StandingsTable.jsx)

**Features:**
- Display points table
- Show team rankings
- Display wins/losses

**TODO (to enhance):**
- **Line 15-30**: Connect to real data instead of mock data
- Add goal difference calculation
- Add head-to-head records
- Add tiebreaker logic
- Add automatic updates when match results change

---

### Phase 8: Awards Management (COMPLETED ✓)

**File:** [AwardManagement.jsx](src/components/awards/AwardManagement.jsx)

**Features:**
- Display Man of Match awards
- Display Man of Series
- Display top scorers list

**TODO (to add):**
- Add form to assign awards after matches
- Add award date tracking
- Add award notification system
- Add award history

---

### Phase 9: Budget Management (COMPLETED ✓)

**File:** [BudgetManagement.jsx](src/components/budget/BudgetManagement.jsx)

**Features:**
- Set tournament budget
- Add and track expenses
- Display budget summary
- Show remaining budget

**TODO (to enhance):**
- Add budget alerts when overspending
- Add expense reports with charts
- Add category-wise breakdown
- Add expense date tracking
- Add ability to edit/delete expenses

---

## Data Service Methods

**File:** [dataService.js](src/services/dataService.js)

All data operations currently use localStorage. To connect to real backend:

### Tournament Operations
```javascript
createTournament(data)         // Create new tournament
getTournaments(organizerId)    // Get all tournaments for organizer
getTournamentById(id)          // Get single tournament
updateTournament(id, data)     // Update tournament
```

### Team Operations
```javascript
registerTeam(data)             // Register new team
getTeamsByTournament(id)       // Get all teams in tournament
updateTeam(id, data)           // Update team
deleteTeam(id)                 // Delete team
```

### Player Operations
```javascript
registerPlayer(data)           // Register new player
getPlayersByTeam(id)           // Get players in team
updatePlayer(id, data)         // Update player
deletePlayer(id)               // Delete player
```

### Match Operations
```javascript
createMatch(data)              // Create match
getMatchesByTournament(id)     // Get all matches
recordMatchResult(id, result)  // Record match result
setManOfMatch(matchId, playerId)
setManOfSeries(tournamentId, playerId)
```

### Budget Operations
```javascript
addExpense(data)               // Add expense
getExpensesByTournament(id)    // Get all expenses
calculateTotalExpenses(id)     // Calculate total
```

---

## Implementation Checklist

### Frontend (Current Status)
- [x] Authentication (Login/Register)
- [x] Dashboard with sidebar
- [x] Tournament CRUD
- [x] Team management
- [x] Player management
- [x] Match scheduling
- [x] Standings display
- [x] Awards management
- [x] Budget tracking

### Backend (TODO - Not yet implemented)
- [ ] API endpoints for all operations
- [ ] Database schema
- [ ] User authentication API
- [ ] Password hashing
- [ ] JWT token management
- [ ] Data validation
- [ ] Error handling
- [ ] Permission checks

### Database (TODO - Not yet implemented)
- [ ] Create organizers table
- [ ] Create tournaments table
- [ ] Create teams table
- [ ] Create players table
- [ ] Create matches table
- [ ] Create groups table
- [ ] Create expenses table
- [ ] Create awards table
- [ ] Add relationships and constraints

### Additional Features (TODO)
- [ ] Export reports to PDF/Excel
- [ ] Live score updates
- [ ] Email notifications
- [ ] Mobile app version
- [ ] Admin dashboard
- [ ] Analytics and insights

---

## How to Test the App

### 1. Register as Organizer
- Go to `http://localhost:5173/register`
- Fill in details and submit
- (Data saved to localStorage)

### 2. Login
- Go to `http://localhost:5173/login`
- Use registered email/password
- Redirected to Dashboard

### 3. Create Tournament
- Click "Create Tournament" from dashboard
- Fill tournament details
- Submit form

### 4. Manage Teams
- Go to Tournaments → Select Tournament → Teams
- Click "Add Team"
- Register teams for tournament

### 5. Manage Players
- Go to Players section
- Select team and add players
- Assign jersey numbers and positions

### 6. Schedule Matches
- Go to Matches section
- Click "Schedule Match"
- Select teams, date, time, venue

### 7. View Standings
- Go to Standings
- See points table

### 8. Manage Budget
- Go to Budget section
- Set tournament budget
- Add expenses with categories

---

## API Integration Guide (When Backend is Ready)

### Replace localStorage with API calls:

**In [dataService.js](src/services/dataService.js), replace all functions with:**

```javascript
const API_BASE_URL = 'http://your-backend-api.com/api'

export const createTournament = async (tournamentData) => {
  const response = await fetch(`${API_BASE_URL}/tournaments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(tournamentData)
  })
  return response.json()
}

// Similar pattern for other endpoints
```

### Update Authentication:

**In [OrganizerLogin.jsx](src/components/auth/OrganizerLogin.jsx) line 30:**

```javascript
const response = await fetch('http://your-backend-api.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
const data = await response.json()
// Store token and organizer data
```

---

## Error Handling

Each component has try-catch blocks. Current errors are logged to console.

### To Improve Error Handling:
1. Add error state in components
2. Display user-friendly error messages
3. Add retry logic for failed requests
4. Add loading states during API calls
5. Add validation before submissions

---

## Security Considerations

### Current Issues (for development only):
- Passwords stored in localStorage (not hashed)
- No HTTPS
- No input validation
- No SQL injection protection

### For Production, Add:
- HTTPS/SSL
- Password hashing (bcrypt on backend)
- Input validation and sanitization
- CORS configuration
- Rate limiting
- User role-based access control
- Two-factor authentication

---

## Performance Optimization Tips

1. Add React.memo for components that don't change often
2. Use useCallback for event handlers
3. Implement data pagination for large lists
4. Add lazy loading for images
5. Cache API responses
6. Minimize bundle size

---

## Deployment Guide

### Frontend Deployment (Vercel/Netlify):
```bash
npm run build
# Deploy the dist/ folder
```

### Backend Deployment (Heroku/Railway/DigitalOcean):
- Push to GitHub
- Connect repository
- Set environment variables
- Deploy

---

## Support & Next Steps

1. **Review each component** and understand the structure
2. **Test the app** thoroughly with test data
3. **Connect backend API** when ready
4. **Add more features** as needed
5. **Deploy to production**

---

## File Summary

| File | Purpose | Status |
|------|---------|--------|
| App.jsx | Main routing | ✓ Complete |
| AuthContext.jsx | Auth state | ✓ Complete |
| OrganizerLogin.jsx | Login page | ✓ Complete |
| OrganizerRegister.jsx | Register page | ✓ Complete |
| Dashboard.jsx | Main dashboard | ✓ Complete |
| TournamentCreate.jsx | Create tournament | ✓ Complete |
| TournamentList.jsx | List tournaments | ✓ Complete |
| TeamManagement.jsx | Team CRUD | ✓ Complete |
| PlayerManagement.jsx | Player CRUD | ✓ Complete |
| MatchManagement.jsx | Match scheduling | ✓ Complete |
| StandingsTable.jsx | Standings view | ✓ Complete |
| BudgetManagement.jsx | Budget tracking | ✓ Complete |
| AwardManagement.jsx | Awards display | ✓ Complete |
| dataService.js | Data operations | ✓ Mock API |

---

Last Updated: April 2026
