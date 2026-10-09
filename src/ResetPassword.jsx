import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authAPI } from './services/backendAPI'

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!token) {
      setError('Invalid or missing reset token')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.resetPassword(token, newPassword)
      
      if (response.error) {
        setError(response.error)
      } else {
        setMessage('Password reset successfully! Redirecting to login...')
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '600'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s',
    boxSizing: 'border-box'
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
          <h2 style={{ textAlign: 'center', color: 'white', marginBottom: '10px' }}>Create New Password</h2>
          <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '30px', fontSize: '14px' }}>
            Enter a strong password to secure your account.
          </p>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '15px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{
              background: 'rgba(0, 255, 133, 0.1)',
              color: '#00ff85',
              padding: '15px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid rgba(0, 255, 133, 0.2)',
              fontSize: '14px'
            }}>
              {message}
            </div>
          )}

          {!token ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#ef4444', marginBottom: '20px' }}>
                Invalid or expired reset link.
              </p>
              <button onClick={() => navigate('/forgot-password')} style={{ background: 'transparent', border: '1px solid #00ff85', color: '#00ff85', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}>
                Request New Link
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat your new password"
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: '#00ff85',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 20px rgba(0, 255, 133, 0.3)',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? 'SAVING...' : 'RESET PASSWORD'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
