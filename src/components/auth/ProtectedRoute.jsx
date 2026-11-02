import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token } = useAuth()
  if (!token || !user) {
    const loginPath = allowedRoles?.includes('authority') && !allowedRoles.includes('organizer')
      ? '/authority/login'
      : '/login'
    return <Navigate to={loginPath} replace />
  }

  const role = user.role || 'organizer'
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'authority' ? '/authority/dashboard' : '/dashboard'} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
