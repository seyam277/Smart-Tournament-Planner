import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import * as dataService from '../../services/dataService'

const TournamentCreate = () => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    sport: 'Cricket',
    turfId: '',
    slotId: '',
    startDate: '',
    endDate: '',
    format: 'League',
    rules: '',
    maxPlayersPerTeam: 11,
    teams: [],
    players: [],
    budget: {
      total: '',
      food: 0,
      transport: 0,
      venue: 0,
      equipment: 0,
      other: 0
    },
    prizeMoney: {
      first: '',
      second: '',
      third: '',
      showToPublic: true
    }
  })
  
  // New States for Turfs & Slots
  const [turfs, setTurfs] = useState([])
  const [slots, setSlots] = useState([])
  const [turfError, setTurfError] = useState('')
  const [bookingStatus, setBookingStatus] = useState('')
  const [error, setError] = useState('')
  const [newTeam, setNewTeam] = useState({ name: '', category: 'General', budget: 0 })
  const [newPlayer, setNewPlayer] = useState({ name: '', role: '', team: '', jerseyNumber: '' })

  const loadTournamentData = async () => {
    try {
      const data = await dataService.getTournamentById(id)
      if (data) {
        if (user && (data.organizerId === user.id || data.creatorEmail === user.email || data.canEdit)) {
          setFormData({
            ...data,
            teams: data.teams || [],
            players: data.players || [],
            budget: {
              total: '',
              food: 0,
              transport: 0,
              venue: 0,
              equipment: 0,
              other: 0,
              ...(data.budget || {})
            },
            prizeMoney: {
              first: '',
              second: '',
              third: '',
              showToPublic: true,
              ...(data.prizeMoney || {})
            }
          })
        } else {
          setError('You do not have permission to edit this tournament.')
          setTimeout(() => navigate('/tournaments'), 2000)
        }
      }
    } catch (err) {
      setError('Failed to load tournament data for editing.')
    }
  }

  // Load turfs on mount defensively
  useEffect(() => {
    fetch('http://localhost:3001/api/turfs')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) {
          setTurfs(data)
          setTurfError('')
        } else {
          console.warn('Unexpected turfs response:', data)
          setTurfs([])
          setTurfError('Unable to load turfs (invalid data format).')
        }
      })
      .catch(err => {
        console.error('Failed to load turfs:', err)
        setTurfs([])
        setTurfError('Unable to load turfs. Please make sure the backend server is running.')
      })
  }, [])

  // Load available slots whenever turf or date changes
  useEffect(() => {
    if (formData.turfId && formData.startDate) {
      fetch(`http://localhost:3001/api/turfs/${formData.turfId}/slots?date=${formData.startDate}`)
        .then(res => {
          if (!res.ok) throw new Error(`Server returned ${res.status}`)
          return res.json()
        })
        .then(data => {
          if (Array.isArray(data)) {
            setSlots(data)
          } else {
            setSlots([])
          }
        })
        .catch(err => {
          console.error('Failed to load slots:', err)
          setSlots([])
        })
    } else {
      setSlots([])
    }
  }, [formData.turfId, formData.startDate])

  // Load tournament data for editing
  useEffect(() => {
    if (isEdit) {
      loadTournamentData()
    }
  }, [id])

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.turfId) {
        setError('Please select a Turf / Field.')
        return
      }
      if (!formData.startDate) {
        setError('Please select a Start Date.')
        return
      }
      if (!formData.slotId) {
        setError('Please select an available time slot.')
        return
      }
    }
    setError('')
    setCurrentStep(prev => Math.min(prev + 1, 6))
  }
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: value }
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const addPlayer = () => {
    if (newPlayer.name && newPlayer.team) {
      const currentTeamPlayers = formData.players.filter(p => p.team === newPlayer.team).length
      if (currentTeamPlayers >= formData.maxPlayersPerTeam) {
        setError(`Cannot add player. ${newPlayer.team} has reached the maximum of ${formData.maxPlayersPerTeam} players.`)
        setTimeout(() => setError(''), 3000)
        return
      }
      setFormData(prev => ({ ...prev, players: [...prev.players, { ...newPlayer, id: Date.now() }] }))
      setNewPlayer({ name: '', role: '', team: '', jerseyNumber: '' })
    }
  }

  const handleSubmit = async () => {
    setError('')
    if (!formData.turfId || !formData.startDate || !formData.slotId) {
      setError('Please select a Turf, Date, and Time Slot before launching.')
      return
    }
    try {
      if (isEdit) {
        await dataService.updateTournament(id, formData)
      } else {
        const tournamentData = {
          ...formData,
          organizerId: user?.id,
          creatorEmail: user?.email,
          status: 'Active',
          createdAt: new Date().toISOString()
        }
        const newTournament = await dataService.createTournament(tournamentData)
        
        // Handle booking if turf and slot were selected
        if (formData.turfId && formData.slotId) {
          try {
            await fetch('http://localhost:3001/api/turfs/bookings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tournamentId: newTournament._id || newTournament.id,
                fieldId: formData.turfId,
                slotId: formData.slotId,
                date: formData.startDate,
                userId: user?.id || user?._id
              })
            })
          } catch (e) {
            console.error('Failed to create booking', e)
          }
        }
      }
      navigate('/dashboard')
    } catch (err) {
      setError(`Failed to ${isEdit ? 'update' : 'publish'} tournament: ` + err.message)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '14px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    color: 'white',
    outline: 'none',
    fontSize: '15px',
    transition: 'border-color 0.3s'
  }

  const labelStyle = {
    display: 'block',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#94a3b8',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="wizard-content" style={{ textAlign: 'left' }}>
            <h3 style={{ color: '#00ff85', marginBottom: '25px', fontSize: '22px' }}>Tournament Core Details</h3>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Tournament Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Champions League 2026" style={inputStyle} />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Sport Category</label>
              <select name="sport" value={formData.sport} onChange={handleChange} style={inputStyle}>
                <option value="Cricket">Cricket</option>
                <option value="Football">Football</option>
                <option value="Badminton">Badminton</option>
                <option value="Basketball">Basketball</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Select Turf / Field</label>
              {turfError && (
                <div style={{ 
                  padding: '10px 14px', 
                  background: 'rgba(239, 68, 68, 0.12)', 
                  border: '1px solid #ef4444', 
                  borderRadius: '8px', 
                  color: '#f87171', 
                  fontSize: '13px', 
                  marginBottom: '10px' 
                }}>
                  ⚠️ {turfError}
                </div>
              )}
              <select name="turfId" value={formData.turfId} onChange={handleChange} style={inputStyle}>
                <option value="">[ Select a Turf / Field ]</option>
                {Array.isArray(turfs) && turfs.map(t => (
                  <option key={t._id || t.id} value={t._id || t.id}>
                    {t.name} {t.rating ? `(⭐ ${t.rating})` : ''} - {t.location}
                  </option>
                ))}
              </select>
              {formData.turfId && Array.isArray(turfs) && turfs.find(t => (t._id || t.id) === formData.turfId) && (
                <div style={{ marginTop: '10px', fontSize: '13px', color: '#94a3b8' }}>
                  📍 {turfs.find(t => (t._id || t.id) === formData.turfId).location} &nbsp; | &nbsp; 
                  <a href={`/turfs/${formData.turfId}`} target="_blank" rel="noopener noreferrer" style={{ color: '#00ff85', textDecoration: 'underline' }}>View Turf Details</a>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
               <div style={{ flex: 1 }}>
                 <label style={labelStyle}>Start Date</label>
                 <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} style={inputStyle} />
               </div>
               <div style={{ flex: 1 }}>
                 <label style={labelStyle}>End Date</label>
                 <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} style={inputStyle} />
               </div>
               <div style={{ flex: 1 }}>
                 <label style={labelStyle}>Max Players / Team</label>
                 <input type="number" name="maxPlayersPerTeam" value={formData.maxPlayersPerTeam} onChange={handleChange} min="1" style={inputStyle} />
               </div>
            </div>

            {formData.turfId && formData.startDate && (
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Select Available Slot</label>
                {!Array.isArray(slots) || slots.length === 0 ? (
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>No slots available for this date.</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {slots.map(slot => {
                      const sId = slot.id || slot._id
                      const isSelected = formData.slotId === sId
                      return (
                        <div 
                          key={sId} 
                          onClick={() => slot.isAvailable && setFormData({...formData, slotId: sId})}
                          style={{
                            padding: '10px 15px', 
                            borderRadius: '8px', 
                            border: isSelected ? '2px solid #00ff85' : '1px solid #334155',
                            background: slot.isAvailable ? (isSelected ? 'rgba(0, 255, 133, 0.1)' : '#1e293b') : '#0f172a',
                            color: slot.isAvailable ? 'white' : '#64748b',
                            cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                          }}
                        >
                          <span style={{ fontWeight: 'bold' }}>{slot.startTime} - {slot.endTime}</span>
                          <span style={{ fontSize: '12px', color: slot.isAvailable ? '#00ff85' : '#ef4444' }}>
                            {slot.isAvailable ? 'AVAILABLE' : 'BOOKED'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
                {formData.slotId && (
                  <div style={{ marginTop: '10px', fontSize: '14px', color: '#94a3b8' }}>
                    Booking Status: <span style={{ color: '#00ff85', fontWeight: 'bold' }}>PENDING</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      case 2:
        return (
          <div className="wizard-content" style={{ textAlign: 'left' }}>
            <h3 style={{ color: '#00ff85', marginBottom: '25px', fontSize: '22px' }}>Registration: Teams</h3>
            <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <input type="text" value={newTeam.name} onChange={(e) => setNewTeam({...newTeam, name: e.target.value})} placeholder="Team Name" style={inputStyle} />
                <input type="text" value={newTeam.category} onChange={(e) => setNewTeam({...newTeam, category: e.target.value})} placeholder="Category (e.g. U-19)" style={inputStyle} />
                <input type="number" value={newTeam.budget} onChange={(e) => setNewTeam({...newTeam, budget: e.target.value})} placeholder="Allocated Budget" style={inputStyle} />
              </div>
              <button type="button" onClick={() => {
                if (newTeam.name) {
                  setFormData(prev => ({ ...prev, teams: [...prev.teams, { ...newTeam, id: Date.now() }] }));
                  setNewTeam({ name: '', category: 'General', budget: 0 });
                }
              }} className="btn" style={{ width: '100%', background: '#00ff85', color: '#0f172a', fontWeight: 'bold', padding: '12px', borderRadius: '12px' }}>ADD TEAM</button>
            </div>
            <div className="team-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {formData.teams.map((team, index) => (
                <div key={index} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid #334155', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '15px' }}>{team.name}</strong>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{team.category} • ${team.budget}</div>
                  </div>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, teams: prev.teams.filter((_, i) => i !== index) }))} style={{ color: '#ff4d4d', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>REMOVE</button>
                </div>
              ))}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="wizard-content" style={{ textAlign: 'left' }}>
            <h3 style={{ color: '#00ff85', marginBottom: '25px', fontSize: '22px' }}>Drafting: Players</h3>
            <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '25px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '25px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={labelStyle}>Player Name</label>
                  <input type="text" placeholder="Full Name" value={newPlayer.name} onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Role / Specialty</label>
                  <input type="text" placeholder="e.g. Striker, Bowler" value={newPlayer.role} onChange={(e) => setNewPlayer({ ...newPlayer, role: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Assign to Team</label>
                  <select value={newPlayer.team} onChange={(e) => setNewPlayer({ ...newPlayer, team: e.target.value })} style={inputStyle}>
                    <option value="">Select Team</option>
                    {formData.teams.map((t, i) => <option key={i} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Jersey Number</label>
                  <input type="text" placeholder="e.g. 10" value={newPlayer.jerseyNumber} onChange={(e) => setNewPlayer({ ...newPlayer, jerseyNumber: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <button type="button" onClick={addPlayer} className="btn" style={{ width: '100%', background: '#38bdf8', color: '#0f172a', fontWeight: 'bold', padding: '15px', borderRadius: '12px' }}>Register Player</button>
            </div>
            <div className="player-list">
               <h4 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '15px' }}>CURRENT ROSTER ({formData.players.length})</h4>
               {formData.players.map((p) => (
                 <div key={p.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', border: '1px solid #334155', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <strong style={{ color: 'white' }}>{p.name}</strong> 
                     {p.jerseyNumber && <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '5px' }}>#{p.jerseyNumber}</span>}
                     {' '}• <span style={{ color: '#38bdf8' }}>{p.role}</span> • <span style={{ color: '#00ff85' }}>{p.team}</span>
                   </div>
                   <button type="button" onClick={() => setFormData(prev => ({ ...prev, players: prev.players.filter(player => player.id !== p.id) }))} style={{ color: '#ff4d4d', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px' }}>REMOVE</button>
                 </div>
               ))}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="wizard-content" style={{ textAlign: 'left' }}>
            <h3 style={{ color: '#00ff85', marginBottom: '25px', fontSize: '22px' }}>Financial: Budgeting</h3>
            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label style={labelStyle}>Overall Tournament Budget ($)</label>
              <input type="number" name="budget.total" value={formData.budget.total} onChange={handleChange} placeholder="e.g. 50000" style={inputStyle} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
               <div>
                 <label style={labelStyle}>Food & Catering ($)</label>
                 <input type="number" name="budget.food" value={formData.budget.food} onChange={handleChange} placeholder="0" style={inputStyle} />
               </div>
               <div>
                 <label style={labelStyle}>Transportation ($)</label>
                 <input type="number" name="budget.transport" value={formData.budget.transport} onChange={handleChange} placeholder="0" style={inputStyle} />
               </div>
               <div>
                 <label style={labelStyle}>Venue / Security ($)</label>
                 <input type="number" name="budget.venue" value={formData.budget.venue} onChange={handleChange} placeholder="0" style={inputStyle} />
               </div>
               <div>
                 <label style={labelStyle}>Equipment & Kits ($)</label>
                 <input type="number" name="budget.equipment" value={formData.budget.equipment} onChange={handleChange} placeholder="0" style={inputStyle} />
               </div>
               <div>
                 <label style={labelStyle}>Other Expenses ($)</label>
                 <input type="number" name="budget.other" value={formData.budget.other} onChange={handleChange} placeholder="0" style={inputStyle} />
               </div>
            </div>

            <div style={{ padding: '25px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', borderRadius: '16px' }}>
               <p style={{ margin: 0, color: '#38bdf8', fontWeight: '600' }}>
                 💡 The total above will be used to track your spending efficiency in the Tournament Hub.
               </p>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="wizard-content" style={{ textAlign: 'left' }}>
            <h3 style={{ color: '#00ff85', marginBottom: '25px', fontSize: '22px' }}>Rewards: Prize Pool</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div>
                 <label style={labelStyle}>Winner Prize Pool ($)</label>
                 <input type="number" name="prizeMoney.first" value={formData.prizeMoney.first} onChange={handleChange} style={inputStyle} />
               </div>
               <div>
                 <label style={labelStyle}>Runner Up Reward ($)</label>
                 <input type="number" name="prizeMoney.second" value={formData.prizeMoney.second} onChange={handleChange} style={inputStyle} />
               </div>
               <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <input 
                   type="checkbox" 
                   checked={formData.prizeMoney.showToPublic}
                   onChange={(e) => setFormData({
                     ...formData,
                     prizeMoney: { ...formData.prizeMoney, showToPublic: e.target.checked }
                   })}
                 />
                 <label style={{ color: 'white', fontSize: '13px' }}>Show Prize Pool to Public</label>
               </div>
            </div>
          </div>
        )
      case 6:
        return (
          <div className="wizard-content" style={{ textAlign: 'left' }}>
            <h3 style={{ color: '#00ff85', marginBottom: '25px', fontSize: '22px' }}>Final Review & Launch</h3>
            <div style={{ padding: '30px', background: '#1e293b', border: '1px solid #334155', borderRadius: '24px' }}>
               <h4 style={{ color: '#38bdf8', marginTop: 0, marginBottom: '20px' }}>Tournament Summary</h4>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>NAME: <span style={{ color: 'white', fontWeight: 'bold' }}>{formData.name}</span></div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>SPORT: <span style={{ color: 'white', fontWeight: 'bold' }}>{formData.sport}</span></div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>TURF: <span style={{ color: '#00ff85', fontWeight: 'bold' }}>{turfs.find(t => (t._id || t.id) === formData.turfId)?.name || '-'}</span></div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>DATE: <span style={{ color: '#00ff85', fontWeight: 'bold' }}>{formData.startDate}</span></div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>SLOT: <span style={{ color: '#00ff85', fontWeight: 'bold' }}>{slots.find(s => s.id === formData.slotId)?.startTime} – {slots.find(s => s.id === formData.slotId)?.endTime}</span></div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>BOOKING STATUS: <span style={{ color: '#facc15', fontWeight: 'bold' }}>PENDING</span></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>TEAMS: <span style={{ color: '#00ff85', fontWeight: 'bold' }}>{formData.teams.length}</span></div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>PLAYERS: <span style={{ color: '#00ff85', fontWeight: 'bold' }}>{formData.players.length}</span></div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>TOTAL BUDGET: <span style={{ color: '#00ff85', fontWeight: 'bold' }}>${formData.budget.total || '0'}</span></div>
                  </div>
               </div>
            </div>
            <div style={{ marginTop: '25px', padding: '20px', background: 'rgba(0, 255, 133, 0.1)', border: '1px solid #00ff85', borderRadius: '16px' }}>
               <p style={{ margin: 0, color: '#00ff85', fontWeight: '700' }}>Everything looks perfect! Your tournament is ready for the world stage.</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '60px 0' }}>
      <div className="container">
        <div style={{ 
          maxWidth: '900px', 
          margin: '0 auto', 
          padding: '50px',
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Glowing Step Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: '#334155', zIndex: 0 }}></div>
            {[1, 2, 3, 4, 5, 6].map(step => (
              <div key={step} style={{ zIndex: 1, textAlign: 'center' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: currentStep >= step ? '#00ff85' : '#1e293b',
                  color: currentStep >= step ? '#0f172a' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  margin: '0 auto 10px',
                  boxShadow: currentStep >= step ? '0 0 15px rgba(0, 255, 133, 0.5)' : 'none',
                  transition: 'all 0.4s ease'
                }}>
                  {step}
                </div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: currentStep >= step ? 'white' : '#64748b', textTransform: 'uppercase' }}>
                  {['Details', 'Teams', 'Players', 'Budget', 'Prize', 'Launch'][step - 1]}
                </div>
              </div>
            ))}
          </div>

          {error && <div style={{ color: '#ff4d4d', padding: '15px', background: 'rgba(255, 77, 77, 0.1)', borderRadius: '12px', border: '1px solid #ff4d4d', marginBottom: '30px' }}>{error}</div>}

          {renderStep()}

          <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between' }}>
            <button 
              type="button" 
              onClick={prevStep} 
              style={{ 
                padding: '15px 40px', 
                borderRadius: '16px', 
                background: 'transparent', 
                border: '1px solid #334155', 
                color: 'white', 
                fontWeight: 'bold',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                opacity: currentStep === 1 ? 0.3 : 1
              }}
              disabled={currentStep === 1}
            >
              Back
            </button>
            
            {currentStep < 6 ? (
              <button 
                type="button" 
                onClick={nextStep} 
                style={{ padding: '15px 50px', borderRadius: '16px', background: '#00ff85', border: 'none', color: '#0f172a', fontWeight: '900', boxShadow: '0 10px 20px rgba(0, 255, 133, 0.2)' }}
              >
                Continue
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleSubmit} 
                style={{ padding: '15px 50px', borderRadius: '16px', background: 'linear-gradient(135deg, #00ff85, #38bdf8)', border: 'none', color: '#0f172a', fontWeight: '900', boxShadow: '0 10px 20px rgba(0, 255, 133, 0.3)' }}
              >
                {isEdit ? 'UPDATE TOURNAMENT' : 'LAUNCH TOURNAMENT'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TournamentCreate
