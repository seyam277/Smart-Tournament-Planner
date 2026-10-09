// Frontend API service for backend calls
const API_BASE_URL = 'http://127.0.0.1:3001/api' // Using 127.0.0.1 for better reliability

const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`[API Error] ${url}:`, err.message);
    if (err.message === 'Failed to fetch') {
      throw new Error('Could not connect to the server. Please make sure the backend is running on port 3001.');
    }
    throw err;
  }
};

// Auth endpoints
export const authAPI = {
  register: async (name, email, password, phone = '') => {
    return safeFetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone })
    });
  },

  login: async (email, password) => {
    return safeFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  },

  forgotPassword: async (email) => {
    return safeFetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  },

  resetPassword: async (token, newPassword) => {
    return safeFetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
  }
}

// Tournament endpoints
export const tournamentAPI = {
  getAll: async (token = null) => {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    return safeFetch(`${API_BASE_URL}/tournaments`, { headers });
  },

  getById: async (id, token = null) => {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    return safeFetch(`${API_BASE_URL}/tournaments/${id}`, { headers });
  },

  create: async (tournamentData, token) => {
    return safeFetch(`${API_BASE_URL}/tournaments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(tournamentData)
    });
  },

  update: async (id, tournamentData, token) => {
    return safeFetch(`${API_BASE_URL}/tournaments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(tournamentData)
    });
  },

  delete: async (id, token) => {
    return safeFetch(`${API_BASE_URL}/tournaments/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
  },

  getMyTournaments: async (token) => {
    return safeFetch(`${API_BASE_URL}/tournaments/my-tournaments`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
  }
}

export default {
  authAPI,
  tournamentAPI
}
