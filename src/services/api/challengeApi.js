// src/services/api/challengeApi.js - À CRÉER
import api from './axiosConfig';

export const challengeApi = {
  // Challenges
  getAllChallenges: async (params) => {
    const response = await api.get('/api/challenges', { params });
    return response.data;
  },

  getChallengeById: async (id) => {
    const response = await api.get(`/api/challenges/${id}`);
    return response.data;
  },

  getActiveChallenges: async () => {
    const response = await api.get('/api/challenges/active');
    return response.data;
  },

  getFeaturedChallenges: async () => {
    const response = await api.get('/api/challenges/featured');
    return response.data;
  },

  getChallengesByType: async (type, limit = 10) => {
    const response = await api.get(`/api/challenges/type/${type}`, { params: { limit } });
    return response.data;
  },

  createChallenge: async (challengeData) => {
    const response = await api.post('/api/challenges', challengeData);
    return response.data;
  },

  updateChallenge: async (id, challengeData) => {
    const response = await api.put(`/api/challenges/${id}`, challengeData);
    return response.data;
  },

  deleteChallenge: async (id) => {
    await api.delete(`/api/challenges/${id}`);
  },

  joinChallenge: async (id) => {
    const response = await api.post(`/api/challenges/${id}/join`);
    return response.data;
  },

  leaveChallenge: async (id) => {
    const response = await api.post(`/api/challenges/${id}/leave`);
    return response.data;
  },

  getMyActiveChallenges: async () => {
    const response = await api.get('/api/challenges/my/active');
    return response.data;
  },

  getMyCompletedChallenges: async () => {
    const response = await api.get('/api/challenges/my/completed');
    return response.data;
  },

  // Submissions
  getAllSubmissions: async (params) => {
    const response = await api.get('/api/submissions', { params });
    return response.data;
  },

  getSubmissionById: async (id) => {
    const response = await api.get(`/api/submissions/${id}`);
    return response.data;
  },

  getMySubmissions: async (pageNumber = 1, pageSize = 20) => {
    const response = await api.get('/api/submissions/my', {
      params: { pageNumber, pageSize }
    });
    return response.data;
  },

  getChallengeSubmissions: async (challengeId, pageNumber = 1, pageSize = 20) => {
    const response = await api.get(`/api/submissions/challenge/${challengeId}`, {
      params: { pageNumber, pageSize }
    });
    return response.data;
  },

  createSubmission: async (submissionData) => {
    const response = await api.post('/api/submissions', submissionData);
    return response.data;
  },

  voteOnSubmission: async (id, voteData) => {
    const response = await api.post(`/api/submissions/${id}/vote`, voteData);
    return response.data;
  },

  deleteSubmission: async (id) => {
    await api.delete(`/api/submissions/${id}`);
  },

  // Achievements
  getAllAchievements: async () => {
    const response = await api.get('/api/achievements');
    return response.data;
  },

  getMyAchievements: async () => {
    const response = await api.get('/api/achievements/my');
    return response.data;
  },

  // Stats
  getMyStats: async () => {
    const response = await api.get('/api/stats/me');
    return response.data;
  },

  getUserStats: async (userId) => {
    const response = await api.get(`/api/stats/user/${userId}`);
    return response.data;
  },

  getGlobalLeaderboard: async (limit = 100) => {
    const response = await api.get('/api/stats/leaderboard/global', { params: { limit } });
    return response.data;
  },

  getWeeklyLeaderboard: async (limit = 100) => {
    const response = await api.get('/api/stats/leaderboard/weekly', { params: { limit } });
    return response.data;
  },

  getMonthlyLeaderboard: async (limit = 100) => {
    const response = await api.get('/api/stats/leaderboard/monthly', { params: { limit } });
    return response.data;
  }
};