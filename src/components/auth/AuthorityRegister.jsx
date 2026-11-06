import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/backendAPI'
import { useAuth } from '../../context/AuthContext'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  businessName: '',
  businessContactNumber: '',
  businessAddress: '',
  preferredContact: ''
}

const AuthorityRegister = () => {
  const [formData, setFormData] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = event => {
    setFormData(current => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')
    if (Object.values(formData).some(value => !value.trim())) {
      setError('Please complete every required field.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const profile = { ...formData }
      delete profile.confirmPassword
      const result = await authAPI.registerAuthority(profile)
      login(result.token, result.authority)
      navigate('/authority/dashboard')
    } catch (requestError) {
      setError(requestError.message || 'Authority registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    ['name', 'Full name', 'text'],
    ['email', 'Email address', 'email'],
    ['phone', 'Phone number', 'tel'],
    ['password', 'Password', 'password'],
    ['confirmPassword', 'Confirm password', 'password'],
    ['businessName', 'Authority / business name', 'text'],
    ['businessContactNumber', 'Business contact number', 'tel'],
    ['businessAddress', 'Business address', 'text'],
    ['preferredContact', 'Preferred contact information', 'text']
  ]

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    color: 'white',
    boxSizing: 'border-box'
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0f172a', padding: '32px 16px', color: 'white' }}>
      <section style={{ width: '100%', maxWidth: '680px', margin: '0 auto', background: '#1e293b', padding: '32px', borderRadius: '20px' }}>
        <h1 style={{ color: '#00ff85', textAlign: 'center' }}>Turf Authority Registration</h1>
        <p style={{ color: '#94a3b8', textAlign: 'center' }}>Create an Authority account to manage your facilities.</p>
        {error && <div role="alert" style={{ color: '#f87171', margin: '16px 0' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
            {fields.map(([name, label, type]) => (
              <label key={name} style={{ display: 'grid', gap: '7px', color: '#cbd5e1', fontSize: '14px' }}>
                {label}
                <input
                  name={name}
                  type={type}
                  value={formData[name]}
                  onChange={handleChange}
                  autoComplete={name === 'confirmPassword' ? 'new-password' : name}
                  required
                  style={inputStyle}
                />
              </label>
            ))}
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', marginTop: '22px', border: 0, borderRadius: '10px', background: '#00ff85', color: '#0f172a', fontWeight: 800, cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Creating account…' : 'Create Authority Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 0 }}>
          Already registered? <Link to="/authority/login" style={{ color: '#00ff85' }}>Venue Login</Link>
        </p>
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>
          Organizer? <Link to="/register" style={{ color: '#00ff85' }}>Organizer Registration</Link>
        </p>
      </section>
    </main>
  )
}

export default AuthorityRegister
