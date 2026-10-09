import React from 'react'

const StandingsTable = () => {
  const standingsData = [
    { position: 1, teamName: 'Team A', played: 3, won: 3, lost: 0, points: 9 },
    { position: 2, teamName: 'Team B', played: 3, won: 2, lost: 1, points: 6 },
    { position: 3, teamName: 'Team C', played: 3, won: 1, lost: 2, points: 3 },
    { position: 4, teamName: 'Team D', played: 3, won: 0, lost: 3, points: 0 }
  ]

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--text-h)', marginBottom: '30px' }}>Points Table & Standings</h1>

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
              <th style={{ padding: '12px', textAlign: 'center' }}>Position</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Team Name</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Played</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Won</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Lost</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {standingsData.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid var(--border)` }}>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{row.position}</td>
                <td style={{ padding: '12px' }}>{row.teamName}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{row.played}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#0a0' }}>{row.won}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#c00' }}>{row.lost}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--accent)' }}>{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StandingsTable
