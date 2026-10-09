import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import * as dataService from '../../services/dataService'
import { useAuth } from '../../context/AuthContext'
import { getSportTheme } from '../../utils/theme'
import TournamentDashboard from './TournamentDashboard'

const TournamentDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [tournament, setTournament] = useState(null)
  const [activeTab, setActiveTab] = useState('Home')
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [isEditingStandings, setIsEditingStandings] = useState(false)
  const [manualStandings, setManualStandings] = useState([])
  const [isEditingBudget, setIsEditingBudget] = useState(false)
  const [budgetForm, setBudgetForm] = useState({})

  useEffect(() => {
    loadTournament()
    
    // Handle tab deep linking from URL
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab')
    if (tabParam) {
      if (tabParam === 'table') setActiveTab('Points Table')
      else if (tabParam === 'matches') setActiveTab('Matches')
      else if (tabParam === 'squads') setActiveTab('Squads')
    }
  }, [id, location])

  const loadTournament = async () => {
    try {
      const data = await dataService.getTournamentById(id)
      setTournament(data)
    } catch (err) {
      console.error('Failed to load tournament:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTournament = async () => {
    if (window.confirm('Are you absolutely sure you want to delete this tournament? This action cannot be undone.')) {
      try {
        await dataService.deleteTournament(id);
        alert('Tournament deleted successfully.');
        navigate('/dashboard');
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete tournament.');
      }
    }
  }

  if (loading) return <div className="container" style={{ padding: '40px', color: 'var(--text)' }}>Loading Tournament Details...</div>
  if (!tournament) return <div className="container" style={{ padding: '40px', color: 'var(--text)' }}>Tournament not found.</div>

  const theme = getSportTheme(tournament.sport)
  const isOwner = tournament.canEdit || (user && (tournament.organizerId === user.id || tournament.creatorEmail === user.email));
  
  const publicTabs = ['Home', 'Live', 'Matches', 'Points Table', 'Squads', 'Stats', 'Budget']
  const tabs = publicTabs

  const currentTab = activeTab

  return (
    <div className="container" style={{ padding: '20px 0', color: 'var(--text)' }}>
      {/* Premium Tournament Header */}
      <div style={{ 
        padding: '30px', 
        background: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=1200')`,
        backgroundSize: 'cover',
        borderRadius: '16px 16px 0 0',
        borderTop: `2px solid ${theme.primary}`,
        borderLeft: `2px solid ${theme.primary}`,
        borderRight: `2px solid ${theme.primary}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
      }}>
         <div>
           <div style={{ fontSize: '14px', color: theme.primary, fontWeight: '800', letterSpacing: '2px', marginBottom: '10px' }}>
             {(tournament.sport || 'Sport').toUpperCase()} • {(tournament.format || 'Knockout').toUpperCase()}
           </div>
           <h1 style={{ color: 'white', margin: 0, fontSize: '36px', fontWeight: '900' }}>{tournament.name}</h1>
           <div style={{ marginTop: '15px', display: 'flex', gap: '20px', fontSize: '14px', color: 'var(--text-dim)', alignItems: 'center' }}>
              <span>📍 {tournament.location}</span>
              <span>📅 {tournament.startDate} to {tournament.endDate}</span>
              <span style={{ 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '11px', 
                fontWeight: '900', 
                letterSpacing: '1px',
                background: isOwner ? 'rgba(0, 255, 133, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                color: isOwner ? '#00ff85' : '#38bdf8',
                border: `1px solid ${isOwner ? 'rgba(0, 255, 133, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`
              }}>
                {isOwner ? '🛡️ ADMIN' : '👁️ VIEWER'}
              </span>
            </div>
         </div>

          {isOwner && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => navigate(`/tournaments/edit/${id}`)}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.3s'
                }}
              >
                ⚙️ EDIT
              </button>
              <button 
                onClick={handleDeleteTournament}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.3s'
                }}
              >
                🗑️ DELETE
              </button>
            </div>
          )}
      </div>

      {/* Cricbuzz Style Sub-Navigation Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        background: 'white', 
        padding: '15px 30px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '25px', 
        overflowX: 'auto',
        borderRadius: '0 0 16px 16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <div style={{ fontWeight: '900', fontSize: '18px', color: '#0f172a', marginRight: '30px', whiteSpace: 'nowrap' }}>
          {tournament.name}
        </div>
        <div style={{ display: 'flex', gap: '25px' }}>
          {tabs.map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                cursor: 'pointer', 
                fontWeight: '600',
                color: currentTab === tab ? '#0f172a' : '#2563eb',
                fontSize: '15px',
                transition: 'color 0.2s',
                whiteSpace: 'nowrap',
                borderBottom: currentTab === tab ? `3px solid ${theme.primary}` : '3px solid transparent',
                paddingBottom: '5px'
              }}
              onMouseOver={(e) => { if (currentTab !== tab) e.target.style.color = '#1d4ed8'; }}
              onMouseOut={(e) => { if (currentTab !== tab) e.target.style.color = '#2563eb'; }}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div className="tab-content">
        {currentTab === 'Home' && (
           <TournamentDashboard tournament={tournament} isOwner={isOwner} setTournament={setTournament} setActiveTab={setActiveTab} />
        )}

        {currentTab === 'Live' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
              Live Action
            </h2>
            <style>{`
              @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0.5; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}</style>
            {(tournament.matches || []).filter(m => m.status === 'Live').length > 0 ? (
              (tournament.matches || []).filter(m => m.status === 'Live').map((match, i) => (
                <div key={i} style={{ 
                  padding: '30px', 
                  background: 'rgba(30, 41, 59, 0.8)', 
                  borderRadius: '24px', 
                  border: `2px solid ${theme.primary}`,
                  boxShadow: `0 0 20px ${theme.primary}33`,
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: '900', fontSize: '22px' }}>
                    {match.team1Name}
                    <div style={{ fontSize: '32px', color: theme.primary, marginTop: '10px' }}>{match.score1Full || match.score1}</div>
                  </div>
                  <div style={{ padding: '0 50px' }}>
                    <div style={{ background: '#ef4444', color: 'white', padding: '4px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: '900', marginBottom: '10px' }}>LIVE</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>{match.venue}</div>
                    <div style={{ fontSize: '12px', color: theme.primary, marginTop: '5px' }}>{match.resultSummary || 'In Progress'}</div>
                  </div>
                  <div style={{ fontWeight: '900', fontSize: '22px' }}>
                    {match.team2Name}
                    <div style={{ fontSize: '32px', color: theme.primary, marginTop: '10px' }}>{match.score2Full || match.score2}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(30, 41, 59, 0.2)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <h3 style={{ color: 'white' }}>No Live Matches</h3>
                <p style={{ color: '#94a3b8' }}>Check the 'Matches' tab for upcoming fixtures.</p>
              </div>
            )}
          </div>
        )}

        {currentTab === 'Budget' && (() => {
          const b = tournament.budget || {};
          const pm = tournament.prizeMoney || {};
          const cats = [
            { label: 'Food & Catering', icon: '🍲', color: '#ff4d4d', amount: parseFloat(b.food) || 0 },
            { label: 'Transportation', icon: '🚌', color: '#38bdf8', amount: parseFloat(b.transport) || 0 },
            { label: 'Venue & Security', icon: '🏟️', color: '#4ade80', amount: parseFloat(b.venue) || 0 },
            { label: 'Equipment & Kits', icon: '🛡️', color: '#fb923c', amount: parseFloat(b.equipment) || 0 },
            { label: 'Prize Pool', icon: '🏆', color: '#fdbb2d', amount: (parseFloat(pm.first)||0) + (parseFloat(pm.second)||0) },
            { label: 'Other Expenses', icon: '⚙️', color: '#94a3b8', amount: parseFloat(b.other) || 0 },
          ];
          const prizeTotal = (parseFloat(pm.first)||0) + (parseFloat(pm.second)||0);
          const total = (parseFloat(b.total) || 0) + prizeTotal;
          const spentCats = cats.filter(c => c.label !== 'Prize Pool');
          const finalMatch = tournament.matches?.find(m => m.matchStage === 'Final');
          const isCompleted = tournament.matches?.length > 0 && (finalMatch ? finalMatch.status === 'Completed' : tournament.matches.every(m => m.status === 'Completed'));
          const spent = spentCats.reduce((s, c) => s + c.amount, 0) + (isCompleted ? prizeTotal : 0);
          const balance = total - spent;
          return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>
              {/* Budget Summary Card */}
              <div className="card" style={{ padding: '25px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                <h3 style={{ color: theme.primary, marginBottom: '20px' }}>Budget Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Total Allocated</div>
                    <div style={{ fontSize: '28px', fontWeight: '900' }}>৳{total.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ color: '#ff4d4d', fontSize: '12px' }}>Total Spent</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#ff4d4d' }}>৳{spent.toLocaleString()}</div>
                  </div>
                  <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ color: balance >= 0 ? theme.primary : '#f87171', fontSize: '12px' }}>Balance Available</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: balance >= 0 ? theme.primary : '#f87171' }}>৳{balance.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Expense Categories Grid */}
              <div className="card" style={{ padding: '25px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: theme.primary, margin: 0 }}>Tournament Expenses</h3>
                  {isOwner && <button onClick={() => setActiveTab('Budget')} className="btn btn-primary" style={{ background: theme.primary, fontSize: '12px', color: 'black' }}>✏️ Edit Budget</button>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  {cats.map((cat, i) => (
                    <div key={i} style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center', transition: 'transform 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ fontSize: '30px', marginBottom: '10px' }}>{cat.icon}</div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>{cat.label}</div>
                      <div style={{ color: cat.color, fontWeight: '800' }}>৳{cat.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {currentTab === 'Squads' && (
          <div>
            {selectedTeam ? (
              <div className="card" style={{ padding: '30px', background: 'var(--card-bg)', border: `1px solid ${theme.primary}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                  <h3 style={{ margin: 0, color: theme.primary }}>{selectedTeam.name} - Roster</h3>
                  <button className="btn" onClick={() => setSelectedTeam(null)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '12px' }}>← Back to Teams</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                  {(tournament.players || []).filter(p => p.team === selectedTeam.name).map((player, i) => (
                    <div key={i} style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{player.name}</strong>
                      <span style={{ color: theme.primary, fontSize: '12px' }}>{player.role}</span>
                    </div>
                  ))}
                  {(tournament.players || []).filter(p => p.team === selectedTeam.name).length === 0 && <p style={{ color: 'var(--text-dim)' }}>No players registered for this team yet.</p>}
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {(tournament.teams || []).map((team, i) => (
                  <div key={i} className="card" 
                    onClick={() => setSelectedTeam(typeof team === 'string' ? { name: team } : team)}
                    style={{ 
                      padding: '30px', 
                      textAlign: 'center', 
                      background: 'rgba(30, 41, 59, 0.4)', 
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = theme.primary}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ 
                      width: '80px', 
                      height: '80px', 
                      background: 'rgba(0,0,0,0.3)', 
                      borderRadius: '50%', 
                      margin: '0 auto 15px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '32px',
                      border: `2px solid ${theme.primary}`,
                      boxShadow: `inset 0 0 10px ${theme.primary}`
                    }}>
                      {tournament.sport === 'Football' ? '⚽' : tournament.sport === 'Cricket' ? '🏏' : '🏆'}
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '18px' }}>{typeof team === 'string' ? team : team.name}</div>
                    <div style={{ fontSize: '12px', color: theme.primary, marginTop: '5px' }}>{typeof team === 'object' ? team.category : 'Official Entry'}</div>
                    {typeof team === 'object' && team.budget && <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '5px' }}>Budget: ${team.budget}</div>}
                    <div style={{ marginTop: '15px', fontSize: '11px', color: 'var(--text-dim)', fontWeight: 'bold' }}>CLICK TO VIEW ROSTER</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === 'Matches' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '24px', margin: 0, color: 'white' }}>Match Center</h2>
              {isOwner && (
                <button 
                  onClick={() => navigate(`/tournaments/${id}/matches`)}
                  style={{ 
                    padding: '12px 24px', 
                    background: 'rgba(56, 189, 248, 0.1)', 
                    border: '1px solid #38bdf8', 
                    color: '#38bdf8', 
                    borderRadius: '12px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  + Manage Schedule & Results
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {tournament.matches && tournament.matches.length > 0 ? (
                tournament.matches.map((match, i) => {
                  const isCompleted = match.status === 'Completed';
                  return (
                    <div key={i} style={{ 
                      padding: '25px', 
                      background: isCompleted ? 'rgba(30, 41, 59, 0.6)' : 'rgba(30, 41, 59, 0.4)', 
                      borderRadius: '20px', 
                      border: isCompleted ? `1px solid ${theme.primary}44` : '1px solid rgba(255,255,255,0.05)',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto 1fr',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative'
                    }}>
                      <div style={{ fontWeight: '800', fontSize: '18px' }}>
                        {match.team1Name || 'Team 1'}
                        {isCompleted && <div style={{ fontSize: '24px', color: theme.primary, marginTop: '5px' }}>{match.score1Full || match.score1}</div>}
                      </div>
                      
                      <div style={{ padding: '0 40px' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '5px' }}>
                          {match.matchNumber || `Match ${i+1}`} • {match.matchDate}
                        </div>
                        <div style={{ background: isCompleted ? theme.primary : 'white', color: '#0f172a', padding: '4px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: '900' }}>
                          {isCompleted ? 'RESULT' : 'VS'}
                        </div>
                        <div style={{ fontSize: '12px', color: theme.primary, marginTop: '8px' }}>{match.venue}</div>
                        {isCompleted && match.resultSummary && (
                          <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '10px', fontWeight: 'bold', fontStyle: 'italic' }}>
                            {match.resultSummary}
                          </div>
                        )}
                        {isCompleted && match.manOfTheMatch && (
                          <div style={{ fontSize: '11px', color: '#00ff85', marginTop: '5px', fontWeight: 'bold' }}>
                            ⭐ MOM: {match.manOfTheMatch}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ fontWeight: '800', fontSize: '18px' }}>
                        {match.team2Name || 'Team 2'}
                        {isCompleted && <div style={{ fontSize: '24px', color: theme.primary, marginTop: '5px' }}>{match.score2Full || match.score2}</div>}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(30, 41, 59, 0.2)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '15px' }}>📅</div>
                  <h3 style={{ margin: 0, color: 'white' }}>No Matches Scheduled</h3>
                  <p style={{ color: '#94a3b8', maxWidth: '300px', margin: '10px auto 0' }}>{isOwner ? 'Get started by creating your first match fixture.' : 'The match schedule has not been published yet.'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === 'Points Table' && (
           <div className="card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(0,0,0,0.2)' }}>
                <h3 style={{ margin: 0, color: 'white' }}>Leaderboard</h3>
                {isOwner && (
                  <button 
                    onClick={() => setActiveTab('Matches')}
                    style={{ padding: '8px 16px', background: theme.primary, color: 'black', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    MANAGE FIXTURES
                  </button>
                )}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(255,255,255,0.03)', color: '#94a3b8' }}>
                  <tr>
                    <th style={{ padding: '20px', textAlign: 'left' }}>Rank</th>
                    <th style={{ padding: '20px', textAlign: 'left' }}>Team</th>
                    <th style={{ padding: '20px' }}>P</th>
                    <th style={{ padding: '20px' }}>W</th>
                    <th style={{ padding: '20px' }}>L</th>
                    <th style={{ padding: '20px' }}>D/NR</th>
                    <th style={{ padding: '20px' }}>Pts</th>
                    <th style={{ padding: '20px' }}>{tournament.sport === 'Cricket' ? 'NRR' : tournament.sport === 'Football' ? 'NGR' : 'NET'}</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const teams = tournament.teams || [];
                    const matches = tournament.matches || [];
                    
                    const autoStandings = teams.map(teamObj => {
                      const teamName = typeof teamObj === 'string' ? teamObj : teamObj.name;
                      let played = 0, won = 0, lost = 0, drawn = 0, points = 0, netScore = 0;
                      
                      matches.forEach(match => {
                        if (match.status === 'Completed' && (match.team1Name === teamName || match.team2Name === teamName)) {
                          played++;
                          const isTeam1 = match.team1Name === teamName;
                          const myScore = parseInt(isTeam1 ? match.score1 : match.score2) || 0;
                          const oppScore = parseInt(isTeam1 ? match.score2 : match.score1) || 0;
                          
                          netScore += (myScore - oppScore);

                          if (myScore > oppScore) { won++; points += 3; }
                          else if (myScore < oppScore) { lost++; }
                          else { drawn++; points += 1; }
                        }
                      });

                      const netRate = played > 0 ? (netScore / played) : 0;
                      return { teamName, played, won, lost, drawn, points, netScore, netRate };
                    }).sort((a, b) => {
                      if (b.points !== a.points) return b.points - a.points;
                      return b.netRate - a.netRate;
                    });

                    const displayData = tournament.manualStandings?.length > 0 ? tournament.manualStandings : autoStandings;
                    const allMatchesCompleted = matches.length > 0 && matches.every(m => m.status === 'Completed');

                   return (
                     <>
                       {allMatchesCompleted && displayData.length > 0 && (
                         <tr>
                           <td colSpan="8" style={{ padding: '0' }}>
                             <div style={{ background: 'linear-gradient(90deg, #fdbb2d, #b21f1f)', padding: '15px', textAlign: 'center', color: 'white', fontWeight: '900', fontSize: '18px', letterSpacing: '2px' }}>
                               🏆 TOURNAMENT CHAMPION: {displayData[0]?.teamName?.toUpperCase() || 'UNKNOWN'} 🏆
                             </div>
                           </td>
                         </tr>
                       )}
                       {displayData.map((stat, i) => (
                         <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                           <td style={{ padding: '20px', fontWeight: '800' }}>#{i + 1}</td>
                           <td style={{ padding: '20px' }}><strong>{stat.teamName}</strong></td>
                           <td style={{ padding: '20px' }}>{stat.played}</td>
                           <td style={{ padding: '20px', color: '#4ade80' }}>{stat.won}</td>
                           <td style={{ padding: '20px', color: '#ff4d4d' }}>{stat.lost}</td>
                           <td style={{ padding: '20px', color: '#94a3b8' }}>{stat.drawn}</td>
                           <td style={{ padding: '20px', color: theme.primary, fontWeight: '900', fontSize: '18px' }}>{stat.points}</td>
                           <td style={{ padding: '20px', color: stat.netRate >= 0 ? '#4ade80' : '#ff4d4d' }}>{stat.netRate.toFixed(2)}</td>
                         </tr>
                       ))}
                       {displayData.length === 0 && (
                         <tr>
                           <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                             No teams registered in this tournament yet.
                           </td>
                         </tr>
                       )}
                     </>
                   );
                 })()}
               </tbody>
             </table>
           </div>
        )}

        {currentTab === 'Stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            <div className="card" style={{ padding: '25px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <h3 style={{ color: theme.primary, marginBottom: '20px' }}>Top Performers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {[...(tournament.players || [])].sort((a, b) => (b.stats?.runs || b.stats?.goals || b.stats?.points || 0) - (a.stats?.runs || a.stats?.goals || a.stats?.points || 0)).slice(0, 5).map((player, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '30px', height: '30px', background: theme.primary, color: 'black', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px' }}>{i+1}</div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{player.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{player.team} • {player.role}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: theme.primary }}>{player.stats?.runs || player.stats?.goals || 0}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>{tournament.sport === 'Cricket' ? 'RUNS' : 'GOALS'}</div>
                    </div>
                  </div>
                ))}
                {(tournament.players || []).length === 0 && <p style={{ color: '#94a3b8' }}>No player statistics available yet.</p>}
              </div>
            </div>

            <div className="card" style={{ padding: '25px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <h3 style={{ color: theme.primary, marginBottom: '20px' }}>Tournament Overview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900' }}>{tournament.teams?.length || 0}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>TEAMS</div>
                </div>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900' }}>{tournament.players?.length || 0}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>PLAYERS</div>
                </div>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900' }}>{tournament.matches?.length || 0}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>MATCHES</div>
                </div>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900' }}>{tournament.matches?.filter(m => m.status === 'Completed').length || 0}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>COMPLETED</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'Budget' && (() => {
          const b = tournament.budget || {};
          const pm2 = tournament.prizeMoney || {};
          const prizeTotal2 = (parseFloat(pm2.first)||0) + (parseFloat(pm2.second)||0);
          const total = (parseFloat(b.total) || 0) + prizeTotal2;
          const categories = [
            { key: 'food', label: 'Food & Catering', icon: '🍱', color: '#f59e0b' },
            { key: 'transport', label: 'Transportation', icon: '🚌', color: '#38bdf8' },
            { key: 'venue', label: 'Venue & Logistics', icon: '🏟️', color: '#3b82f6' },
            { key: 'equipment', label: 'Equipment', icon: '🏏', color: '#8b5cf6' },
            { key: '_prizes', label: 'Prize Money', icon: '🏆', color: '#10b981', amount: prizeTotal2 },
            { key: 'other', label: 'Other Expenses', icon: '📦', color: '#64748b' },
          ];
          const operationalKeys = ['food', 'transport', 'venue', 'equipment', 'other'];
          const finalMatch = tournament.matches?.find(m => m.matchStage === 'Final');
          const isCompleted = tournament.matches?.length > 0 && (finalMatch ? finalMatch.status === 'Completed' : tournament.matches.every(m => m.status === 'Completed'));
          const spent = operationalKeys.reduce((sum, k) => sum + (parseFloat(b[k]) || 0), 0) + (isCompleted ? prizeTotal2 : 0);
          const remaining = total - spent;

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: 'white', margin: 0 }}>💰 Tournament Budget</h2>
                {isOwner && !isEditingBudget && (
                  <button onClick={() => { setIsEditingBudget(true); setBudgetForm({ ...b }); }}
                    style={{ padding: '10px 20px', background: theme.primary, color: 'black', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    ✏️ Edit Budget
                  </button>
                )}
              </div>

              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                {[{ label: 'Total Budget', value: `৳${Number(b.total||0).toLocaleString()}`, color: theme.primary },
                  { label: 'Total Spent', value: `৳${spent.toLocaleString()}`, color: '#f59e0b' },
                  { label: 'Remaining', value: `৳${remaining.toLocaleString()}`, color: remaining >= 0 ? '#4ade80' : '#f87171' }]
                  .map((card, i) => (
                  <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: card.color }}>{card.value}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>{card.label}</div>
                  </div>
                ))}
              </div>

              {/* Distribution Bar */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px', fontWeight: 'bold' }}>BUDGET DISTRIBUTION</div>
                <div style={{ display: 'flex', height: '20px', borderRadius: '10px', overflow: 'hidden' }}>
                  {categories.map(c => {
                    const amt = c.amount !== undefined ? c.amount : parseFloat(b[c.key] || 0);
                    const pct = total > 0 ? (amt / total) * 100 : 0;
                    return pct > 0 ? <div key={c.key} style={{ width: `${pct}%`, background: c.color }} title={`${c.label}: ${pct.toFixed(1)}%`} /> : null;
                  })}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
                  {categories.map(c => (
                    <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                      <span style={{ width: '10px', height: '10px', background: c.color, borderRadius: '2px', display: 'inline-block' }} />
                      {c.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown */}
              {!isEditingBudget ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {categories.map(c => {
                    const amt = c.amount !== undefined ? c.amount : parseFloat(b[c.key] || 0);
                    const pct = total > 0 ? ((amt / total) * 100).toFixed(1) : 0;
                    return (
                      <div key={c.key} style={{ padding: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', borderLeft: `4px solid ${c.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 'bold' }}>{c.icon} {c.label}</span>
                          <span style={{ color: c.color, fontWeight: '900' }}>৳{amt.toLocaleString()}</span>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '4px', height: '6px' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: c.color, borderRadius: '4px' }} />
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px' }}>{pct}% of total budget</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Edit Form (Organizer only)
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '25px' }}>
                  <h3 style={{ color: 'white', margin: '0 0 20px 0' }}>Edit Budget</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {[{ key: 'total', label: '💰 Total Budget' }, ...categories.map(c => ({ key: c.key, label: `${c.icon} ${c.label}` }))].map(f => (
                      <div key={f.key}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{f.label}</label>
                        <input type="number"
                          value={budgetForm[f.key] || ''}
                          onChange={e => setBudgetForm({ ...budgetForm, [f.key]: e.target.value })}
                          style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '14px', boxSizing: 'border-box' }}
                          placeholder="৳ Amount" />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button onClick={async () => {
                        const updated = { ...tournament, budget: budgetForm };
                        await dataService.updateTournament(id, updated);
                        setTournament(updated);
                        setIsEditingBudget(false);
                      }}
                      style={{ padding: '12px 30px', background: '#00ff85', color: 'black', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                      💾 Save Budget
                    </button>
                    <button onClick={() => setIsEditingBudget(false)}
                      style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Prize Money */}
              {tournament.prizeMoney && (
                <div style={{ background: 'rgba(253,187,45,0.08)', border: '1px solid rgba(253,187,45,0.2)', borderRadius: '16px', padding: '20px' }}>
                  <h3 style={{ color: '#fdbb2d', margin: '0 0 15px 0' }}>🏆 Prize Distribution</h3>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    {[{ pos: '🥇 1st Place', key: 'first', color: '#fdbb2d' },
                      { pos: '🥈 2nd Place', key: 'second', color: '#94a3b8' }].map(p => (
                      <div key={p.key} style={{ flex: 1, textAlign: 'center', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: p.color }}>৳{Number(tournament.prizeMoney[p.key]||0).toLocaleString()}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>{p.pos}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

      </div>
    </div>
  )
}

export default TournamentDetails
