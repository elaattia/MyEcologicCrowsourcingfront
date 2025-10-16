// src/services/auth/AuthService.js
import axios from '../api/axiosConfig'; 

const API_URL = '/api/users';

const AuthService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });

    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response.data;
  },

  signup: async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

export default AuthService;
