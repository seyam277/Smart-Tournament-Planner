import React, { createContext, useState, useContext } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [initialSession] = useState(() => {
    const token = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('organizerData')
    if (!token || !savedUser) return { token: null, user: null }

    try {
      const user = JSON.parse(savedUser)
      return { token, user: { ...user, role: user.role || 'organizer' } }
    } catch {
      localStorage.removeItem('authToken')
      localStorage.removeItem('organizerData')
      localStorage.removeItem('user')
      return { token: null, user: null }
    }
  })
  const [organizer, setOrganizer] = useState(initialSession.user)
  const [authToken, setAuthToken] = useState(initialSession.token)
  const [isLoading, setIsLoading] = useState(false)

  const login = (token, userData) => {
    const normalizedUser = { ...userData, role: userData.role || 'organizer' }
    localStorage.setItem('authToken', token)
    localStorage.setItem('organizerData', JSON.stringify(normalizedUser))
    setAuthToken(token)
    setOrganizer(normalizedUser)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('organizerData')
    localStorage.removeItem('user')
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
