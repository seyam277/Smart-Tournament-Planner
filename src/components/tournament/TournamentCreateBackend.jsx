import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { tournamentAPI } from '../services/backendAPI'

const TournamentCreate = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('General')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { authToken } = useContext(AuthContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name || !startDate) {
      setError('Tournament name and start date are required')
      return
    }

    setLoading(true)

    try {
      const response = await tournamentAPI.create(
        {
          name,
          description,
          startDate,
          endDate,
          location,
          type
        },
        authToken
      )

      if (response.error) {
        setError(response.error)
      } else {
        navigate(`/tournaments/${response.tournament.id}`)
      }
    } catch (err) {
      setError('Failed to create tournament')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Create Tournament</h1>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name">Tournament Name *:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid var(--border)`,
              borderRadius: '4px',
              background: 'var(--bg)',
              color: 'var(--text)',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows="4"
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid var(--border)`,
              borderRadius: '4px',
              background: 'var(--bg)',
              color: 'var(--text)',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label htmlFor="startDate">Start Date *:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid var(--border)`,
                borderRadius: '4px',
                background: 'var(--bg)',
                color: 'var(--text)',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid var(--border)`,
                borderRadius: '4px',
                background: 'var(--bg)',
                color: 'var(--text)',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={loading}
            placeholder="e.g., Stadium, Hall"
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid var(--border)`,
              borderRadius: '4px',
              background: 'var(--bg)',
              color: 'var(--text)',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="type">Tournament Type:</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid var(--border)`,
              borderRadius: '4px',
              background: 'var(--bg)',
              color: 'var(--text)',
              boxSizing: 'border-box'
            }}
          >
            <option value="General">General</option>
            <option value="League">League</option>
            <option value="Knockout">Knockout</option>
            <option value="GroupStage">Group Stage</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              background: loading ? '#ccc' : 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create Tournament'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/tournaments')}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              color: 'var(--accent)',
              border: '1px solid var(--accent)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default TournamentCreate
