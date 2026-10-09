import React from 'react'

const AwardManagement = () => {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--text-h)', marginBottom: '30px' }}>Awards & Recognition</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        <AwardSection
          title="Man of the Match"
          icon="🏅"
          description="Award recognition for best performing player in each match"
          matches={[
            { match: 'Team A vs Team B', player: 'Player Name', date: '2024-01-15' },
            { match: 'Team C vs Team D', player: 'Player Name', date: '2024-01-16' }
          ]}
        />
        <AwardSection
          title="Man of the Series"
          icon="🏆"
          description="Award recognition for best overall performer in the tournament"
          matches={[
            { player: 'Best Player', stats: '15 Goals, 5 Assists', date: 'Ongoing' }
          ]}
        />
        <AwardSection
          title="Top Scorers"
          icon="⚽"
          description="Ranking of top goal scorers in the tournament"
          matches={[
            { rank: 1, player: 'Player A', goals: 12 },
            { rank: 2, player: 'Player B', goals: 10 },
            { rank: 3, player: 'Player C', goals: 8 }
          ]}
        />
      </div>
    </div>
  )
}

const AwardSection = ({ title, icon, description, matches }) => (
  <div style={{
    background: 'var(--bg)',
    border: `2px solid var(--accent)`,
    borderRadius: '8px',
    padding: '25px'
  }}>
    <h2 style={{ color: 'var(--text-h)', marginTop: 0 }}>
      {icon} {title}
    </h2>
    <p style={{ color: 'var(--text)', fontSize: '14px', margin: '10px 0 20px 0' }}>
      {description}
    </p>

    <div style={{ background: 'var(--code-bg)', borderRadius: '4px', padding: '15px' }}>
      {matches.map((item, idx) => (
        <div key={idx} style={{ marginBottom: '10px', fontSize: '14px' }}>
          <p style={{ margin: 0, color: 'var(--text)', fontWeight: '600' }}>
            {item.match || item.player || `#${item.rank} ${item.player}`}
          </p>
          <p style={{ margin: '3px 0 0 0', color: 'var(--text)', fontSize: '12px' }}>
            {item.player && `${item.player}`}
            {item.stats && ` • ${item.stats}`}
            {item.goals && ` • ${item.goals} Goals`}
            {item.date && ` • ${item.date}`}
          </p>
        </div>
      ))}
    </div>
  </div>
)

export default AwardManagement
