// src/services/api/wasteApi.js
import api from './axiosConfig';

const API_URL = '/api/pointdechet';

const wasteApi = {
  /**
   * Signaler un déchet avec image et localisation
   */
  signalWaste: async (imageFile, latitude, longitude) => {
    const formData = new FormData();
    formData.append('Image', imageFile);
    formData.append('Latitude', latitude.toString());
    formData.append('Longitude', longitude.toString());

    try {
      const response = await api.post(`${API_URL}/signaler`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      console.error('Erreur signalWaste:', err);
      throw err;
    }
  },

  /**
   * Récupérer les statistiques globales
   */
  getStatistics: async (params = {}) => {
    try {
      const response = await api.get(`${API_URL}/statistiques`, { params });
      return response.data;
    } catch (err) {
      console.error('Erreur getStatistics:', err);
      throw err;
    }
  },

  /**
   * Récupérer MES statistiques
   */
  getMyStatistics: async (dateDebut = null, dateFin = null) => {
    try {
      const params = {};
      if (dateDebut) params.dateDebut = dateDebut;
      if (dateFin) params.dateFin = dateFin;

      const response = await api.get(`${API_URL}/mes-statistiques`, { params });
      return response.data;
    } catch (err) {
      console.error('Erreur getMyStatistics:', err);
      throw err;
    }
  },

  /**
   * Récupérer tous les points de déchets (avec filtres)
   */
  getAllWastes: async (filters = {}) => {
    try {
      const response = await api.get(API_URL, {
        params: {
          Page: filters.page || 1,
          PageSize: filters.pageSize || 10,
          Search: filters.search || '',
          Statut: filters.statut || '',
          Type: filters.type || '',
          Pays: filters.pays || '',
          Zone: filters.zone || '',
          DateDebut: filters.dateDebut || '',
          DateFin: filters.dateFin || '',
          SortBy: filters.sortBy || 'Date',
          Descending: filters.descending !== undefined ? filters.descending : true
        }
      });
      return response.data;
    } catch (err) {
      console.error('Erreur getAllWastes:', err);
      throw err;
    }
  },

  /**
   * Récupérer MES déchets signalés
   */
  getMyWastes: async (filters = {}) => {
    try {
      const response = await api.get(`${API_URL}/mes-dechets`, {
        params: {
          Page: filters.page || 1,
          PageSize: filters.pageSize || 10,
          Search: filters.search || '',
          Statut: filters.statut || '',
          Type: filters.type || '',
          SortBy: filters.sortBy || 'Date',
          Descending: filters.descending !== undefined ? filters.descending : true
        }
      });
      return response.data;
    } catch (err) {
      console.error('Erreur getMyWastes:', err);
      throw err;
    }
  },

  /**
   * Récupérer un point de déchet par ID
   */
  getWasteById: async (id) => {
    try {
      const response = await api.get(`${API_URL}/${id}`);
      return response.data;
    } catch (err) {
      console.error('Erreur getWasteById:', err);
      throw err;
    }
  },

  /**
   * Vérifier si une recommandation est disponible
   */
  checkRecommendation: async (pointDechetId) => {
    try {
      const response = await api.get(`${API_URL}/${pointDechetId}/check-recommandation`);
      return response.data;
    } catch (err) {
      console.error('Erreur checkRecommendation:', err);
      throw err;
    }
  },

  /**
   * Télécharger les statistiques (CSV/JSON/Excel)
   */
  downloadStatistics: async (format = 'csv', params = {}) => {
    try {
      const response = await api.get(`${API_URL}/statistiques/telecharger`, {
        params: { ...params, format },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `statistiques_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      console.error('Erreur downloadStatistics:', err);
      throw err;
    }
  }
};

export default wasteApi;