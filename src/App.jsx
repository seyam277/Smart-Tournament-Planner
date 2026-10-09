import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ResetPassword from './ResetPassword'
import OrganizerLogin from './components/auth/OrganizerLogin'
import OrganizerRegister from './components/auth/OrganizerRegister'
import ForgotPassword from './components/auth/ForgotPassword'
import Dashboard from './components/dashboard/Dashboard'
import TournamentCreate from './components/tournament/TournamentCreate'
import TournamentList from './components/tournament/TournamentList'
import TournamentDetails from './components/tournament/TournamentDetails'
import TeamManagement from './components/team/TeamManagement'
import PlayerManagement from './components/player/PlayerManagement'
import MatchManagement from './components/match/MatchManagement'
import StandingsTable from './components/statistics/StandingsTable'
import BudgetManagement from './components/budget/BudgetManagement'
import AwardManagement from './components/awards/AwardManagement'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import { AuthProvider } from './context/AuthContext'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<OrganizerLogin />} />
          <Route path="/register" element={<OrganizerRegister />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/organizer-login" element={<OrganizerLogin />} />
          <Route path="/organizer-register" element={<OrganizerRegister />} />

          {/* Public Tournament Routes */}
          <Route path="/tournaments" element={<TournamentList />} />
          <Route path="/tournaments/:id" element={<TournamentDetails />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Tournament Management Routes */}
            <Route path="/tournaments/create" element={<TournamentCreate />} />
            <Route path="/tournaments/edit/:id" element={<TournamentCreate />} />
            
            {/* Team & Player Routes */}
            <Route path="/tournaments/:id/teams" element={<TeamManagement />} />
            <Route path="/tournaments/:id/players" element={<PlayerManagement />} />
            
            {/* Match Routes */}
            <Route path="/tournaments/:id/matches" element={<MatchManagement />} />
            
            {/* Statistics Routes */}
            <Route path="/tournaments/:id/standings" element={<StandingsTable />} />
            
            {/* Awards Routes */}
            <Route path="/tournaments/:id/awards" element={<AwardManagement />} />
            
            {/* Budget Routes */}
            <Route path="/tournaments/:id/budget" element={<BudgetManagement />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
