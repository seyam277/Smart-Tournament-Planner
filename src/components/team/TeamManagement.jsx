import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as dataService from '../../services/dataService'

const TeamManagement = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', category: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeams()
  }, [id])

  const loadTeams = async () => {
    try {
      const data = await dataService.getTeamsByTournament(id)
      setTeams(data)
    } catch (err) {
      console.error('Failed to load teams:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTeam = async (e) => {
    e.preventDefault()
    if (!formData.name) {
      alert('Please enter team name')
      return
    }

    const newTeam = await dataService.registerTeam({
      ...formData,
      tournamentId: id
    })
    setTeams([...teams, newTeam])
    setFormData({ name: '', category: '' })
    setShowForm(false)
  }

  const deleteTeam = async (teamId) => {
    if (window.confirm('Are you sure?')) {
      await dataService.deleteTeam(teamId)
      setTeams(teams.filter(t => t.id !== teamId))
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--text-h)' }}>Team Management</h1>
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
          {showForm ? '✕ Cancel' : '+ Add Team'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddTeam}
          style={{
            background: 'var(--bg)',
            border: `1px solid var(--border)`,
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input
              type="text"
              placeholder="Team Name"
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
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{
                padding: '10px',
                border: `1px solid var(--border)`,
                borderRadius: '4px',
                background: 'var(--bg)',
                color: 'var(--text)'
              }}
            />
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
            Add Team
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading teams...</p>
      ) : teams.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text)' }}>No teams registered yet.</p>
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
                <th style={{ padding: '12px', textAlign: 'left' }}>Team Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, idx) => (
                <tr key={team.id} style={{ borderBottom: `1px solid var(--border)`, background: idx % 2 === 0 ? 'transparent' : 'var(--code-bg)' }}>
                  <td style={{ padding: '12px' }}>{team.name}</td>
                  <td style={{ padding: '12px' }}>{team.category}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => deleteTeam(team.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
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

export default TeamManagement
