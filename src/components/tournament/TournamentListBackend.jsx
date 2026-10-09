import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { tournamentAPI } from '../services/backendAPI'

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, mine

  const navigate = useNavigate()
  const { organizer, authToken } = useContext(AuthContext)

  useEffect(() => {
    fetchTournaments()
  }, [filter, authToken])

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      setError('')
      
      let data
      if (filter === 'mine') {
        data = await tournamentAPI.getMyTournaments(authToken)
      } else {
        data = await tournamentAPI.getAll(authToken)
      }
      
      setTournaments(data)
    } catch (err) {
      setError('Failed to load tournaments')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return
    
    try {
      const response = await tournamentAPI.delete(id, authToken)
      if (response.error) {
        setError(response.error)
      } else {
        setTournaments(tournaments.filter(t => t.id !== id))
      }
    } catch (err) {
      setError('Failed to delete tournament')
      console.error(err)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Tournaments</h1>
        <button
          onClick={() => navigate('/tournaments/create')}
          style={{
            padding: '10px 20px',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Create Tournament
        </button>
      </div>

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

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            marginRight: '10px',
            padding: '8px 15px',
            background: filter === 'all' ? 'var(--accent)' : 'transparent',
            color: filter === 'all' ? 'white' : 'var(--accent)',
            border: '1px solid var(--accent)',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          All Tournaments
        </button>
        <button
          onClick={() => setFilter('mine')}
          style={{
            padding: '8px 15px',
            background: filter === 'mine' ? 'var(--accent)' : 'transparent',
            color: filter === 'mine' ? 'white' : 'var(--accent)',
            border: '1px solid var(--accent)',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          My Tournaments
        </button>
      </div>

      {loading ? (
        <p>Loading tournaments...</p>
      ) : tournaments.length === 0 ? (
        <p>No tournaments found</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {tournaments.map(tournament => (
            <div
              key={tournament.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '15px',
                background: 'var(--bg-secondary)'
              }}
            >
              <h3>{tournament.name}</h3>
              <p>{tournament.description}</p>
              <p><strong>Status:</strong> {tournament.status}</p>
              <p><strong>Start Date:</strong> {new Date(tournament.startDate).toLocaleDateString()}</p>
              <p><strong>Location:</strong> {tournament.location}</p>
              {!tournament.canEdit && (
                <p style={{ color: '#999', fontSize: '12px' }}>
                  Created by: {tournament.creatorEmail}
                </p>
              )}
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                  onClick={() => navigate(`/tournaments/${tournament.id}`)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  View
                </button>
                
                {tournament.canEdit && (
                  <>
                    <button
                      onClick={() => navigate(`/tournaments/${tournament.id}`, { state: { edit: true } })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: '#0066cc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDelete(tournament.id)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: '#cc0000',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TournamentList
