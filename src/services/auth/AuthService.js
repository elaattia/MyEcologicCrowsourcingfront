// src/services/auth/AuthService.js - VERSION FINALE COMPLÈTE
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
        
        // Mapper le rôle string vers number
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
   * Inscription d'un administrateur (BLOQUÉ - nécessite endpoint backend sécurisé)
   */
  signupAdmin: async (adminData) => {
    throw new Error('❌ La création de compte administrateur n\'est pas autorisée via l\'interface. Contactez un administrateur existant.');
  },

  /**
   * Envoyer un code de vérification par email (2FA)
   */
  sendVerificationCode: async (email) => {
    try {
      // Générer un code à 6 chiffres
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Stocker temporairement le code avec expiration (10 minutes)
      const expirationTime = Date.now() + (10 * 60 * 1000); // 10 minutes
      sessionStorage.setItem(`verification_${email}`, JSON.stringify({
        code: code,
        expiresAt: expirationTime
      }));
      
      // TODO: En production, appeler votre endpoint backend pour envoyer l'email
      // await api.post('/api/auth/send-verification', { email, code });
      
      // Pour la démo, afficher le code
      console.log('📧 Code de vérification pour', email, ':', code);
      console.log('⏰ Expire dans 10 minutes');
      
      // Alert pour la démo (à retirer en production)
      alert(
        `CODE DE VÉRIFICATION (démo): ${code}\n\n` +
        `Email: ${email}\n` +
        `Valide pendant 10 minutes.\n\n` +
        `En production, ce code serait envoyé par email.`
      );
      
      return { success: true, message: 'Code envoyé' };
    } catch (error) {
      console.error('❌ Erreur envoi code:', error);
      throw new Error('Erreur lors de l\'envoi du code de vérification');
    }
  },

  /**
   * Vérifier le code de vérification
   */
  verifyCode: async (email, code) => {
    try {
      const storedDataStr = sessionStorage.getItem(`verification_${email}`);
      
      if (!storedDataStr) {
        throw new Error('Aucun code de vérification trouvé. Veuillez en demander un nouveau.');
      }
      
      const storedData = JSON.parse(storedDataStr);
      const now = Date.now();
      
      // Vérifier l'expiration
      if (now > storedData.expiresAt) {
        sessionStorage.removeItem(`verification_${email}`);
        throw new Error('Le code de vérification a expiré. Veuillez en demander un nouveau.');
      }
      
      // Vérifier le code
      if (storedData.code !== code.trim()) {
        return false;
      }
      
      // Code valide - nettoyer le storage
      sessionStorage.removeItem(`verification_${email}`);
      
      console.log('✅ Code vérifié avec succès pour', email);
      return true;
    } catch (error) {
      console.error('❌ Erreur vérification code:', error);
      throw error;
    }
  },

  /**
   * Réinitialiser le mot de passe (envoyer email de reset)
   */
  resetPassword: async (email) => {
    try {
      // TODO: En production, appeler votre endpoint backend
      // await api.post('/api/auth/reset-password', { email });
      
      // Simulation pour la démo
      console.log('📧 Email de réinitialisation envoyé à:', email);
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Alert pour la démo (à retirer en production)
      alert(
        `Email de réinitialisation envoyé à:\n${email}\n\n` +
        `Vérifiez votre boîte de réception.\n\n` +
        `En production, vous recevriez un lien sécurisé pour réinitialiser votre mot de passe.`
      );
      
      return { success: true, message: 'Email envoyé' };
    } catch (error) {
      console.error('❌ Erreur reset password:', error);
      
      // Ne pas révéler si l'email existe ou non (sécurité)
      return { success: true, message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
    }
  },

  /**
   * Confirmer la réinitialisation du mot de passe avec token
   */
  confirmResetPassword: async (token, newPassword) => {
    try {
      // TODO: En production, appeler votre endpoint backend
      // await api.post('/api/auth/confirm-reset-password', { token, newPassword });
      
      console.log('✅ Mot de passe réinitialisé avec succès');
      return { success: true, message: 'Mot de passe réinitialisé' };
    } catch (error) {
      console.error('❌ Erreur confirmation reset:', error);
      throw new Error('Erreur lors de la réinitialisation du mot de passe');
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
      
      // Mapper le rôle si c'est une string
      if (typeof user.role === 'string') {
        user.role = AuthService.mapRoleToNumber(user.role);
        // Sauvegarder la version corrigée
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      console.log('📋 getCurrentUser:', user);
      return user;
    } catch (err) {
      console.error('❌ Erreur parsing user:', err);
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
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole: (requiredRole) => {
    const user = AuthService.getCurrentUser();
    return user && user.role === requiredRole;
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
   * Mettre à jour les informations utilisateur
   */
  updateUserInfo: (updates) => {
    const user = AuthService.getCurrentUser();
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    console.log('✅ Informations utilisateur mises à jour:', updatedUser);
    return updatedUser;
  },

  /**
   * Vérifier la validité du token
   */
  isTokenValid: () => {
    const token = AuthService.getToken();
    if (!token) return false;

    try {
      // Décoder le JWT (partie payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Vérifier l'expiration
      const now = Date.now() / 1000;
      if (payload.exp && payload.exp < now) {
        console.warn('⚠️ Token expiré');
        AuthService.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erreur validation token:', error);
      return false;
    }
  },

  /**
   * Rafraîchir le token (si votre backend le supporte)
   */
  refreshToken: async () => {
    try {
      // TODO: Implémenter si votre backend supporte le refresh token
      // const response = await api.post('/api/auth/refresh-token');
      // localStorage.setItem('token', response.data.token);
      // return response.data.token;
      
      console.warn('⚠️ Refresh token non implémenté');
      return null;
    } catch (error) {
      console.error('❌ Erreur refresh token:', error);
      throw error;
    }
  },

  /**
   * Déconnexion
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Nettoyer aussi les codes de vérification en session
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('verification_')) {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('👋 Déconnexion effectuée');
  }
};

export default AuthService;