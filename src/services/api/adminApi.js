import api from './axiosConfig';

// ============================================
// ADMIN API - VERSION FINALE CORRIGÉE
// ============================================

export const adminApi = {
  // ==================== STATISTIQUES ====================
  
  getDetailedStats: async () => {
    try {
      // Appeler tous les endpoints en parallèle (avec gestion d'erreur pour WastePoints)
      const [usersRes, challengesRes, submissionsRes, wastePointsRes] = await Promise.allSettled([
        api.get('/api/Users'),
        api.get('/api/Challenges'),
        api.get('/api/Submissions'),
        api.get('/api/WastePoints').catch(() => null) // Ne pas échouer si endpoint manquant
      ]);

      const users = usersRes.status === 'fulfilled' && usersRes.value?.data ? 
        (Array.isArray(usersRes.value.data) ? usersRes.value.data : []) : [];
      
      const challenges = challengesRes.status === 'fulfilled' && challengesRes.value?.data ? 
        (Array.isArray(challengesRes.value.data) ? challengesRes.value.data : 
         challengesRes.value.data.data || []) : [];
      
      const submissions = submissionsRes.status === 'fulfilled' && submissionsRes.value?.data ? 
        (Array.isArray(submissionsRes.value.data) ? submissionsRes.value.data : 
         submissionsRes.value.data.data || []) : [];
      
      // Gérer les waste points (peut être null si endpoint n'existe pas)
      let wastePoints = [];
      if (wastePointsRes.status === 'fulfilled' && wastePointsRes.value?.data) {
        wastePoints = Array.isArray(wastePointsRes.value.data) ? wastePointsRes.value.data : 
                      wastePointsRes.value.data.data || [];
      }

      return {
        users: {
          total: users.length,
          active: users.filter(u => u.isActive !== false).length,
          byRole: {
            users: users.filter(u => u.role === 0 || u.role === 'User').length,
            representatives: users.filter(u => u.role === 1 || u.role === 'Representant').length,
            admins: users.filter(u => u.role === 2 || u.role === 'Admin').length
          }
        },
        challenges: {
          total: challenges.length,
          active: challenges.filter(c => c.isActive).length,
          completed: 0
        },
        submissions: {
          total: submissions.length,
          pending: submissions.filter(s => s.status === 'Pending' || s.status === 0).length,
          approved: submissions.filter(s => s.status === 'Approved' || s.status === 2).length,
          rejected: submissions.filter(s => s.status === 'Rejected' || s.status === 3).length
        },
        forum: { 
          totalPosts: 0, 
          activePosts: 0 
        },
        wastePoints: {
          total: wastePoints.length,
          reported: wastePoints.filter(w => w.statut === 'Signale' || w.statut === 0 || w.status === 0).length,
          cleaned: wastePoints.filter(w => w.statut === 'Nettoye' || w.statut === 1 || w.status === 1).length
        }
      };
    } catch (error) {
      console.error('❌ Erreur stats:', error);
      throw error;
    }
  },

  recalculateRanks: async () => {
    try {
      const response = await api.post('/api/Stats/recalculate-ranks');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur recalcul:', error);
      throw error;
    }
  },

  // ==================== UTILISATEURS ====================
  
  getUsers: async () => {
    try {
      console.log('📡 GET /api/Users');
      const response = await api.get('/api/Users');
      console.log('✅ Users:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ GET Users:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const dto = {
        email: userData.email,
        username: userData.prenom && userData.nom 
          ? `${userData.prenom} ${userData.nom}` 
          : userData.email,
        password: userData.motDePasse,
        role: parseInt(userData.role) || 0
      };
      
      console.log('📡 POST /api/Users:', dto);
      const response = await api.post('/api/Users', dto);
      console.log('✅ User créé:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ POST User:', error.response?.status, error.response?.data);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.title || 
        'Erreur lors de la création de l\'utilisateur'
      );
    }
  },

  updateUser: async (userId, userData) => {
    try {
      // Vérifier que userId est valide
      if (!userId || typeof userId !== 'string') {
        throw new Error('UserId invalide');
      }

      const dto = {
        email: userData.email,
        username: userData.prenom && userData.nom 
          ? `${userData.prenom} ${userData.nom}` 
          : userData.email,
        role: parseInt(userData.role)
      };
      
      // N'inclure password que s'il est fourni et non vide
      if (userData.motDePasse && userData.motDePasse.trim()) {
        dto.password = userData.motDePasse;
      }
      
      console.log('📡 PUT /api/Users/' + userId + ':', dto);
      const response = await api.put(`/api/Users/${userId}`, dto);
      console.log('✅ User modifié:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PUT User:', error.response?.status, error.response?.data);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.title || 
        `Erreur lors de la modification de l'utilisateur: ${error.message}`
      );
    }
  },

  deleteUser: async (userId) => {
    try {
      // Vérifier que userId est valide
      if (!userId || typeof userId !== 'string') {
        throw new Error('UserId invalide');
      }
      
      console.log('📡 DELETE /api/Users/' + userId);
      const response = await api.delete(`/api/Users/${userId}`);
      console.log('✅ User supprimé');
      return response.data;
    } catch (error) {
      console.error('❌ DELETE User:', error.response?.status, error.response?.data);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.title || 
        `Erreur lors de la suppression de l'utilisateur: ${error.message}`
      );
    }
  },

  // ==================== CHALLENGES ====================
  
  getChallenges: async () => {
    try {
      console.log('📡 GET /api/Challenges');
      const response = await api.get('/api/Challenges');
      console.log('✅ Challenges:', response.data);
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ GET Challenges:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  createChallenge: async (challengeData) => {
    try {
      const dto = {
        title: challengeData.titre,
        description: challengeData.description,
        type: challengeData.type,
        difficulty: challengeData.difficulte,
        frequency: 'OneTime',
        points: parseInt(challengeData.pointsRecompense),
        bonusPoints: 0,
        requiredProofType: 'Photo',
        startDate: challengeData.dateDebut || new Date().toISOString(),
        durationDays: 7,
        imageUrl: challengeData.imageUrl || null,
        icon: challengeData.icon || null,
        tips: challengeData.objectif || null
      };
      
      console.log('📡 POST /api/Challenges:', dto);
      const response = await api.post('/api/Challenges', dto);
      console.log('✅ Challenge créé:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ POST Challenge:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  updateChallenge: async (challengeId, challengeData) => {
    try {
      const dto = {
        title: challengeData.titre,
        description: challengeData.description,
        type: challengeData.type,
        difficulty: challengeData.difficulte,
        frequency: 'OneTime',
        points: parseInt(challengeData.pointsRecompense),
        bonusPoints: 0,
        requiredProofType: 'Photo',
        startDate: challengeData.dateDebut || new Date().toISOString(),
        durationDays: 7,
        imageUrl: challengeData.imageUrl || null,
        icon: challengeData.icon || null,
        tips: challengeData.objectif || null
      };
      
      console.log('📡 PUT /api/Challenges/' + challengeId + ':', dto);
      const response = await api.put(`/api/Challenges/${challengeId}`, dto);
      console.log('✅ Challenge modifié:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PUT Challenge:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  deleteChallenge: async (challengeId) => {
    try {
      console.log('📡 DELETE /api/Challenges/' + challengeId);
      const response = await api.delete(`/api/Challenges/${challengeId}`);
      console.log('✅ Challenge supprimé');
      return response.data;
    } catch (error) {
      console.error('❌ DELETE Challenge:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  generateAIChallenge: async (prompt) => {
    try {
      const dto = { theme: prompt, count: 1 };
      
      console.log('📡 POST /api/Challenges/generate:', dto);
      const response = await api.post('/api/Challenges/generate', dto);
      console.log('✅ Challenge IA généré:', response.data);
      
      // Attendre un peu pour que le backend enregistre
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return response.data;
    } catch (error) {
      console.error('❌ POST Challenge/generate:', error.response?.status, error.response?.data);
      throw new Error(
        error.response?.data?.message || 
        'Erreur lors de la génération du challenge avec l\'IA'
      );
    }
  },

  generateAIChallengesBatch: async (count = 5) => {
    try {
      const dto = { count: parseInt(count) };
      
      console.log('📡 POST /api/Challenges/generate/batch:', dto);
      const response = await api.post('/api/Challenges/generate/batch', dto);
      console.log('✅ Batch généré:', response.data);
      
      // Attendre que tous les challenges soient créés
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return response.data;
    } catch (error) {
      console.error('❌ POST Challenge/generate/batch:', error.response?.status, error.response?.data);
      throw new Error(
        error.response?.data?.message || 
        'Erreur lors de la génération en lot'
      );
    }
  },

  // ==================== ACHIEVEMENTS ====================
  
  getAchievements: async () => {
    try {
      console.log('📡 GET /api/Achievements');
      const response = await api.get('/api/Achievements');
      console.log('✅ Achievements:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ GET Achievements:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  createAchievement: async (achievementData) => {
    try {
      const dto = {
        name: achievementData.titre,
        description: achievementData.description,
        icon: achievementData.icone || '🏆',
        pointsRequired: parseInt(achievementData.pointsRecompense),
        criteria: achievementData.condition
      };
      
      console.log('📡 POST /api/Achievements:', dto);
      const response = await api.post('/api/Achievements', dto);
      console.log('✅ Achievement créé:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ POST Achievement:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  // ==================== SOUMISSIONS ====================
  
  getPendingSubmissions: async (pageNumber = 1, pageSize = 10) => {
    try {
      console.log('📡 GET /api/Submissions/pending');
      const response = await api.get('/api/Submissions/pending', {
        params: { pageNumber, pageSize }
      });
      console.log('✅ Pending submissions:', response.data);
      
      return {
        items: Array.isArray(response.data) ? response.data : 
               response.data?.items || response.data?.data || [],
        totalCount: response.data?.totalCount || 0
      };
    } catch (error) {
      console.error('❌ GET Submissions/pending:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  getAllSubmissions: async (pageNumber = 1, pageSize = 10, status = null) => {
    try {
      console.log('📡 GET /api/Submissions');
      const response = await api.get('/api/Submissions', {
        params: { pageNumber, pageSize, status }
      });
      console.log('✅ All submissions:', response.data);
      
      return {
        items: Array.isArray(response.data) ? response.data : 
               response.data?.items || response.data?.data || [],
        totalCount: response.data?.totalCount || 0
      };
    } catch (error) {
      console.error('❌ GET Submissions:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  /*reviewSubmission: async (submissionId, approved, notes = '', points = 0) => {
    try {
      const dto = {
        approved: approved,
        notes: notes,
        pointsAwarded: approved ? parseInt(points) : 0
      };
      
      console.log('📡 POST /api/Submissions/' + submissionId + '/review:', dto);
      const response = await api.post(`/api/Submissions/${submissionId}/review`, dto);
      console.log('✅ Soumission reviewée:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ POST Submission/review:', error.response?.status, error.response?.data);
      throw error;
    }
  },*/

  reviewSubmission: async (submissionId, approved, notes = '', points = 0) => {
    const dto = {
        status: approved ? 'Approved' : 'Rejected',  // ✅ STRING pas boolean
        pointsAwarded: approved ? parseInt(points) : 0,
        reviewNotes: notes || null
    };
    
    console.log('📡 Review submission:', submissionId, dto);
    const response = await api.post(`/api/Submissions/${submissionId}/review`, dto);
    return response.data;
    },

  // ==================== MODÉRATION FORUM ====================
  
  getReports: async (status = null, pageNumber = 1, pageSize = 20) => {
    try {
      console.log('📡 GET /api/Reports');
      const response = await api.get('/api/Reports', {
        params: { status, pageNumber, pageSize }
      });
      console.log('✅ Reports:', response.data);
      
      return {
        items: Array.isArray(response.data) ? response.data : 
               response.data?.items || response.data?.data || [],
        totalCount: response.data?.totalCount || 0
      };
    } catch (error) {
      console.error('❌ GET Reports:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  getPendingReportsCount: async () => {
    try {
      const response = await api.get('/api/Reports/pending/count');
      return response.data?.count || response.data || 0;
    } catch (error) {
      console.error('❌ GET Reports/pending/count:', error);
      return 0;
    }
  },

  reviewReport: async (reportId, action, notes = '') => {
    try {
      const dto = { action, notes };
      
      console.log('📡 POST /api/Reports/' + reportId + '/review:', dto);
      const response = await api.post(`/api/Reports/${reportId}/review`, dto);
      console.log('✅ Report reviewé:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ POST Report/review:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  // Actions sur les posts
  pinPost: async (postId) => {
    try {
      const response = await api.post(`/api/Posts/${postId}/pin`);
      return response.data;
    } catch (error) {
      console.error('❌ Pin post:', error);
      throw error;
    }
  },

  unpinPost: async (postId) => {
    try {
      const response = await api.post(`/api/Posts/${postId}/unpin`);
      return response.data;
    } catch (error) {
      console.error('❌ Unpin post:', error);
      throw error;
    }
  },

  lockPost: async (postId) => {
    try {
      const response = await api.post(`/api/Posts/${postId}/lock`);
      return response.data;
    } catch (error) {
      console.error('❌ Lock post:', error);
      throw error;
    }
  },

  unlockPost: async (postId) => {
    try {
      const response = await api.post(`/api/Posts/${postId}/unlock`);
      return response.data;
    } catch (error) {
      console.error('❌ Unlock post:', error);
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/api/Posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Delete post:', error);
      throw error;
    }
  }
};

export default adminApi;