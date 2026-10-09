import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../services/backendAPI'

const OrganizerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactInfo: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password is too weak. Must be at least 6 characters long.')
      return
    }

    setIsLoading(true)
    try {
      const data = await authAPI.register(
        formData.name,
        formData.email,
        formData.password,
        formData.contactInfo
      )

      if (data.error) {
        throw new Error(data.error)
      }

      alert('Account initialized successfully! Please login.')
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '14px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    color: 'white',
    outline: 'none',
    fontSize: '15px',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block',
    color: '#94a3b8',
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px'
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
        <h1 style={{ textAlign: 'center', color: '#00ff85', marginBottom: '30px', fontWeight: '900', fontSize: '32px' }}>
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

          <h2 style={{ textAlign: 'center', color: 'white', marginBottom: '30px', fontSize: '24px' }}>Initialize Account</h2>

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
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@company.com"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Contact Number (Optional)</label>
              <input
                type="tel"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                placeholder="+880XXXXXXXXX"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a strong password"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repeat your password"
                style={inputStyle}
              />
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
                boxShadow: isLoading ? 'none' : '0 0 20px rgba(0, 255, 133, 0.3)',
                transition: 'all 0.3s'
              }}
            >
              {isLoading ? 'INITIALIZING...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '25px', color: '#94a3b8', fontSize: '14px' }}>
            Already an organizer?{' '}
            <Link
              to="/login"
              style={{
                color: '#00ff85',
                textDecoration: 'none',
                fontWeight: '700'
              }}
            >
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default OrganizerRegister
