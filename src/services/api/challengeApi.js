// src/services/api/challengeApi.js
import api from './axiosConfig';

export const challengeApi = {
  // ============ CHALLENGES ============
  
  // Récupérer tous les challenges avec filtres et pagination
  getAllChallenges: async (params) => {
    const response = await api.get('/api/challenges', { params });
    return response.data;
  },

  // Récupérer un challenge par ID
  getChallengeById: async (id) => {
    const response = await api.get(`/api/challenges/${id}`);
    return response.data;
  },

  // Récupérer les challenges actifs
  getActiveChallenges: async () => {
    const response = await api.get('/api/challenges/active');
    return response.data;
  },

  // Récupérer les challenges en vedette
  getFeaturedChallenges: async () => {
    const response = await api.get('/api/challenges/featured');
    return response.data;
  },

  // Récupérer les challenges par type
  getChallengesByType: async (type, limit = 10) => {
    const response = await api.get(`/api/challenges/type/${type}`, { 
      params: { limit } 
    });
    return response.data;
  },

  // Créer un nouveau challenge (Admin/Representant uniquement)
  createChallenge: async (challengeData) => {
    const response = await api.post('/api/challenges', challengeData);
    return response.data;
  },

  // Générer un challenge avec IA (Admin/Representant uniquement)
  generateAIChallenge: async (requestData) => {
    const response = await api.post('/api/challenges/generate', requestData);
    return response.data;
  },

  // Générer plusieurs challenges avec IA (Admin uniquement)
  generateMultipleAIChallenges: async (requestData) => {
    const response = await api.post('/api/challenges/generate/batch', requestData);
    return response.data;
  },

  // Mettre à jour un challenge (Admin/Representant uniquement)
  updateChallenge: async (id, challengeData) => {
    const response = await api.put(`/api/challenges/${id}`, challengeData);
    return response.data;
  },

  // Supprimer un challenge (Admin uniquement)
  deleteChallenge: async (id) => {
    await api.delete(`/api/challenges/${id}`);
  },

  // Rejoindre un challenge
  joinChallenge: async (id) => {
    const response = await api.post(`/api/challenges/${id}/join`);
    return response.data;
  },

  // Quitter un challenge
  leaveChallenge: async (id) => {
    const response = await api.post(`/api/challenges/${id}/leave`);
    return response.data;
  },

  // Récupérer mes challenges actifs
  getMyActiveChallenges: async () => {
    const response = await api.get('/api/challenges/my/active');
    return response.data;
  },

  // Récupérer mes challenges complétés
  getMyCompletedChallenges: async () => {
    const response = await api.get('/api/challenges/my/completed');
    return response.data;
  },

  // ============ SUBMISSIONS ============
  
  // Récupérer toutes les soumissions avec filtres (Admin/Representant)
  getAllSubmissions: async (params) => {
    const response = await api.get('/api/submissions', { params });
    return response.data;
  },

  // Récupérer une soumission par ID
  getSubmissionById: async (id) => {
    const response = await api.get(`/api/submissions/${id}`);
    return response.data;
  },

  // Récupérer mes soumissions
  getMySubmissions: async (pageNumber = 1, pageSize = 20) => {
    const response = await api.get('/api/submissions/my', {
      params: { pageNumber, pageSize }
    });
    return response.data;
  },

  // Récupérer les soumissions d'un challenge
  getChallengeSubmissions: async (challengeId, pageNumber = 1, pageSize = 20) => {
    const response = await api.get(`/api/submissions/challenge/${challengeId}`, {
      params: { pageNumber, pageSize }
    });
    return response.data;
  },

  // Récupérer les soumissions en attente (Admin/Representant)
  getPendingSubmissions: async (pageNumber = 1, pageSize = 50) => {
    const response = await api.get('/api/submissions/pending', {
      params: { pageNumber, pageSize }
    });
    return response.data;
  },

  // Créer une nouvelle soumission
  createSubmission: async (submissionData) => {
    const response = await api.post('/api/submissions', submissionData);
    return response.data;
  },

  // Réviser une soumission (Admin/Representant)
  reviewSubmission: async (id, reviewData) => {
    const response = await api.post(`/api/submissions/${id}/review`, reviewData);
    return response.data;
  },

  // Voter sur une soumission
  voteOnSubmission: async (id, voteData) => {
    const response = await api.post(`/api/submissions/${id}/vote`, voteData);
    return response.data;
  },

  // Récupérer les votes d'une soumission
  getSubmissionVotes: async (id) => {
    const response = await api.get(`/api/submissions/${id}/votes`);
    return response.data;
  },

  // Supprimer une soumission
  deleteSubmission: async (id) => {
    await api.delete(`/api/submissions/${id}`);
  },

  // ============ ACHIEVEMENTS ============
  
  // Récupérer tous les achievements
  getAllAchievements: async () => {
    const response = await api.get('/api/achievements');
    return response.data;
  },

  // Récupérer mes achievements
  getMyAchievements: async () => {
    const response = await api.get('/api/achievements/my');
    return response.data;
  },

  // Créer un achievement (Admin uniquement)
  createAchievement: async (achievementData) => {
    const response = await api.post('/api/achievements', achievementData);
    return response.data;
  },

  // Vérifier et débloquer les achievements d'un utilisateur (Admin)
  checkAchievements: async (userId) => {
    const response = await api.post(`/api/achievements/check/${userId}`);
    return response.data;
  },

  // ============ STATISTICS ============
  
  // Récupérer mes statistiques
  getMyStats: async () => {
    const response = await api.get('/api/stats/me');
    return response.data;
  },

  // Récupérer les statistiques d'un utilisateur
  getUserStats: async (userId) => {
    const response = await api.get(`/api/stats/user/${userId}`);
    return response.data;
  },

  // Récupérer le leaderboard global
  getGlobalLeaderboard: async (limit = 100) => {
    const response = await api.get('/api/stats/leaderboard/global', { 
      params: { limit } 
    });
    return response.data;
  },

  // Récupérer le leaderboard hebdomadaire
  getWeeklyLeaderboard: async (limit = 100) => {
    const response = await api.get('/api/stats/leaderboard/weekly', { 
      params: { limit } 
    });
    return response.data;
  },

  // Récupérer le leaderboard mensuel
  getMonthlyLeaderboard: async (limit = 100) => {
    const response = await api.get('/api/stats/leaderboard/monthly', { 
      params: { limit } 
    });
    return response.data;
  }
};

export default challengeApi;