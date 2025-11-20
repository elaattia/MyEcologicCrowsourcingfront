// src/services/api/forumApi.js - À CRÉER
import api from './axiosConfig';

export const forumApi = {
  // Categories
  getCategories: async () => {
    const response = await api.get('/api/forum/categories');
    return response.data;
  },

  // Posts
  getPosts: async (params) => {
    const response = await api.get('/api/forum/posts', { params });
    return response.data;
  },

  createPost: async (postData) => {
    const response = await api.post('/api/forum/posts', postData);
    return response.data;
  },

  getPostById: async (id) => {
    const response = await api.get(`/api/forum/posts/${id}`);
    return response.data;
  },

  updatePost: async (id, postData) => {
    const response = await api.put(`/api/forum/posts/${id}`, postData);
    return response.data;
  },

  deletePost: async (id) => {
    await api.delete(`/api/forum/posts/${id}`);
  },

  // Comments
  getComments: async (postId) => {
    const response = await api.get(`/api/forum/comments/post/${postId}`);
    return response.data;
  },

  createComment: async (commentData) => {
    const response = await api.post('/api/forum/comments', commentData);
    return response.data;
  },

  updateComment: async (id, commentData) => {
    const response = await api.put(`/api/forum/comments/${id}`, commentData);
    return response.data;
  },

  deleteComment: async (id) => {
    await api.delete(`/api/forum/comments/${id}`);
  },

  // Reactions
  addPostReaction: async (postId, type) => {
    const response = await api.post(`/api/forum/reactions/post/${postId}`, { type });
    return response.data;
  },

  removePostReaction: async (postId) => {
    await api.delete(`/api/forum/reactions/post/${postId}`);
  },

  addCommentReaction: async (commentId, type) => {
    const response = await api.post(`/api/forum/reactions/comment/${commentId}`, { type });
    return response.data;
  },

  removeCommentReaction: async (commentId) => {
    await api.delete(`/api/forum/reactions/comment/${commentId}`);
  },

  // Reports
  reportPost: async (reportData) => {
    const response = await api.post('/api/forum/reports', reportData);
    return response.data;
  }
};