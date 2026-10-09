import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import { AuthProvider } from './context/AuthContext'

import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/auth/ProtectedRoute'

import OrganizerLogin from './components/auth/OrganizerLogin'
import OrganizerRegister from './components/auth/OrganizerRegister'
import ForgotPassword from './components/auth/ForgotPassword'

import Dashboard from './components/dashboard/Dashboard'

import TournamentList from './components/tournament/TournamentList'
import TournamentCreate from './components/tournament/TournamentCreate'
import TournamentDetails from './components/tournament/TournamentDetails'

import TeamManagement from './components/team/TeamManagement'
import PlayerManagement from './components/player/PlayerManagement'
import MatchManagement from './components/match/MatchManagement'
import BudgetManagement from './components/budget/BudgetManagement'
import TurfDetails from './components/turf/TurfDetails'
import TurfList from './components/turf/TurfList'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/login" element={<OrganizerLogin />} />
          <Route path="/register" element={<OrganizerRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/tournaments" element={<TournamentList />} />
            <Route path="/tournaments/create" element={<TournamentCreate />} />
            <Route path="/tournaments/edit/:id" element={<TournamentCreate />} />
            <Route path="/tournaments/:id" element={<TournamentDetails />} />

            <Route path="/tournaments/:id/teams" element={<TeamManagement />} />
            <Route path="/tournaments/:id/players" element={<PlayerManagement />} />
            <Route path="/tournaments/:id/matches" element={<MatchManagement />} />
            <Route path="/tournaments/:id/budget" element={<BudgetManagement />} />
            <Route path="/turfs" element={<TurfList />} />
            <Route path="/turfs/:id" element={<TurfDetails />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
