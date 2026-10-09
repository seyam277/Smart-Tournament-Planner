import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { authAPI } from '../../services/backendAPI'

const OrganizerLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const data = await authAPI.login(email, password)
      
      if (data.error) {
        throw new Error(data.error)
      }

      login(data.token, data.organizer)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#0f172a', 
      padding: '20px' 
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <h1 style={{ textAlign: 'center', color: '#00ff85', marginBottom: '30px', fontWeight: '900' }}>
          Tournament Hobe
        </h1>
      <div style={{ 
        background: 'rgba(30, 41, 59, 0.7)', 
        backdropFilter: 'blur(15px)',
        borderRadius: '24px',
        padding: '40px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
      }}>
        <h2 style={{ textAlign: 'center', color: 'white', marginBottom: '20px' }}>Organizer Login</h2>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #ef4444',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@company.com"
              style={{
                width: '100%',
                padding: '14px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '14px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '25px' }}>
            <Link to="/forgot-password" style={{ color: '#00ff85', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '15px',
              background: isLoading ? '#334155' : '#00ff85',
              color: '#0f172a',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: isLoading ? 'none' : '0 0 20px rgba(0, 255, 133, 0.3)'
            }}
          >
            {isLoading ? 'Scanning Arena...' : 'Access Suite'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', color: '#94a3b8', fontSize: '14px' }}>
          New organizer?{' '}
          <Link
            to="/register"
            style={{
              color: '#00ff85',
              textDecoration: 'none',
              fontWeight: '700'
            }}
          >
            Initialize Account
          </Link>
        </p>
        </div>
      </div>
    </div>
  )
}

export default OrganizerLogin
