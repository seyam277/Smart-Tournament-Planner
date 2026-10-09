const API_BASE_URL = 'http://127.0.0.1:3001/api'

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

// Generic fetch wrapper
const apiRequest = async (endpoint, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  }
  console.log(`[API] Sending ${options.method || 'GET'} ${endpoint}`, { headers })
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    })
    
    // If token is invalid or expired
    if (response.status === 401) {
      console.error('[Auth] 401 Unauthorized detected. Token:', localStorage.getItem('authToken'))
      // localStorage.removeItem('authToken')
      // localStorage.removeItem('organizerData')
      // window.location.href = '/login'
      const data = await response.json()
      throw new Error(data.error || 'Session expired. Please login again.')
    }

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }
    return data
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error)
    throw error
  }
}

// Tournament Data
export const createTournament = async (tournamentData) => {
  return apiRequest('/tournaments', {
    method: 'POST',
    body: JSON.stringify(tournamentData)
  })
}

export const getTournaments = async (organizerId) => {
  // If organizerId is provided, get specific ones, otherwise get all public ones
  if (organizerId) {
    return apiRequest('/tournaments/my-tournaments')
  }
  return apiRequest('/tournaments/all')
}

export const getTournamentById = async (id) => {
  return apiRequest(`/tournaments/${id}`)
}

export const updateTournament = async (id, tournamentData) => {
  const response = await apiRequest(`/tournaments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tournamentData)
  })
  // Backend returns { message, tournament } - return the tournament
  return response.tournament || response
}

export const deleteTournament = async (id) => {
  return apiRequest(`/tournaments/${id}`, {
    method: 'DELETE'
  })
}

// Team Data
export const registerTeam = async (teamData) => {
  console.warn('registerTeam: Ensure backend supports separate team registration if needed')
  return teamData
}

export const getTeamsByTournament = async (tournamentId) => {
  const tournament = await getTournamentById(tournamentId)
  return tournament.teams || []
}

// Match Data - Matches are embedded in tournaments
export const createMatch = async (matchData) => {
  // Generate a unique ID for the new match
  const newMatch = { 
    ...matchData, 
    id: Date.now().toString(), 
    status: matchData.status || 'Scheduled',
    score1: 0,
    score2: 0,
    playerPerformances: []
  }
  return newMatch
}

export const getMatchesByTournament = async (tournamentId) => {
  const tournament = await getTournamentById(tournamentId)
  return tournament.matches || []
}

export const updateMatch = async (matchId, matchData) => {
  // Matches are updated via tournament update - caller handles this
  return matchData
}

export const recordMatchResult = async (matchId, resultData) => {
  return { id: matchId, ...resultData, status: 'Completed' }
}

// Expense/Budget Data
export const addExpense = async (expenseData) => {
  console.warn('addExpense: Ensure backend supports expenses')
  return expenseData
}

export const getExpensesByTournament = async (tournamentId) => {
  const tournament = await getTournamentById(tournamentId)
  return tournament.expenses || []
}

export const calculateTotalExpenses = async (tournamentId) => {
  const expenses = await getExpensesByTournament(tournamentId)
  return expenses.reduce((total, expense) => total + expense.amount, 0)
}

