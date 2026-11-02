import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { turfAPI } from '../../services/backendAPI'

const AuthorityDashboard = () => {
  const { user, token } = useAuth()
  const authorityProfile = user?.authorityProfile || {}
  const [turfs, setTurfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    turfAPI.getMyTurfs(token)
      .then(data => { if (active) setTurfs(data) })
      .catch(err => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [token])

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px', color: 'var(--text)' }}>
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ color: 'var(--text-h)' }}>Welcome, {user?.name || 'Turf Authority'}</h1>
        <p style={{ color: 'var(--text)' }}>Authority dashboard</p>
      </header>

      <section style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '22px', marginBottom: '22px' }}>
        <h2 style={{ color: 'var(--text-h)', marginTop: 0 }}>Authority Profile</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', margin: 0 }}>
          <div><dt>Name</dt><dd>{user?.name || '—'}</dd></div>
          <div><dt>Email</dt><dd>{user?.email || '—'}</dd></div>
          <div><dt>Phone</dt><dd>{user?.phone || '—'}</dd></div>
          <div><dt>Business</dt><dd>{authorityProfile.businessName || '—'}</dd></div>
          <div><dt>Business contact</dt><dd>{authorityProfile.businessContactNumber || '—'}</dd></div>
          <div><dt>Business address</dt><dd>{authorityProfile.businessAddress || '—'}</dd></div>
          <div><dt>Preferred contact</dt><dd>{authorityProfile.preferredContact || '—'}</dd></div>
        </dl>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' }}>
        <section style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ color: 'var(--text-h)', margin: 0 }}>My Turfs</h2>
            <Link to="/authority/turfs/new" className="btn-primary" style={{ padding: '9px 13px', borderRadius: '8px' }}>
              Add Turf
            </Link>
          </div>
          {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
          {loading
            ? <p style={{ color: 'var(--text)' }}>Loading your turfs...</p>
            : turfs.length === 0
              ? <p style={{ color: 'var(--text)' }}>You have no turfs registered yet.</p>
              : <ul style={{ listStyle: 'none', padding: 0 }}>
                  {turfs.map(turf => (
                    <li key={turf.id || turf._id} style={{ borderTop: '1px solid var(--border)', padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <strong>{turf.name}</strong>
                        <div style={{ color: 'var(--text)', fontSize: '14px' }}>{turf.location || turf.address}</div>
                        <span style={{ fontSize: '13px' }}>Status: {turf.registrationStatus || 'pending'}</span>
                      </div>
                      <Link to={`/authority/turfs/${turf.id || turf._id}`}>Manage</Link>
                    </li>
                  ))}
                </ul>}
        </section>

        <section style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '22px' }}>
          <h2 style={{ color: 'var(--text-h)', marginTop: 0 }}>Booking Requests</h2>
          <p style={{ color: 'var(--text)' }}>There are no booking requests yet.</p>
        </section>
      </div>
    </main>
  )
}

export default AuthorityDashboard
