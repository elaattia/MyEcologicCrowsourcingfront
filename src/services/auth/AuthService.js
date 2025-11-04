// src/services/auth/AuthService.js
import axios from '../api/axiosConfig';

const API_URL = '/api/users';
const ORG_URL = '/api/organisations';

const AuthService = {
  /**
   * LOGIN pour User ET Organisation
   */
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        
        const userInfo = {
          userId: response.data.userId,
          email: response.data.email,
          username: response.data.username,
          role: response.data.role, // 0=User, 1=Representant, 2=Admin
          organisationId: response.data.organisationId || null
        };
        
        localStorage.setItem('user', JSON.stringify(userInfo));
        console.log('✅ Connexion réussie:', userInfo);
      }

      return response.data;
    } catch (err) {
      console.error('❌ Erreur login:', err.response?.data);
      throw new Error(err.response?.data?.message || 'Email ou mot de passe incorrect');
    }
  },

  /**
   * SIGNUP User (Citoyen)
   */
  signupUser: async (userData) => {
    try {
      await axios.post(API_URL, {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        role: 0 // User
      });

      // Auto-login après inscription
      return await AuthService.login(userData.email, userData.password);
    } catch (err) {
      console.error('❌ Erreur signup user:', err.response?.data);
      throw new Error(err.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  },

  /**
   * SIGNUP Organisation
   */
  signupOrganisation: async (orgData) => {
    try {
      const response = await axios.post(ORG_URL, {
        nom: orgData.nom,
        nbrVolontaires: parseInt(orgData.nbrVolontaires, 10),
        repreUsername: orgData.repreUsername,
        repreEmail: orgData.repreEmail,
        reprePassword: orgData.reprePassword
      });

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        
        const userInfo = {
          organisationId: response.data.organisationId,
          email: orgData.repreEmail,
          username: orgData.repreUsername,
          role: 1, // Representant
          organisationName: response.data.nom
        };
        
        localStorage.setItem('user', JSON.stringify(userInfo));
        console.log('✅ Organisation créée:', userInfo);
      }

      return response.data;
    } catch (err) {
      console.error('❌ Erreur signup org:', err.response?.data);
      throw new Error(err.response?.data?.message || 'Erreur création organisation');
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => localStorage.getItem('token'),

  isAuthenticated: () => !!(localStorage.getItem('token') && localStorage.getItem('user')),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ Déconnexion');
  }
};

export default AuthService;