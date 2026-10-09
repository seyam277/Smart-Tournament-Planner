import React, { createContext, useState, useEffect, useContext } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [organizer, setOrganizer] = useState(null)
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'))
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const organizerData = localStorage.getItem('organizerData')
    
    if (token && organizerData) {
      setAuthToken(token)
      setOrganizer(JSON.parse(organizerData))
    }
  }, [])

  const login = (token, organizerData) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('organizerData', JSON.stringify(organizerData))
    setAuthToken(token)
    setOrganizer(organizerData)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('organizerData')
    setAuthToken(null)
    setOrganizer(null)
  }

  return (
    <AuthContext.Provider value={{ organizer, authToken, login, logout, isLoading, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return {
    user: context.organizer,
    token: context.authToken,
    login: context.login,
    logout: context.logout,
    isLoading: context.isLoading,
    setIsLoading: context.setIsLoading
  }
}
