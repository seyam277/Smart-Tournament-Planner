import React, { useState } from 'react';
import { getSportTheme } from '../../utils/theme';
import * as dataService from '../../services/dataService';

const TournamentDashboard = ({ tournament, isOwner, setTournament, setActiveTab }) => {
  const theme = getSportTheme(tournament.sport);
  const [isEditingMatchSummary, setIsEditingMatchSummary] = useState(false);
  const [manualMatchSummary, setManualMatchSummary] = useState([]);
  const [isEditingTournamentSummary, setIsEditingTournamentSummary] = useState(false);
  const [manualTournamentSummary, setManualTournamentSummary] = useState({ total: 0, completed: 0, live: 0, upcoming: 0 });
  const [isEditingTopPerformers, setIsEditingTopPerformers] = useState(false);
  const [manualTopPerformers, setManualTopPerformers] = useState([]);
  const [isEditingMatchLogs, setIsEditingMatchLogs] = useState(false);
  const [manualMatchLogs, setManualMatchLogs] = useState([]);

  // --- Leaderboard Calculation (Shared logic) ---
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const calculateStandings = (tourney) => {
    const teams = tourney.teams || [];
    const matches = tourney.matches || [];
    
    return teams.map(teamObj => {
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
      const goalsFor = matches.reduce((acc, m) => {
        if (m.status === 'Completed') {
          if (m.team1Name === teamName) return acc + (parseInt(m.score1) || 0);
          if (m.team2Name === teamName) return acc + (parseInt(m.score2) || 0);
        }
        return acc;
      }, 0);
      return { teamName, played, won, lost, drawn, points, netScore, netRate, goalsFor };
    }).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.netScore !== a.netScore) return b.netScore - a.netScore;
      return b.goalsFor - a.goalsFor;
    });
  };

  const autoStandings = calculateStandings(tournament);
  let displayData = tournament.manualStandings?.length > 0 
    ? tournament.manualStandings 
    : autoStandings;

  // --- Match Summary Logic ---
  const handleSaveMatchSummary = async () => {
    try {
      const updatedTournament = { ...tournament, manualMatchSummary };
      await dataService.updateTournament(tournament.id, updatedTournament);
      setTournament(updatedTournament);
      setIsEditingMatchSummary(false);
    } catch(err) { console.error(err); }
  };

  const handleSaveTournamentSummary = async () => {
    try {
      const updatedTournament = { ...tournament, manualTournamentSummary };
      await dataService.updateTournament(tournament.id, updatedTournament);
      setTournament(updatedTournament);
      setIsEditingTournamentSummary(false);
    } catch(err) { console.error(err); }
  };

  const handleSaveTopPerformers = async () => {
    try {
      const updatedTournament = { ...tournament, manualTopPerformers };
      await dataService.updateTournament(tournament.id, updatedTournament);
      setTournament(updatedTournament);
      setIsEditingTopPerformers(false);
    } catch(err) { console.error(err); }
  };

  const handleSaveMatchLogs = async () => {
    try {
      const updatedTournament = { ...tournament, manualMatchLogs };
      await dataService.updateTournament(tournament.id, updatedTournament);
      setTournament(updatedTournament);
      setIsEditingMatchLogs(false);
    } catch(err) { console.error(err); }
  };

  const handleResetTopPerformers = async () => {
    if (window.confirm('Reset stats to automatic calculation?')) {
      const updatedTournament = { ...tournament, manualTopPerformers: [] };
      await dataService.updateTournament(tournament.id, updatedTournament);
      setTournament(updatedTournament);
    }
  };

  // --- Latest Match Calculation ---
  const matches = tournament.matches || [];
  const latestMatch = matches.length > 0 ? [...matches].reverse().find(m => m.status === 'Completed' || m.status === 'Live') || matches[0] : null;

  // Match Center: Show top 3 most relevant matches (Live > Completed > Scheduled)
  const matchCenterMatches = [...matches].sort((a, b) => {
    const statusOrder = { 'Live': 0, 'Completed': 1, 'Scheduled': 2 };
    return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
  }).slice(0, 3);

  // --- Automated Winner Detection ---
  const finalMatch = matches.find(m => m.matchStage === 'Final');
  const isFinalCompleted = finalMatch ? finalMatch.status === 'Completed' : false;
  const allMatchesCompleted = matches.length > 0 && (isFinalCompleted || matches.every(m => m && m.status === 'Completed'));
  const tournamentWinner = (allMatchesCompleted && Array.isArray(displayData) && displayData.length > 0) ? displayData[0] : null;
  const tournamentRunnerUp = (allMatchesCompleted && Array.isArray(displayData) && displayData.length > 1) ? displayData[1] : null;

  // --- Top Performers Calculation (Dynamic from Matches) ---
  const dynamicPlayerStats = {};
  matches.forEach(m => {
    if (m.status === 'Completed' && Array.isArray(m.playerPerformances)) {
      m.playerPerformances.forEach(perf => {
        if (!perf.playerName) return;
        if (!dynamicPlayerStats[perf.playerName]) {
          dynamicPlayerStats[perf.playerName] = { name: perf.playerName, team: '', runs: 0, goals: 0, wickets: 0, points: 0 };
        }
        dynamicPlayerStats[perf.playerName].runs += (parseInt(perf.runs) || 0);
        dynamicPlayerStats[perf.playerName].goals += (parseInt(perf.goals) || 0);
        dynamicPlayerStats[perf.playerName].wickets += (parseInt(perf.wickets) || 0);
        dynamicPlayerStats[perf.playerName].points += (parseInt(perf.points) || 0);
      });
    }
  });

  // Merge with static players array to get team info if possible, or fallback to static stats
  const staticPlayers = Array.isArray(tournament.players) ? [...tournament.players] : [];
  const players = Object.values(dynamicPlayerStats).length > 0 
    ? Object.values(dynamicPlayerStats).map(dp => {
        const staticP = staticPlayers.find(p => p.name === dp.name);
        return { ...dp, team: staticP ? staticP.team : 'Unknown', stats: dp };
      })
    : staticPlayers;

  const topRunScorer = players.length > 0 ? [...players].sort((a, b) => (b.stats?.runs || b.stats?.goals || b.stats?.points || 0) - (a.stats?.runs || a.stats?.goals || a.stats?.points || 0))[0] : null;
  const topWicketTaker = (tournament.sport === 'Cricket' && players.length > 0) ? [...players].sort((a, b) => (b.stats?.wickets || 0) - (a.stats?.wickets || 0))[0] : null;

  // Common UI Styles
  const cardStyle = {
    background: '#151e2e',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    overflow: 'hidden'
  };
  const cardHeaderStyle = {
    padding: '15px 20px',
    borderBottom: '1px solid #1e293b',
    color: '#38bdf8',
    fontWeight: '800',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#0b1120', padding: '20px', borderRadius: '16px', color: '#cbd5e1', fontFamily: '"Inter", sans-serif' }}>

      {/* VIEW-ONLY NOTICE FOR NON-OWNERS */}
      {!isOwner && (
        <div style={{ 
          background: 'rgba(56, 189, 248, 0.08)', 
          border: '1px solid rgba(56, 189, 248, 0.25)', 
          borderRadius: '10px', 
          padding: '12px 20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          fontSize: '13px',
          color: '#38bdf8'
        }}>
          <span style={{ fontSize: '18px' }}>👁️</span>
          <span>You are viewing this tournament in <strong>read-only</strong> mode. Only the tournament organizer can edit records.</span>
        </div>
      )}

      {/* RESTORED: AUTOMATED TOURNAMENT WINNER / LEADER BANNER */}
      {displayData.length > 0 && (displayData[0].played > 0 || allMatchesCompleted) && (
        <div style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 50%, #0f172a 100%)',
          border: `2px solid ${allMatchesCompleted ? '#fdbb2d' : '#38bdf8'}`,
          borderRadius: '16px',
          padding: '30px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 0 40px ${allMatchesCompleted ? 'rgba(253, 187, 45, 0.25)' : 'rgba(56, 189, 248, 0.2)'}`,
        }}>
          <style>{`
            @keyframes trophyPulse {
              0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(253, 187, 45, 0.5)); }
              50% { transform: scale(1.15); filter: drop-shadow(0 0 25px rgba(253, 187, 45, 0.8)); }
              100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(253, 187, 45, 0.5)); }
            }
            @keyframes shimmer {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
          `}</style>
          <div style={{ fontSize: '60px', marginBottom: '10px', animation: allMatchesCompleted ? 'trophyPulse 2s ease-in-out infinite' : 'none' }}>
            {allMatchesCompleted ? '🏆' : '🔥'}
          </div>
          <div style={{ color: allMatchesCompleted ? '#fdbb2d' : '#38bdf8', fontSize: '11px', fontWeight: '900', letterSpacing: '4px', marginBottom: '8px', textTransform: 'uppercase' }}>
            {allMatchesCompleted ? 'TOURNAMENT CHAMPION' : 'CURRENT POINTS LEADER'}
          </div>
          <div style={{ 
            color: 'white', 
            fontSize: '32px', 
            fontWeight: '900', 
            textTransform: 'uppercase',
            background: allMatchesCompleted ? 'linear-gradient(90deg, #fdbb2d, #fff, #fdbb2d)' : 'linear-gradient(90deg, #38bdf8, #fff, #38bdf8)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 3s linear infinite'
          }}>{displayData[0].teamName}</div>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '12px', fontWeight: '600' }}>
            P{displayData[0].played} • W{displayData[0].won} • L{displayData[0].lost} • <span style={{ color: theme.primary }}>{displayData[0].points} PTS</span>
            <span style={{ marginLeft: '10px', color: '#94a3b8' }}>
              ({displayData[0].netScore >= 0 ? '+' : ''}{displayData[0].netScore} {tournament.sport === 'Football' ? 'GD' : 'Diff'})
            </span>
          </div>
          {displayData.length > 1 && (
            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>
                🥈 {allMatchesCompleted ? 'RUNNER UP' : '2ND PLACE'}: {displayData[1].teamName} ({displayData[1].points} PTS)
              </span>
            </div>
          )}
        </div>
      )}

      
      {/* LEADERBOARD */}
      <div style={cardStyle}>
        <div style={{...cardHeaderStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>LEADERBOARD {tournament.manualStandings?.length > 0 && <span style={{fontSize:'10px', color:'#f87171', marginLeft:'10px', background:'rgba(248,113,113,0.1)', padding:'2px 6px', borderRadius:'4px'}}>MANUAL OVERRIDE</span>}</div>
          {isOwner && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {tournament.manualStandings?.length > 0 && (
                <button 
                  onClick={async () => {
                    if (window.confirm('Clear manual standings and auto-calculate from matches?')) {
                      const updatedTournament = { ...tournament, manualStandings: [] };
                      await dataService.updateTournament(tournament.id, updatedTournament);
                      setTournament(updatedTournament);
                    }
                  }}
                  style={{ padding: '6px 12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  SYNC WITH MATCHES
                </button>
              )}
              <button 
                onClick={() => setActiveTab('Matches')}
                style={{ padding: '6px 12px', background: theme.primary, color: 'black', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                MANAGE MATCHES
              </button>
            </div>
          )}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
          <thead style={{ background: '#0f172a', color: '#38bdf8' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>RANK</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>TEAM</th>
              <th style={{ padding: '15px' }}>PLAYED</th>
              <th style={{ padding: '15px' }}>WON</th>
              <th style={{ padding: '15px' }}>LOST</th>
              <th style={{ padding: '15px' }}>{tournament.sport === 'Football' ? 'D' : 'D/NR'}</th>
              <th style={{ padding: '15px' }}>PTS</th>
              <th style={{ padding: '15px' }}>{tournament.sport === 'Cricket' ? 'NET SCORE' : tournament.sport === 'Football' ? 'GD' : 'NET SCORE'}</th>
              <th style={{ padding: '15px' }}>{tournament.sport === 'Cricket' ? 'NET RUN RATE' : tournament.sport === 'Football' ? 'NET GOAL RATE' : 'NET RATE'}</th>
            </tr>
          </thead>
          <tbody>
            {displayData.length > 0 ? displayData.map((team, idx) => {
              const nRate = team.netRate || (team.played > 0 ? (team.netScore / team.played) : 0);
              const nScore = team.netScore || 0;
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>
                    {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'left', color: 'white', fontWeight: 'bold' }}>{team.teamName}</td>
                  <td style={{ padding: '15px' }}>{team.played}</td>
                  <td style={{ padding: '15px' }}>{team.won}</td>
                  <td style={{ padding: '15px' }}>{team.lost}</td>
                  <td style={{ padding: '15px' }}>{team.drawn || team.nr || 0}</td>
                  <td style={{ padding: '15px', color: '#00ff85', fontWeight: 'bold' }}>{team.points}</td>
                  <td style={{ padding: '15px', color: nScore >= 0 ? '#4ade80' : '#ff4d4d' }}>
                    {nScore > 0 ? `+${nScore}` : nScore}
                  </td>
                </tr>
              );
            }) : <tr><td colSpan="9" style={{ padding: '20px' }}>No teams registered yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* DASHBOARD GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* MATCH CENTER */}
          <div style={cardStyle}>
            <div style={{...cardHeaderStyle, display: 'flex', justifyContent: 'space-between'}}>
              <span>MATCH CENTER</span>
              {isOwner && (
                 <button onClick={() => setActiveTab('Matches')} style={{ padding: '4px 10px', fontSize: '10px', background: theme.primary, color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>MANAGE FIXTURES</button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1px', background: '#1e293b', overflowX: 'auto' }}>
              {matchCenterMatches.length > 0 ? matchCenterMatches.map((m, idx) => (
                <div key={idx} style={{ 
                  flex: 1, 
                  minWidth: '250px', 
                  padding: '25px', 
                  background: '#151e2e', 
                  textAlign: 'center',
                  borderRight: idx < matchCenterMatches.length - 1 ? '1px solid #1e293b' : 'none'
                }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '15px', fontWeight: 'bold' }}>
                    {(() => {
                      const originalIdx = matches.findIndex(match => match.id === m.id);
                      const displayIdx = originalIdx !== -1 ? originalIdx + 1 : idx + 1;
                      return `${displayIdx}${getOrdinal(displayIdx)} Match`;
                    })()} • {m.status.toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                     <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '12px', color: 'white', fontWeight: 'bold' }}>{m.team1Name}</div>
                        <div style={{ fontSize: '20px', color: 'white', fontWeight: '900' }}>{m.score1Full || m.score1}</div>
                     </div>
                     <div style={{ color: m.status === 'Live' ? '#ef4444' : '#64748b', fontWeight: '900', fontSize: '12px', padding: '0 10px' }}>
                       {m.status === 'Live' ? 'LIVE' : 'VS'}
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'white', fontWeight: 'bold' }}>{m.team2Name}</div>
                        <div style={{ fontSize: '20px', color: 'white', fontWeight: '900' }}>{m.score2Full || m.score2}</div>
                     </div>
                  </div>
                  <div style={{ fontSize: '10px', color: theme.primary, fontWeight: 'bold', marginTop: '10px' }}>
                    {m.status === 'Completed' ? (m.resultSummary || 'Finished') : (m.matchDate || 'TBD')}
                  </div>
                </div>
              )) : (
                <div style={{ padding: '30px', textAlign: 'center', width: '100%' }}>No matches available.</div>
              )}
            </div>
          </div>

          {/* SCORECARD & BALL BY BALL ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
             <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
               <div style={{...cardHeaderStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <div>SCORECARD</div>
               </div>
               {latestMatch && latestMatch.playerPerformances?.length > 0 ? (
                 <div style={{ padding: '15px', flex: 1 }}>
                   <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                     <div style={{ background: '#1e293b', padding: '5px 15px', borderRadius: '4px', fontSize: '12px', color: 'white' }}>{latestMatch.team1Name || 'Team 1'}</div>
                     <div style={{ background: 'transparent', padding: '5px 15px', borderRadius: '4px', fontSize: '12px', border: '1px solid #1e293b' }}>{latestMatch.team2Name || 'Team 2'}</div>
                   </div>
                   <table style={{ width: '100%', fontSize: '12px', textAlign: 'left' }}>
                     <thead style={{ color: '#38bdf8' }}>
                       <tr>
                         <th style={{ paddingBottom: '10px' }}>PLAYER</th>
                         <th style={{ paddingBottom: '10px', textAlign: 'right' }}>{tournament.sport === 'Football' ? 'G' : tournament.sport === 'Cricket' ? 'R' : 'P'}</th>
                         {tournament.sport === 'Cricket' && <th style={{ paddingBottom: '10px', textAlign: 'right' }}>W</th>}
                       </tr>
                     </thead>
                     <tbody>
                       {latestMatch.playerPerformances.map((perf, idx) => (
                         <tr key={idx} style={{ borderTop: '1px solid #1e293b' }}>
                           <td style={{ padding: '10px 0', color: 'white' }}>{perf.playerName}</td>
                           <td style={{ padding: '10px 0', textAlign: 'right' }}>{tournament.sport === 'Football' ? (perf.goals || 0) : tournament.sport === 'Cricket' ? (perf.runs || 0) : (perf.points || 0)}</td>
                           {tournament.sport === 'Cricket' && <td style={{ padding: '10px 0', textAlign: 'right' }}>{perf.wickets || 0}</td>}
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               ) : (
                 <div style={{ padding: '30px', textAlign: 'center', fontSize: '12px' }}>Scorecard details not logged.</div>
               )}
             </div>

             {/* RECENT EVENTS */}
             <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
                <div style={{...cardHeaderStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>MATCH LOGS</div>
                  {isOwner && (
                    <div>
                      {isEditingMatchLogs ? (
                        <>
                          <button onClick={handleSaveMatchLogs} style={{ padding: '4px 10px', background: '#00ff85', color: 'black', border: 'none', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', marginRight: '5px' }}>SAVE</button>
                          <button onClick={() => setIsEditingMatchLogs(false)} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>CANCEL</button>
                        </>
                      ) : (
                        <button onClick={() => {
                          const baseLogs = tournament.manualMatchLogs?.length > 0 ? tournament.manualMatchLogs : (latestMatch && latestMatch.status === 'Completed' ? [
                            `• Match Concluded`,
                            `• Player of Match: ${latestMatch.manOfTheMatch || 'N/A'}`,
                            `• Venue: ${latestMatch.venue || 'N/A'}`,
                            `• Date: ${latestMatch.matchDate || 'N/A'}`
                          ] : []);
                          setManualMatchLogs(baseLogs);
                          setIsEditingMatchLogs(true);
                        }} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>EDIT LOGS</button>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ padding: '15px', flex: 1, fontSize: '12px' }}>
                   {isEditingMatchLogs ? (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                       {manualMatchLogs.map((log, idx) => (
                         <div key={idx} style={{ display: 'flex', gap: '5px' }}>
                           <input type="text" value={log} onChange={e => { const n = [...manualMatchLogs]; n[idx] = e.target.value; setManualMatchLogs(n); }} style={{ flex: 1, background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px' }} />
                           <button onClick={() => setManualMatchLogs(manualMatchLogs.filter((_, i) => i !== idx))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                         </div>
                       ))}
                       <button onClick={() => setManualMatchLogs([...manualMatchLogs, '• '])} style={{ color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', textAlign: 'left', marginTop: '5px' }}>+ ADD LOG ENTRY</button>
                     </div>
                   ) : (
                     (tournament.manualMatchLogs?.length > 0 ? tournament.manualMatchLogs : (latestMatch && latestMatch.status === 'Completed' ? [
                       `• Match Concluded`,
                       `• Player of Match: ${latestMatch.manOfTheMatch || 'N/A'}`,
                       `• Venue: ${latestMatch.venue || 'N/A'}`,
                       `• Date: ${latestMatch.matchDate || 'N/A'}`
                     ] : [])).length > 0 ? (
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                         {(tournament.manualMatchLogs || (latestMatch && latestMatch.status === 'Completed' ? [
                           `• Match Concluded`,
                           `• Player of Match: ${latestMatch.manOfTheMatch || 'N/A'}`,
                           `• Venue: ${latestMatch.venue || 'N/A'}`,
                           `• Date: ${latestMatch.matchDate || 'N/A'}`
                         ] : [])).map((log, idx) => (
                           <div key={idx} style={{ color: log.startsWith('•') ? '#00ff85' : 'white' }}>{log}</div>
                         ))}
                       </div>
                     ) : (
                       <div style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>Awaiting Match Updates</div>
                     )
                   )}
                </div>
              </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* MATCH DETAILS */}
          <div style={cardStyle}>
            <div style={{...cardHeaderStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>MATCH DETAILS</div>
            </div>
            <div style={{ padding: '15px', fontSize: '12px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                 <div style={{ color: '#94a3b8' }}>Date</div>
                 <div style={{ color: 'white' }}>{latestMatch?.matchDate || 'N/A'}</div>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                 <div style={{ color: '#94a3b8' }}>Venue</div>
                 <div style={{ color: 'white' }}>{latestMatch?.venue || 'N/A'}</div>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                 <div style={{ color: '#94a3b8' }}>Player of the Match</div>
                 <div style={{ color: 'white' }}>{latestMatch?.manOfTheMatch || 'TBD'}</div>
               </div>
            </div>
          </div>

          {/* TOURNAMENT SUMMARY */}
          <div style={cardStyle}>
            <div style={{...cardHeaderStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>TOURNAMENT SUMMARY</div>
              {isOwner && (
                <div>
                  {isEditingTournamentSummary ? (
                    <>
                      <button onClick={handleSaveTournamentSummary} style={{ padding: '4px 10px', background: '#00ff85', color: 'black', border: 'none', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', marginRight: '5px' }}>SAVE</button>
                      <button onClick={() => setIsEditingTournamentSummary(false)} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>CANCEL</button>
                    </>
                  ) : (
                    <button onClick={() => {
                      setManualTournamentSummary({
                        total: tournament.manualTournamentSummary?.total || matches.length,
                        completed: tournament.manualTournamentSummary?.completed || matches.filter(m => m.status === 'Completed').length,
                        live: tournament.manualTournamentSummary?.live || matches.filter(m => m.status === 'Live').length,
                        upcoming: tournament.manualTournamentSummary?.upcoming || matches.filter(m => m.status === 'Scheduled').length
                      });
                      setIsEditingTournamentSummary(true);
                    }} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>EDIT SUMMARY</button>
                  )}
                  {tournament && (
                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '8px', marginBottom: '2px' }}>SPORT</label>
                      <select 
                        value={tournament.sport || 'Cricket'} 
                        onChange={async (e) => {
                          const updatedTournament = { ...tournament, sport: e.target.value };
                          await dataService.updateTournament(tournament.id, updatedTournament);
                          setTournament(updatedTournament);
                        }}
                        style={{ background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 4px', fontSize: '10px' }}
                      >
                        <option value="Cricket">Cricket</option>
                        <option value="Football">Football</option>
                        <option value="Basketball">Basketball</option>
                        <option value="Tennis">Tennis</option>
                        <option value="Badminton">Badminton</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ padding: '15px', fontSize: '12px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                 <div style={{ color: '#94a3b8' }}>Total Matches</div>
                 {isEditingTournamentSummary ? (
                   <input type="number" value={manualTournamentSummary.total} onChange={e => setManualTournamentSummary({...manualTournamentSummary, total: e.target.value})} style={{ width: '50px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px' }} />
                 ) : (
                   <div style={{ color: 'white', fontWeight: 'bold' }}>{tournament.manualTournamentSummary?.total || matches.length}</div>
                 )}
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                 <div style={{ color: '#94a3b8' }}>Completed</div>
                 {isEditingTournamentSummary ? (
                   <input type="number" value={manualTournamentSummary.completed} onChange={e => setManualTournamentSummary({...manualTournamentSummary, completed: e.target.value})} style={{ width: '50px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px' }} />
                 ) : (
                   <div style={{ color: '#00ff85', fontWeight: 'bold' }}>{tournament.manualTournamentSummary?.completed || matches.filter(m => m.status === 'Completed').length}</div>
                 )}
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                 <div style={{ color: '#94a3b8' }}>Live</div>
                 {isEditingTournamentSummary ? (
                   <input type="number" value={manualTournamentSummary.live} onChange={e => setManualTournamentSummary({...manualTournamentSummary, live: e.target.value})} style={{ width: '50px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px' }} />
                 ) : (
                   <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{tournament.manualTournamentSummary?.live || matches.filter(m => m.status === 'Live').length}</div>
                 )}
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                 <div style={{ color: '#94a3b8' }}>Upcoming</div>
                 {isEditingTournamentSummary ? (
                   <input type="number" value={manualTournamentSummary.upcoming} onChange={e => setManualTournamentSummary({...manualTournamentSummary, upcoming: e.target.value})} style={{ width: '50px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px' }} />
                 ) : (
                   <div style={{ color: '#38bdf8', fontWeight: 'bold' }}>{tournament.manualTournamentSummary?.upcoming || matches.filter(m => m.status === 'Scheduled' || m.status === 'Upcoming').length}</div>
                 )}
               </div>
               {tournamentWinner && (
                 <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #fdbb2d' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <div style={{ color: '#fdbb2d', fontWeight: 'bold' }}>{matches.filter(m => m.status === 'Completed').length === matches.length ? '🏆 Champion' : '🔥 Current Leader'}</div>
                     <div style={{ color: '#fdbb2d', fontWeight: '900' }}>{tournamentWinner.teamName}</div>
                   </div>
                   {tournamentRunnerUp && (
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <div style={{ color: '#c0c0c0', fontWeight: 'bold' }}>🥈 {matches.filter(m => m.status === 'Completed').length === matches.length ? 'Runner Up' : '2nd Place'}</div>
                       <div style={{ color: '#c0c0c0', fontWeight: '700' }}>{tournamentRunnerUp.teamName}</div>
                     </div>
                   )}
                 </div>
               )}
               {!tournamentWinner && matches.length > 0 && (
                 <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #38bdf8' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <div style={{ color: '#38bdf8', fontWeight: 'bold' }}>Current Leader</div>
                     <div style={{ color: '#38bdf8', fontWeight: '700' }}>{displayData.length > 0 ? displayData[0].teamName : 'TBD'}</div>
                   </div>
                 </div>
               )}
            </div>
          </div>

          {/* TOP PERFORMERS */}
          <div style={cardStyle}>
            <div style={{...cardHeaderStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>TOP PERFORMERS</div>
              {isOwner && (
                <div>
                  {isEditingTopPerformers ? (
                    <>
                      <button onClick={handleSaveTopPerformers} style={{ padding: '4px 10px', background: '#00ff85', color: 'black', border: 'none', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', marginRight: '5px' }}>SAVE</button>
                      <button onClick={() => setIsEditingTopPerformers(false)} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>CANCEL</button>
                   </>
                  ) : (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {tournament.manualTopPerformers?.length > 0 && (
                        <button onClick={handleResetTopPerformers} style={{ padding: '4px 8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>RESET</button>
                      )}
                      <button onClick={() => {
                        const baseTop = tournament.manualTopPerformers?.length > 0 ? tournament.manualTopPerformers : [
                          { label: tournament.sport === 'Football' ? 'Top Goal Scorer' : tournament.sport === 'Cricket' ? 'Top Run Scorer' : 'MVP', name: topRunScorer?.name || 'N/A', team: topRunScorer?.team || 'N/A', value: topRunScorer?.stats?.runs || topRunScorer?.stats?.goals || topRunScorer?.stats?.points || 0, suffix: tournament.sport === 'Football' ? 'Goals' : tournament.sport === 'Cricket' ? 'Runs' : 'Points' },
                          ...(tournament.sport === 'Cricket' ? [{ label: 'Top Wicket Taker', name: topWicketTaker?.name || 'N/A', team: topWicketTaker?.team || 'N/A', value: topWicketTaker?.stats?.wickets || 0, suffix: 'Wickets' }] : [])
                        ];
                        setManualTopPerformers(baseTop);
                        setIsEditingTopPerformers(true);
                      }} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>EDIT STATS</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {isEditingTopPerformers ? (
                manualTopPerformers.map((perf, idx) => (
                  <div key={idx} style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <input type="text" value={perf.label} onChange={e => { const n = [...manualTopPerformers]; n[idx].label = e.target.value; setManualTopPerformers(n); }} style={{ background: 'transparent', color: '#38bdf8', fontSize: '10px', border: 'none', borderBottom: '1px solid #334155' }} />
                    <input type="text" value={perf.name} onChange={e => { const n = [...manualTopPerformers]; n[idx].name = e.target.value; setManualTopPerformers(n); }} placeholder="Player Name" style={{ background: 'transparent', color: 'white', fontSize: '12px', border: 'none', borderBottom: '1px solid #334155' }} />
                    <input type="text" value={perf.team} onChange={e => { const n = [...manualTopPerformers]; n[idx].team = e.target.value; setManualTopPerformers(n); }} placeholder="Team" style={{ background: 'transparent', color: '#94a3b8', fontSize: '10px', border: 'none', borderBottom: '1px solid #334155' }} />
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <input type="number" value={perf.value} onChange={e => { const n = [...manualTopPerformers]; n[idx].value = e.target.value; setManualTopPerformers(n); }} style={{ width: '50px', background: 'transparent', color: 'white', fontSize: '11px', border: 'none', borderBottom: '1px solid #334155' }} />
                      <input type="text" value={perf.suffix} onChange={e => { const n = [...manualTopPerformers]; n[idx].suffix = e.target.value; setManualTopPerformers(n); }} style={{ flex: 1, background: 'transparent', color: '#94a3b8', fontSize: '10px', border: 'none', borderBottom: '1px solid #334155' }} />
                    </div>
                  </div>
                ))
              ) : (
                (tournament.manualTopPerformers || (topRunScorer ? [
                  { label: tournament.sport === 'Football' ? 'Top Goal Scorer' : tournament.sport === 'Cricket' ? 'Top Run Scorer' : 'MVP', name: topRunScorer.name, team: topRunScorer.team, value: topRunScorer.stats?.runs || topRunScorer.stats?.goals || topRunScorer.stats?.points || 0, suffix: tournament.sport === 'Football' ? 'Goals' : tournament.sport === 'Cricket' ? 'Runs' : 'Points' },
                  ...(topWicketTaker ? [{ label: 'Top Wicket Taker', name: topWicketTaker.name, team: topWicketTaker.team, value: topWicketTaker.stats?.wickets || 0, suffix: 'Wickets' }] : [])
                ] : [])).length > 0 ? (
                  (tournament.manualTopPerformers || (topRunScorer ? [
                    { label: tournament.sport === 'Football' ? 'Top Goal Scorer' : tournament.sport === 'Cricket' ? 'Top Run Scorer' : 'MVP', name: topRunScorer.name, team: topRunScorer.team, value: topRunScorer.stats?.runs || topRunScorer.stats?.goals || topRunScorer.stats?.points || 0, suffix: tournament.sport === 'Football' ? 'Goals' : tournament.sport === 'Cricket' ? 'Runs' : 'Points' },
                    ...(topWicketTaker ? [{ label: 'Top Wicket Taker', name: topWicketTaker.name, team: topWicketTaker.team, value: topWicketTaker.stats?.wickets || 0, suffix: 'Wickets' }] : [])
                  ] : [])).map((perf, idx) => {
                    // FORCE SPORT LABELS EVEN FOR MANUAL ENTRIES IF THEY MATCH OLD TERMS
                    let displayLabel = perf.label;
                    let displaySuffix = perf.suffix;
                    if (tournament.sport === 'Football') {
                      if (displayLabel.includes('Run Scorer')) displayLabel = displayLabel.replace('Run Scorer', 'Goal Scorer');
                      if (displayLabel.includes('Wicket')) displayLabel = 'Top Assist/Defender'; // Or hide
                      if (displaySuffix === 'Runs') displaySuffix = 'Goals';
                    }
                    if (tournament.sport === 'Football' && displayLabel.includes('Top Wicket Taker')) return null;

                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👤</div>
                        <div>
                          <div style={{ color: '#38bdf8', fontSize: '11px', marginBottom: '2px' }}>{displayLabel}</div>
                          <div style={{ color: 'white', fontSize: '13px', fontWeight: 'bold' }}>{perf.name} <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>({perf.team})</span></div>
                          <div style={{ fontSize: '11px' }}>{perf.value} {displaySuffix}</div>
                        </div>
                      </div>
                    );
                  })
                ) : <div style={{ fontSize: '12px' }}>No stats available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TOURNAMENT MATCH SUMMARY TABLE */}
      <div style={cardStyle}>
        <div style={{...cardHeaderStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>TOURNAMENT MATCH SUMMARY TABLE</div>
          {isOwner && (
            <div>
              {isEditingMatchSummary ? (
                <>
                  <button onClick={handleSaveMatchSummary} style={{ padding: '6px 15px', background: '#00ff85', color: 'black', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginRight: '10px' }}>SAVE</button>
                  <button onClick={() => setIsEditingMatchSummary(false)} style={{ padding: '6px 15px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>CANCEL</button>
                </>
              ) : (
                <div style={{ display: 'flex', gap: '5px' }}>
                  {tournament.manualMatchSummary?.length > 0 && (
                    <button 
                      onClick={async () => {
                        if (window.confirm('Clear manual edits and sync with latest match data?')) {
                          const updatedTournament = { ...tournament, manualMatchSummary: [] };
                          await dataService.updateTournament(tournament.id, updatedTournament);
                          setTournament(updatedTournament);
                        }
                      }}
                      style={{ padding: '6px 12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      SYNC WITH MATCHES
                    </button>
                  )}
                  <button onClick={() => {
                    const baseSummary = matches.map((m, idx) => {
                      let winnerName = '-';
                      let margin = '-';
                      const s = tournament.sport || 'Cricket';
                      const unit = s === 'Football' ? 'goals' : s === 'Cricket' ? 'runs' : 'pts';
                      
                      if (m.status === 'Completed') {
                        const s1 = parseInt(m.score1) || 0;
                        const s2 = parseInt(m.score2) || 0;
                        if (s1 > s2) { winnerName = m.team1Name; margin = `${s1 - s2} ${unit}`; }
                        else if (s2 > s1) { winnerName = m.team2Name; margin = `${s2 - s1} ${unit}`; }
                        else { winnerName = 'Draw'; margin = '-'; }
                      }
                      
                      let matchTopScorer = '-';
                      let matchTopWicketTaker = '-';
                      if (m.playerPerformances && m.playerPerformances.length > 0) {
                        const topS = [...m.playerPerformances].sort((a,b) => (b.runs || b.goals || b.points || 0) - (a.runs || a.goals || a.points || 0))[0];
                        const topVal = topS.runs || topS.goals || topS.points || 0;
                        if (topVal > 0) matchTopScorer = `${topS.playerName} (${topVal})`;
                        
                        if (s === 'Cricket') {
                          const topW = [...m.playerPerformances].sort((a,b) => (b.wickets || 0) - (a.wickets || 0))[0];
                          if (topW && topW.wickets > 0) matchTopWicketTaker = `${topW.playerName} (${topW.wickets})`;
                        }
                      }
                      
                      return {
                        matchNo: m.matchNumber || `${idx + 1}${getOrdinal(idx + 1)} Match`,
                        date: m.matchDate || 'TBD',
                        team1: m.team1Name,
                        team2: m.team2Name,
                        result: m.status === 'Completed' ? (m.score1Full ? `${m.score1Full} vs ${m.score2Full}` : `${m.score1}-${m.score2}`) : 'Upcoming',
                        winner: winnerName,
                        margin,
                        topScorer: matchTopScorer,
                        topWicketTaker: matchTopWicketTaker,
                        playerOfMatch: m.manOfTheMatch || '-'
                      };
                    });
                    setManualMatchSummary(baseSummary);
                    setIsEditingMatchSummary(true);
                  }} style={{ padding: '6px 15px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>EDIT SUMMARY</button>
                </div>
              )}
            </div>
          )}
        </div>
        {displayData.length > 0 && (displayData[0].played > 0 || matches.every(m => m.status === 'Completed')) && (
          <div style={{ background: matches.every(m => m.status === 'Completed') ? 'rgba(253, 187, 45, 0.1)' : 'rgba(56, 189, 248, 0.1)', padding: '15px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: matches.every(m => m.status === 'Completed') ? '#fdbb2d' : '#38bdf8', fontWeight: 'bold', fontSize: '14px' }}>
              {matches.every(m => m.status === 'Completed') ? '🏆 TOURNAMENT CHAMPION' : '🔥 CURRENT LEADER'}: {displayData[0].teamName.toUpperCase()} 
              {matches.every(m => m.status === 'Completed') && tournamentRunnerUp && <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '15px' }}>🥈 RUNNER UP: {tournamentRunnerUp.teamName}</span>}
            </span>
          </div>
        )}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px', whiteSpace: 'nowrap' }}>
            <thead style={{ background: '#0f172a', color: '#94a3b8' }}>
              <tr>
                <th style={{ padding: '15px' }}>MATCH NO.</th>
                <th style={{ padding: '15px' }}>DATE</th>
                <th style={{ padding: '15px' }}>TEAM 1</th>
                <th style={{ padding: '15px' }}>TEAM 2</th>
                <th style={{ padding: '15px' }}>RESULT</th>
                <th style={{ padding: '15px' }}>WINNER</th>
                <th style={{ padding: '15px' }}>MARGIN</th>
                <th style={{ padding: '15px' }}>{tournament.sport === 'Cricket' ? 'TOP RUN SCORER' : tournament.sport === 'Football' ? 'TOP GOAL SCORER' : 'TOP SCORER'}</th>
                {tournament.sport === 'Cricket' && <th style={{ padding: '15px' }}>TOP WICKET TAKER</th>}
                <th style={{ padding: '15px' }}>PLAYER OF THE MATCH</th>
              </tr>
            </thead>
            <tbody>
              {isEditingMatchSummary ? manualMatchSummary.map((m, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '5px' }}><input type="text" value={m.matchNo} onChange={e => { const n = [...manualMatchSummary]; n[idx].matchNo = e.target.value; setManualMatchSummary(n); }} style={{ width: '80px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px' }} /></td>
                  <td style={{ padding: '5px' }}><input type="text" value={m.date} onChange={e => { const n = [...manualMatchSummary]; n[idx].date = e.target.value; setManualMatchSummary(n); }} style={{ width: '80px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px' }} /></td>
                  <td style={{ padding: '5px', color: 'white', fontWeight: 'bold' }}>{m.team1}</td>
                  <td style={{ padding: '5px', color: 'white', fontWeight: 'bold' }}>{m.team2}</td>
                  <td style={{ padding: '5px' }}><input type="text" value={m.result} onChange={e => { const n = [...manualMatchSummary]; n[idx].result = e.target.value; setManualMatchSummary(n); }} style={{ width: '100px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px' }} /></td>
                  <td style={{ padding: '5px' }}><input type="text" value={m.winner} onChange={e => { const n = [...manualMatchSummary]; n[idx].winner = e.target.value; setManualMatchSummary(n); }} style={{ width: '100px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px' }} /></td>
                  <td style={{ padding: '5px' }}><input type="text" value={m.margin} onChange={e => { const n = [...manualMatchSummary]; n[idx].margin = e.target.value; setManualMatchSummary(n); }} style={{ width: '80px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px' }} /></td>
                  <td style={{ padding: '5px' }}><input type="text" value={m.topScorer} onChange={e => { const n = [...manualMatchSummary]; n[idx].topScorer = e.target.value; setManualMatchSummary(n); }} style={{ width: '100px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px' }} /></td>
                  {tournament.sport === 'Cricket' && <td style={{ padding: '5px' }}><input type="text" value={m.topWicketTaker} onChange={e => { const n = [...manualMatchSummary]; n[idx].topWicketTaker = e.target.value; setManualMatchSummary(n); }} style={{ width: '100px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px' }} /></td>}
                  <td style={{ padding: '5px' }}><input type="text" value={m.playerOfMatch} onChange={e => { const n = [...manualMatchSummary]; n[idx].playerOfMatch = e.target.value; setManualMatchSummary(n); }} style={{ width: '100px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px' }} /></td>
                </tr>
              )) : (tournament.manualMatchSummary?.length > 0 ? tournament.manualMatchSummary : matches.map((m, idx) => {
                let win = '-', marg = '-';
                const s = tournament.sport || 'Cricket';
                const unit = s === 'Football' ? 'goals' : s === 'Cricket' ? 'runs' : 'pts';
                if (m.status === 'Completed') {
                  const s1 = parseInt(m.score1) || 0;
                  const s2 = parseInt(m.score2) || 0;
                  if (s1 > s2) { win = m.team1Name; marg = `${s1 - s2} ${unit}`; }
                  else if (s2 > s1) { win = m.team2Name; marg = `${s2 - s1} ${unit}`; }
                  else { win = 'Draw'; marg = '-'; }
                }
                let topS = '-';
                let topW = '-';
                if (m.playerPerformances?.length > 0) {
                  const pS = [...m.playerPerformances].sort((a,b) => (b.runs || b.goals || b.points || 0) - (a.runs || a.goals || a.points || 0))[0];
                  const valS = pS.runs || pS.goals || pS.points || 0;
                  if (valS > 0) topS = `${pS.playerName} (${valS})`;
                  if (s === 'Cricket') {
                    const pW = [...m.playerPerformances].sort((a,b) => (b.wickets || 0) - (a.wickets || 0))[0];
                    if (pW && pW.wickets > 0) topW = `${pW.playerName} (${pW.wickets})`;
                  }
                } else if (m.status === 'Completed' && (parseInt(m.score1) > 0 || parseInt(m.score2) > 0)) {
                  // Fallback if no individual performances recorded yet
                  topS = 'Multi-scorer';
                }
                return { matchNo: `${idx + 1}${getOrdinal(idx + 1)} Match`, date: m.matchDate || 'TBD', team1: m.team1Name, team2: m.team2Name, result: m.status === 'Completed' ? (m.score1Full ? `${m.score1Full} vs ${m.score2Full}` : `${m.score1}-${m.score2}`) : 'Upcoming', winner: win, margin: marg, topScorer: topS, topWicketTaker: topW, playerOfMatch: m.manOfTheMatch || '-' };
              })).map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '15px', color: 'white' }}>{row.matchNo}</td>
                  <td style={{ padding: '15px' }}>{row.date}</td>
                  <td style={{ padding: '15px', color: 'white', fontWeight: 'bold' }}>{row.team1}</td>
                  <td style={{ padding: '15px', color: 'white', fontWeight: 'bold' }}>{row.team2}</td>
                  <td style={{ padding: '15px', color: theme.primary }}>{row.result}</td>
                  <td style={{ padding: '15px', color: '#00ff85', fontWeight: 'bold' }}>{row.winner}</td>
                  <td style={{ padding: '15px' }}>{row.margin}</td>
                  <td style={{ padding: '15px' }}>{row.topScorer}</td>
                  {tournament.sport === 'Cricket' && <td style={{ padding: '15px' }}>{row.topWicketTaker}</td>}
                  <td style={{ padding: '15px', color: '#fdbb2d' }}>{row.playerOfMatch}</td>
                </tr>
              ))}
               {!isEditingMatchSummary && matches.length === 0 && <tr><td colSpan={tournament.sport === 'Cricket' ? "10" : "9"} style={{ padding: '20px' }}>No matches scheduled yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default TournamentDashboard;
