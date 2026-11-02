import React, { useState } from 'react'
import { turfAPI } from '../../services/backendAPI'

const blankField = { name: '', sportType: 'Football', surface: '', dimensions: '', description: '' }

const FieldManagement = ({ turf, token, onUpdated }) => {
  const [form, setForm] = useState(blankField)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const edit = field => {
    setEditingId(field.id || field._id)
    setForm({
      name: field.name || '',
      sportType: field.sportType || 'Football',
      surface: field.surface || '',
      dimensions: field.dimensions || '',
      description: field.description || ''
    })
    setError('')
  }

  const reset = () => {
    setEditingId('')
    setForm(blankField)
  }

  const submit = async event => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        await turfAPI.updateField(turf.id || turf._id, editingId, form, token)
      } else {
        await turfAPI.addField(turf.id || turf._id, form, token)
      }
      reset()
      await onUpdated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async fieldId => {
    if (!window.confirm('Delete this field?')) return
    setError('')
    try {
      await turfAPI.deleteField(turf.id || turf._id, fieldId, token)
      await onUpdated()
    } catch (err) {
      setError(err.message)
    }
  }

  const inputStyle = {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '5px',
    padding: '9px',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    background: 'var(--bg)',
    color: 'var(--text)'
  }

  return (
    <section style={{ marginTop: '24px' }}>
      <h2>Fields</h2>
      {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
      {turf.fields?.length
        ? <ul style={{ padding: 0, listStyle: 'none' }}>
            {turf.fields.map(field => {
              const id = field.id || field._id
              return (
                <li key={id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginBottom: '10px' }}>
                  <strong>{field.name}</strong> · {field.sportType}
                  {field.surface && <span> · {field.surface}</span>}
                  {field.dimensions && <span> · {field.dimensions}</span>}
                  {field.description && <p>{field.description}</p>}
                  <button type="button" onClick={() => edit(field)}>Edit</button>{' '}
                  <button type="button" onClick={() => remove(id)}>Delete</button>
                </li>
              )
            })}
          </ul>
        : <p>No fields added yet. Create a field to give each playing area its own identity.</p>}

      <h3>{editingId ? 'Edit field' : 'Add field'}</h3>
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
        <label>Field name
          <input style={inputStyle} value={form.name} maxLength={100} required onChange={event => setForm({ ...form, name: event.target.value })} />
        </label>
        <label>Sport type
          <select style={inputStyle} value={form.sportType} required onChange={event => setForm({ ...form, sportType: event.target.value })}>
            {['Football', 'Futsal', 'Cricket', 'Badminton', 'Basketball', 'Other'].map(sport => <option key={sport}>{sport}</option>)}
          </select>
        </label>
        <label>Surface
          <input style={inputStyle} value={form.surface} maxLength={100} onChange={event => setForm({ ...form, surface: event.target.value })} />
        </label>
        <label>Dimensions
          <input style={inputStyle} value={form.dimensions} maxLength={100} onChange={event => setForm({ ...form, dimensions: event.target.value })} />
        </label>
        <label style={{ gridColumn: '1 / -1' }}>Description
          <textarea style={inputStyle} value={form.description} maxLength={1000} onChange={event => setForm({ ...form, description: event.target.value })} />
        </label>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save field' : 'Add field'}</button>
          {editingId && <button type="button" onClick={reset}>Cancel edit</button>}
        </div>
      </form>
    </section>
  )
}

export default FieldManagement
