import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import * as dataService from '../../services/dataService'
import { getSportTheme } from '../../utils/theme'

const TournamentList = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadTournaments()
  }, [])

  const loadTournaments = async () => {
    try {
      const data = await dataService.getTournaments()
      setTournaments(data)
    } catch (err) {
      console.error('Failed to load tournaments:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteTournament = async (e, id) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await dataService.deleteTournament(id)
        setTournaments(tournaments.filter(t => t.id !== id))
      } catch (err) {
        alert('Failed to delete tournament')
      }
    }
  }

  const filteredTournaments = tournaments.filter(t => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = t.name ? t.name.toLowerCase().includes(searchLower) : false;
    const sportMatch = t.sport ? t.sport.toLowerCase().includes(searchLower) : false;
    return nameMatch || sportMatch;
  });

  const getSportIcon = (sport) => {
    switch (sport?.toLowerCase()) {
      case 'cricket': return '🏏'
      case 'football': return '⚽'
      case 'badminton': return '🏸'
      case 'basketball': return '🏀'
      default: return '🏆'
    }
  }


  return (
    <div className="container" style={{ padding: '40px 0', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: '#00ff85' }}>Global Tournaments</h1>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>
            System Database Status: {tournaments.length} tournaments found.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input
            type="text"
            placeholder="Filter by name or sport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: 'white',
              outline: 'none',
              width: '250px'
            }}
          />
          {user ? (
            <button className="btn btn-primary" onClick={() => navigate('/tournaments/create')} style={{ borderRadius: '12px', background: '#00ff85', color: '#0f172a', fontWeight: '800' }}>
              + Create Tournament
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: '800', border: '1px solid rgba(255,255,255,0.2)' }}>
              Login to Create
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Scanning arena...</p>
      ) : filteredTournaments.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', background: '#1e293b', border: '1px solid #334155' }}>
          <p style={{ fontSize: '18px', color: '#94a3b8' }}>No tournaments active in this sector.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '25px' }}>
          {filteredTournaments.map(tournament => {
            const isOwner = user && (tournament.organizerId === user.id || tournament.creatorEmail === user.email);
            const theme = getSportTheme(tournament.sport);

            return (
              <div
                key={tournament.id}
                className="card"
                onClick={() => navigate(`/tournaments/${tournament.id}`)}
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '25px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.boxShadow = theme.glow; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '900', color: theme.primary, letterSpacing: '2px' }}>{tournament.sport.toUpperCase()} • {tournament.format}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>📍 {tournament.location}</span>
                </div>

                <h3 style={{ fontSize: '22px', margin: '0 0 20px 0', fontWeight: '800' }}>{tournament.name}</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    border: `2px solid ${theme.primary}`
                  }}>
                    {getSportIcon(tournament.sport)}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{tournament.teams?.length || 0} Teams Joined</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{tournament.startDate} - {tournament.endDate}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: theme.primary }}>
                    HUB • FIXTURES • STANDINGS
                  </div>
                  {isOwner && (
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/tournaments/edit/${tournament.id}`) }}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        EDIT
                      </button>
                      <button
                        onClick={(e) => deleteTournament(e, tournament.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        DELETE
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}


export default TournamentList


