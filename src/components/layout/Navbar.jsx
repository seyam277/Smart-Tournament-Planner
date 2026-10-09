import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as dataService from '../../services/dataService';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const tournaments = await dataService.getTournaments();
        const upcomingMatches = [];
        
        tournaments.forEach(t => {
          if (t.teams && t.teams.length >= 2) {
            // Generate a mock match from the first two teams of each tournament
            upcomingMatches.push({
              id: t.id || t._id,
              teams: `${t.teams[0].name || t.teams[0]} vs ${t.teams[1].name || t.teams[1]}`,
              status: 'Upcoming'
            });
          } else {
            // If the tournament has no teams yet, show the tournament name instead
            upcomingMatches.push({
              id: t.id || t._id,
              teams: t.name,
              status: 'Upcoming Tournament'
            });
          }
        });
        
        setMatches(upcomingMatches.slice(0, 3)); // Show top 3
      } catch (err) {
        console.error('Failed to fetch matches for navbar', err);
      }
    };
    fetchMatches();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hide Navbar on Login, Registration, Reset, and Forgot Password pages
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/organizer-login', '/organizer-register'];
  if (authPages.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="navbar" style={{ background: '#0f172a', borderBottom: '1px solid #334155', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
      <div className="container">
        <div className="navbar-top">
          <Link to="/dashboard" className="navbar-logo" style={{ textTransform: 'lowercase', color: '#00ff85', textShadow: '0 0 10px rgba(0, 255, 133, 0.5)' }}>
            tournament hobe
          </Link>
          
          <ul className="navbar-links">
            <li><Link to="/dashboard" style={{ color: '#f8fafc' }}>Dashboard</Link></li>
            <li><Link to="/tournaments" style={{ color: '#f8fafc' }}>Tournaments</Link></li>
            <li><Link to="/tournaments/create" style={{ color: '#f8fafc' }}>Create Tournament</Link></li>
            {user ? (
              <>
                <li style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600' }}>
                   Hi, {user.name || (user.email ? user.email.split('@')[0] : 'Organizer')}
                </li>

                <li>
                  <button 
                    onClick={handleLogout}
                    style={{ background: 'transparent', border: '1px solid #334155', borderRadius: '4px', padding: '5px 15px', color: '#f8fafc', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: 'all 0.3s' }}
                    onMouseOver={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = '#00ff85'; }}
                    onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = '#334155'; }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li><Link to="/login" style={{ color: '#f8fafc' }}>Login</Link></li>
            )}
          </ul>
        </div>
      </div>
      <div className="navbar-sub" style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', whiteSpace: 'nowrap', padding: '10px 0' }}>
            <span style={{ fontWeight: 'bold', color: '#00ff85' }}>LIVE MATCHES</span>
            {matches.length > 0 ? matches.map(m => (
              <span key={m.id} style={{ cursor: 'pointer', color: '#f8fafc', fontSize: '13px' }} onClick={() => navigate(`/tournaments/${m.id}`)}>
                {m.teams} - <span style={{ color: '#94a3b8' }}>{m.status}</span>
              </span>
            )) : (
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>No Upcoming Matches</span>
            )}
          </div>
        </div>
      </div>
    </nav>

  );
};

export default Navbar;

