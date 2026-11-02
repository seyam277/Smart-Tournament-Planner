import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { turfAPI } from '../../services/backendAPI'
import FieldManagement from './FieldManagement'

const AuthorityTurfDetails = () => {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [turf, setTurf] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadTurf = useCallback(async () => {
    try {
      const data = await turfAPI.getMyTurf(id, token)
      setTurf(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => { loadTurf() }, [loadTurf])

  const removeTurf = async () => {
    if (!window.confirm('Remove this turf from active management?')) return
    try {
      await turfAPI.delete(id, token)
      navigate('/authority/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <main className="container"><p>Loading turf details...</p></main>
  if (error && !turf) return <main className="container"><p role="alert">{error}</p><Link to="/authority/dashboard">Return to dashboard</Link></main>
  if (!turf) return null

  const mapUrl = turf.coordinates
    ? `https://www.openstreetmap.org/?mlat=${turf.coordinates.latitude}&mlon=${turf.coordinates.longitude}#map=16/${turf.coordinates.latitude}/${turf.coordinates.longitude}`
    : ''

  return (
    <main className="container" style={{ maxWidth: '1000px', padding: '28px 20px' }}>
      <Link to="/authority/dashboard">← Authority dashboard</Link>
      <header style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
        <div>
          <h1>{turf.name}</h1>
          <p>Registration status: <strong>{turf.registrationStatus || 'pending'}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link className="btn-primary" to={`/authority/turfs/${id}/edit`}>Edit turf</Link>
          <button type="button" onClick={removeTurf}>Delete turf</button>
        </div>
      </header>
      {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}

      <section style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '18px', marginTop: '16px' }}>
        <h2>Facility information</h2>
        {turf.description && <p>{turf.description}</p>}
        <p><strong>Sport:</strong> {turf.sportType}</p>
        <p><strong>Address:</strong> {turf.address || turf.location}, {turf.area}, {turf.city}, {turf.district}</p>
        <p><strong>Contact:</strong> {turf.contactNumber}</p>
        <p><strong>Facilities:</strong> {turf.facilities?.length ? turf.facilities.join(', ') : 'None listed'}</p>
        {mapUrl && <p><a href={mapUrl} target="_blank" rel="noreferrer">View map location</a></p>}
        {!!turf.photos?.length && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {turf.photos.map((photo, index) => (
              <img key={`${photo}-${index}`} src={photo} alt={`${turf.name} facility ${index + 1}`} loading="lazy" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
            ))}
          </div>
        )}
      </section>

      <FieldManagement turf={turf} token={token} onUpdated={loadTurf} />
    </main>
  )
}

export default AuthorityTurfDetails
