import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Create
export const addPlayer = async (playerData) => {
  const response = await axios.post(`${API_BASE_URL}/players`, playerData);
  return response.data;
};

// Read all
export const getPlayers = async () => {
  const response = await axios.get(`${API_BASE_URL}/players`);
  return response.data;
};

// Read one
export const getPlayer = async (playerId) => {
  const response = await axios.get(`${API_BASE_URL}/players/${playerId}`);
  return response.data;
};

// Update
export const updatePlayer = async (playerId, playerData) => {
  const response = await axios.put(`${API_BASE_URL}/players/${playerId}`, playerData);
  return response.data;
};

// Delete
export const deletePlayer = async (playerId) => {
  const response = await axios.delete(`${API_BASE_URL}/players/${playerId}`);
  return response.data;
};

// Transfer CRUD
export const addTransfer = async (transferData) => {
  const response = await axios.post(`${API_BASE_URL}/transfers`, transferData);
  return response.data;
};

export const getTransfers = async () => { // Add this function
  const response = await axios.get(`${API_BASE_URL}/transfers`);
  return response.data;
};


// Team CRUD
export const addTeam = async (teamData) => {
  const response = await axios.post(`${API_BASE_URL}/teams`, teamData);
  return response.data;
};

export const getTeams = async () => {
  const response = await axios.get(`${API_BASE_URL}/teams`);
  return response.data;
};

export const getTeam = async (teamId) => {
  const response = await axios.get(`${API_BASE_URL}/teams/${teamId}`);
  return response.data;
};

export const updateTeam = async (teamId, teamData) => {
  const response = await axios.put(`${API_BASE_URL}/teams/${teamId}`, teamData);
  return response.data;
};

export const deleteTeam = async (teamId) => {
  const response = await axios.delete(`${API_BASE_URL}/teams/${teamId}`);
  return response.data;
};

//search
export const searchTeams = async (query) => {
  const response = await axios.get(`${API_BASE_URL}/teams/search?query=${query}`);
  return response.data;
};

export const searchPlayers = async (query) => {
  const response = await axios.get(`${API_BASE_URL}/players/search?query=${query}`);
  return response.data;
};

