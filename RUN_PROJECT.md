# How to Run Tournament Hobe Project

## Prerequisites

Before starting, make sure you have:
- **Node.js** installed (version 14 or higher)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Check if Node.js is installed:
```bash
node --version
npm --version
```

---

## Step-by-Step Instructions to Run the Project

### Step 1: Navigate to the Project Directory

Open PowerShell or Command Prompt and go to the tournament-hobe folder:

```bash
cd tournament-hobe
```

**Expected result:** You should see the prompt showing you're in the tournament-hobe folder.

---

### Step 2: Install Dependencies

Install all required packages using npm:

```bash
npm install
```

**What happens:**
- This downloads and installs all dependencies listed in package.json
- Takes 2-3 minutes depending on internet speed
- Creates a `node_modules` folder with all packages

**Expected result:** You'll see a message like "added 150 packages" when complete.

---

### Step 3: Start the Development Server

Start the Vite development server:

```bash
npm run dev
```

**What happens:**
- Vite compiles your React code
- Starts a local development server
- Hot reload is enabled (changes auto-refresh)

**Expected output:**
```
  VITE v8.0.8  ready in 377 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Note:** If port 5173 is in use, Vite will try 5174, 5175, etc.

---

### Step 4: Open Your Browser

Open your web browser and go to:
```
http://localhost:5173
```

Or click the link shown in the terminal output.

**You should see:** The Tournament Hobe login page

---

## Testing the Application

### First Test - Registration

1. **Click "Don't have an account? Register here"**
2. **Fill in the registration form:**
   - Email: `test@tournament.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. **Click Register**
4. **You should see:** "Registration successful" message

### Second Test - Login

1. **Use the credentials you just created:**
   - Email: `test@tournament.com`
   - Password: `password123`
2. **Click Login**
3. **You should see:** The Dashboard with sidebar menu

### Third Test - Dashboard Features

From the dashboard, test these features:

#### Create a Tournament
1. Click "Create Tournament" button
2. Fill in:
   - Tournament Name: `Cricket Championship`
   - Sport: `Cricket`
   - Location: `Dhaka`
   - Start Date: Select a date
   - End Date: Select a future date
   - Format: `League`
   - Budget: `50000`
3. Click "Create Tournament"

#### View Tournaments
1. Click "View Tournaments" on the sidebar
2. You should see the tournament you created

#### Manage Teams
1. Click on a tournament
2. Click "Teams"
3. Click "Add Team"
4. Fill in:
   - Team Name: `Team A`
   - Category: `A Division`
5. Click "Add Team"

#### Add Players
1. Go to "Players" section
2. Click "Register Player"
3. Fill in:
   - Player Name: `John Doe`
   - Jersey Number: `7`
   - Position: `Batsman`
   - Select Team: Choose the team you created
4. Click "Register Player"

#### Schedule Matches
1. Go to "Matches" section
2. Click "Schedule Match"
3. Fill in:
   - Team 1: Select a team
   - Team 2: Select another team
   - Match Date: Select date
   - Match Time: Set time
   - Venue: `Stadium`
4. Click "Schedule Match"

#### View Standings
1. Go to "Standings" section
2. You should see the points table

#### Track Budget
1. Go to "Budget" section
2. Add expenses:
   - Category: `Venue Rent`
   - Amount: `5000`
   - Description: `Stadium booking`
3. Click "Add Expense"
4. See the remaining budget calculated

---

## Common Issues and Solutions

### Issue 1: "react-router-dom not found" Error

**Solution:**
```bash
npm install react-router-dom@6.20.0
```

### Issue 2: Port 5173 Already in Use

**Solution:** Vite will automatically try the next available port (5174, 5175, etc.)

**Or manually specify a different port:**
```bash
npm run dev -- --port 3000
```

### Issue 3: "Cannot find module" Error

**Solution:** Delete node_modules and reinstall:
```bash
rm -r node_modules
npm install
```

### Issue 4: Page Not Responding

**Solution:**
- Press `Ctrl+C` in the terminal to stop the server
- Run `npm run dev` again
- Refresh your browser (Ctrl+R or Cmd+R)

### Issue 5: Changes Not Reflecting

**Solution:**
- Make sure the dev server is still running
- Clear browser cache (Ctrl+Shift+Delete)
- Press F12 to open DevTools and check for errors

---

## Keyboard Shortcuts While Running

### In Terminal:
- **h + Enter:** Show Vite help
- **r + Enter:** Restart server
- **Ctrl+C:** Stop server

### In Browser:
- **F12:** Open Developer Tools
- **Ctrl+R:** Refresh page
- **Ctrl+Shift+Delete:** Clear cache

---

## Project Structure (Quick Reference)

```
tournament-hobe/
├── src/
│   ├── components/        ← React components
│   ├── services/          ← Data management
│   ├── context/           ← Global state
│   ├── App.jsx            ← Main app file
│   ├── index.css          ← Global styles
│   └── main.jsx           ← Entry point
├── package.json           ← Dependencies
└── vite.config.js         ← Vite configuration
```

---

## Available Routes

| Route | Purpose |
|-------|---------|
| `/register` | Create new organizer account |
| `/login` | Sign in to your account |
| `/dashboard` | Main dashboard |
| `/tournaments` | View all tournaments |
| `/tournaments/create` | Create new tournament |
| `/tournaments/:id/teams` | Manage teams |
| `/tournaments/:id/players` | Manage players |
| `/tournaments/:id/matches` | Schedule matches |
| `/tournaments/:id/standings` | View standings table |
| `/tournaments/:id/budget` | Track budget |
| `/tournaments/:id/awards` | View awards |

---

## Data Storage

Currently, all data is stored in **browser localStorage**. This means:
- ✅ Data persists across page refreshes (in same browser)
- ✅ Each browser has separate data
- ⚠️ Data is lost if you clear browser cache
- ⚠️ Not suitable for production

**To reset all data:**
Open browser console (F12) and run:
```javascript
localStorage.clear()
```

Then refresh the page.

---

## Building for Production

When ready to deploy, create a production build:

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

To preview the production build:
```bash
npm run preview
```

---

## Development Tips

### 1. Use Browser DevTools
- Press F12 to open DevTools
- Check Console tab for errors
- Check Application tab to see localStorage data

### 2. Hot Module Replacement (HMR)
- Save a file and the browser automatically refreshes
- Your app state is preserved (usually)

### 3. Debugging with Console
Add this to any component:
```javascript
console.log("Debug message:", variable)
```

Check DevTools Console to see the output.

### 4. React DevTools Extension
Install React DevTools browser extension to inspect components.

---

## What's Next?

After running the project successfully:

1. **Explore the code** in `src/components/`
2. **Try modifying colors** in `src/index.css`
3. **Add new features** by creating components
4. **Connect backend API** when ready (update `src/services/dataService.js`)

---

## Quick Troubleshooting Checklist

- [ ] Node.js is installed (`node --version`)
- [ ] npm is installed (`npm --version`)
- [ ] In correct folder (`tournament-hobe`)
- [ ] Ran `npm install`
- [ ] Running `npm run dev`
- [ ] Browser is open at correct URL (http://localhost:5173)
- [ ] DevTools checked for errors (F12)

---

## Getting Help

### Check Documentation
- [README.md](README.md) - Project overview
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup
- [DELIVERABLES.md](DELIVERABLES.md) - What's included

### Resources
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)

---

## Summary

```bash
# 1. Navigate to project
cd tournament-hobe

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Go to http://localhost:5173
```

**That's it! Your Tournament Hobe app is running! 🚀**

---

**Last Updated:** April 16, 2026
