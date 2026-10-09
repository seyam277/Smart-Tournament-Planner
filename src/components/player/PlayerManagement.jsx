import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import * as dataService from '../../services/dataService'

const PlayerManagement = () => {
  const { id } = useParams()
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    jerseyNumber: '',
    position: '',
    teamId: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const teamsData = await dataService.getTeamsByTournament(id)
      setTeams(teamsData)
      
      const allPlayers = []
      for (const team of teamsData) {
        const teamPlayers = await dataService.getPlayersByTeam(team.id)
        allPlayers.push(...teamPlayers)
      }
      setPlayers(allPlayers)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlayer = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.teamId) {
      alert('Please fill required fields')
      return
    }

    const newPlayer = await dataService.registerPlayer({
      ...formData,
      jerseyNumber: parseInt(formData.jerseyNumber) || 0
    })
    setPlayers([...players, newPlayer])
    setFormData({ name: '', jerseyNumber: '', position: '', teamId: '' })
    setShowForm(false)
  }

  const deletePlayer = async (playerId) => {
    if (window.confirm('Are you sure?')) {
      await dataService.deletePlayer(playerId)
      setPlayers(players.filter(p => p.id !== playerId))
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--text-h)' }}>Player Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showForm ? '✕ Cancel' : '+ Add Player'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddPlayer}
          style={{
            background: 'var(--bg)',
            border: `1px solid var(--border)`,
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <input
              type="text"
              placeholder="Player Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                padding: '10px',
                border: `1px solid var(--border)`,
                borderRadius: '4px',
                background: 'var(--bg)',
                color: 'var(--text)'
              }}
            />
            <input
              type="number"
              placeholder="Jersey Number"
              value={formData.jerseyNumber}
              onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
              style={{
                padding: '10px',
                border: `1px solid var(--border)`,
                borderRadius: '4px',
                background: 'var(--bg)',
                color: 'var(--text)'
              }}
            />
            <input
              type="text"
              placeholder="Position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              style={{
                padding: '10px',
                border: `1px solid var(--border)`,
                borderRadius: '4px',
                background: 'var(--bg)',
                color: 'var(--text)'
              }}
            />
            <select
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
              style={{
                padding: '10px',
                border: `1px solid var(--border)`,
                borderRadius: '4px',
                background: 'var(--bg)',
                color: 'var(--text)'
              }}
            >
              <option value="">Select Team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add Player
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading players...</p>
      ) : players.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text)' }}>No players registered yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'var(--bg)',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow)'
          }}>
            <thead>
              <tr style={{ background: 'var(--accent)', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Jersey #</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Position</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, idx) => (
                <tr key={player.id} style={{ borderBottom: `1px solid var(--border)` }}>
                  <td style={{ padding: '12px' }}>{player.name}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{player.jerseyNumber}</td>
                  <td style={{ padding: '12px' }}>{player.position}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => deletePlayer(player.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default PlayerManagement
