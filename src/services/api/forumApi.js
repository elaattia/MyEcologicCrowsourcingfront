// src/services/api/forumApi.js
import api from './axiosConfig';

export const forumApi = {
  // ============ CATEGORIES ============
  
  // Récupérer toutes les catégories
  getCategories: async (includeInactive = false) => {
    const response = await api.get('/api/forum/categories', {
      params: { includeInactive }
    });
    return response.data;
  },

  // Récupérer une catégorie par ID
  getCategoryById: async (id) => {
    const response = await api.get(`/api/forum/categories/${id}`);
    return response.data;
  },

  // Récupérer une catégorie par slug
  getCategoryBySlug: async (slug) => {
    const response = await api.get(`/api/forum/categories/slug/${slug}`);
    return response.data;
  },

  // Créer une catégorie (Admin uniquement)
  createCategory: async (categoryData) => {
    const response = await api.post('/api/forum/categories', categoryData);
    return response.data;
  },

  // Mettre à jour une catégorie (Admin uniquement)
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/api/forum/categories/${id}`, categoryData);
    return response.data;
  },

  // Supprimer une catégorie (Admin uniquement)
  deleteCategory: async (id) => {
    await api.delete(`/api/forum/categories/${id}`);
  },

  // ============ POSTS ============
  
  // Récupérer tous les posts avec filtres et pagination
  getPosts: async (params) => {
    const response = await api.get('/api/forum/posts', { params });
    return response.data;
  },

  // Récupérer un post par ID
  getPostById: async (id) => {
    const response = await api.get(`/api/forum/posts/${id}`);
    return response.data;
  },

  // Récupérer les posts par catégorie
  getPostsByCategory: async (categoryId, page = 1, pageSize = 20) => {
    const response = await api.get(`/api/forum/posts/category/${categoryId}`, {
      params: { page, pageSize }
    });
    return response.data;
  },

  // Récupérer les posts par utilisateur
  getPostsByUser: async (userId, page = 1, pageSize = 20) => {
    const response = await api.get(`/api/forum/posts/user/${userId}`, {
      params: { page, pageSize }
    });
    return response.data;
  },

  // Récupérer les posts épinglés
  getPinnedPosts: async (categoryId = null) => {
    const response = await api.get('/api/forum/posts/pinned', {
      params: { categoryId }
    });
    return response.data;
  },

  // Créer un nouveau post
  createPost: async (postData) => {
    const response = await api.post('/api/forum/posts', postData);
    return response.data;
  },

  // Mettre à jour un post
  updatePost: async (id, postData) => {
    const response = await api.put(`/api/forum/posts/${id}`, postData);
    return response.data;
  },

  // Supprimer un post
  deletePost: async (id) => {
    await api.delete(`/api/forum/posts/${id}`);
  },

  // Épingler un post (Admin uniquement)
  pinPost: async (id) => {
    const response = await api.post(`/api/forum/posts/${id}/pin`);
    return response.data;
  },

  // Désépingler un post (Admin uniquement)
  unpinPost: async (id) => {
    const response = await api.post(`/api/forum/posts/${id}/unpin`);
    return response.data;
  },

  // Verrouiller un post (Admin uniquement)
  lockPost: async (id) => {
    const response = await api.post(`/api/forum/posts/${id}/lock`);
    return response.data;
  },

  // Déverrouiller un post (Admin uniquement)
  unlockPost: async (id) => {
    const response = await api.post(`/api/forum/posts/${id}/unlock`);
    return response.data;
  },

  // ============ COMMENTS ============
  
  // Récupérer les commentaires d'un post
  getComments: async (postId) => {
    const response = await api.get(`/api/forum/comments/post/${postId}`);
    return response.data;
  },

  // Récupérer un commentaire par ID
  getCommentById: async (id) => {
    const response = await api.get(`/api/forum/comments/${id}`);
    return response.data;
  },

  // Créer un nouveau commentaire
  createComment: async (commentData) => {
    const response = await api.post('/api/forum/comments', commentData);
    return response.data;
  },

  // Mettre à jour un commentaire
  updateComment: async (id, commentData) => {
    const response = await api.put(`/api/forum/comments/${id}`, commentData);
    return response.data;
  },

  // Supprimer un commentaire
  deleteComment: async (id) => {
    await api.delete(`/api/forum/comments/${id}`);
  },

  // ============ REACTIONS ============
  
  // Ajouter une réaction à un post
  addPostReaction: async (postId, type) => {
    const response = await api.post(`/api/forum/reactions/post/${postId}`, { type });
    return response.data;
  },

  // Retirer une réaction d'un post
  removePostReaction: async (postId) => {
    await api.delete(`/api/forum/reactions/post/${postId}`);
  },

  // Récupérer le résumé des réactions d'un post
  getPostReactionSummary: async (postId) => {
    const response = await api.get(`/api/forum/reactions/post/${postId}/summary`);
    return response.data;
  },

  // Ajouter une réaction à un commentaire
  addCommentReaction: async (commentId, type) => {
    const response = await api.post(`/api/forum/reactions/comment/${commentId}`, { type });
    return response.data;
  },

  // Retirer une réaction d'un commentaire
  removeCommentReaction: async (commentId) => {
    await api.delete(`/api/forum/reactions/comment/${commentId}`);
  },

  // Récupérer le résumé des réactions d'un commentaire
  getCommentReactionSummary: async (commentId) => {
    const response = await api.get(`/api/forum/reactions/comment/${commentId}/summary`);
    return response.data;
  },

  // ============ REPORTS ============
  
  // Signaler un post
  reportPost: async (reportData) => {
    const response = await api.post('/api/forum/reports', reportData);
    return response.data;
  },

  // Récupérer tous les signalements (Admin uniquement)
  getAllReports: async (status = null) => {
    const response = await api.get('/api/forum/reports', {
      params: { status }
    });
    return response.data;
  },

  // Réviser un signalement (Admin uniquement)
  reviewReport: async (id, reviewData) => {
    const response = await api.put(`/api/forum/reports/${id}/review`, reviewData);
    return response.data;
  }
};

export default forumApi;