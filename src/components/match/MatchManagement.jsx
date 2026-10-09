import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as dataService from '../../services/dataService'
import { getSportTheme } from '../../utils/theme'
import { useAuth } from '../../context/AuthContext'

const MatchManagement = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    team1Id: '',
    team2Id: '',
    matchDate: '',
    matchTime: '',
    venue: '',
    matchStage: 'Group Stage'
  })
  
  // Scoring State
  const [editingScoreId, setEditingScoreId] = useState(null)
  const [scoreData, setScoreData] = useState({ 
    team1Score: '', 
    team2Score: '', 
    team1ScoreFull: '', 
    team2ScoreFull: '',
    resultSummary: '',
    manOfTheMatch: '',
    playerPerformances: []
  })
  
  const [newPerformance, setNewPerformance] = useState({ playerName: '', goals: 0, runs: 0, wickets: 0, points: 0 })
  
  // Standings State
  const [showStandingsEditor, setShowStandingsEditor] = useState(false)
  const [manualStandings, setManualStandings] = useState([])

  const loadData = async () => {
    try {
      const tData = await dataService.getTournamentById(id)
      setTournament(tData)
      const matchesData = await dataService.getMatchesByTournament(id)
      const teamsData = tData.teams || []
      setMatches(matchesData)
      setTeams(teamsData)
      
      // Pre-fill venue with tournament location
      if (tData.location) {
        setFormData(prev => ({ ...prev, venue: tData.location }));
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const { user } = useAuth()

  if (!tournament) return <div style={{ color: 'white', padding: '50px' }}>Loading...</div>

  const theme = getSportTheme(tournament.sport)
  const isOwner = tournament.canEdit || (user && (tournament.organizerId === user.id || tournament.creatorEmail === user.email))

  const handleAddMatch = async (e) => {
    e.preventDefault()
    if (!formData.team1Id || !formData.team2Id || !formData.matchDate) {
      alert('Please fill required fields')
      return
    }

    // DATE VALIDATION: Match must be between tournament start and end dates
    if (tournament.startDate && tournament.endDate) {
      const mDate = formData.matchDate;
      if (mDate < tournament.startDate || mDate > tournament.endDate) {
        alert(`Match date (${mDate}) must be between tournament dates: ${tournament.startDate} to ${tournament.endDate}`);
        return;
      }
    }

    const team1 = teams.find(t => (t.id === formData.team1Id || t.name === formData.team1Id))
    const team2 = teams.find(t => (t.id === formData.team2Id || t.name === formData.team2Id))
    const matchNo = matches.length + 1;
    const newMatch = await dataService.createMatch({
      ...formData,
      team1Name: typeof team1 === 'string' ? team1 : team1?.name,
      team2Name: typeof team2 === 'string' ? team2 : team2?.name,
      tournamentId: id,
      matchNumber: `${matchNo}${getOrdinal(matchNo)} Match`
    })

    // Also update the tournament's matches array for the hub view
    const updatedTournament = {
      ...tournament,
      matches: [...(tournament.matches || []), newMatch]
    }
    await dataService.updateTournament(id, updatedTournament)

    setMatches([...matches, newMatch])
    setFormData({ team1Id: '', team2Id: '', matchDate: '', matchTime: '', venue: tournament.location || '', matchStage: 'Group Stage' })
    setShowForm(false)
  }

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  const handleSaveScore = async (matchId, newStatus = 'Completed') => {
    const matchToUpdate = matches.find(m => m.id === matchId);
    if (!matchToUpdate) return;

    // Extract primary numeric score from text input (e.g., "207-6 (20)" -> 207)
    const extractScore = (str) => {
      if (!str) return 0;
      const match = str.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };

    const score1Num = extractScore(scoreData.team1ScoreFull);
    const score2Num = extractScore(scoreData.team2ScoreFull);
    
    let winnerId = matchToUpdate.winnerId || null;
    let winnerName = matchToUpdate.winnerName || '';
    let autoResultSummary = scoreData.resultSummary;
    
    if (newStatus === 'Completed' && !autoResultSummary) {
      const unit = tournament.sport === 'Cricket' ? 'runs' : tournament.sport === 'Football' ? 'goals' : 'points';
      if (score1Num > score2Num) {
        winnerId = matchToUpdate.team1Id;
        winnerName = matchToUpdate.team1Name;
        autoResultSummary = `${matchToUpdate.team1Name} won by ${score1Num - score2Num} ${unit}`;
      } else if (score2Num > score1Num) {
        winnerId = matchToUpdate.team2Id;
        winnerName = matchToUpdate.team2Name;
        autoResultSummary = `${matchToUpdate.team2Name} won by ${score2Num - score1Num} ${unit}`;
      } else {
        autoResultSummary = 'Match Drawn';
      }
    } else if (newStatus === 'Live' && !autoResultSummary) {
      autoResultSummary = 'Match in progress';
    }

    try {
      const updatedMatch = {
        ...matchToUpdate,
        score1: score1Num,
        score2: score2Num,
        score1Full: scoreData.team1ScoreFull || score1Num.toString(),
        score2Full: scoreData.team2ScoreFull || score2Num.toString(),
        resultSummary: autoResultSummary,
        winnerId,
        winnerName,
        manOfTheMatch: scoreData.manOfTheMatch,
        playerPerformances: scoreData.playerPerformances,
        status: newStatus
      };

      let updatedPlayers = tournament.players;
      // Only apply stats to global players if we are concluding the match
      if (newStatus === 'Completed' && matchToUpdate.status !== 'Completed') {
        updatedPlayers = [...(tournament.players || [])];
        scoreData.playerPerformances.forEach(perf => {
          const pIndex = updatedPlayers.findIndex(p => p.name === perf.playerName);
          if (pIndex !== -1) {
            const stats = updatedPlayers[pIndex].stats || { matches: 0, runs: 0, wickets: 0, goals: 0, points: 0 };
            updatedPlayers[pIndex] = {
              ...updatedPlayers[pIndex],
              stats: {
                ...stats,
                matches: (stats.matches || 0) + 1,
                runs: (stats.runs || 0) + parseInt(perf.runs || 0),
                wickets: (stats.wickets || 0) + parseInt(perf.wickets || 0),
                goals: (stats.goals || 0) + parseInt(perf.goals || 0),
                points: (stats.points || 0) + parseInt(perf.points || 0),
              }
            };
          }
        });
      }

      // Update match in backend
      await dataService.updateMatch(matchId, updatedMatch);

      // Update local state
      const newMatchesList = matches.map(m => m.id === matchId ? updatedMatch : m);
      setMatches(newMatchesList);

      // Update tournament object
      const updatedTournament = {
        ...tournament,
        matches: newMatchesList,
        players: updatedPlayers
      };
      await dataService.updateTournament(id, updatedTournament);

      setEditingScoreId(null);
      setScoreData({ team1Score: '', team2Score: '', team1ScoreFull: '', team2ScoreFull: '', resultSummary: '', manOfTheMatch: '', playerPerformances: [] });
      setNewPerformance({ playerName: '', goals: 0, runs: 0, wickets: 0, points: 0 });
    } catch (err) {
      console.error('Failed to save score:', err);
    }
  }
  const handleDeleteMatch = async (matchId) => {
    if (window.confirm('Are you sure you want to delete this match fixture? This will remove all scores and stats associated with it.')) {
      try {
        const updatedMatches = matches.filter(m => m.id !== matchId);
        const updatedTournament = { ...tournament, matches: updatedMatches };
        await dataService.updateTournament(id, updatedTournament);
        setMatches(updatedMatches);
        setTournament(updatedTournament);
        alert('Match deleted successfully.');
      } catch (err) {
        console.error('Delete match failed:', err);
        alert('Failed to delete match.');
      }
    }
  }

  const handleSaveStandings = async () => {
    try {
      const updatedStandings = manualStandings.map(s => ({
        ...s,
        netRate: s.played > 0 ? (parseFloat(s.netScore || 0) / parseInt(s.played)) : 0
      })).sort((a, b) => b.points !== a.points ? b.points - a.points : b.netRate - a.netRate);

      const updatedTournament = { ...tournament, manualStandings: updatedStandings };
      await dataService.updateTournament(id, updatedTournament);
      setTournament(updatedTournament);
      alert('Standings updated successfully!');
    } catch (err) {
      console.error('Failed to save standings:', err);
    }
  }

  const handleStandingsChange = (index, field, value) => {
    const newStandings = [...manualStandings];
    newStandings[index] = { ...newStandings[index], [field]: value };
    setManualStandings(newStandings);
  }

  const handleResetStandings = async () => {
    if (window.confirm('Reset all standings to automatic match calculation?')) {
      const updatedTournament = { ...tournament, manualStandings: [] };
      await dataService.updateTournament(id, updatedTournament);
      setTournament(updatedTournament);
      setManualStandings([]);
      setShowStandingsEditor(false);
    }
  }

  const inputStyle = {
    padding: '12px',
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'white',
    width: '100%'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 0' }}>
      <div className="container">
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <button onClick={() => navigate(`/tournaments/${id}`)} style={{ background: 'none', border: 'none', color: theme.primary, cursor: 'pointer', marginBottom: '10px', display: 'block' }}>← Back to Tournament</button>
            <h1 style={{ color: 'white', margin: 0, fontSize: '32px' }}>Fixture Scheduler</h1>
          </div>
          {isOwner ? (
            <button
              onClick={() => setShowForm(!showForm)}
              style={{ padding: '12px 30px', background: theme.primary, color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', boxShadow: theme.glow }}
            >
              {showForm ? 'CLOSE EDITOR' : '+ SCHEDULE NEW MATCH'}
            </button>
          ) : (
            <div style={{ padding: '10px 20px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '10px', color: '#38bdf8', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👁️</span> View-only mode
            </div>
          )}
        </div>

        {/* ADD MATCH FORM */}
        {showForm && isOwner && (
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '30px', borderRadius: '24px', border: `1px solid ${theme.primary}`, marginBottom: '40px', backdropFilter: 'blur(10px)' }}>
            <form onSubmit={handleAddMatch}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}>TEAM 1</label>
                  <select value={formData.team1Id} onChange={(e) => setFormData({ ...formData, team1Id: e.target.value })} style={inputStyle}>
                    <option value="">Select Team</option>
                    {teams.map((team, i) => (
                      <option key={i} value={typeof team === 'string' ? team : team.name}>{typeof team === 'string' ? team : team.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}>TEAM 2</label>
                  <select value={formData.team2Id} onChange={(e) => setFormData({ ...formData, team2Id: e.target.value })} style={inputStyle}>
                    <option value="">Select Team</option>
                    {teams.map((team, i) => (
                      <option key={i} value={typeof team === 'string' ? team : team.name}>{typeof team === 'string' ? team : team.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}>STAGE</label>
                  <select value={formData.matchStage} onChange={(e) => setFormData({ ...formData, matchStage: e.target.value })} style={inputStyle}>
                    <option value="Group Stage">Group Stage</option>
                    <option value="Round of 16">Round of 16</option>
                    <option value="Quarter Final">Quarter Final</option>
                    <option value="Semi Final">Semi Final</option>
                    <option value="Final">Final</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}>DATE</label>
                  <input 
                    type="date" 
                    value={formData.matchDate} 
                    onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })} 
                    style={inputStyle} 
                    min={tournament.startDate}
                    max={tournament.endDate}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}>TIME</label>
                  <input type="time" value={formData.matchTime} onChange={(e) => setFormData({ ...formData, matchTime: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}>VENUE</label>
                  <input type="text" placeholder="Stadium / Court" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <button type="submit" style={{ marginTop: '30px', padding: '15px 40px', background: 'linear-gradient(135deg, #00ff85, #38bdf8)', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>
                CONFIRM FIXTURE
              </button>
            </form>
          </div>
        )}

        {/* MATCH LIST SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '10px' }}>SCHEDULED FIXTURES ({matches.length})</h2>
          {matches.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(30, 41, 59, 0.2)', borderRadius: '24px' }}>
              <p style={{ color: '#64748b' }}>Your match schedule is currently empty.</p>
            </div>
          ) : (
            matches.map((match) => (
              <div key={match.id} style={{ padding: '20px 30px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
                <div style={{ fontWeight: '800', textAlign: 'right' }}>
                  {match.team1Name}
                  {match.status === 'Completed' && (
                    <div style={{ fontSize: '24px', color: theme.primary }}>{match.score1Full || match.score1}</div>
                  )}
                </div>
                
                <div style={{ padding: '0 50px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: theme.primary, fontWeight: 'bold', marginBottom: '5px' }}>{match.matchStage || 'Group Stage'}</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>{match.matchDate} • {match.matchTime || 'TBA'}</div>
                  
                  {editingScoreId === match.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', margin: '15px 0' }}>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>TEAM 1 SCORE</label>
                          <input type="text" value={scoreData.team1ScoreFull} onChange={e => setScoreData({...scoreData, team1ScoreFull: e.target.value})} style={{ width: '100px', textAlign: 'center', background: '#1e293b', color: 'white', border: `1px solid ${theme.primary}`, borderRadius: '6px', padding: '8px' }} placeholder="e.g. 207-6 (20)" />
                        </div>
                        <span style={{ color: 'white', fontWeight: 'bold', marginTop: '15px' }}>VS</span>
                        <div style={{ textAlign: 'center' }}>
                          <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>TEAM 2 SCORE</label>
                          <input type="text" value={scoreData.team2ScoreFull} onChange={e => setScoreData({...scoreData, team2ScoreFull: e.target.value})} style={{ width: '100px', textAlign: 'center', background: '#1e293b', color: 'white', border: `1px solid ${theme.primary}`, borderRadius: '6px', padding: '8px' }} placeholder="e.g. 104 (19)" />
                        </div>
                      </div>

                      <div style={{ width: '100%' }}>
                        <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', textAlign: 'center' }}>RESULT SUMMARY</label>
                        <input type="text" value={scoreData.resultSummary} onChange={e => setScoreData({...scoreData, resultSummary: e.target.value})} style={{ width: '100%', background: '#1e293b', color: 'white', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: '6px', padding: '8px', fontSize: '12px' }} placeholder="Brief result description..." />
                      </div>


                      <div style={{ width: '100%', marginTop: '10px' }}>
                        <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', textAlign: 'center' }}>MAN OF THE MATCH</label>
                        <select value={scoreData.manOfTheMatch} onChange={e => setScoreData({...scoreData, manOfTheMatch: e.target.value})} style={{ width: '100%', background: '#1e293b', color: 'white', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: '6px', padding: '8px', fontSize: '12px' }}>
                          <option value="">Select Player</option>
                          {(tournament.players || []).filter(p => p.team === match.team1Name || p.team === match.team2Name).map((p, idx) => (
                            <option key={idx} value={p.name}>{p.name} ({p.team})</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ width: '100%', marginTop: '15px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ margin: '0 0 10px', color: theme.primary, fontSize: '12px', textAlign: 'left' }}>Add Player Performance</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '5px' }}>
                          <select value={newPerformance.playerName} onChange={e => setNewPerformance({...newPerformance, playerName: e.target.value})} style={{ background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '5px', fontSize: '11px' }}>
                            <option value="">Select Player</option>
                            {(tournament.players || []).filter(p => p.team === match.team1Name || p.team === match.team2Name).map((p, idx) => (
                              <option key={idx} value={p.name}>{p.name}</option>
                            ))}
                          </select>
                          {tournament.sport === 'Cricket' ? (
                            <>
                              <input type="number" placeholder="Runs" value={newPerformance.runs} onChange={e => setNewPerformance({...newPerformance, runs: e.target.value})} style={{ background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '5px', fontSize: '11px' }} />
                              <input type="number" placeholder="Wkts" value={newPerformance.wickets} onChange={e => setNewPerformance({...newPerformance, wickets: e.target.value})} style={{ background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '5px', fontSize: '11px' }} />
                            </>
                          ) : (
                            <input type="number" placeholder={tournament.sport === 'Football' ? 'Goals' : 'Points'} value={tournament.sport === 'Football' ? newPerformance.goals : newPerformance.points} onChange={e => setNewPerformance({...newPerformance, [tournament.sport === 'Football' ? 'goals' : 'points']: e.target.value})} style={{ background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '5px', fontSize: '11px', gridColumn: 'span 2' }} />
                          )}
                          <button type="button" onClick={() => {
                            if (newPerformance.playerName) {
                              setScoreData(prev => ({ ...prev, playerPerformances: [...prev.playerPerformances, { ...newPerformance }] }));
                              setNewPerformance({ playerName: '', goals: 0, runs: 0, wickets: 0, points: 0 });
                            }
                          }} style={{ background: theme.primary, color: 'black', border: 'none', borderRadius: '4px', padding: '5px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>ADD</button>
                        </div>
                        {scoreData.playerPerformances.length > 0 && (
                          <div style={{ marginTop: '10px', fontSize: '11px', textAlign: 'left' }}>
                            {scoreData.playerPerformances.map((perf, idx) => (
                              <div key={idx} style={{ padding: '5px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <strong style={{ color: 'white' }}>{perf.playerName}</strong>: 
                                {tournament.sport === 'Cricket' ? ` ${perf.runs}R ${perf.wickets}W` : tournament.sport === 'Football' ? ` ${perf.goals}G` : ` ${perf.points} Pts`}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: match.status === 'Completed' ? theme.primary : 'white', color: '#0f172a', padding: '2px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '900', display: 'inline-block' }}>
                      {match.status === 'Completed' ? 'FULL TIME' : 'VS'}
                    </div>
                  )}
                  
                  <div style={{ fontSize: '11px', color: theme.primary, marginTop: '5px' }}>{match.venue}</div>
                  {match.status === 'Completed' && match.resultSummary && (
                    <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '5px', fontWeight: 'bold' }}>{match.resultSummary}</div>
                  )}
                  
                  {isOwner && (
                    <div style={{ marginTop: '10px' }}>
                      {editingScoreId === match.id ? (
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button onClick={() => handleSaveScore(match.id, 'Live')} style={{ padding: '8px 15px', fontSize: '10px', background: '#38bdf8', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>UPDATE LIVE</button>
                          <button onClick={() => handleSaveScore(match.id, 'Completed')} style={{ padding: '8px 15px', fontSize: '10px', background: '#00ff85', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>CONCLUDE</button>
                          <button onClick={() => setEditingScoreId(null)} style={{ padding: '8px 15px', fontSize: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>CANCEL</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          {match.status !== 'Completed' && (
                            <button onClick={() => { setEditingScoreId(match.id); setScoreData({ team1Score: match.score1 || '0', team2Score: match.score2 || '0', team1ScoreFull: match.score1Full || (match.score1?.toString() || '0'), team2ScoreFull: match.score2Full || (match.score2?.toString() || '0'), resultSummary: match.resultSummary || '', manOfTheMatch: match.manOfTheMatch || '', playerPerformances: match.playerPerformances || [] }); }} style={{ padding: '6px 15px', fontSize: '11px', background: 'rgba(255,255,255,0.1)', color: 'white', border: `1px solid rgba(255,255,255,0.2)`, borderRadius: '8px', cursor: 'pointer' }}>
                              RECORD RESULT
                            </button>
                          )}
                          <button onClick={() => handleDeleteMatch(match.id)} style={{ padding: '6px 15px', fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: `1px solid rgba(239, 68, 68, 0.2)`, borderRadius: '8px', cursor: 'pointer' }}>
                            DELETE
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div style={{ fontWeight: '800' }}>
                  {match.team2Name}
                  {match.status === 'Completed' && (
                    <div style={{ fontSize: '24px', color: theme.primary }}>{match.score2Full || match.score2}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* STANDINGS OVERRIDE SECTION */}
        {isOwner && (
          <div style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', color: '#94a3b8', margin: 0 }}>TOURNAMENT STANDINGS (MANUAL OVERRIDE)</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => {
                      // Calculate auto-standings and set them as the manual base
                      const teams = tournament.teams || [];
                      const matchesData = matches || [];
                      const auto = teams.map(teamObj => {
                        const name = typeof teamObj === 'string' ? teamObj : teamObj.name;
                        let played = 0, won = 0, lost = 0, drawn = 0, points = 0, netScore = 0;
                        matchesData.forEach(m => {
                          if (m.status === 'Completed' && (m.team1Name === name || m.team2Name === name)) {
                            played++;
                            const isT1 = m.team1Name === name;
                            const s1 = parseInt(m.score1) || 0;
                            const s2 = parseInt(m.score2) || 0;
                            const myS = isT1 ? s1 : s2;
                            const opS = isT1 ? s2 : s1;
                            netScore += (myS - opS);
                            if (myS > opS) { won++; points += 3; }
                            else if (myS < opS) { lost++; }
                            else { drawn++; points += 1; }
                          }
                        });
                        return { teamName: name, played, won, lost, drawn, points, netScore };
                      });
                      setManualStandings(auto);
                      if (!showStandingsEditor) setShowStandingsEditor(true);
                    }}
                    style={{ padding: '8px 15px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                  >
                    SYNC FROM MATCHES
                  </button>
                  {tournament.manualStandings?.length > 0 && (
                    <button onClick={handleResetStandings} style={{ padding: '8px 15px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '11px' }}>RESET TO AUTOMATIC</button>
                  )}
                  <button onClick={() => {
                    if (!showStandingsEditor) {
                      const initial = (tournament.teams || []).map(t => {
                        const name = typeof t === 'string' ? t : t.name;
                        const existing = (tournament.manualStandings || []).find(s => s.teamName === name);
                        return existing || { teamName: name, played: 0, won: 0, lost: 0, drawn: 0, points: 0, netScore: 0 };
                      });
                      setManualStandings(initial);
                    }
                    setShowStandingsEditor(!showStandingsEditor);
                  }} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                    {showStandingsEditor ? 'HIDE EDITOR' : 'EDIT POINTS TABLE'}
                  </button>
                </div>
            </div>

            {showStandingsEditor && (
              <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '20px' }}>Manual changes here override calculations. Net Rate = Net Score / Played.</p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead style={{ color: theme.primary }}>
                      <tr>
                        <th style={{ padding: '10px' }}>TEAM</th>
                        <th style={{ padding: '10px' }}>P</th>
                        <th style={{ padding: '10px' }}>W</th>
                        <th style={{ padding: '10px' }}>L</th>
                        <th style={{ padding: '10px' }}>D/NR</th>
                        <th style={{ padding: '10px' }}>PTS</th>
                        <th style={{ padding: '10px' }}>NET SCORE</th>
                        <th style={{ padding: '10px' }}>NET RATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualStandings.map((s, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '10px', color: 'white', fontWeight: 'bold' }}>{s.teamName}</td>
                          <td style={{ padding: '5px' }}><input type="number" value={s.played} onChange={e => handleStandingsChange(idx, 'played', e.target.value)} style={{ ...inputStyle, padding: '5px', width: '50px' }} /></td>
                          <td style={{ padding: '5px' }}><input type="number" value={s.won} onChange={e => handleStandingsChange(idx, 'won', e.target.value)} style={{ ...inputStyle, padding: '5px', width: '50px' }} /></td>
                          <td style={{ padding: '5px' }}><input type="number" value={s.lost} onChange={e => handleStandingsChange(idx, 'lost', e.target.value)} style={{ ...inputStyle, padding: '5px', width: '50px' }} /></td>
                          <td style={{ padding: '5px' }}><input type="number" value={s.drawn} onChange={e => handleStandingsChange(idx, 'drawn', e.target.value)} style={{ ...inputStyle, padding: '5px', width: '50px' }} /></td>
                          <td style={{ padding: '5px' }}><input type="number" value={s.points} onChange={e => handleStandingsChange(idx, 'points', e.target.value)} style={{ ...inputStyle, padding: '5px', width: '60px', color: theme.primary, fontWeight: 'bold' }} /></td>
                          <td style={{ padding: '5px' }}><input type="number" value={s.netScore} onChange={e => handleStandingsChange(idx, 'netScore', e.target.value)} style={{ ...inputStyle, padding: '5px', width: '80px' }} /></td>
                          <td style={{ padding: '10px', color: '#94a3b8' }}>
                            {(parseFloat(s.netScore || 0) / Math.max(1, parseInt(s.played || 0))).toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={handleSaveStandings} style={{ flex: 2, padding: '12px', background: theme.primary, color: 'black', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>SAVE STANDINGS</button>
                  <button 
                    onClick={async () => {
                      if (window.confirm('Clear all manual overrides and use automatic match calculations?')) {
                        const updatedTournament = { ...tournament, manualStandings: [] };
                        await dataService.updateTournament(id, updatedTournament);
                        setTournament(updatedTournament);
                        setManualStandings([]);
                        setShowStandingsEditor(false);
                      }
                    }}
                    style={{ flex: 1, padding: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    RESET TO AUTOMATIC
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MatchManagement
