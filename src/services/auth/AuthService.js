// src/services/auth/AuthService.js - CORRECTION COMPLÈTE
import api from '../api/axiosConfig';

const API_URL = '/api/users';
const ORG_URL = '/api/organisations';

const AuthService = {
  /**
   * Mapper le rôle string (backend) vers number (frontend)
   */
  mapRoleToNumber: (role) => {
    if (typeof role === 'number') return role;
    
    const roleMap = {
      'User': 0,
      'Representant': 1,
      'Admin': 2
    };
    
    return roleMap[role] !== undefined ? roleMap[role] : role;
  },

  /**
   * Connexion d'un utilisateur (User, Representant ou Admin)
   */
  login: async (email, password) => {
    try {
      const response = await api.post(`${API_URL}/login`, { email, password });

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        
        // CORRECTION: Mapper le rôle string vers number
        const mappedRole = AuthService.mapRoleToNumber(response.data.role);
        
        const userInfo = {
          userId: response.data.userId,
          email: response.data.email,
          username: response.data.username,
          role: mappedRole, // Toujours un number: 0, 1 ou 2
          organisationId: response.data.organisationId || null
        };
        
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        console.log('✅ Connexion réussie:', {
          ...userInfo,
          roleOriginal: response.data.role,
          roleMapped: mappedRole,
          roleText: userInfo.role === 0 ? 'User' : userInfo.role === 1 ? 'Representant' : 'Admin'
        });

        return userInfo;
      }

      return response.data;
    } catch (err) {
      console.error('❌ Erreur login:', err);
      const message = err.response?.data?.message || 
                      err.response?.data?.error || 
                      err.message || 
                      'Erreur de connexion';
      throw new Error(message);
    }
  },

  /**
   * Inscription d'un utilisateur normal (User)
   */
  signupUser: async (userData) => {
    try {
      const createResponse = await api.post(API_URL, {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        role: 0 // User
      });

      console.log('✅ Utilisateur créé:', createResponse.data);

      // Connexion automatique (retourne userInfo avec role mappé)
      return await AuthService.login(userData.email, userData.password);
    } catch (err) {
      console.error('❌ Erreur signup user:', err);
      const message = err.response?.data?.message || 
                      err.response?.data?.error ||
                      err.response?.data?.errors?.Email?.[0] ||
                      err.response?.data?.errors?.Username?.[0] ||
                      err.response?.data?.errors?.Password?.[0] ||
                      err.message || 
                      'Erreur lors de l\'inscription';
      throw new Error(message);
    }
  },

  /**
   * Inscription d'une organisation (crée automatiquement un Representant)
   */
  signupOrganisation: async (orgData) => {
    try {
      const response = await api.post(ORG_URL, {
        nom: orgData.nom,
        nbrVolontaires: parseInt(orgData.nbrVolontaires, 10),
        repreUsername: orgData.repreUsername,
        repreEmail: orgData.repreEmail,
        reprePassword: orgData.reprePassword
      });

      console.log('📦 Réponse API organisation:', response.data);

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        
        // IMPORTANT: Role toujours en number
        const userInfo = {
          userId: response.data.userId || null,
          organisationId: response.data.organisationId,
          email: orgData.repreEmail,
          username: orgData.repreUsername,
          role: 1, // Representant (toujours en number)
          organisationName: response.data.nom
        };
        
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        console.log('✅ Organisation créée - userInfo sauvegardé:', userInfo);

        return userInfo;
      }

      throw new Error('Token non reçu de l\'API');
    } catch (err) {
      console.error('❌ Erreur signup org:', err);
      const message = err.response?.data?.message || 
                      err.response?.data?.error || 
                      err.message || 
                      'Erreur lors de la création de l\'organisation';
      throw new Error(message);
    }
  },

  /**
   * Inscription d'un administrateur (Role = 2)
   */
  signupAdmin: async (adminData) => {
    try {
      const createResponse = await api.post(API_URL, {
        email: adminData.email,
        username: adminData.username,
        password: adminData.password,
        role: 2 // Admin
      });

      console.log('✅ Admin créé:', createResponse.data);

      // Connexion automatique (retourne userInfo avec role mappé)
      return await AuthService.login(adminData.email, adminData.password);
    } catch (err) {
      console.error('❌ Erreur signup admin:', err);
      const message = err.response?.data?.message || 
                      err.response?.data?.error || 
                      err.message || 
                      'Erreur lors de la création du compte admin';
      throw new Error(message);
    }
  },

  /**
   * Récupérer l'utilisateur courant depuis localStorage
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      
      // CORRECTION: Mapper le rôle si c'est une string
      if (typeof user.role === 'string') {
        user.role = AuthService.mapRoleToNumber(user.role);
        // Sauvegarder la version corrigée
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      console.log('📋 getCurrentUser:', user);
      return user;
    } catch (err) {
      console.error('Erreur parsing user:', err);
      return null;
    }
  },

  /**
   * Récupérer le token JWT
   */
  getToken: () => localStorage.getItem('token'),

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  /**
   * Vérifier si l'utilisateur est un admin (Role = 2)
   */
  isAdmin: () => {
    const user = AuthService.getCurrentUser();
    return user?.role === 2;
  },

  /**
   * Vérifier si l'utilisateur est un représentant d'organisation (Role = 1)
   */
  isRepresentant: () => {
    const user = AuthService.getCurrentUser();
    return user?.role === 1;
  },

  /**
   * Vérifier si l'utilisateur est un citoyen/user normal (Role = 0)
   */
  isUser: () => {
    const user = AuthService.getCurrentUser();
    return user?.role === 0;
  },

  /**
   * Obtenir le texte du rôle
   */
  getRoleText: (role) => {
    const mappedRole = AuthService.mapRoleToNumber(role);
    const roles = {
      0: 'Citoyen',
      1: 'Représentant',
      2: 'Administrateur'
    };
    return roles[mappedRole] || 'Inconnu';
  },

  /**
   * Déconnexion
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('👋 Déconnexion effectuée');
  }
};

export default AuthService;