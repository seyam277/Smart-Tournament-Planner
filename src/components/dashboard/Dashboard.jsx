import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import * as dataService from '../../services/dataService'
import { getSportTheme } from '../../utils/theme'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await dataService.getTournaments()
        setTournaments(data)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const ownedTournaments = tournaments.filter(t => 
    user && (t.organizerId === user.id || t.creatorEmail === user.email)
  )

  const stats = {
    total: tournaments.length,
    football: tournaments.filter(t => t.sport?.toLowerCase() === 'football').length,
    cricket: tournaments.filter(t => t.sport?.toLowerCase() === 'cricket').length,
    totalBudget: ownedTournaments.reduce((acc, t) => acc + (parseFloat(t.budget?.total) || 0), 0)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f172a',
      padding: '40px 0',
      color: 'white'
    }}>
      <div className="container">
        {/* Premium Dark Header */}
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.7)', 
          backdropFilter: 'blur(15px)',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '36px', margin: 0, color: '#00ff85', textShadow: '0 0 15px rgba(0, 255, 133, 0.3)', fontWeight: '900' }}>
              Welcome back, {user?.name || 'Champ'}!
            </h1>
            <p style={{ color: '#94a3b8', margin: '10px 0 0 0', fontWeight: '500', fontSize: '16px' }}>
              Your pro tournament management suite is active.
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ borderRadius: '12px', padding: '15px 35px', fontSize: '16px', background: '#00ff85', color: '#0f172a', fontWeight: '800', border: 'none', boxShadow: '0 0 20px rgba(0, 255, 133, 0.4)' }}
            onClick={() => navigate('/tournaments/create')}
          >
            + Create Tournament
          </button>
        </div>

        {/* Live/Upcoming Matches Carousel (Cricbuzz Style) */}
        {(() => {
          const allMatches = tournaments.flatMap(t => 
            (t.matches || []).map(m => ({
              ...m,
              type: 'match',
              tournamentName: t.name,
              tournamentId: t.id,
              sport: t.sport
            }))
          );

          const upcomingTournaments = tournaments
            .filter(t => !t.matches || t.matches.length === 0)
            .map(t => ({
              id: t.id,
              type: 'tournament',
              tournamentName: t.name,
              tournamentId: t.id,
              sport: t.sport,
              status: 'Upcoming',
              matchDate: t.startDate
            }));

          const carouselItems = [...allMatches, ...upcomingTournaments].sort((a, b) => {
            if (a.status === 'Live') return -1;
            if (b.status === 'Live') return 1;
            return new Date(a.matchDate) - new Date(b.matchDate);
          });

          if (carouselItems.length === 0) return null;

          return (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '900', letterSpacing: '1px' }}>
                  <span style={{ color: '#ef4444', marginRight: '10px' }}>●</span> LIVE & UPCOMING EVENTS
                </h3>
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '15px', 
                overflowX: 'auto', 
                padding: '5px 5px 20px 5px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                {carouselItems.map((m, i) => {
                  const mTheme = getSportTheme(m.sport);
                  const isCricket = m.sport === 'Cricket';
                  const isMatch = m.type === 'match';
                  
                  return (
                    <div key={i} 
                      onClick={() => navigate(`/tournaments/${m.tournamentId}`)}
                      style={{ 
                        minWidth: '320px', 
                        background: '#ffffff', 
                        borderRadius: '10px', 
                        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        color: '#333',
                        transition: 'transform 0.2s',
                        border: '1px solid #eee'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ fontSize: '11px', color: '#666', fontWeight: '500' }}>
                            {isMatch ? (m.matchNumber || `Match ${i+1}`) : 'NEW TOURNAMENT'} • {m.tournamentName}
                          </div>
                          <div style={{ background: m.status === 'Live' ? '#ef4444' : (m.type === 'tournament' ? '#38bdf8' : '#333'), color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                            {m.status === 'Live' ? 'LIVE' : m.status === 'Completed' ? 'RESULT' : (m.type === 'tournament' ? 'UPCOMING' : 'FIXTURE')}
                          </div>
                        </div>
                        
                        {isMatch ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '24px', height: '24px', background: '#1e3a8a', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'white' }}>
                                  {m.team1Name?.charAt(0) || 'T'}
                                </div>
                                <span style={{ fontWeight: '800', fontSize: '16px', color: '#000' }}>{m.team1Name}</span>
                              </div>
                              <span style={{ fontWeight: '900', fontSize: '16px' }}>
                                {(m.status === 'Completed' || m.status === 'Live') ? (isCricket ? (m.score1Full || m.score1) : m.score1) : ''}
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '24px', height: '24px', background: '#be123c', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'white' }}>
                                  {m.team2Name?.charAt(0) || 'T'}
                                </div>
                                <span style={{ fontWeight: '800', fontSize: '16px', color: '#000' }}>{m.team2Name}</span>
                              </div>
                              <span style={{ fontWeight: '900', fontSize: '16px' }}>
                                {(m.status === 'Completed' || m.status === 'Live') ? (isCricket ? (m.score2Full || m.score2) : m.score2) : ''}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding: '10px 0', textAlign: 'center' }}>
                            <div style={{ fontWeight: '800', fontSize: '16px', color: '#000', marginBottom: '5px' }}>{m.tournamentName}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Starts on {new Date(m.matchDate).toLocaleDateString()}</div>
                          </div>
                        )}
                        
                        <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                          {m.status === 'Live' ? (
                            <span style={{ color: '#ef4444' }}>{m.resultSummary || 'Match in progress...'}</span>
                          ) : (
                            <span style={{ color: '#666' }}>
                              {isMatch ? (m.status === 'Completed' ? (m.resultSummary || 'Match Finished') : `${m.matchDate} • ${m.matchTime || 'TBD'}`) : `Starts on ${new Date(m.matchDate).toLocaleDateString()}`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer Links */}
                      <div style={{ 
                        background: '#e0e0e0', 
                        padding: '10px 20px', 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        gap: '15px',
                        borderTop: '1px solid #ccc',
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#444'
                      }}>
                        <span style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); navigate(`/tournaments/${m.tournamentId}`); }}>FORECAST</span>
                        <span style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); navigate(`/tournaments/${m.tournamentId}?tab=table`); }}>TABLE</span>
                        <span style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); navigate(`/tournaments/${m.tournamentId}?tab=matches`); }}>SCHEDULE</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Glowing Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
           <StatCard label="Live Tournaments" value={stats.total} icon="🏆" color="#00ff85" glow="rgba(0, 255, 133, 0.2)" />
           <StatCard label="Football Hub" value={stats.football} icon="⚽" color="#38bdf8" glow="rgba(56, 189, 248, 0.2)" />
           <StatCard label="Cricket Arena" value={stats.cricket} icon="🏏" color="#fb923c" glow="rgba(251, 146, 60, 0.2)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          {/* Main Area: Recent Activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* My Tournaments */}
            <div style={{ 
              background: 'rgba(30, 41, 59, 0.5)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              padding: '30px',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h2 style={{ fontSize: '22px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', color: '#f8fafc' }}>
                <span style={{ width: '4px', height: '28px', background: '#00ff85', borderRadius: '2px', boxShadow: '0 0 10px #00ff85' }}></span>
                My Tournaments
              </h2>
              
              {loading ? (
                <p style={{ color: '#94a3b8' }}>Accessing data vaults...</p>
              ) : ownedTournaments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#94a3b8' }}>You haven't created any tournaments yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {ownedTournaments.slice(0, 3).map(t => {
                    const tTheme = getSportTheme(t.sport);
                    return (
                      <div key={t.id} onClick={() => navigate(`/tournaments/${t.id}`)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ fontSize: '24px' }}>{t.sport === 'Football' ? '⚽' : '🏏'}</div>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '16px' }}>{t.name}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{t.sport} • {t.location}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', fontWeight: '900', color: tTheme.primary }}>{t.teams?.length || 0}</div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>TEAMS</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* All Tournaments Grid */}
            <div style={{ 
              background: 'rgba(30, 41, 59, 0.4)', 
              borderRadius: '24px',
              padding: '30px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              boxShadow: '0 4px 20px rgba(56, 189, 248, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ fontSize: '20px', margin: 0, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🌎</span> All Tournaments
                </h2>
                <button 
                  onClick={() => navigate('/tournaments')}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  VIEW FULL DIRECTORY
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                {tournaments.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '13px' }}>No tournaments found in the database.</p>
                ) : (
                  tournaments.map(t => {
                    const tTheme = getSportTheme(t.sport);
                    return (
                      <div key={t.id} onClick={() => navigate(`/tournaments/${t.id}`)} style={{ 
                        padding: '20px', 
                        background: 'rgba(15, 23, 42, 0.6)', 
                        borderRadius: '16px', 
                        cursor: 'pointer', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <div style={{ fontSize: '10px', color: tTheme.primary, fontWeight: '900', marginBottom: '8px' }}>{t.sport.toUpperCase()}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>{t.name}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>📍 {t.location}</div>
                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>By: {t.creatorEmail?.split('@')[0] || 'Guest'}</span>
                          <span style={{ fontSize: '11px', color: tTheme.primary, fontWeight: 'bold' }}>DETAILS →</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: System Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div style={{ 
               background: 'linear-gradient(135deg, #00ff85, #38bdf8)',
               borderRadius: '24px',
               padding: '30px',
               color: '#0f172a',
               boxShadow: '0 10px 40px rgba(0, 255, 133, 0.2)'
             }}>
               <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '900' }}>Expense Intel</h3>
               <p style={{ fontSize: '14px', margin: 0, fontWeight: '600', lineHeight: '1.6' }}>
                 New: Detailed tracking for Food, Transport, and Venue is now live in the Budget Hub.
               </p>
             </div>

             <div style={{ 
               background: 'rgba(30, 41, 59, 0.5)',
               borderRadius: '24px',
               padding: '30px',
               border: '1px solid rgba(255, 255, 255, 0.05)',
               boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
             }}>
               <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#f8fafc' }}>Control Panel</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <OverviewItem label="Active User" value={user?.name || 'Organizer'} />
                  <OverviewItem label="Access Level" value="Administrator" />
                  <OverviewItem label="Server Status" value="Optimal" />
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ label, value, icon, color, glow }) => (
  <div style={{ 
    background: 'rgba(30, 41, 59, 0.5)', 
    borderRadius: '20px', 
    padding: '25px', 
    boxShadow: `0 0 20px ${glow}`,
    border: `1px solid rgba(255,255,255,0.05)`,
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '50px', opacity: 0.1, color: color }}>{icon}</div>
    <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    <div style={{ fontSize: '28px', fontWeight: '900', marginTop: '15px', color: color }}>{value}</div>
  </div>
)


const OverviewItem = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
    <span style={{ color: '#94a3b8' }}>{label}</span>
    <span style={{ fontWeight: 'bold', color: 'white' }}>{value}</span>
  </div>
)

export default Dashboard



