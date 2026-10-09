import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = () => {
  const { user, token } = useAuth()
  const isAuthenticated = !!token || !!user
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
}

export default ProtectedRoute

