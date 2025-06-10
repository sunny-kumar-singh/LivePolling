const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const pollService = {
  // Get all polls
  getPolls: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/polls?${queryParams}`, {
      headers: getAuthHeader()
    });
    return response.json();
  },

  // Get poll statistics
  getStats: async () => {
    const response = await fetch(`${API_URL}/polls/stats`, {
      headers: getAuthHeader()
    });
    return response.json();
  },

  // Create a new poll
  createPoll: async (pollData) => {
    const response = await fetch(`${API_URL}/polls`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(pollData)
    });
    return response.json();
  },

  // Get a specific poll
  getPoll: async (pollId) => {
    const response = await fetch(`${API_URL}/polls/${pollId}`, {
      headers: getAuthHeader()
    });
    return response.json();
  },

  // End a poll
  endPoll: async (pollId) => {
    const response = await fetch(`${API_URL}/polls/${pollId}/end`, {
      method: 'PATCH',
      headers: getAuthHeader()
    });
    return response.json();
  },

  // Delete a poll
  deletePoll: async (pollId) => {
    const response = await fetch(`${API_URL}/polls/${pollId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return response.json();
  }
}; 