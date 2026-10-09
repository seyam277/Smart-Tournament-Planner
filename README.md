# Tournament Hobe - Tournament Management System

## Overview

Tournament Hobe is a web-based tournament management system designed for organizing sports tournaments (Football, Cricket, Badminton) with features for team/player management, match scheduling, statistics tracking, and budget management.

## Project Status

✅ **Frontend Components**: 100% Complete  
⏳ **Backend API**: Not Started (Ready for integration)  
⏳ **Database**: Not Started (Ready for setup)  

---

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## Features Implemented

### 1. Authentication System ✓
- Organizer registration with email validation
- Secure login with password verification
- Session persistence using localStorage
- Protected routes for authenticated users
- Logout functionality

### 2. Tournament Management ✓
- Create tournaments with details (name, sport, location, date, format, budget)
- View all tournaments by organizer
- Edit and delete tournaments
- Track tournament status (Planning, Ongoing, Completed)

### 3. Team Management ✓
- Register teams in tournaments
- Add team details (name, category, logo placeholder)
- Edit and delete teams
- View all teams in tournament

### 4. Player Management ✓
- Register players to teams
- Assign jersey numbers and positions
- Track player information
- View player list with team details

### 5. Match Management ✓
- Schedule matches between teams
- Set match date, time, and venue
- Assign group/fixture information
- View match list

### 6. Statistics & Standings ✓
- Display points table with team rankings
- Show win/loss/draw records
- Calculate and display points
- Support for different sports rules

### 7. Awards Management ✓
- Man of the Match selection
- Man of the Series award
- Top scorers ranking
- Award history tracking

### 8. Budget Management ✓
- Set tournament budget
- Track and categorize expenses
- Calculate remaining budget
- Display expense breakdown

### 9. Dashboard ✓
- Main organizer dashboard
- Sidebar navigation
- Quick stats cards
- Quick action buttons
- Responsive layout

---

## Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Main dashboard
│   ├── tournament/        # Tournament management
│   ├── team/             # Team management
│   ├── player/           # Player management
│   ├── match/            # Match management
│   ├── statistics/       # Statistics & standings
│   ├── awards/           # Awards management
│   └── budget/           # Budget management
├── services/
│   └── dataService.js    # Data operations
├── context/
│   └── AuthContext.jsx   # Auth state management
├── App.jsx               # Main app with routing
└── index.css             # Global styles
```

---

## Available Routes

| Route | Purpose |
|-------|---------|
| `/login` | Organizer login |
| `/register` | Organizer registration |
| `/dashboard` | Main dashboard |
| `/tournaments` | List tournaments |
| `/tournaments/create` | Create tournament |
| `/tournaments/:id` | Tournament details |
| `/tournaments/:id/teams` | Team management |
| `/tournaments/:id/players` | Player management |
| `/tournaments/:id/matches` | Match management |
| `/tournaments/:id/standings` | Standings |
| `/tournaments/:id/awards` | Awards |
| `/tournaments/:id/budget` | Budget |

---

## Getting Started

1. Install dependencies: `npm install`
2. Start server: `npm run dev`
3. Register as organizer at `/register`
4. Login and start creating tournaments
5. Manage teams, players, and matches
6. Track budget and view statistics

---

## Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup and implementation guide
- **[PROJECT_IMPLEMENTATION_GUIDE.md](PROJECT_IMPLEMENTATION_GUIDE.md)** - Project roadmap and architecture

---

## Next Steps

1. Connect to backend API
2. Set up database
3. Add advanced features (exports, notifications, etc.)
4. Deploy to production

---

**Tournament Hobe - Making Tournament Management Simple! 🏆**
