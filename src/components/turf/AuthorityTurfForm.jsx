import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { turfAPI } from '../../services/backendAPI'

const emptyTurf = {
  name: '',
  description: '',
  sportType: 'Football',
  address: '',
  area: '',
  city: '',
  district: '',
  contactNumber: '',
  facilities: '',
  photos: '',
  latitude: '',
  longitude: ''
}

const AuthorityTurfForm = () => {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyTurf)
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const mapUrl = useMemo(() => {
    const latitude = Number(form.latitude)
    const longitude = Number(form.longitude)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return ''
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`
  }, [form.latitude, form.longitude])

  useEffect(() => {
    if (!id) return
    let active = true
    turfAPI.getMyTurf(id, token)
      .then(turf => {
        if (!active) return
        setForm({
          name: turf.name || '',
          description: turf.description || '',
          sportType: turf.sportType || 'Football',
          address: turf.address || turf.location || '',
          area: turf.area || '',
          city: turf.city || '',
          district: turf.district || '',
          contactNumber: turf.contactNumber || '',
          facilities: (turf.facilities || []).join(', '),
          photos: (turf.photos || []).join('\n'),
          latitude: turf.coordinates?.latitude ?? '',
          longitude: turf.coordinates?.longitude ?? ''
        })
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
    return () => { active = false }
  }, [id, token])

  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }))

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      ...form,
      facilities: form.facilities.split(',').map(value => value.trim()).filter(Boolean),
      photos: form.photos.split(/\r?\n/).map(value => value.trim()).filter(Boolean),
      coordinates: {
        latitude: Number(form.latitude),
        longitude: Number(form.longitude)
      }
    }

    try {
      const turf = id
        ? await turfAPI.update(id, payload, token)
        : await turfAPI.create(payload, token)
      navigate(`/authority/turfs/${turf.id || turf._id}`, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <main className="container"><p>Loading turf...</p></main>

  const inputStyle = {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '6px',
    padding: '10px',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    background: 'var(--bg)',
    color: 'var(--text)'
  }
  const labelStyle = { display: 'block', marginBottom: '14px', color: 'var(--text-h)' }

  return (
    <main className="container" style={{ maxWidth: '900px', padding: '28px 20px' }}>
      <Link to="/authority/dashboard">← Authority dashboard</Link>
      <h1>{id ? 'Edit Turf' : 'Register a Turf'}</h1>
      <p>New registrations remain private while their status is pending.</p>
      {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '8px 18px' }}>
        <label style={labelStyle}>Facility name
          <input style={inputStyle} name="name" value={form.name} onChange={update} required maxLength={120} />
        </label>
        <label style={labelStyle}>Sport type
          <select style={inputStyle} name="sportType" value={form.sportType} onChange={update} required>
            {['Football', 'Futsal', 'Cricket', 'Badminton', 'Basketball', 'Other'].map(sport => <option key={sport}>{sport}</option>)}
          </select>
        </label>
        <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>Description
          <textarea style={{ ...inputStyle, minHeight: '90px' }} name="description" value={form.description} onChange={update} maxLength={2000} />
        </label>
        <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>Full address
          <input style={inputStyle} name="address" value={form.address} onChange={update} required maxLength={300} />
        </label>
        <label style={labelStyle}>Area
          <input style={inputStyle} name="area" value={form.area} onChange={update} required maxLength={120} />
        </label>
        <label style={labelStyle}>City
          <input style={inputStyle} name="city" value={form.city} onChange={update} required maxLength={120} />
        </label>
        <label style={labelStyle}>District
          <input style={inputStyle} name="district" value={form.district} onChange={update} required maxLength={120} />
        </label>
        <label style={labelStyle}>Contact number
          <input style={inputStyle} name="contactNumber" value={form.contactNumber} onChange={update} required maxLength={40} />
        </label>
        <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>Facilities and amenities (comma-separated)
          <input style={inputStyle} name="facilities" value={form.facilities} onChange={update} placeholder="Floodlights, parking, changing room" />
        </label>
        <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>Photo URLs (one HTTP/HTTPS URL per line)
          <textarea style={{ ...inputStyle, minHeight: '75px' }} name="photos" value={form.photos} onChange={update} />
        </label>
        <label style={labelStyle}>Latitude
          <input style={inputStyle} type="number" name="latitude" value={form.latitude} onChange={update} required min="-90" max="90" step="any" />
        </label>
        <label style={labelStyle}>Longitude
          <input style={inputStyle} type="number" name="longitude" value={form.longitude} onChange={update} required min="-180" max="180" step="any" />
        </label>
        {mapUrl && <p style={{ gridColumn: '1 / -1' }}><a href={mapUrl} target="_blank" rel="noreferrer">Preview coordinates on OpenStreetMap</a></p>}
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : id ? 'Save changes' : 'Register turf'}</button>
          <Link to={id ? `/authority/turfs/${id}` : '/authority/dashboard'}>Cancel</Link>
        </div>
      </form>
    </main>
  )
}

export default AuthorityTurfForm
