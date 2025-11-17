// src/services/api/organisationApis.js
import api from './axiosConfig';

// ============= DÉPÔTS =============
export const depotApi = {
  getAll: async () => {
    try {
      const response = await api.get('/api/depots');
      return response.data;
    } catch (err) {
      console.error('Erreur getAll depots:', err);
      throw err;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/api/depots/${id}`);
      return response.data;
    } catch (err) {
      console.error('Erreur getById depot:', err);
      throw err;
    }
  },

  create: async (depot) => {
    try {
      const response = await api.post('/api/depots', depot);
      return response.data;
    } catch (err) {
      console.error('Erreur create depot:', err);
      throw err;
    }
  },

  update: async (id, depot) => {
    try {
      const response = await api.put(`/api/depots/${id}`, depot);
      return response.data;
    } catch (err) {
      console.error('Erreur update depot:', err);
      throw err;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/api/depots/${id}`);
      return true;
    } catch (err) {
      console.error('Erreur delete depot:', err);
      throw err;
    }
  }
};

// ============= VÉHICULES =============
export const vehiculeApi = {
  getAll: async () => {
    try {
      const response = await api.get('/api/vehicules');
      return response.data;
    } catch (err) {
      console.error('Erreur getAll vehicules:', err);
      throw err;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/api/vehicules/${id}`);
      return response.data;
    } catch (err) {
      console.error('Erreur getById vehicule:', err);
      throw err;
    }
  },

  create: async (vehicule) => {
    try {
      const response = await api.post('/api/vehicules', vehicule);
      return response.data;
    } catch (err) {
      console.error('Erreur create vehicule:', err);
      throw err;
    }
  },

  update: async (id, vehicule) => {
    try {
      const response = await api.put(`/api/vehicules/${id}`, vehicule);
      return response.data;
    } catch (err) {
      console.error('Erreur update vehicule:', err);
      throw err;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/api/vehicules/${id}`);
      return true;
    } catch (err) {
      console.error('Erreur delete vehicule:', err);
      throw err;
    }
  }
};

// ============= OPTIMISATION =============
export const optimisationApi = {
  optimiserTournees: async (requestData) => {
    try {
      const response = await api.post('/api/optimisation/optimiser', requestData);
      return response.data;
    } catch (err) {
      console.error('Erreur optimiserTournees:', err);
      throw err;
    }
  }
};

// ============= ORGANISATIONS =============
export const organisationApi = {
  getAll: async () => {
    try {
      const response = await api.get('/api/organisations');
      return response.data;
    } catch (err) {
      console.error('Erreur getAll organisations:', err);
      throw err;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/api/organisations/${id}`);
      return response.data;
    } catch (err) {
      console.error('Erreur getById organisation:', err);
      throw err;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/api/organisations/${id}`, data);
      return response.data;
    } catch (err) {
      console.error('Erreur update organisation:', err);
      throw err;
    }
  }
};