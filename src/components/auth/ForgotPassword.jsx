import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../../services/backendAPI'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sentEmailData, setSentEmailData] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setSentEmailData(null)
    setLoading(true)

    try {
      const data = await authAPI.forgotPassword(email)
      if (data.error) {
        setError(data.error)
      } else {
        setMessage('Verification successful! We have generated a reset link.')
        setSentEmailData({
          email: email,
          token: data.token
        })
      }
    } catch (err) {
      setError(err.message || 'Failed to process request.')
    } finally {
      setLoading(false)
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
        
        {!sentEmailData ? (
          <>
            <h2 style={{ textAlign: 'center', color: 'white', marginBottom: '20px' }}>Reset Password</h2>
            <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '30px' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '12px', border: '1px solid #ef4444', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
            {message && <div style={{ background: 'rgba(0, 255, 133, 0.1)', color: '#00ff85', padding: '12px', borderRadius: '12px', border: '1px solid #00ff85', marginBottom: '20px', fontSize: '14px' }}>{message}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Email Address</label>
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
                  boxShadow: '0 0 20px rgba(0, 255, 133, 0.3)'
                }}
              >
                {loading ? 'VERIFYING...' : 'SEND RESET LINK'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              background: 'rgba(0, 255, 133, 0.1)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <span style={{ fontSize: '30px' }}>📧</span>
            </div>
            <h2 style={{ color: 'white', marginBottom: '10px' }}>Check Your "Inbox"</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '14px' }}>
              We've simulated sending an email to <br/>
              <strong style={{ color: '#00ff85' }}>{sentEmailData.email}</strong>
            </p>

            <div style={{ 
              background: 'rgba(15, 23, 42, 0.5)', 
              padding: '20px', 
              borderRadius: '16px', 
              border: '1px dashed rgba(255, 255, 255, 0.1)',
              textAlign: 'left',
              marginBottom: '30px'
            }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}>From: Tournament Hobe Team</p>
              <p style={{ color: 'white', fontWeight: 'bold', marginBottom: '15px' }}>Subject: Reset Your Password</p>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
                Hi there! Click the button below to reset your password. This link is for testing purposes.
              </p>
              <Link 
                to={`/reset-password?token=${sentEmailData.token}`}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#00ff85',
                  color: '#0f172a',
                  padding: '12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                RESET PASSWORD NOW
              </Link>
            </div>
            
            <button 
              onClick={() => setSentEmailData(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}
            >
              ← Back to form
            </button>
          </div>
        )}


        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <Link to="/login" style={{ color: '#00ff85', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}>
            ← Back to Login
          </Link>
        </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
