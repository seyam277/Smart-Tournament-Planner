import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/backendAPI'
import { useAuth } from '../../context/AuthContext'

const AuthorityLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await authAPI.loginAuthority(email, password)
      login(result.token, result.authority)
      navigate('/authority/dashboard')
    } catch (requestError) {
      setError(requestError.message || 'Authority login failed.')
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle = {
    width: '100%',
    padding: '13px',
    marginTop: '8px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    color: 'white',
    boxSizing: 'border-box'
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f172a', padding: '20px', color: 'white' }}>
      <section style={{ width: '100%', maxWidth: '460px', background: '#1e293b', padding: '32px', borderRadius: '20px' }}>
        <h1 style={{ color: '#00ff85', textAlign: 'center' }}>Turf Authority Login</h1>
        {error && <div role="alert" style={{ color: '#f87171', marginBottom: '16px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '18px', color: '#cbd5e1' }}>
            Email address
            <input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} style={fieldStyle} />
          </label>
          <label style={{ display: 'block', marginBottom: '22px', color: '#cbd5e1' }}>
            Password
            <input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} style={fieldStyle} />
          </label>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', border: 0, borderRadius: '10px', background: '#00ff85', color: '#0f172a', fontWeight: 800, cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Signing in…' : 'Sign in as Turf Authority'}
          </button>
        </form>
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>
          New Authority? <Link to="/authority/register" style={{ color: '#00ff85' }}>Register</Link>
        </p>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 0 }}>
          Organizer? <Link to="/login" style={{ color: '#00ff85' }}>Organizer Login</Link>
        </p>
      </section>
    </main>
  )
}

export default AuthorityLogin
