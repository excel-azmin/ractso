import axios from 'axios';

const API_URL = process.env.VITE_API_URL;

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};

export const logoutUser = async (token) => {
  await axios.post(`${API_URL}/auth/logout`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const refreshToken = async (token) => {
  const response = await axios.post(`${API_URL}/auth/refresh-token`, {
    refreshToken: token,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.token;
};

export const getCurrentUser = async (token) => {
  const response = await axios.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};